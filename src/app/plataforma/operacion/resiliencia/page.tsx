import ResilienciaWorkspace from "@/components/itsm/ResilienciaWorkspace";
import { exigirPerfilPagina } from "@/lib/page-auth";
export default function PaginaResiliencia(){const {idPerfil}=exigirPerfilPagina([4,6,7,8,9]);return <ResilienciaWorkspace perfil={idPerfil}/>}
