"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PerfilBasico } from "@/types";

interface Props {
  perfiles: PerfilBasico[];
  perfilActivo: PerfilBasico;
}

export default function SelectorPerfilActivo({ perfiles, perfilActivo }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cambiandoA, setCambiandoA] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const tieneVariosPerfiles = perfiles.length > 1;

  // Cerrar el menú desplegable al hacer clic fuera
  useEffect(() => {
    function manejarClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener("mousedown", manejarClicFuera);
    }
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
    };
  }, [abierto]);

  async function cambiarA(idPerfil: number) {
    if (idPerfil === perfilActivo.id_perfil || cambiandoA !== null) {
      setAbierto(false);
      return;
    }

    setError(null);
    setCambiandoA(idPerfil);

    try {
      const respuesta = await fetch("/api/auth/cambiar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_perfil: idPerfil }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        setError(datos.error ?? "No se pudo cambiar de perfil");
        return;
      }

      setAbierto(false);
      const destinosPorPerfil: Record<number, string> = {
        1: "/admin/usuarios",
        2: "/tickets/gestion/asignados",
        3: "/tickets/gestion/mios",
        4: "/tickets/gestion/todos",
        5: "/tickets/gestion/aprobaciones",
        6: "/tickets/gestion/auditoria",
        7: "/cambios/gestion/cab",
        8: "/cambios",
        9: "/activos",
      };
      const destino = destinosPorPerfil[idPerfil] ?? "/tickets";

      window.location.href = destino;
    } catch {
      setError("Error de conexión");
    } finally {
      setCambiandoA(null);
    }
  }

  return (
    <div className="selector-perfil-contenedor" ref={contenedorRef}>
      <button
        type="button"
        className={`boton-selector-perfil ${abierto ? "boton-selector-perfil-activo" : ""}`}
        onClick={() => tieneVariosPerfiles && setAbierto(!abierto)}
        disabled={!tieneVariosPerfiles || cambiandoA !== null}
        title={tieneVariosPerfiles ? "Cambiar de perfil" : `Perfil activo: ${perfilActivo.nombre}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className="nombre-perfil-activo">
          {cambiandoA === perfilActivo.id_perfil || (cambiandoA !== null && perfiles.some(p => p.id_perfil === cambiandoA))
            ? "Cambiando..."
            : perfilActivo.nombre}
        </span>
        {tieneVariosPerfiles && (
          <svg
            className={`icono-desplegable ${abierto ? "rotado" : ""}`}
            width="12"
            height="12"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {abierto && (
        <div className="menu-desplegable-perfiles" role="listbox">
          <div className="desplegable-encabezado">Cambiar perfil</div>
          {perfiles.map((perfil) => {
            const esActivo = perfil.id_perfil === perfilActivo.id_perfil;
            const estaCargandoEste = cambiandoA === perfil.id_perfil;

            return (
              <button
                key={perfil.id_perfil}
                type="button"
                role="option"
                aria-selected={esActivo}
                className={`item-desplegable-perfil ${esActivo ? "item-perfil-seleccionado" : ""}`}
                onClick={() => cambiarA(perfil.id_perfil)}
                disabled={cambiandoA !== null}
              >
                <div className="item-perfil-contenido">
                  <span className="item-perfil-nombre">{perfil.nombre}</span>
                  {estaCargandoEste && <span className="item-perfil-tag">...</span>}
                  {esActivo && !estaCargandoEste && (
                    <span className="item-perfil-check" title="Perfil actualmente activo" aria-label="Perfil actualmente activo">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {error && <div className="desplegable-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
