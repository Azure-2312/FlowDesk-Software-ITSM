import { NextRequest, NextResponse } from "next/server";
import { autenticarApiKey } from "@/shared/lib/api-key-auth";
import {
  listarUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorDni,
  registrarUsuario,
  actualizarUsuario,
  obtenerTrazabilidad,
} from "@/modules/identidades/services/apiClientesService";

export async function handleListarUsuarios(req: NextRequest) {
  const auth = await autenticarApiKey(req, "clientes:read");
  if (!auth.autorizado) return auth.respuesta;

  try {
    const searchParams = req.nextUrl.searchParams;
    const filtros = {
      busqueda: searchParams.get("busqueda") || searchParams.get("q"),
      departamento: searchParams.get("departamento") || searchParams.get("area"),
      rol: searchParams.get("rol"),
      limite: searchParams.get("limite"),
      pagina: searchParams.get("pagina")
    };

    const resultado = await listarUsuarios(filtros);

    await auth.registrarAuditoria(200);

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Listado de usuarios/trabajadores recuperado exitosamente desde la base de datos de FlowDesk ITSM",
        grupo_solicitante: auth.credencial.nombre_grupo,
        ...resultado,
        timestamp: new Date().toISOString()
      },
      { headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    await auth.registrarAuditoria(500, err.message);
    return NextResponse.json(
      {
        exito: false,
        codigo_error: "ERROR_INTERNO",
        mensaje: "Error interno al consultar usuarios: " + (err.message || err),
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: auth.headersRateLimit }
    );
  }
}

export async function handleCrearUsuario(req: NextRequest) {
  const auth = await autenticarApiKey(req, "clientes:write");
  if (!auth.autorizado) return auth.respuesta;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      await auth.registrarAuditoria(400, "Cuerpo JSON inválido");
      return NextResponse.json(
        { exito: false, codigo_error: "JSON_INVALIDO", mensaje: "El cuerpo de la petición debe ser un JSON válido." },
        { status: 400, headers: auth.headersRateLimit }
      );
    }

    const grupoOrigen = auth.credencial.nombre_grupo || "GRUPO_EXTERNO";
    const nuevoUsuario = await registrarUsuario(body, grupoOrigen);

    await auth.registrarAuditoria(201);

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Trabajador/Cliente registrado exitosamente en la base de datos de FlowDesk ITSM",
        usuario: nuevoUsuario,
        cliente: nuevoUsuario,
        registrado_por: grupoOrigen,
        timestamp: new Date().toISOString()
      },
      { status: 201, headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    const status = err.status || 500;
    const codigo = err.codigo || "ERROR_REGISTRO";
    const mensaje = err.message || "Error al procesar el registro.";

    await auth.registrarAuditoria(status, mensaje);

    return NextResponse.json(
      {
        exito: false,
        codigo_error: codigo,
        mensaje,
        timestamp: new Date().toISOString()
      },
      { status, headers: auth.headersRateLimit }
    );
  }
}

export async function handleObtenerUsuarioPorId(req: NextRequest, id: string) {
  const auth = await autenticarApiKey(req, "clientes:read");
  if (!auth.autorizado) return auth.respuesta;

  try {
    const usuario = await obtenerUsuarioPorId(id);

    if (!usuario) {
      await auth.registrarAuditoria(404, `Usuario ID ${id} no encontrado`);
      return NextResponse.json(
        {
          exito: false,
          codigo_error: "USUARIO_NO_ENCONTRADO",
          mensaje: `No se encontró ningún usuario/trabajador con el ID [${id}]`,
          timestamp: new Date().toISOString()
        },
        { status: 404, headers: auth.headersRateLimit }
      );
    }

    await auth.registrarAuditoria(200);

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Usuario encontrado",
        usuario,
        cliente: usuario,
        timestamp: new Date().toISOString()
      },
      { headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    await auth.registrarAuditoria(500, err.message);
    return NextResponse.json(
      {
        exito: false,
        codigo_error: "ERROR_INTERNO",
        mensaje: "Error al obtener usuario: " + err.message,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: auth.headersRateLimit }
    );
  }
}

export async function handleActualizarUsuario(req: NextRequest, id: string) {
  const auth = await autenticarApiKey(req, "clientes:write");
  if (!auth.autorizado) return auth.respuesta;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      await auth.registrarAuditoria(400, "Cuerpo JSON inválido");
      return NextResponse.json(
        { exito: false, codigo_error: "JSON_INVALIDO", mensaje: "El cuerpo de la petición debe ser un JSON válido." },
        { status: 400, headers: auth.headersRateLimit }
      );
    }

    const grupoEditor = auth.credencial.nombre_grupo || "GRUPO_EXTERNO";
    const usuarioActualizado = await actualizarUsuario(id, body, grupoEditor);

    await auth.registrarAuditoria(200);

    return NextResponse.json(
      {
        exito: true,
        mensaje: `Trabajador/Cliente con ID [${id}] actualizado exitosamente`,
        usuario: usuarioActualizado,
        cliente: usuarioActualizado,
        actualizado_por: grupoEditor,
        timestamp: new Date().toISOString()
      },
      { headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    const status = err.status || 500;
    const codigo = err.codigo || "ERROR_ACTUALIZACION";
    const mensaje = err.message || "Error al actualizar usuario.";

    await auth.registrarAuditoria(status, mensaje);

    return NextResponse.json(
      {
        exito: false,
        codigo_error: codigo,
        mensaje,
        timestamp: new Date().toISOString()
      },
      { status, headers: auth.headersRateLimit }
    );
  }
}

export async function handleObtenerUsuarioPorDni(req: NextRequest, dni: string) {
  const auth = await autenticarApiKey(req, "clientes:read");
  if (!auth.autorizado) return auth.respuesta;

  try {
    const usuario = await obtenerUsuarioPorDni(dni);

    if (!usuario) {
      await auth.registrarAuditoria(404, `DNI ${dni} no encontrado`);
      return NextResponse.json(
        {
          exito: false,
          codigo_error: "USUARIO_NO_ENCONTRADO",
          mensaje: `No se encontró ningún usuario/trabajador con el DNI [${dni}]`,
          timestamp: new Date().toISOString()
        },
        { status: 404, headers: auth.headersRateLimit }
      );
    }

    await auth.registrarAuditoria(200);

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Usuario encontrado por DNI",
        usuario,
        cliente: usuario,
        timestamp: new Date().toISOString()
      },
      { headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    await auth.registrarAuditoria(500, err.message);
    return NextResponse.json(
      {
        exito: false,
        codigo_error: "ERROR_INTERNO",
        mensaje: "Error al buscar por DNI: " + err.message,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: auth.headersRateLimit }
    );
  }
}

export async function handleObtenerTrazabilidad(req: NextRequest) {
  const auth = await autenticarApiKey(req, "clientes:read");
  if (!auth.autorizado) return auth.respuesta;

  try {
    const limiteParam = req.nextUrl.searchParams.get("limite");
    const limite = limiteParam ? parseInt(limiteParam, 10) : 50;

    const resultado = await obtenerTrazabilidad(auth.credencial, limite);

    await auth.registrarAuditoria(200);

    return NextResponse.json(
      {
        exito: true,
        mensaje: "Bitácora de trazabilidad y auditoría forense de la API (Append-Only)",
        ...resultado,
        timestamp: new Date().toISOString()
      },
      { headers: auth.headersRateLimit }
    );
  } catch (err: any) {
    await auth.registrarAuditoria(500, err.message);
    return NextResponse.json(
      {
        exito: false,
        codigo_error: "ERROR_INTERNO",
        mensaje: "Error al obtener trazabilidad: " + err.message,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: auth.headersRateLimit }
    );
  }
}
