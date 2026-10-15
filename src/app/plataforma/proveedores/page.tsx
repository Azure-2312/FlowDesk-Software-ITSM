import VistaProveedores from "@/modules/proveedores/views/VistaProveedores";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";
export default function PaginaProveedores(){const {idPerfil}=exigirPerfilPagina([6,7,8,9]);return <VistaProveedores puedeEditar={idPerfil===9}/>}