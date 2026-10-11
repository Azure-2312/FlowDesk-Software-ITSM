import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { COOKIE_SESION,verificarTokenSesion } from "@/lib/auth";

export async function PATCH(req:NextRequest,{params}:{params:{id:string}}){
 const token=req.cookies.get(COOKIE_SESION)?.value;const sesion=token?verificarTokenSesion(token):null;
 if(!sesion)return NextResponse.json({error:"No autenticado"},{status:401});
 if(sesion.perfilActivo?.id_perfil!==9)return NextResponse.json({error:"Solo el Gestor de Activos y Configuración puede modificar proveedores"},{status:403});
 const id=Number(params.id);if(!Number.isInteger(id))return NextResponse.json({error:"Proveedor no válido"},{status:400});
 try{const b=await req.json();const estado=String(b.estado||"ACTIVO").toUpperCase();if(!["ACTIVO","EN_REVISION","VENCIDO","INACTIVO"].includes(estado))return NextResponse.json({error:"Estado no válido"},{status:400});
 const rows=await query(`UPDATE proveedor_ti SET estado=$2,observaciones=COALESCE($3,observaciones),usuario_modificacion=$4,fecha_modificacion=now(),estado_registro=($2<>'INACTIVO') WHERE id_proveedor=$1 RETURNING id_proveedor,codigo_proveedor,nombre,estado,observaciones`,[id,estado,b.observaciones===undefined?null:String(b.observaciones).trim(),sesion.id_usuario]);
 if(!rows.length)return NextResponse.json({error:"Proveedor no encontrado"},{status:404});return NextResponse.json(rows[0]);
 }catch(error){console.error("Error al actualizar proveedor:",error);return NextResponse.json({error:"No se pudo actualizar el proveedor"},{status:500})}
}
