import ProveedoresWorkspace from "@/modules/proveedores/components/ProveedoresWorkspace";
import { exigirPerfilPagina } from "@/lib/page-auth";
export default function PaginaProveedores(){const {idPerfil}=exigirPerfilPagina([6,7,8,9]);return <ProveedoresWorkspace puedeEditar={idPerfil===9}/>}
