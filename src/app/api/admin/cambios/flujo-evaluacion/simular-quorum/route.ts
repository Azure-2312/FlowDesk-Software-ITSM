import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";

export const dynamic = "force-dynamic";

interface MiembroSimulacion {
  id_usuario: number;
  nombre: string;
  rol_comite: string;
  perfil_origen?: string;
  suplente_id?: number | null;
  suplente_nombre?: string;
  presente?: boolean;
  voto?: "aprobar" | "aprobar_con_condiciones" | "rechazar" | "aplazar" | "solicitar_informacion" | "abstencion";
  condicion_texto?: string;
  es_solicitante?: boolean;
  es_implementador?: boolean;
  grupo_implementador_coincide?: boolean;
  ausente?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { comite_id = "cab", miembros = [], parametros_custom } = body;

    // Obtener configuración de comités si no se envían parámetros custom
    let configComite = parametros_custom;
    if (!configComite) {
      const dbRow = await queryRow(`
        SELECT snapshot FROM configuracion_modulo_versiones 
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'comites' AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `);
      configComite = dbRow?.snapshot?.[comite_id] || {};
    }

    const quorumMinimo = configComite.quorum_minimo ?? (comite_id === "cab" ? 3 : 2);
    const presenciaPresiObligatoria = configComite.presencia_presidente_obligatoria ?? true;
    const reglaAprobacion = configComite.regla_aprobacion ?? (comite_id === "cab" ? "mayoria_simple" : "dos_de_tres");
    const desempate = configComite.desempate ?? "voto_calidad_presidente";
    const abstencionesCuentanQuorum = configComite.abstenciones_cuentan_para_quorum ?? false;
    const excluirConflicto = configComite.exclusion_conflicto_interes ?? true;

    const miembrosConfig: MiembroSimulacion[] = miembros.length > 0 ? miembros : (configComite.miembros || []);

    const excluidosConflicto: any[] = [];
    const miembrosEfectivos: any[] = [];
    let presidentePresente = false;
    let votoPresidente: string | null = null;

    for (const m of miembrosConfig) {
      // 1. Verificar conflicto de interés
      if (excluirConflicto && (m.es_solicitante || m.es_implementador || m.grupo_implementador_coincide)) {
        excluidosConflicto.push({
          id_usuario: m.id_usuario,
          nombre: m.nombre,
          rol: m.rol_comite,
          motivo: m.es_solicitante ? "Es el solicitante del cambio" : m.es_implementador ? "Es el implementador del cambio" : "Pertenece al grupo implementador"
        });
        continue;
      }

      // 2. Verificar ausencia y reemplazo por suplente
      let actorId = m.id_usuario;
      let actorNombre = m.nombre;
      let suplenteActuo = false;

      if (m.ausente) {
        if (m.suplente_id && m.suplente_id !== m.id_usuario) {
          actorId = m.suplente_id;
          actorNombre = m.suplente_nombre || `Suplente de ${m.nombre}`;
          suplenteActuo = true;
        } else {
          // Ausente sin suplente, no participa
          continue;
        }
      }

      const tieneVoto = m.rol_comite === "presidente" || m.rol_comite === "secretario" || m.rol_comite === "miembro_voto";
      const esPresidente = m.rol_comite === "presidente";

      if (esPresidente && (m.presente !== false)) {
        presidentePresente = true;
        votoPresidente = m.voto || null;
      }

      miembrosEfectivos.push({
        id_usuario: actorId,
        nombre: actorNombre,
        rol_comite: m.rol_comite,
        tiene_voto: tieneVoto,
        suplente_actuante: suplenteActuo,
        presente: m.presente !== false,
        voto: m.voto || "aprobar",
        condicion_texto: m.condicion_texto || ""
      });
    }

    // 3. Cálculo de quórum
    const votantesPresentes = miembrosEfectivos.filter(m => m.presente && m.tiene_voto);
    const totalPresentesVotantes = abstencionesCuentanQuorum 
      ? votantesPresentes.length 
      : votantesPresentes.filter(m => m.voto !== "abstencion").length;

    const quorumAlcanzado = totalPresentesVotantes >= quorumMinimo && (!presenciaPresiObligatoria || presidentePresente);

    // 4. Conteo de votos
    const conteo = {
      aprobar: 0,
      aprobar_con_condiciones: 0,
      rechazar: 0,
      aplazar: 0,
      solicitar_informacion: 0,
      abstencion: 0
    };

    votantesPresentes.forEach(m => {
      if (m.voto && m.voto in conteo) {
        conteo[m.voto as keyof typeof conteo]++;
      }
    });

    const votosFavorables = conteo.aprobar + conteo.aprobar_con_condiciones;
    const votosNegativos = conteo.rechazar;
    const votosEmitidosValidos = votosFavorables + votosNegativos;

    let dictamen = "No determinado";
    let detalleDictamen = "";

    if (!quorumAlcanzado) {
      dictamen = "Sin quórum";
      detalleDictamen = `No se alcanzó el quórum mínimo (${totalPresentesVotantes}/${quorumMinimo} miembros requeridos)${!presidentePresente && presenciaPresiObligatoria ? " o faltó el Presidente del comité." : "."}`;
    } else {
      if (reglaAprobacion === "unanimidad") {
        if (votosNegativos === 0 && votosFavorables > 0 && conteo.aplazar === 0 && conteo.solicitar_informacion === 0) {
          dictamen = conteo.aprobar_con_condiciones > 0 ? "Aprobado con condiciones" : "Aprobado";
          detalleDictamen = "Unanimidad alcanzada favorablemente.";
        } else {
          dictamen = votosNegativos > 0 ? "Rechazado" : "Aplazado / No unánime";
          detalleDictamen = "No se logró la unanimidad exigida por la política.";
        }
      } else if (reglaAprobacion === "dos_de_tres") {
        if (votosFavorables >= 2) {
          dictamen = conteo.aprobar_con_condiciones > 0 ? "Aprobado con condiciones" : "Aprobado";
          detalleDictamen = `Se alcanzaron ${votosFavorables} votos a favor de 3 requeridos en ECAB.`;
        } else if (votosNegativos >= 2) {
          dictamen = "Rechazado";
          detalleDictamen = `Se registraron ${votosNegativos} votos en contra.`;
        } else {
          dictamen = "Aplazado";
          detalleDictamen = "No se logró el umbral mínimo de 2 de 3 votos a favor.";
        }
      } else if (reglaAprobacion === "mayoria_calificada") {
        const umbral23 = Math.ceil((votantesPresentes.length * 2) / 3);
        if (votosFavorables >= umbral23) {
          dictamen = conteo.aprobar_con_condiciones > 0 ? "Aprobado con condiciones" : "Aprobado";
          detalleDictamen = `Mayoría calificada alcanzada (${votosFavorables}/${umbral23} votos).`;
        } else {
          dictamen = "Rechazado";
          detalleDictamen = `No se alcanzó la mayoría calificada de 2/3 (${votosFavorables}/${umbral23}).`;
        }
      } else {
        // mayoria_simple
        if (votosFavorables > votosNegativos) {
          dictamen = conteo.aprobar_con_condiciones > 0 ? "Aprobado con condiciones" : "Aprobado";
          detalleDictamen = `Mayoría simple favorable (${votosFavorables} a favor vs. ${votosNegativos} en contra).`;
        } else if (votosNegativos > votosFavorables) {
          dictamen = "Rechazado";
          detalleDictamen = `Mayoría simple denegada (${votosNegativos} en contra vs. ${votosFavorables} a favor).`;
        } else if (votosFavorables === votosNegativos && votosEmitidosValidos > 0) {
          if (desempate === "voto_calidad_presidente" && votoPresidente) {
            dictamen = (votoPresidente === "aprobar" || votoPresidente === "aprobar_con_condiciones") ? "Aprobado por voto de calidad del presidente" : "Rechazado por voto de calidad del presidente";
            detalleDictamen = `Empate técnico resuelto mediante el voto de calidad del Presidente (${votoPresidente}).`;
          } else {
            dictamen = "Aplazado por empate";
            detalleDictamen = "Empate técnico. Se aplaza el dictamen a la siguiente sesión según política.";
          }
        } else if (conteo.solicitar_informacion > 0) {
          dictamen = "Solicitud de información";
          detalleDictamen = "El comité determinó requerir información complementaria al solicitante.";
        } else {
          dictamen = "Aplazado";
          detalleDictamen = "Sin votos determinantes emitidos.";
        }
      }
    }

    return NextResponse.json({
      comite_id,
      regla_aprobacion: reglaAprobacion,
      quorum_minimo: quorumMinimo,
      presencia_presidente_obligatoria: presenciaPresiObligatoria,
      presidente_presente: presidentePresente,
      total_miembros_evaluados: miembrosConfig.length,
      votantes_presentes: votantesPresentes.length,
      quorum_alcanzado: quorumAlcanzado,
      desglose_votos: conteo,
      excluidos_conflicto: excluidosConflicto,
      dictamen_final: dictamen,
      detalle_dictamen: detalleDictamen
    });
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/simular-quorum:", error);
    return NextResponse.json({ error: error.message || "Error al simular quórum" }, { status: 500 });
  }
}
