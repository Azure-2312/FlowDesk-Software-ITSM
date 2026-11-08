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
    <div style={{ padding: "20px 28px 80px 28px", minWidth: 1080, backgroundColor: "#f8fafc", minHeight: "100vh" }}>

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
