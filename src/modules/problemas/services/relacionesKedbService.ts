import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface PruebaCoincidenciaKedb {
  titulo?: string;
  descripcion?: string;
  id_servicio?: number | string;
  texto_ci?: string;
}

/**
 * Simulador de coincidencia de errores conocidos (KEDB).
 * Puntúa candidatos según los pesos configurados en `problema_config_kedb`.
 */
export async function probarCoincidenciaKedb(prueba: PruebaCoincidenciaKedb) {
  const { titulo, descripcion, id_servicio, texto_ci } = prueba || {};

  const config =
    (await queryRow<any>("SELECT * FROM problema_config_kedb WHERE id_config = 1")) || {
      peso_servicio: 4,
      peso_categoria: 3,
      peso_ci: 5,
      peso_clase_ci: 2,
      peso_palabras_titulo: 4,
      peso_palabras_descripcion: 3,
      umbral_minimo_coincidencia: 60,
      maximo_sugerencias: 5,
    };

  const erroresBase = [
    {
      id_ke: "KE-000101",
      titulo: "Fallo recurrente en cola de impresión del servidor Spooler Print-01",
      sintomas: "Impresoras en red se quedan en estado de pausa y los trabajos se acumulan sin salir.",
      causa: "Desbordamiento de búfer en el controlador HP Universal Print Driver v6.8.",
      workaround:
        "Reiniciar el servicio 'Spooler' en Windows Server mediante PowerShell: Restart-Service Spooler -Force",
      servicio: "Impresión y Digitalización",
      ci: "SRV-PRINT-01",
      estado: "Publicado",
    },
    {
      id_ke: "KE-000102",
      titulo: "Cierre inesperado de cliente VPN FortiClient tras actualización de Windows",
      sintomas: "Error 'Unable to logon to the server' al llegar al 48% de la negociación SSL VPN.",
      causa: "Conflicto con adaptador de red virtual WAN Miniport (IP).",
      workaround:
        "Deshabilitar IPv6 en el adaptador de red físico y ejecutar 'netsh winsock reset' en símbolo del sistema como Administrador.",
      servicio: "Acceso Remoto y VPN",
      ci: "FW-CORP-01",
      estado: "Publicado",
    },
    {
      id_ke: "KE-000103",
      titulo: "Bloqueo de consultas SQL por Deadlock en base de datos transaccional",
      sintomas: "Timeout de conexión en módulo de facturación y lentitud generalizada en ERP.",
      causa: "Falta de índice cubridor en tabla 'comprobante_detalle' durante el cierre contable.",
      workaround:
        "Ejecutar script kill para sesión bloqueante y forzar query hint (NOLOCK) en reportes de solo lectura.",
      servicio: "Base de Datos y ERP",
      ci: "BD-PROD-CLUSTER",
      estado: "Publicado",
    },
  ];

  const palabrasTituloPrueba = (titulo || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
  const palabrasDescPrueba = (descripcion || "").toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);

  const resultados = erroresBase
    .map((ke) => {
      let score = 0;
      const maxPosible = 100;

      const matchTitulo = palabrasTituloPrueba.filter((w: string) => ke.titulo.toLowerCase().includes(w)).length;
      if (matchTitulo > 0) score += Math.min(30, matchTitulo * 15 * (config.peso_palabras_titulo / 5));

      const matchDesc = palabrasDescPrueba.filter((w: string) =>
        (ke.sintomas + " " + ke.causa).toLowerCase().includes(w)
      ).length;
      if (matchDesc > 0) score += Math.min(30, matchDesc * 10 * (config.peso_palabras_descripcion / 5));

      if (id_servicio && ke.servicio.toLowerCase().includes("impresión") && id_servicio === 1) {
        score += 25 * (config.peso_servicio / 5);
      }

      if (texto_ci && ke.ci.toLowerCase().includes(texto_ci.toLowerCase())) {
        score += 35 * (config.peso_ci / 5);
      }

      const porcentaje = Math.min(100, Math.round(score));
      return {
        ...ke,
        porcentaje_coincidencia: porcentaje,
        supera_umbral: porcentaje >= config.umbral_minimo_coincidencia,
      };
    })
    .sort((a, b) => b.porcentaje_coincidencia - a.porcentaje_coincidencia);

  return {
    ok: true,
    umbralMinimo: config.umbral_minimo_coincidencia,
    sugerencias: resultados.slice(0, config.maximo_sugerencias),
  };
}
