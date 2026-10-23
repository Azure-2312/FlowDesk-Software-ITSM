// =====================================================================
// Modulo Identidades
// Usuarios, perfiles y credenciales de acceso.
//
// Contrato publico: importar SOLO desde "@/modules/identidades".
// =====================================================================

export { listarUsuarios, crearUsuario } from "./services/usuarioService";

export {
  actualizarUsuario,
  alternarEstadoUsuario,
  type ContextoAuditoriaUsuario,
} from "./services/usuarioDetalleService";

export { desbloquearUsuario } from "./services/usuarioDetalleDesbloquearService";

export { enviarCredenciales } from "./services/enviarCredencialesService";

export { listarPerfiles, crearPerfil } from "./services/perfilService";

export { actualizarPerfil, alternarEstadoPerfil } from "./services/perfilDetalleService";
