import VistaEventosOperacion from "@/modules/operacion/views/VistaEventosOperacion";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";
export default function PaginaEventos(){const {idPerfil}=exigirPerfilPagina([2,4,6,7,8,9]);return <VistaEventosOperacion perfil={idPerfil}/>}
