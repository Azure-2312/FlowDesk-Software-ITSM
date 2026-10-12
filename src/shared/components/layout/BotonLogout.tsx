"use client";

import { useRouter } from "next/navigation";

export default function BotonCerrarSesion({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="boton-cerrar-sesion"
      onClick={cerrarSesion}
      title="Cerrar sesión del sistema"
      style={compacto ? { width: "auto", padding: "8px", justifyContent: "center", flexShrink: 0 } : undefined}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {!compacto && <span>Cerrar sesión</span>}
    </button>
  );
}
