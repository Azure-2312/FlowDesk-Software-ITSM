import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarCodigo, validarTexto } from "@/shared/lib/validaciones";

export async function listarDepartamentosEmpresa() {
  const departamentos = await query(
    "SELECT d.*,COUNT(u.id_usuario)::int AS colaboradores FROM departamento_empresa d LEFT JOIN usuario u ON u.id_departamento_empresa=d.id_departamento_empresa AND u.estado_registro=true GROUP BY d.id_departamento_empresa ORDER BY d.nombre"
  );
  return { departamentos };
}

export async function crearDepartamentoEmpresa(body: any) {
  const vCod = validarCodigo(body.codigo, 2, 20, "El código del departamento empresarial");
  if (!vCod.valido) throw new ErrorDominio(vCod.mensaje!);

  const vNom = validarTexto(body.nombre, 2, 100, "El nombre del departamento empresarial", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  const nombre = String(body.nombre).trim();
  const codigo = String(body.codigo).trim().toUpperCase();

  try {
    const departamento = await queryRow(
      "INSERT INTO departamento_empresa(codigo,nombre,descripcion) VALUES($1,$2,$3) RETURNING *",
      [codigo, nombre, String(body.descripcion || "").trim() || null]
    );
    return { httpStatus: 201, payload: { departamento } };
  } catch (e: any) {
    if (e.code === "23505") throw new ErrorDominio("Ya existe un departamento con ese código o nombre.", 409);
    throw e;
  }
}
