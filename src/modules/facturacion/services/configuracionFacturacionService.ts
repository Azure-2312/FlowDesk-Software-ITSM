// Configuración de la integración con Nubefact (solo Administrador) y datos
// tributarios de cada proveedor (RUC y razón social).
// El token NO se guarda aquí: vive en la variable de entorno NUBEFACT_TOKEN.

import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import {
  CLAVE_CONFIG_NUBEFACT,
  CONFIG_POR_DEFECTO,
  obtenerConfigNubefact,
  rutaValida,
  tokenConfigurado,
  type ConfigNubefact,
} from "./nubefactCliente";

export async function leerConfiguracion() {
  const config = await obtenerConfigNubefact();
  return { config, credenciales: { token: tokenConfigurado() } };
}

export async function guardarConfiguracion(entrada: Partial<ConfigNubefact>, idUsuario: number) {
  const actual = await obtenerConfigNubefact();
  const nueva: ConfigNubefact = { ...CONFIG_POR_DEFECTO, ...actual };
  if (entrada.ruta !== undefined) {
    const ruta = String(entrada.ruta).trim().replace(/\/+$/, "");
    if (ruta && !rutaValida(ruta)) {
      throw new ErrorDominio("La ruta debe ser la de su cuenta de Nubefact, por ejemplo https://api.nubefact.com/api/v1/xxxxxxxx-xxxx-...");
    }
    nueva.ruta = ruta;
  }
  if (entrada.serie_factura !== undefined) {
    const s = String(entrada.serie_factura).trim().toUpperCase();
    if (!/^F[A-Z0-9]{3}$/.test(s)) throw new ErrorDominio("La serie de facturas debe tener 4 caracteres y empezar con F (ej. FFF1).");
    nueva.serie_factura = s;
  }
  if (entrada.serie_boleta !== undefined) {
    const s = String(entrada.serie_boleta).trim().toUpperCase();
    if (!/^B[A-Z0-9]{3}$/.test(s)) throw new ErrorDominio("La serie de boletas debe tener 4 caracteres y empezar con B (ej. BBB1).");
    nueva.serie_boleta = s;
  }
  if (entrada.ruc_institucion !== undefined) {
    const ruc = String(entrada.ruc_institucion).trim();
    if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) throw new ErrorDominio("El RUC de la institución debe tener 11 dígitos válidos.");
    nueva.ruc_institucion = ruc;
  }
  if (entrada.razon_social_institucion !== undefined) nueva.razon_social_institucion = String(entrada.razon_social_institucion).trim().slice(0, 100);
  if (entrada.direccion_institucion !== undefined) nueva.direccion_institucion = String(entrada.direccion_institucion).trim().slice(0, 100);
  if (entrada.tiempo_espera_ms !== undefined) nueva.tiempo_espera_ms = Math.min(Math.max(Number(entrada.tiempo_espera_ms) || 30000, 5000), 60000);
  if (entrada.habilitado !== undefined) nueva.habilitado = Boolean(entrada.habilitado);
  if (entrada.exigir_conformidad_para_costo !== undefined) nueva.exigir_conformidad_para_costo = Boolean(entrada.exigir_conformidad_para_costo);
  if (nueva.habilitado && (!nueva.ruc_institucion || !nueva.ruta)) {
    throw new ErrorDominio("Para habilitar la integración registre la ruta de Nubefact y el RUC de la institución.");
  }

  await query(
    `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
     VALUES ($1, 'INTEGRACIONES', 'Facturación electrónica SUNAT vía Nubefact (proveedor autorizado)', $2::jsonb, $3, now())
     ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, usuario_modificacion = EXCLUDED.usuario_modificacion, fecha_modificacion = now()`,
    [CLAVE_CONFIG_NUBEFACT, JSON.stringify(nueva), idUsuario]
  );
  return nueva;
}

export async function listarProveedoresFacturacion() {
  return query(
    `SELECT id_proveedor, codigo_proveedor, nombre, razon_social, ruc, (ruc IS NOT NULL) AS habilitado_sunat,
            (SELECT COUNT(*)::int FROM comprobante_proveedor c WHERE c.id_proveedor = p.id_proveedor AND c.estado_registro) AS comprobantes
       FROM proveedor_ti p WHERE estado_registro = true ORDER BY nombre`
  );
}

export async function guardarVinculoProveedor(idProveedor: number, entrada: { ruc?: string; razon_social?: string }) {
  const existe = await queryRow(`SELECT 1 FROM proveedor_ti WHERE id_proveedor = $1 AND estado_registro = true`, [idProveedor]);
  if (!existe) throw new ErrorDominio("Proveedor no encontrado.", 404);
  const ruc = entrada.ruc ? String(entrada.ruc).trim() : null;
  if (ruc && !/^(10|15|17|20)\d{9}$/.test(ruc)) throw new ErrorDominio("El RUC del proveedor debe tener 11 dígitos válidos.");
  try {
    await query(
      `UPDATE proveedor_ti SET ruc = $2, razon_social = $3, fecha_modificacion = now() WHERE id_proveedor = $1`,
      [idProveedor, ruc, entrada.razon_social ? String(entrada.razon_social).trim().slice(0, 255) : null]
    );
  } catch (e: any) {
    if (e?.code === "23505") throw new ErrorDominio("Ya existe otro proveedor con ese RUC.", 409);
    throw e;
  }
}
