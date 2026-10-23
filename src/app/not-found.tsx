"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Home } from "@/shared/components/ui/Iconos";

export default function Pagina404NoEncontrada() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "24px 16px",
      }}
    >
      <div
        className="tarjeta"
        style={{
          maxWidth: 480,
          width: "100%",
          padding: "36px 32px",
          textAlign: "center",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <AlertCircle size={34} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            HTTP 404 · No Encontrado
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "8px 0 12px" }}>
          Página no encontrada
        </h1>

        <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: "0 0 24px" }}>
          La ruta que intentas consultar no existe o ha sido reubicada dentro del sistema.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="boton-secundario"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          <Link
            href="/plataforma"
            className="boton-primario"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            <Home size={14} />
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
