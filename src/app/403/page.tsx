"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "@/shared/components/ui/Iconos";

export default function Pagina403AccesoDenegado() {
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
          maxWidth: 520,
          width: "100%",
          padding: "36px 32px",
          textAlign: "center",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Icono de seguridad */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <ShieldAlert size={34} />
        </div>

        {/* Badge de código HTTP */}
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            HTTP 403 · Acceso No Autorizado
          </span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "8px 0 12px" }}>
          Acceso denegado a esta sección
        </h1>

        <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: "0 0 20px" }}>
          No dispones de los permisos normativos o la opción solicitada no está habilitada para tu perfil institucional activo en esta sesión.
        </p>

        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 12,
            color: "#64748b",
            textAlign: "left",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          <strong style={{ color: "#334155", display: "block", marginBottom: 4 }}>
            Recomendaciones de navegación:
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Si cuentas con más de un rol asignado, verifica tu perfil activo en la barra superior.</li>
            <li>Si requieres acceso permanente por funciones de cargo, coordina con el administrador de plataforma.</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              Volver a la página anterior
            </button>

            <Link
              href="/plataforma/dashboard"
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
              Ir al Panel Principal
            </Link>
          </div>

          <div>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#64748b",
                textDecoration: "none",
                marginTop: 6,
              }}
            >
              <LogOut size={13} />
              Iniciar sesión con otra cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
