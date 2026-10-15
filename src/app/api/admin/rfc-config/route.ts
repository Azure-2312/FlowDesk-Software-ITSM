import { NextRequest,NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION,verificarTokenSesion } from "@/shared/lib/auth";

function admin(req:NextRequest){const token=req.cookies.get(COOKIE_SESION)?.value;const sesion=token?verificarTokenSesion(token):null;return sesion?.perfilActivo?.id_perfil===1?sesion:null}
export async function GET(req:NextRequest){
  const token=req.cookies.get(COOKIE_SESION)?.value;const sesion=token?verificarTokenSesion(token):null;
  if(!sesion||![1,2,8].includes(sesion.perfilActivo?.id_perfil||0))return NextResponse.json({error:"No autorizado para consultar la configuración de RFC"},{status:403});
  try{const row=await queryRow("SELECT perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas FROM configuracion_rfc WHERE id_configuracion=1");return NextResponse.json(row||{perfiles_solicitantes:[2,8],tipos_rfc:["ESTANDAR","NORMAL","EMERGENCIA"],exige_ci:false,exige_plan_pruebas:false,permite_emergencia:true,campos_personalizados:[],exige_rollback:true,duracion_maxima_horas:24})}
  catch(e){console.error("Error al consultar configuración RFC:",e);return NextResponse.json({error:"No se pudo consultar la configuración RFC"},{status:500})}
}
export async function PUT(req:NextRequest){
  const sesion=admin(req);if(!sesion)return NextResponse.json({error:"Solo Administración puede modificar el esquema RFC"},{status:403});
  try{
    const b=await req.json();
    const perfiles:number[]=Array.from(new Set<number>((Array.isArray(b.perfiles_solicitantes)?b.perfiles_solicitantes:[]).map((x:unknown)=>Number(x))));
    const tipos=Array.from(new Set<string>((Array.isArray(b.tipos_rfc)?b.tipos_rfc:[]).map((x:unknown)=>String(x).toUpperCase()))).filter(x=>["ESTANDAR","NORMAL","EMERGENCIA"].includes(x));
    if(!perfiles.length||perfiles.some(x=>![2,8].includes(x)))return NextResponse.json({error:"Solo se puede habilitar a Técnico y Gestor de Cambios como solicitantes de RFC"},{status:400});
    if(!tipos.length)return NextResponse.json({error:"Selecciona al menos un tipo RFC válido."},{status:400});
    const campos=Array.isArray(b.campos_personalizados)?b.campos_personalizados:[];
    if(campos.length>20||campos.some((f:any)=>!f||!/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave||""))||!String(f.etiqueta||"").trim()||!["texto","area","numero","fecha","correo","lista"].includes(f.tipo)||(f.tipo==="lista"&&(!Array.isArray(f.opciones)||!f.opciones.length))))return NextResponse.json({error:"Revisa las claves, etiquetas, tipos y opciones de los campos RFC."},{status:400});
    if(new Set(campos.map((f:any)=>f.clave)).size!==campos.length)return NextResponse.json({error:"Las claves de campos RFC deben ser únicas."},{status:400});
    const duracion=Number(b.duracion_maxima_horas);if(!Number.isInteger(duracion)||duracion<1||duracion>720)return NextResponse.json({error:"La duración máxima debe estar entre 1 y 720 horas."},{status:400});
    const row=await queryRow(`INSERT INTO configuracion_rfc(id_configuracion,perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas,usuario_modificacion,fecha_modificacion) VALUES(1,$1,$2,$3,$4,$5,$6,$7,$8,$9,now()) ON CONFLICT(id_configuracion) DO UPDATE SET perfiles_solicitantes=EXCLUDED.perfiles_solicitantes,tipos_rfc=EXCLUDED.tipos_rfc,exige_ci=EXCLUDED.exige_ci,exige_plan_pruebas=EXCLUDED.exige_plan_pruebas,permite_emergencia=EXCLUDED.permite_emergencia,campos_personalizados=EXCLUDED.campos_personalizados,exige_rollback=EXCLUDED.exige_rollback,duracion_maxima_horas=EXCLUDED.duracion_maxima_horas,usuario_modificacion=EXCLUDED.usuario_modificacion,fecha_modificacion=now() RETURNING perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas`,[perfiles,tipos,Boolean(b.exige_ci),Boolean(b.exige_plan_pruebas),Boolean(b.permite_emergencia),JSON.stringify(campos),Boolean(b.exige_rollback),duracion,sesion.id_usuario]);

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "CAMBIOS",
        "ACTUALIZAR_CONFIGURACION_RFC",
        `El usuario ${sesion.nombres} actualizó las reglas del esquema RFC (Rollback obligatorio: ${Boolean(b.exige_rollback)}, CI obligatorio: ${Boolean(b.exige_ci)}, Ventana máx: ${duracion}h).`,
        JSON.stringify({ perfiles_solicitantes: perfiles, tipos_rfc: tipos, exige_rollback: Boolean(b.exige_rollback), exige_ci: Boolean(b.exige_ci), duracion_maxima_horas: duracion }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json(row);
  }catch(e){console.error("Error al guardar configuración RFC:",e);return NextResponse.json({error:"No se pudo guardar la configuración RFC"},{status:500})}
}
