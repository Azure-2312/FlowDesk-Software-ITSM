import { query, queryRow } from "@/shared/lib/db";

export async function simularEtapasFlujo(body: any) {
  const {
    tipo_cambio = "normal",
    nivel_riesgo = "medio",
    solicitante_id = 6, // Laura Morales (Solicitante)
    implementador_id = 5, // Carlos Quispe (Tecnico)
    supervisor_id = 7, // Roberto Flores (Supervisor)
    departamentos_afectados = [1],
    requiere_interrupcion = false,
    fuera_de_ventana = false,
    dentro_congelamiento = false
  } = body;

  // Obtener catálogo de etapas de aprobación y segregación de funciones
  const dbEtapas = await queryRow(`
    SELECT snapshot FROM configuracion_modulo_versiones 
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'etapas_aprobacion' AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `);
  const configEtapas = dbEtapas?.snapshot || {};
  const catalogoEtapas: any[] = configEtapas.etapas || [];
  const sodConfig = configEtapas.segregacion_funciones || {
    solicitante_no_aprueba: true,
    implementador_no_aprueba: true,
    no_dos_etapas_misma_persona: true,
    retroactivo_no_autoaprueba: true,
    aprobador_respaldo_activo: true,
    perfil_respaldo: "gestor_cambios"
  };

  // Obtener usuarios clave de la base de datos
  const usuarios = await query(`
    SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico,
           p.nombre as perfil, p.id_perfil
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
    LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
    WHERE u.estado_registro = true
  `);

  const gestorCambiosUsuario = usuarios.find(u => u.perfil === "Gestor de Cambios") || { id_usuario: 11, nombre_completo: "Diego Mendoza", correo_electronico: "diego.cambios@empresa.com" };
  const supervisorUsuario = usuarios.find(u => u.id_usuario === supervisor_id) || usuarios.find(u => u.perfil === "Supervisor") || { id_usuario: 7, nombre_completo: "Roberto Flores", correo_electronico: "roberto.supervisor@empresa.com" };
  const gestorAreaUsuario = usuarios.find(u => u.perfil === "Gestor de Area") || { id_usuario: 8, nombre_completo: "Patricia Salazar", correo_electronico: "patricia.area@empresa.com" };
  const aprobadorDireccion = usuarios.find(u => u.perfil === "Aprobador") || { id_usuario: 10, nombre_completo: "Elena Vargas", correo_electronico: "elena.cab@empresa.com" };

  // Determinar etapas requeridas según tipo y nivel de riesgo
  const codigosEtapasRequeridas: string[] = [];

  if (tipo_cambio === "estandar") {
    if (nivel_riesgo === "bajo") {
      codigosEtapasRequeridas.push("autorizacion_modelo");
    } else {
      // Reclasifica a normal
      codigosEtapasRequeridas.push("tecnica", "gestor_cambios");
    }
  } else if (tipo_cambio === "emergencia") {
    codigosEtapasRequeridas.push("ecab", "autorizacion_retroactiva");
  } else {
    // Normal
    if (nivel_riesgo === "bajo") {
      codigosEtapasRequeridas.push("tecnica", "gestor_cambios");
    } else if (nivel_riesgo === "medio") {
      codigosEtapasRequeridas.push("tecnica", "negocio", "gestor_cambios");
    } else if (nivel_riesgo === "alto") {
      codigosEtapasRequeridas.push("tecnica", "negocio", "cab");
    } else {
      // critico
      codigosEtapasRequeridas.push("tecnica", "negocio", "cab", "direccion");
    }
  }

  if (fuera_de_ventana && tipo_cambio === "normal") {
    codigosEtapasRequeridas.push("excepcion_ventana");
  }
  if (dentro_congelamiento) {
    codigosEtapasRequeridas.push("excepcion_congelamiento");
  }

  const etapasResueltas: any[] = [];
  const usuariosAprobadoresAsignados = new Set<number>();
  const advertenciasSoD: string[] = [];

  for (const cod of codigosEtapasRequeridas) {
    const etapaDef = catalogoEtapas.find(e => e.codigo === cod) || {
      codigo: cod,
      nombre: cod.toUpperCase(),
      regla_decision: "cualquiera",
      tipo_aprobador: "rol_contextual"
    };

    let candidato: any = null;
    let detalleAsignacion = "";

    if (cod === "autorizacion_modelo") {
      candidato = { id_usuario: 0, nombre_completo: "Motor de Sistema ITIL", correo_electronico: "sistema@local" };
      detalleAsignacion = "Auto-aprobación validada por homologación de modelo";
    } else if (cod === "tecnica") {
      candidato = supervisorUsuario;
      detalleAsignacion = "Supervisor del grupo implementador";
    } else if (cod === "negocio") {
      candidato = gestorAreaUsuario;
      detalleAsignacion = "Gestor de Área del departamento afectado";
    } else if (cod === "gestor_cambios") {
      candidato = gestorCambiosUsuario;
      detalleAsignacion = "Perfil Gestor de Cambios (Change Manager)";
    } else if (cod === "cab" || cod === "autorizacion_retroactiva") {
      candidato = { id_usuario: 999, nombre_completo: "Comité Asesor de Cambios (CAB)", correo_electronico: "cab@empresa.com" };
      detalleAsignacion = "Órgano colegiado multidisciplinario";
    } else if (cod === "ecab") {
      candidato = { id_usuario: 998, nombre_completo: "Comité de Emergencia (ECAB)", correo_electronico: "ecab@empresa.com" };
      detalleAsignacion = "Comité reducido de decisión inmediata";
    } else if (cod === "direccion" || cod === "excepcion_ventana" || cod === "excepcion_congelamiento") {
      candidato = aprobadorDireccion;
      detalleAsignacion = "Perfil Aprobador / Dirección Institucional";
    }

    // Verificación de SoD
    let sodConflicto = false;
    let sodMotivo = "";

    if (candidato && candidato.id_usuario > 0 && candidato.id_usuario < 900) {
      // 1. Solicitante no puede aprobar
      if (sodConfig.solicitante_no_aprueba && candidato.id_usuario === solicitante_id) {
        sodConflicto = true;
        sodMotivo = `El usuario ${candidato.nombre_completo} es el Solicitante de la RFC y no puede auto-aprobarse (SoD-1).`;
      }

      // 2. Implementador no puede aprobar
      if (!sodConflicto && sodConfig.implementador_no_aprueba && candidato.id_usuario === implementador_id) {
        sodConflicto = true;
        sodMotivo = `El usuario ${candidato.nombre_completo} es el Implementador técnico y no puede autorizar su propia intervención (SoD-2).`;
      }

      // 3. Misma persona no puede aprobar dos etapas
      if (!sodConflicto && sodConfig.no_dos_etapas_misma_persona && usuariosAprobadoresAsignados.has(candidato.id_usuario)) {
        sodConflicto = true;
        sodMotivo = `El usuario ${candidato.nombre_completo} ya figura como aprobador en una etapa previa de esta misma RFC (SoD-3).`;
      }

      // Aplicar aprobador de respaldo si hay conflicto
      if (sodConflicto) {
        advertenciasSoD.push(sodMotivo);
        if (sodConfig.aprobador_respaldo_activo) {
          const respaldo = gestorCambiosUsuario.id_usuario !== candidato.id_usuario 
            ? gestorCambiosUsuario 
            : aprobadorDireccion;
          detalleAsignacion += ` (Reasignado a Respaldo: ${respaldo.nombre_completo} por conflicto SoD)`;
          candidato = respaldo;
        }
      }

      usuariosAprobadoresAsignados.add(candidato.id_usuario);
    }

    etapasResueltas.push({
      etapa_codigo: etapaDef.codigo,
      etapa_nombre: etapaDef.nombre,
      tipo_aprobador: etapaDef.tipo_aprobador,
      regla_decision: etapaDef.regla_decision,
      aprobador_resuelto: candidato,
      detalle_asignacion: detalleAsignacion,
      conflicto_sod_detectado: sodConflicto,
      motivo_conflicto: sodMotivo
    });
  }

  return {
    tipo_cambio,
    nivel_riesgo,
    total_etapas: etapasResueltas.length,
    etapas: etapasResueltas,
    advertencias_sod: advertenciasSoD,
    segregacion_valida: advertenciasSoD.length === 0 || sodConfig.aprobador_respaldo_activo
  };
}
