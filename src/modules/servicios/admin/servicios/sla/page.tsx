"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConfiguracionObjetivosSla from "../ConfiguracionObjetivosSla";

function ContenidoPaginaSla() {
  const searchParams = useSearchParams();
  const subvista = searchParams.get("subvista");
  const tabInicial = subvista === "matriz" ? "matriz" : "tiempos";

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", width: "100%" }}>
      <ConfiguracionObjetivosSla pestañaInicial={tabInicial} />
    </div>
  );
}

export default function PaginaAdminSla() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando objetivos SLA...</div>}>
      <ContenidoPaginaSla />
    </Suspense>
  );
}
