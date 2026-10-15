import VistaResilienciaOperacion from "@/modules/operacion/views/VistaResilienciaOperacion";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";
export default function PaginaResiliencia(){const {idPerfil}=exigirPerfilPagina([4,6,7,8,9]);return <VistaResilienciaOperacion perfil={idPerfil}/>}
