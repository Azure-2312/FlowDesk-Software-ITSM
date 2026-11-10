"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VistaConfiguracionFormularioMesa from "@/modules/tickets/config/VistaConfiguracionFormularioMesa";

function ContenidoTicketsFormularios({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" }) {
  const searchParams = useSearchParams();
  const tipo = tipoFijo || (searchParams.get("tipo") === "solicitud" ? "solicitud" : "incidente");
  return <VistaConfiguracionFormularioMesa tipo={tipo} />;
}

export default function PaginaTicketsFormularios({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" } = {}) {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando configuración de formulario...</p></div>}>
      <ContenidoTicketsFormularios tipoFijo={tipoFijo} />
    </Suspense>
  );
}
