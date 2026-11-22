import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query, transaccion } from "@/shared/lib/db";
import type { CredencialGrupo } from "@/shared/lib/api-key-auth";

export function validarEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function sanitizarTexto(texto: string): string {
  if (typeof texto !== "string") return "";
  return texto.trim().replace(/[<>]/g, "");
}

export interface FiltrosListado {
  busqueda?: string | null;
  departamento?: string | null;
  rol?: string | null;
  limite?: string | number | null;
  pagina?: string | number | null;
}

export async function listarUsuarios(filtros: FiltrosListado) {
  const limitNum = Math.min(Math.max(Number(filtros.limite) || 50, 1), 200);
  const pageNum = Math.max(Number(filtros.pagina) || 1, 1);
  const offset = (pageNum - 1) * limitNum;

  const condiciones: string[] = ["u.estado_registro = true"];
  const params: any[] = [];

  if (filtros.busqueda && filtros.busqueda.trim()) {
    params.push(`%${filtros.busqueda.trim()}%`);
    condiciones.push(`(
      u.nombres ILIKE $${params.length} OR 
      u.apellido_paterno ILIKE $${params.length} OR 
      u.apellido_materno ILIKE $${params.length} OR 
      u.dni ILIKE $${params.length} OR 
      u.correo_electronico ILIKE $${params.length}
    )`);
  }

  if (filtros.departamento && filtros.departamento.trim()) {
    params.push(`%${filtros.departamento.trim()}%`);
    condiciones.push(`de.nombre ILIKE $${params.length}`);
  }

  const whereClause = `WHERE ${condiciones.join(" AND ")}`;

  // Conteo total
  const countSql = `
    SELECT COUNT(DISTINCT u.id_usuario) as total
    FROM usuario u
    LEFT JOIN departamento_empresa de ON u.id_departamento_empresa = de.id_departamento_empresa
    ${whereClause}
  `;
  const countRes = await query<{ total: string }>(countSql, params);
  const total = parseInt(countRes[0]?.total || "0", 10);

  // Consulta de usuarios con departamento y perfiles
  const queryParams = [...params, limitNum, offset];
  const querySql = `
    SELECT 
      u.id_usuario,
      u.dni,
      u.nombres,
      u.apellido_paterno,
      u.apellido_materno,
      CONCAT(u.nombres, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
      u.correo_electronico,
      u.celular,
      u.correo_personal,
      COALESCE(de.nombre, 'Sin Asignar') as departamento,
      de.id_departamento_empresa,
      ARRAY_REMOVE(ARRAY_AGG(p.nombre), NULL) as roles_perfiles,
      u.estado_registro,
      u.fecha_creacion,
      u.fecha_modificacion
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON u.id_usuario = up.id_usuario AND up.estado_registro = true
    LEFT JOIN perfiles p ON up.id_perfil = p.id_perfil
    LEFT JOIN departamento_empresa de ON u.id_departamento_empresa = de.id_departamento_empresa
    ${whereClause}
    GROUP BY u.id_usuario, u.dni, u.nombres, u.apellido_paterno, u.apellido_materno,
             u.correo_electronico, u.celular, u.correo_personal, de.nombre, de.id_departamento_empresa,
             u.estado_registro, u.fecha_creacion, u.fecha_modificacion
    ORDER BY u.id_usuario ASC
    LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
  `;

  const rows = await query<any>(querySql, queryParams);

  const usuariosFormateados = rows.map((u) => ({
    id: u.id_usuario,
    dni: u.dni,
    nombres: u.nombres,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno,
    nombre_completo: u.nombre_completo.trim(),
    correo_electronico: u.correo_electronico,
    celular: u.celular || null,
    departamento: u.departamento,
    cargo_rol: u.roles_perfiles && u.roles_perfiles.length > 0 ? u.roles_perfiles.join(", ") : "Solicitante (Trabajador)",
    roles: u.roles_perfiles || [],
    tipo_usuario: "TRABAJADOR_EMPRESA",
    estado: u.estado_registro ? "ACTIVO" : "INACTIVO",
    fecha_registro: u.fecha_creacion
  }));

  return {
    total_registros: total,
    pagina_actual: pageNum,
    limite_por_pagina: limitNum,
    total_paginas: Math.ceil(total / limitNum) || 1,
    usuarios: usuariosFormateados,
    clientes: usuariosFormateados // Alias simétrico total
  };
}

export async function obtenerUsuarioPorId(id: string | number) {
  const idNum = Number(id);
  if (isNaN(idNum)) return null;

  const rows = await query<any>(
    `SELECT 
      u.id_usuario,
      u.dni,
      u.nombres,
      u.apellido_paterno,
      u.apellido_materno,
      CONCAT(u.nombres, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
      u.correo_electronico,
      u.celular,
      COALESCE(de.nombre, 'Sin Asignar') as departamento,
      ARRAY_REMOVE(ARRAY_AGG(p.nombre), NULL) as roles_perfiles,
      u.estado_registro,
      u.fecha_creacion
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON u.id_usuario = up.id_usuario AND up.estado_registro = true
    LEFT JOIN perfiles p ON up.id_perfil = p.id_perfil
    LEFT JOIN departamento_empresa de ON u.id_departamento_empresa = de.id_departamento_empresa
    WHERE u.id_usuario = $1
    GROUP BY u.id_usuario, de.nombre`,
    [idNum]
  );

  if (rows.length === 0) return null;
  const u = rows[0];

  return {
    id: u.id_usuario,
    dni: u.dni,
    nombres: u.nombres,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno,
    nombre_completo: u.nombre_completo.trim(),
    correo_electronico: u.correo_electronico,
    celular: u.celular,
    departamento: u.departamento,
    cargo_rol: u.roles_perfiles && u.roles_perfiles.length > 0 ? u.roles_perfiles.join(", ") : "Solicitante",
    roles: u.roles_perfiles || [],
    estado: u.estado_registro ? "ACTIVO" : "INACTIVO",
    fecha_registro: u.fecha_creacion
  };
}

export async function obtenerUsuarioPorDni(dni: string) {
  if (!dni) return null;
  const dniLimpio = String(dni).trim();

  const rows = await query<any>(
    `SELECT 
      u.id_usuario,
      u.dni,
      u.nombres,
      u.apellido_paterno,
      u.apellido_materno,
      CONCAT(u.nombres, ' ', u.apellido_paterno, ' ', COALESCE(u.apellido_materno, '')) AS nombre_completo,
      u.correo_electronico,
      u.celular,
      COALESCE(de.nombre, 'Sin Asignar') as departamento,
      ARRAY_REMOVE(ARRAY_AGG(p.nombre), NULL) as roles_perfiles,
      u.estado_registro,
      u.fecha_creacion
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON u.id_usuario = up.id_usuario AND up.estado_registro = true
    LEFT JOIN perfiles p ON up.id_perfil = p.id_perfil
    LEFT JOIN departamento_empresa de ON u.id_departamento_empresa = de.id_departamento_empresa
    WHERE u.dni = $1
    GROUP BY u.id_usuario, de.nombre`,
    [dniLimpio]
  );

  if (rows.length === 0) return null;
  const u = rows[0];

  return {
    id: u.id_usuario,
    dni: u.dni,
    nombres: u.nombres,
    apellido_paterno: u.apellido_paterno,
    apellido_materno: u.apellido_materno,
    nombre_completo: u.nombre_completo.trim(),
    correo_electronico: u.correo_electronico,
    celular: u.celular,
    departamento: u.departamento,
    cargo_rol: u.roles_perfiles && u.roles_perfiles.length > 0 ? u.roles_perfiles.join(", ") : "Solicitante",
    roles: u.roles_perfiles || [],
    estado: u.estado_registro ? "ACTIVO" : "INACTIVO",
    fecha_registro: u.fecha_creacion
  };
}

export async function registrarUsuario(payload: any, grupoOrigen: string = "API_EXTERNA") {
  const {
    dni,
    numero_documento,
    nombres,
    apellido_paterno,
    apellido_materno,
    apellidos,
    correo_electronico,
    email,
    celular,
    telefono,
    departamento
  } = payload;

  const docFinal = String(dni || numero_documento || "").trim();
  const nomFinal = sanitizarTexto(nombres || "");
  const apePatFinal = sanitizarTexto(apellido_paterno || (apellidos ? apellidos.split(" ")[0] : ""));
  const apeMatFinal = sanitizarTexto(apellido_materno || (apellidos ? apellidos.split(" ").slice(1).join(" ") : ""));
  const correoFinal = String(correo_electronico || email || "").trim().toLowerCase();
  const celularFinal = sanitizarTexto(celular || telefono || "");

  // 1. Validaciones de dominio
  if (!docFinal) {
    throw { status: 400, codigo: "CAMPO_FALTANTE", message: "El campo [dni] (o numero_documento) es obligatorio." };
  }
  if (!/^\d{8}$/.test(docFinal)) {
    throw { status: 400, codigo: "DNI_INVALIDO", message: "El DNI debe contener exactamente 8 dígitos numéricos." };
  }
  if (!nomFinal) {
    throw { status: 400, codigo: "CAMPO_FALTANTE", message: "El campo [nombres] es obligatorio." };
  }
  if (!apePatFinal) {
    throw { status: 400, codigo: "CAMPO_FALTANTE", message: "El campo [apellido_paterno] es obligatorio." };
  }
  if (!correoFinal || !validarEmail(correoFinal)) {
    throw { status: 400, codigo: "EMAIL_INVALIDO", message: "El campo [correo_electronico] debe ser un correo válido." };
  }

  // 2. Unicidad DNI
  const existeDni = await obtenerUsuarioPorDni(docFinal);
  if (existeDni) {
    throw {
      status: 409,
      codigo: "DNI_DUPLICADO",
      message: `Ya existe un usuario registrado con el DNI [${docFinal}] (ID: ${existeDni.id}, Nombre: ${existeDni.nombre_completo}).`
    };
  }

  // 3. Unicidad Correo
  const existeCorreo = await query<{ id_usuario: number }>(
    "SELECT id_usuario FROM usuario WHERE LOWER(correo_electronico) = $1",
    [correoFinal]
  );
  if (existeCorreo.length > 0) {
    throw {
      status: 409,
      codigo: "CORREO_DUPLICADO",
      message: `El correo electrónico [${correoFinal}] ya se encuentra registrado en el sistema.`
    };
  }

  // 4. Asignar Departamento transparente (sin defaults forzados)
  let idDep: number | null = null;
  let nombreDepFinal = "Sin Asignar";
  if (departamento && String(departamento).trim()) {
    const depRows = await query<{ id_departamento_empresa: number; nombre: string }>(
      "SELECT id_departamento_empresa, nombre FROM departamento_empresa WHERE nombre ILIKE $1 LIMIT 1",
      [`%${String(departamento).trim()}%`]
    );
    if (depRows.length > 0) {
      idDep = depRows[0].id_departamento_empresa;
      nombreDepFinal = depRows[0].nombre;
    }
  }

  // 5. Clave criptográfica aleatoria segura e inutilizable (debe_cambiar_clave = true)
  const claveAleatoriaInutilizable = crypto.randomBytes(32).toString("hex");
  const claveHash = await bcrypt.hash(claveAleatoriaInutilizable, 10);

  // 6. Invocación al Stored Procedure: sp_registrar_usuario_cliente
  // Ejecuta la inserción atómica en usuario y usuario_perfiles (perfil 3 Solicitante) dentro del motor PostgreSQL
  const res = await query<any>(
    `SELECT * FROM sp_registrar_usuario_cliente($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      docFinal,
      nomFinal,
      apePatFinal,
      apeMatFinal || null,
      correoFinal,
      celularFinal || null,
      claveHash,
      idDep
    ]
  );

  const nuevo = res[0];

  return {
    id_usuario: nuevo.id_usuario,
    id: nuevo.id_usuario,
    dni: nuevo.dni,
    nombres: nuevo.nombres,
    apellido_paterno: nuevo.apellido_paterno,
    apellido_materno: nuevo.apellido_materno,
    nombre_completo: `${nuevo.nombres} ${nuevo.apellido_paterno} ${nuevo.apellido_materno || ""}`.trim(),
    correo_electronico: nuevo.correo_electronico,
    celular: nuevo.celular,
    departamento_asignado: nombreDepFinal,
    perfil_asignado: "Solicitante (Trabajador de la Empresa)",
    acceso_web: "Requiere activación de credenciales por el administrador",
    registrado_por: grupoOrigen,
    fecha_creacion: nuevo.fecha_creacion
  };
}

export async function actualizarUsuario(
  id: string | number,
  payload: any,
  grupoEditor: string = "API_EXTERNA"
) {
  const usuarioExistente = await obtenerUsuarioPorId(id);
  if (!usuarioExistente) {
    throw {
      status: 404,
      codigo: "USUARIO_NO_ENCONTRADO",
      message: `No se encontró ningún trabajador/cliente con el ID [${id}].`
    };
  }

  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    correo_electronico,
    celular,
    departamento,
    estado
  } = payload;

  if (correo_electronico && !validarEmail(correo_electronico)) {
    throw {
      status: 400,
      codigo: "EMAIL_INVALIDO",
      message: "El formato del correo electrónico proporcionado no es válido."
    };
  }

  let idDep: number | null = null;
  if (departamento && String(departamento).trim()) {
    const depRows = await query<{ id_departamento_empresa: number }>(
      "SELECT id_departamento_empresa FROM departamento_empresa WHERE nombre ILIKE $1 LIMIT 1",
      [`%${String(departamento).trim()}%`]
    );
    if (depRows.length > 0) {
      idDep = depRows[0].id_departamento_empresa;
    }
  }

  // Invocación al Stored Procedure: sp_actualizar_usuario_cliente
  // Actualiza los campos de usuario y valida unicidad de correo atómicamente en PostgreSQL
  await query(
    `SELECT * FROM sp_actualizar_usuario_cliente($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      usuarioExistente.id,
      nombres ? sanitizarTexto(nombres) : null,
      apellido_paterno ? sanitizarTexto(apellido_paterno) : null,
      apellido_materno ? sanitizarTexto(apellido_materno) : null,
      correo_electronico ? correo_electronico.trim().toLowerCase() : null,
      celular ? sanitizarTexto(celular) : null,
      idDep,
      typeof estado === "boolean" ? estado : (estado === "ACTIVO" ? true : (estado === "INACTIVO" ? false : null))
    ]
  );

  const actualizado = await obtenerUsuarioPorId(usuarioExistente.id);
  return {
    ...actualizado,
    actualizado_por: grupoEditor
  };
}

export async function obtenerTrazabilidad(credencial: CredencialGrupo, limite: number = 50) {
  const limitNum = Math.min(Math.max(limite, 1), 100);
  const esAdmin = credencial.permisos.includes("admin");

  if (esAdmin) {
    const logs = await query<any>(
      `SELECT 
        id_log,
        grupo_identificado,
        metodo,
        ruta,
        codigo_estado,
        ip_origen,
        tiempo_respuesta_ms,
        mensaje_error,
        fecha_registro
      FROM api_log_auditoria
      ORDER BY id_log DESC
      LIMIT $1`,
      [limitNum]
    );

    const stats = await query<any>(`
      SELECT 
        COUNT(*) as total_peticiones,
        COUNT(CASE WHEN codigo_estado >= 200 AND codigo_estado < 300 THEN 1 END) as exitosas,
        COUNT(CASE WHEN codigo_estado = 401 THEN 1 END) as bloqueos_seguridad,
        COUNT(CASE WHEN codigo_estado = 409 THEN 1 END) as intentos_duplicados,
        COUNT(CASE WHEN codigo_estado = 429 THEN 1 END) as limite_excedido,
        ROUND(AVG(tiempo_respuesta_ms), 1) as tiempo_promedio_ms
      FROM api_log_auditoria
    `);

    return {
      alcance: "GLOBAL_ADMINISTRADOR",
      estadisticas: stats[0] || {},
      total_en_respuesta: logs.length,
      registros: logs
    };
  } else {
    const logs = await query<any>(
      `SELECT 
        id_log,
        grupo_identificado,
        metodo,
        ruta,
        codigo_estado,
        tiempo_respuesta_ms,
        mensaje_error,
        fecha_registro
      FROM api_log_auditoria
      WHERE id_credencial = $1 OR grupo_identificado = $2
      ORDER BY id_log DESC
      LIMIT $3`,
      [credencial.id_credencial, credencial.nombre_grupo, limitNum]
    );

    const stats = await query<any>(
      `SELECT 
        COUNT(*) as total_peticiones,
        COUNT(CASE WHEN codigo_estado >= 200 AND codigo_estado < 300 THEN 1 END) as exitosas,
        COUNT(CASE WHEN codigo_estado = 409 THEN 1 END) as intentos_duplicados,
        ROUND(AVG(tiempo_respuesta_ms), 1) as tiempo_promedio_ms
      FROM api_log_auditoria
      WHERE id_credencial = $1 OR grupo_identificado = $2`,
      [credencial.id_credencial, credencial.nombre_grupo]
    );

    return {
      alcance: "ACTIVIDAD_PROPIO_GRUPO",
      estadisticas: stats[0] || {},
      total_en_respuesta: logs.length,
      registros: logs
    };
  }
}
