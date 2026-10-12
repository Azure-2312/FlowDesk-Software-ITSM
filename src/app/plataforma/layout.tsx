import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verificarTokenSesion, COOKIE_SESION } from "@/modules/seguridad/authService";
import { obtenerMenuDelUsuario } from "@/shared/lib/menu";
import MenuLateral from "@/shared/components/layout/MenuLateral";
import BotonLogout from "@/shared/components/layout/BotonLogout";
import SelectorPerfil from "@/shared/components/layout/SelectorPerfil";

/** Saca las iniciales del nombre para mostrarlas en el avatar circular. */
function obtenerIniciales(nombres: string): string {
  return nombres
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    redirect("/login");
  }

  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);

  return (
    <div className="app-layout">
      <aside className="barra-lateral">
        <div className="barra-lateral-contenido">
          <div className="barra-lateral-cabecera">
            <div className="marca-fila">
              <span className="marca-titulo">Sistema de tickets</span>
              <SelectorPerfil perfiles={sesion.perfiles} perfilActivo={sesion.perfilActivo} />
            </div>
          </div>
          <MenuLateral opciones={menu} />
        </div>
        <div className="barra-lateral-pie">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
            <Link
              href="/mi-cuenta"
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
      </aside>

      <div className="app-area-principal">
        <main className="contenido-principal">{children}</main>
      </div>
    </div>
  );
}
