import EventosWorkspace from "@/modules/operacion/components/EventosWorkspace";
import { exigirPerfilPagina } from "@/lib/page-auth";
export default function PaginaEventos(){const {idPerfil}=exigirPerfilPagina([2,4,6,7,8,9]);return <EventosWorkspace perfil={idPerfil}/>}
