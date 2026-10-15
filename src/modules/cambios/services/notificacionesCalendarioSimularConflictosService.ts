import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

interface ConflictSimRequest {
  tipo_cambio: "estandar" | "normal" | "emergencia";
  fecha_inicio: string; // ISO string e.g. "2026-10-15T22:00:00Z"
  duracion_horas: number;
  servicio_id?: number | null;
  ci_id?: number | null;
  implementador_id?: number | null;
  requiere_interrupcion?: boolean;
}

export async function simularConflictosCalendario(body: ConflictSimRequest) {
  const { tipo_cambio, fecha_inicio, duracion_horas, servicio_id, ci_id, implementador_id, requiere_interrupcion } = body;

  if (!fecha_inicio || !duracion_horas || duracion_horas <= 0) {
    throw new ErrorDominio("fecha_inicio y duracion_horas son obligatorios y deben ser válidos");
  }

  const tipo = tipo_cambio || "normal";
  const inicioDate = new Date(fecha_inicio);
  if (isNaN(inicioDate.getTime())) {
    throw new ErrorDominio("fecha_inicio inválida");
  }

  const finDate = new Date(inicioDate.getTime() + duracion_horas * 3600 * 1000);

  // 1. Obtener la configuración vigente de conflictos
  const configRow = await queryRow(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = 'conflictos_capacidad' AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `);
  const snapshotConflictos = configRow?.snapshot || {};
  const reglas = snapshotConflictos.reglas || [];
  const reglaPorCodigo = (cod: string) => reglas.find((r: any) => r.codigo === cod) || { activa: true, severidad: { estandar: "bloquear", normal: "bloquear", emergencia: "advertir" } };

  // 2. Obtener ventanas de mantenimiento activas
  const ventanasActivas = await query(`
    SELECT * FROM ventanas_mantenimiento WHERE activo = true
  `);

  // 3. Obtener períodos de congelamiento activos
  const periodosCongelamiento = await query(`
    SELECT * FROM periodos_congelamiento WHERE activo = true
  `);

  // 4. Obtener feriados vigentes
  const feriadosVigentes = await query(`
    SELECT * FROM calendario_feriados WHERE activo = true
  `);

  // 5. Obtener RFCs concurrentes en esa ventana temporal desde la tabla cambio
  const rfcsConcurrentes = await query(`
    SELECT id_cambio, codigo_cambio, titulo, tipo_cambio, ventana_inicio, ventana_fin, id_ci_afectado, id_usuario_responsable
    FROM cambio
    WHERE estado_registro = true
      AND ventana_inicio IS NOT NULL
      AND ventana_fin IS NOT NULL
      AND (ventana_inicio < $2 AND ventana_fin > $1)
  `, [inicioDate.toISOString(), finDate.toISOString()]);

  const bloqueos: string[] = [];
  const advertencias: string[] = [];
  const detalles_conflictos: any[] = [];

  // Helper para evaluar severidad
  const registrarConflicto = (codigoRegla: string, mensaje: string, entidad: string) => {
    const regla = reglaPorCodigo(codigoRegla);
    if (!regla.activa) return;
    const severidadConfig = regla.severidad?.[tipo] || "advertir";
    if (severidadConfig === "bloquear") {
      bloqueos.push(mensaje);
      detalles_conflictos.push({ regla: codigoRegla, mensaje, severidad: "bloqueo", entidad });
    } else if (severidadConfig === "advertir") {
      advertencias.push(mensaje);
      detalles_conflictos.push({ regla: codigoRegla, mensaje, severidad: "advertencia", entidad });
    }
  };

  // A. Regla: Fuera de ventana de mantenimiento
  if (ventanasActivas.length > 0) {
    const horaInicioStr = inicioDate.toTimeString().substring(0, 5); // "HH:MM"
    const diaSemana = inicioDate.getDay(); // 0 = Domingo, 1 = Lunes...

    let coincideVentana = false;
    for (const v of ventanasActivas) {
      // Verificar si el tipo de cambio está permitido en la ventana
      const tiposPermitidos = v.tipos_cambio_permitidos || ["estandar", "normal"];
      if (!tiposPermitidos.includes(tipo)) continue;

      // Verificar recurrencia semanal
      if (v.recurrencia === "semanal" && Array.isArray(v.dias_semana)) {
        if (v.dias_semana.includes(diaSemana)) {
          // Verificar cruce medianoche o horario directo
          if (v.cruce_medianoche) {
            if (horaInicioStr >= v.hora_inicio.substring(0, 5) || horaInicioStr <= v.hora_fin.substring(0, 5)) {
              coincideVentana = true;
              break;
            }
          } else {
            if (horaInicioStr >= v.hora_inicio.substring(0, 5) && horaInicioStr <= v.hora_fin.substring(0, 5)) {
              coincideVentana = true;
              break;
            }
          }
        }
      } else if (v.recurrencia === "diaria") {
        coincideVentana = true;
        break;
      }
    }

    if (!coincideVentana) {
      registrarConflicto(
        "fuera_de_ventana",
        `El horario propuesto (${inicioDate.toLocaleTimeString()} a ${finDate.toLocaleTimeString()}) no coincide con ninguna ventana de mantenimiento autorizada para cambio tipo '${tipo}'.`,
        "Ventana de Mantenimiento"
      );
    }
  }

  // B. Regla: Período de congelamiento
  const fechaInicioISO = inicioDate.toISOString();
  const fechaFinISO = finDate.toISOString();
  for (const pc of periodosCongelamiento) {
    const pcInicio = new Date(pc.fecha_inicio);
    const pcFin = new Date(pc.fecha_fin);

    // Solapamiento de intervalos
    if (inicioDate < pcFin && finDate > pcInicio) {
      const tiposExentos = pc.tipos_exentos || ["emergencia"];
      if (!tiposExentos.includes(tipo)) {
        if (pc.severidad === "bloqueo_total") {
          bloqueos.push(`Período de congelamiento activo: '${pc.nombre}' (${pc.motivo}). Exige autorización excepcional de ECAB.`);
          detalles_conflictos.push({ regla: "congelamiento", mensaje: `Período de congelamiento activo: '${pc.nombre}'.`, severidad: "bloqueo", entidad: pc.nombre });
        } else if (pc.severidad === "bloqueo_con_excepcion") {
          bloqueos.push(`Período de congelamiento con excepción: '${pc.nombre}'. Requiere etapa de aprobación 'Excepción de congelamiento'.`);
          detalles_conflictos.push({ regla: "congelamiento", mensaje: `Período con excepción: '${pc.nombre}'.`, severidad: "bloqueo", entidad: pc.nombre });
        } else {
          advertencias.push(`Aviso preventivo: La fecha coincide con el período de congelamiento '${pc.nombre}'.`);
          detalles_conflictos.push({ regla: "congelamiento", mensaje: `Período preventivo: '${pc.nombre}'.`, severidad: "advertencia", entidad: pc.nombre });
        }
      }
    }
  }

  // C. Regla: Feriados y Días No Laborables
  const fechaSoloDia = inicioDate.toISOString().substring(0, 10);
  const esFeriado = feriadosVigentes.some((f: any) => {
    const fInicio = f.fecha_inicio instanceof Date ? f.fecha_inicio.toISOString().substring(0, 10) : String(f.fecha_inicio).substring(0, 10);
    const fFin = f.fecha_fin instanceof Date ? f.fecha_fin.toISOString().substring(0, 10) : String(f.fecha_fin).substring(0, 10);
    return fechaSoloDia >= fInicio && fechaSoloDia <= fFin;
  });

  if (esFeriado) {
    registrarConflicto(
      "feriado_no_laborable",
      `La intervención está programada en día feriado del calendario institucional (${fechaSoloDia}).`,
      "Calendario de Feriados"
    );
  }

  const diaSem = inicioDate.getDay();
  if (diaSem === 0 || diaSem === 6) { // Fin de semana
    if (tipo === "estandar") {
      advertencias.push("Programación en fin de semana para cambio estándar. Verifique si la ventana autoriza interrupción.");
    }
  }

  // D. Regla: Mismo CI y colchón de seguridad
  if (ci_id) {
    const colchonMin = reglaPorCodigo("mismo_ci").colchon_minutos || 60;
    const inicioColchon = new Date(inicioDate.getTime() - colchonMin * 60 * 1000);
    const finColchon = new Date(finDate.getTime() + colchonMin * 60 * 1000);

    const rfcsMismoCI = await query(`
      SELECT codigo_cambio, titulo, ventana_inicio, ventana_fin
      FROM cambio
      WHERE estado_registro = true
        AND id_ci_afectado = $1
        AND ventana_inicio IS NOT NULL
        AND ventana_fin IS NOT NULL
        AND (ventana_inicio < $3 AND ventana_fin > $2)
    `, [ci_id, inicioColchon.toISOString(), finColchon.toISOString()]);

    if (rfcsMismoCI.length > 0) {
      for (const c of rfcsMismoCI) {
        registrarConflicto(
          "mismo_ci",
          `Conflicto en CI: La RFC ${c.codigo_cambio} ('${c.titulo}') interviene el mismo activo en horario solapado o dentro del colchón de ${colchonMin} min.`,
          `CI #${ci_id}`
        );
      }
    }
  }

  // E. Regla: Mismo Implementador
  if (implementador_id) {
    const rfcsMismoImplementador = await query(`
      SELECT codigo_cambio, titulo, ventana_inicio, ventana_fin
      FROM cambio
      WHERE estado_registro = true
        AND id_usuario_responsable = $1
        AND ventana_inicio IS NOT NULL
        AND ventana_fin IS NOT NULL
        AND (ventana_inicio < $3 AND ventana_fin > $2)
    `, [implementador_id, fechaInicioISO, fechaFinISO]);

    if (rfcsMismoImplementador.length > 0) {
      for (const imp of rfcsMismoImplementador) {
        registrarConflicto(
          "mismo_implementador",
          `El implementador seleccionado ya tiene asignada la RFC ${imp.codigo_cambio} ('${imp.titulo}') en ese mismo intervalo.`,
          `Usuario #${implementador_id}`
        );
      }
    }
  }

  // F. Regla: Capacidad y concurrencia máxima
  const maxGlobal = snapshotConflictos.reglas?.find((r: any) => r.codigo === "capacidad_concurrencia")?.max_global_simultaneo || 5;
  if (rfcsConcurrentes.length >= maxGlobal) {
    registrarConflicto(
      "capacidad_concurrencia",
      `Límite de concurrencia excedido: Actualmente existen ${rfcsConcurrentes.length} RFCs programadas en simultáneo (máximo permitido: ${maxGlobal}).`,
      "Capacidad Global"
    );
  }

  // Generar sugerencias de huecos libres en los próximos 7 días
  const huecos_libres: any[] = [];
  const fechaBase = new Date(inicioDate);
  for (let i = 1; i <= 4; i++) {
    const candidatoInicio = new Date(fechaBase.getTime() + i * 24 * 3600 * 1000);
    candidatoInicio.setHours(22, 0, 0, 0); // Horario típico de ventana nocturna
    const candidatoFin = new Date(candidatoInicio.getTime() + duracion_horas * 3600 * 1000);

    // Comprobar que no coincida con congelamiento estricto
    const enCongelamiento = periodosCongelamiento.some((pc: any) => {
      const pIni = new Date(pc.fecha_inicio);
      const pFin = new Date(pc.fecha_fin);
      return candidatoInicio < pFin && candidatoFin > pIni && pc.severidad === "bloqueo_total";
    });

    if (!enCongelamiento) {
      huecos_libres.push({
        fecha: candidatoInicio.toISOString().substring(0, 10),
        hora_inicio: "22:00",
        hora_fin: candidatoFin.toTimeString().substring(0, 5),
        ventana_nombre: "Noche de mantenimiento programado",
        capacidad_disponible: `${maxGlobal - 1} cupos libres`
      });
    }
  }

  const tieneBloqueos = bloqueos.length > 0;
  const tieneAdvertencias = advertencias.length > 0;

  return {
    resultado: tieneBloqueos ? "bloqueado" : tieneAdvertencias ? "advertencia" : "aprobado",
    resumen: tieneBloqueos 
      ? `Se detectaron ${bloqueos.length} bloqueos normativos para esta programación.` 
      : tieneAdvertencias 
      ? `Se detectaron ${advertencias.length} advertencias que requieren revisión o excepción.` 
      : "Horario verificado con éxito. Sin conflictos detectados con el calendario.",
    bloqueos,
    advertencias,
    detalles_conflictos,
    huecos_libres,
    rfcs_concurrentes_detectadas: rfcsConcurrentes.length
  };
}
