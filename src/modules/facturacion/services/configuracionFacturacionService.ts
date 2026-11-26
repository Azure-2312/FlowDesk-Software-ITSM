// Configuración de la integración fact_api (solo Administrador) y vínculo
// proveedor ↔ empresa/sucursal de fact_api.

import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import {
  CONFIG_POR_DEFECTO,
  credencialesConfiguradas,
  obtenerConfigFactApi,
  type ConfigFactApi,
} from "./factApiCliente";

export async function leerConfiguracion() {
  const config = await obtenerConfigFactApi();
  return { config, credenciales: credencialesConfiguradas() };
}

export async function guardarConfiguracion(entrada: Partial<ConfigFactApi>, idUsuario: number) {
  const actual = await obtenerConfigFactApi();
  const nueva: ConfigFactApi = { ...CONFIG_POR_DEFECTO, ...actual };
  if (entrada.url_base !== undefined) {
    const url = String(entrada.url_base).trim();
    if (!/^https?:\/\/[^\s]+$/i.test(url)) throw new ErrorDominio("La URL base debe empezar con http:// o https://.");
    nueva.url_base = url.replace(/\/+$/, "");
  }
  if (entrada.ruc_institucion !== undefined) {
    const ruc = String(entrada.ruc_institucion).trim();
    if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) throw new ErrorDominio("El RUC de la institución debe tener 11 dígitos válidos.");
    nueva.ruc_institucion = ruc;
  }
  if (entrada.razon_social_institucion !== undefined) nueva.razon_social_institucion = String(entrada.razon_social_institucion).trim().slice(0, 255);
  if (entrada.direccion_institucion !== undefined) nueva.direccion_institucion = String(entrada.direccion_institucion).trim().slice(0, 255);
  if (entrada.tiempo_espera_ms !== undefined) nueva.tiempo_espera_ms = Math.min(Math.max(Number(entrada.tiempo_espera_ms) || 20000, 3000), 60000);
  if (entrada.habilitado !== undefined) nueva.habilitado = Boolean(entrada.habilitado);
  if (entrada.exigir_conformidad_para_costo !== undefined) nueva.exigir_conformidad_para_costo = Boolean(entrada.exigir_conformidad_para_costo);
  if (nueva.habilitado && !nueva.ruc_institucion) throw new ErrorDominio("Para habilitar la integración registre el RUC de la institución.");

  await query(
    `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
     VALUES ('integracion_fact_api', 'INTEGRACIONES', 'API de facturación electrónica SUNAT (fact_api)', $1::jsonb, $2, now())
     ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, usuario_modificacion = EXCLUDED.usuario_modificacion, fecha_modificacion = now()`,
    [JSON.stringify(nueva), idUsuario]
  );
  return nueva;
}

export async function listarProveedoresFacturacion() {
  return query(
    `SELECT id_proveedor, codigo_proveedor, nombre, razon_social, ruc, fact_company_id, fact_branch_id,
            serie_factura, serie_boleta,
            (ruc IS NOT NULL AND fact_company_id IS NOT NULL AND fact_branch_id IS NOT NULL) AS habilitado_sunat,
            (SELECT COUNT(*)::int FROM comprobante_proveedor c WHERE c.id_proveedor = p.id_proveedor AND c.estado_registro) AS comprobantes
       FROM proveedor_ti p WHERE estado_registro = true ORDER BY nombre`
  );
}

export async function guardarVinculoProveedor(
  idProveedor: number,
  entrada: { ruc?: string; razon_social?: string; fact_company_id?: number | null; fact_branch_id?: number | null; serie_factura?: string; serie_boleta?: string }
) {
  const existe = await queryRow(`SELECT 1 FROM proveedor_ti WHERE id_proveedor = $1 AND estado_registro = true`, [idProveedor]);
  if (!existe) throw new ErrorDominio("Proveedor no encontrado.", 404);
  const ruc = entrada.ruc ? String(entrada.ruc).trim() : null;
  if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) throw new ErrorDominio("El RUC del proveedor debe tener 11 dígitos válidos.");
  const serieF = String(entrada.serie_factura || "F001").toUpperCase();
  const serieB = String(entrada.serie_boleta || "B001").toUpperCase();
  if (!/^F[A-Z0-9]{3}$/.test(serieF)) throw new ErrorDominio("La serie de factura debe tener 4 caracteres y empezar con F (ej. F001).");
  if (!/^B[A-Z0-9]{3}$/.test(serieB)) throw new ErrorDominio("La serie de boleta debe tener 4 caracteres y empezar con B (ej. B001).");
  const entero = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : NaN);
  const company = entero(entrada.fact_company_id), branch = entero(entrada.fact_branch_id);
  if (Number.isNaN(company) || Number.isNaN(branch)) throw new ErrorDominio("Los identificadores de empresa y sucursal de fact_api deben ser enteros positivos.");
  try {
    await query(
      `UPDATE proveedor_ti SET ruc = $2, razon_social = $3, fact_company_id = $4, fact_branch_id = $5,
              serie_factura = $6, serie_boleta = $7, fecha_modificacion = now()
        WHERE id_proveedor = $1`,
      [idProveedor, ruc, entrada.razon_social ? String(entrada.razon_social).trim().slice(0, 255) : null, company, branch, serieF, serieB]
    );
  } catch (e: any) {
    if (e?.code === "23505") throw new ErrorDominio("Ya existe otro proveedor con ese RUC.", 409);
    throw e;
  }
}
