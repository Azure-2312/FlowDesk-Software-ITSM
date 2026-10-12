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
      {/* Breadcrumb reglamentario */}
      <nav style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none" }}>
          Configuración
        </Link>
        {" / "}
        <Link href="/admin/servicios" style={{ color: "#2563eb", textDecoration: "none" }}>
          Catálogo de servicios
        </Link>
        {" / "}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Objetivos SLA</span>
      </nav>

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
