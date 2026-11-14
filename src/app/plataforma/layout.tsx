// ============================================================================
// CONTENEDOR PRINCIPAL: Layout estructural de la plataforma web
// ============================================================================
// Renderiza la barra lateral fija, el selector de perfiles activos, el menú
// adaptativo según permisos y el contenedor central donde se inyectan las vistas.
// ============================================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verificarTokenSesion, COOKIE_SESION } from "@/modules/seguridad";
import { obtenerMenuDelUsuario } from "@/shared/lib/menu";
import MenuLateral from "@/shared/components/layout/MenuLateral";
import BarraLateral from "@/shared/components/layout/BarraLateral";
import BotonLogout from "@/shared/components/layout/BotonLogout";
import SelectorPerfil from "@/shared/components/layout/SelectorPerfil";

// ----------------------------------------------------------------------------
// 1. UTILIDAD DE AVATAR: Extrae iniciales del nombre para el círculo visual
// ----------------------------------------------------------------------------
function obtenerIniciales(nombres: string): string {
  return nombres
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? "")
    .join("");
}

// ----------------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL DEL SERVIDOR (RSC): Layout global autenticado
// ----------------------------------------------------------------------------
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  // Validación de token criptográfico de sesión
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  // Redirección si la sesión no es válida
  if (!sesion) {
    redirect("/login");
  }

  // Carga del árbol jerárquico de navegación según el rol activo del usuario
  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);

  return (
    <div className="app-layout">
      {/* -------------------------------------------------------------------- */}
      {/* 3. BARRA LATERAL: Encabezado, selector de perfil y menú adaptativo   */}
      {/* -------------------------------------------------------------------- */}
      <BarraLateral>
        <div className="barra-lateral-contenido">
          {/* Encabezado institucional y conmutador de perfil activo */}
          <div className="barra-lateral-cabecera">
            <div className="marca-fila">
              <span className="marca-titulo">Sistema de tickets</span>
              <SelectorPerfil perfiles={sesion.perfiles} perfilActivo={sesion.perfilActivo} />
            </div>
          </div>
          {/* Árbol jerárquico de navegación por dominios ITIL */}
          <MenuLateral opciones={menu} />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 4. PIE DE BARRA: Identidad del usuario autenticado y botón logout   */}
        {/* ------------------------------------------------------------------ */}
        <div className="barra-lateral-pie">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <Link
              href="/plataforma/mi-cuenta"
              className="boton-perfil-sidebar"
              title={`Mi perfil: ${sesion.nombres}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                minWidth: 0,
                flex: 1,
                padding: "6px 8px",
                borderRadius: 6,
                transition: "background-color 0.15s ease",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {obtenerIniciales(sesion.nombres)}
              </span>
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sesion.nombres}
                </span>
                <span style={{ display: "block", fontSize: 10.5, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sesion.correo_electronico}
                </span>
              </span>
            </Link>
            <BotonLogout compacto={true} />
          </div>
        </div>
      </BarraLateral>

      {/* -------------------------------------------------------------------- */}
      {/* 5. ÁREA PRINCIPAL: Renderizado de la vista de negocio activa        */}
      {/* -------------------------------------------------------------------- */}
      <div className="app-area-principal">
        <main className="contenido-principal">{children}</main>
      </div>
    </div>
  );
}
