import { redirect } from "next/navigation";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";
export default function OperacionServicios(){exigirPerfilPagina([2,4,5,6,7,8,9]);redirect("/operacion/eventos")}
