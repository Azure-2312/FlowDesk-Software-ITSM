// Consumo de la API de clientes de la empresa externa (Equipo 10).
// · La llamada se hace SIEMPRE desde el servidor: la clave (EQUIPO10_API_KEY)
//   nunca llega al navegador.
// · Los datos no se guardan en FlowDesk: se consultan, se exportan y se descartan.
// · Cada extracción queda en la bitácora inmutable (quién, cuándo, cuántos, formato).
import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface ClienteExterno {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  ubigeo: string;
  fecha_registro: string;
}

interface ConfigEquipo10 {
  url_base: string;
  ruta: string;
  por_pagina: number;
  tiempo_espera_ms: number;
}

const MAX_PAGINAS = 50; // tope de seguridad: 50 × 100 = 5000 clientes

async function leerConfig(): Promise<ConfigEquipo10> {
  const fila = await queryRow<{ valor: any }>(
    `SELECT valor FROM configuracion_sistema WHERE clave = 'integracion_equipo10_clientes'`
  );
  const v = fila?.valor || {};
  const config: ConfigEquipo10 = {
    url_base: process.env.EQUIPO10_API_URL || v.url_base || "https://carrito-equipo10.onrender.com",
    ruta: v.ruta || "/api/clientes",
    por_pagina: Math.min(Math.max(Number(v.por_pagina) || 100, 1), 100),
    tiempo_espera_ms: Math.min(Math.max(Number(v.tiempo_espera_ms) || 90000, 5000), 110000),
  };
  let url: URL;
  try {
    url = new URL(config.ruta, config.url_base);
  } catch {
    throw new ErrorDominio("La URL configurada de la API externa no es válida.", 500);
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new ErrorDominio("La API externa debe usar HTTPS.", 500);
  }
  return config;
}

function textoSeguro(v: unknown, max = 200): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[\u0000-\u001f\u007f]/g, " ").trim().substring(0, max);
}

function normalizar(c: any): ClienteExterno {
  return {
    id: textoSeguro(c?.id, 40),
    nombres: textoSeguro(c?.nombres, 120),
    apellidos: textoSeguro(c?.apellidos, 120),
    correo: textoSeguro(c?.correo, 150),
    telefono: textoSeguro(c?.telefono, 30),
    direccion: textoSeguro(c?.direccion, 200),
    ubigeo: textoSeguro(c?.ubigeo, 10),
    fecha_registro: textoSeguro(c?.fecha_registro, 40),
  };
}

const MENSAJES_HTTP: Record<number, string> = {
  400: "La API externa rechazó los parámetros de la consulta.",
  401: "La API externa rechazó la clave de acceso (revise EQUIPO10_API_KEY).",
  403: "La API externa denegó el acceso.",
  405: "La API externa no admite el método usado.",
  429: "La API externa limitó las peticiones; intente en unos minutos.",
  500: "La API externa tuvo un error interno.",
  503: "La API externa no está disponible en este momento.",
};

async function pedirPagina(config: ConfigEquipo10, clave: string, pagina: number, esperaMs: number) {
  const url = new URL(config.ruta, config.url_base);
  url.searchParams.set("pagina", String(pagina));
  url.searchParams.set("por_pagina", String(config.por_pagina));

  for (let intento = 1; intento <= 2; intento++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: { "X-API-Key": clave, Accept: "application/json" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(esperaMs),
      });
    } catch (err: any) {
      if (intento === 2) {
        const porTiempo = err?.name === "TimeoutError" || err?.name === "AbortError";
        throw new ErrorDominio(
          porTiempo
            ? "La API externa no respondió a tiempo (puede estar iniciando). Intente nuevamente en un minuto."
            : "No se pudo conectar con la API externa.",
          504
        );
      }
      continue;
    }
    // Render responde 502/503 mientras "despierta": un reintento corto.
    if ((res.status === 502 || res.status === 503 || res.status === 504) && intento === 1) {
      await new Promise((r) => setTimeout(r, 4000));
      continue;
    }
    if (!res.ok) {
      throw new ErrorDominio(MENSAJES_HTTP[res.status] || `La API externa respondió con estado ${res.status}.`, 502);
    }
    const tipo = res.headers.get("content-type") || "";
    if (!tipo.includes("application/json")) throw new ErrorDominio("La API externa no devolvió JSON.", 502);
    const cuerpo = await res.json();
    if (!cuerpo || !Array.isArray(cuerpo.clientes)) {
      throw new ErrorDominio("La respuesta de la API externa no tiene el formato esperado.", 502);
    }
    return cuerpo;
  }
  throw new ErrorDominio("No se pudo conectar con la API externa.", 504);
}

export async function extraerClientesEquipo10() {
  const clave = process.env.EQUIPO10_API_KEY || "";
  if (!clave) {
    throw new ErrorDominio("Falta configurar la variable de entorno EQUIPO10_API_KEY en el servidor.", 503);
  }
  const config = await leerConfig();

  const primera = await pedirPagina(config, clave, 1, config.tiempo_espera_ms);
  const totalPaginas = Math.min(Math.max(Number(primera.total_paginas) || 1, 1), MAX_PAGINAS);
  const clientes: ClienteExterno[] = primera.clientes.map(normalizar);

  for (let p = 2; p <= totalPaginas; p++) {
    const pagina = await pedirPagina(config, clave, p, 30000);
    clientes.push(...pagina.clientes.map(normalizar));
  }

  return {
    equipo: textoSeguro(primera.equipo, 60) || "Equipo 10",
    total_informado: Number(primera.total) || clientes.length,
    truncado: Number(primera.total_paginas) > MAX_PAGINAS,
    origen: new URL(config.ruta, config.url_base).host,
    fecha_extraccion: new Date().toISOString(),
    clientes,
  };
}
