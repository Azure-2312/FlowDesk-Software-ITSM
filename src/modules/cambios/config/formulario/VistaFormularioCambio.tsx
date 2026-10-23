"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "./components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "./components/ModalRestaurarFabrica";
import { ModalVistaPrevia } from "./components/ModalVistaPrevia";

import { PestanaCampos } from "./components/PestanaCampos";
import { PestanaCamposPersonalizados } from "./components/PestanaCamposPersonalizados";
import { PestanaCatalogos } from "./components/PestanaCatalogos";
import { PestanaCuestionarioRiesgo } from "./components/PestanaCuestionarioRiesgo";
import { PestanaPrioridad } from "./components/PestanaPrioridad";
import { PestanaPlantillas } from "./components/PestanaPlantillas";
import { PestanaVistaTicket } from "./components/PestanaVistaTicket";

type TabId =
  | "campos"
  | "campos_personalizados"
  | "catalogos"
  | "cuestionario_riesgo"
  | "prioridad"
  | "plantillas"
  | "vista_ticket";

const PESTANAS_INFO: Record<TabId, { numero: string; titulo: string; descripcion: string }> = {
  campos: {
    numero: "1.3.3.1.1",
    titulo: "Campos",
    descripcion: "Estructura, obligatoriedad y orden de los campos del formulario de registro y edición de RFC.",
  },
  campos_personalizados: {
    numero: "1.3.3.1.2",
    titulo: "Campos personalizados",
    descripcion: "Definición y catálogo de campos técnicos personalizados para la entidad Cambio.",
  },
  catalogos: {
    numero: "1.3.3.1.3",
    titulo: "Listas y catálogos",
    descripcion: "Valores predefinidos de categorías, orígenes, entornos, motivos y estados de cierre.",
  },
  cuestionario_riesgo: {
    numero: "1.3.3.1.4",
    titulo: "Cuestionario de riesgo",
    descripcion: "Ponderación multicriterio para el cálculo del nivel de riesgo y autoridad de cambio requerida.",
  },
  prioridad: {
    numero: "1.3.3.1.5",
    titulo: "Prioridad (matriz compartida)",
    descripcion: "Matriz institucional de Impacto × Urgencia compartida y textos guía para solicitudes de cambio.",
  },
  plantillas: {
    numero: "1.3.3.1.6",
    titulo: "Plantillas de RFC",
    descripcion: "Plantillas institucionales con campos prellenados y paquetes de tareas estándar.",
  },
  vista_ticket: {
    numero: "1.3.3.1.7",
    titulo: "Vista del ticket",
    descripcion: "Diseño de la cabecera fija, pestañas del ciclo de vida y panel lateral del ticket RFC.",
  },
};

export default function ConfiguracionFormularioCambiosPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("campos");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de control de versiones y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [hayBorrador, setHayBorrador] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [publicando, setPublicando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedePublicar, setPuedePublicar] = useState<boolean>(true);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Datos específicos de pestañas
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [camposPersonalizados, setCamposPersonalizados] = useState<any[]>([]);
  const [limiteCampos, setLimiteCampos] = useState<number>(30);

  // Modales
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [modalVistaPreviaAbierto, setModalVistaPreviaAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [rfcsAbiertasAfectadas, setRfcsAbiertasAfectadas] = useState<number>(0);

  // Cargar datos de la pestaña activa
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const [resConfig, resCP] = await Promise.all([
        fetch(`/api/cambios/configuracion/formulario/configuracion?pantalla=1.3.3.1&pestana=${tabActiva}`),
        fetch(`/api/cambios/configuracion/campos-personalizados`),
      ]);

      const dataConfig = await resConfig.json();
      const dataCP = await resCP.json();

      if (dataConfig.ok) {
        setVersionPublicada(dataConfig.version_publicada || 1);
        setFechaPublicada(dataConfig.fecha_publicacion || "");
        setAutorPublicada(dataConfig.autor_publicacion || "");
        setHayBorrador(dataConfig.tiene_borrador);
        setConfigSnapshot(dataConfig.configuracion || {});

        if (dataConfig.bloqueo?.en_edicion_por_otro) {
          setBloqueadoPorOtro(dataConfig.bloqueo.usuario_bloqueo?.nombre);
        } else {
          setBloqueadoPorOtro(undefined);
        }
      } else {
        setErrorCarga(dataConfig.error || "Error al cargar la configuración");
      }

      if (dataCP.ok) {
        setCamposPersonalizados(dataCP.campos || []);
        setLimiteCampos(dataCP.limite || 30);
      }
    } catch (err: any) {
      console.error("Error al cargar configuración:", err);
      setErrorCarga(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Guardar borrador de la pestaña activa
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/cambios/configuracion/formulario/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantalla: "1.3.3.1",
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: `Guardado de borrador en pestaña ${tabActiva}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setHayBorrador(true);
        alert("Borrador guardado exitosamente.");
      } else {
        alert(data.error || "No se pudo guardar el borrador.");
      }
    } catch (err) {
      console.error("Error al guardar borrador:", err);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de publicación
  const handleAbrirPublicar = async () => {
    try {
      const resCount = await fetch("/api/cambios");
      const rfcs = await resCount.json();
      const abiertas = Array.isArray(rfcs)
        ? rfcs.filter((r) => ![6, 7, 8].includes(r.id_estado)).length
        : 0;
      setRfcsAbiertasAfectadas(abiertas);
      setModalPublicarAbierto(true);
    } catch (err) {
      setRfcsAbiertasAfectadas(0);
      setModalPublicarAbierto(true);
    }
  };

  // Confirmar publicación
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/cambios/configuracion/formulario/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantalla: "1.3.3.1",
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo,
          diff: { tipo: "modificacion_general", pestana: tabActiva },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al publicar la configuración.");
      }

      alert(data.mensaje || "Versión publicada exitosamente.");
      setHayBorrador(false);
      cargarDatos();
    } finally {
      setPublicando(false);
    }
  };

  // Descartar borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("Se perderán todos los cambios del borrador sin publicar. ¿Desea continuar?")) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/formulario/configuracion?pantalla=1.3.3.1&pestana=${tabActiva}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHayBorrador(false);
        cargarDatos();
      }
    } catch (err) {
      console.error("Error al descartar:", err);
    }
  };

  // Restaurar fábrica
  const handleRestaurarFabrica = async () => {
    try {
      const res = await fetch("/api/cambios/configuracion/formulario/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pantalla: "1.3.3.1",
          pestana: tabActiva,
          accion: "restaurar_fabrica",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setHayBorrador(true);
        if (data.snapshot) setConfigSnapshot(data.snapshot);
        cargarDatos();
      }
    } catch (err) {
      console.error("Error al restaurar fábrica:", err);
    }
  };

  // Ver historial de versiones
  const handleVerHistorial = async () => {
    try {
      const res = await fetch(`/api/cambios/configuracion/formulario/configuracion?pantalla=1.3.3.1&pestana=${tabActiva}`);
      const data = await res.json();
      if (data.ok) {
        setVersionesHistorial([
          {
            id_version: 1,
            numero_version: data.version_publicada || 1,
            fecha_creacion: data.fecha_publicacion || new Date().toISOString(),
            autor_nombre: data.autor_publicacion || "Sistema ITSM",
            motivo: "Versión de fábrica inicial ITIL v4",
            snapshot: data.configuracion,
          },
        ]);
        setModalHistorialAbierto(true);
      }
    } catch (err) {
      console.error("Error al consultar historial:", err);
    }
  };

  // Exportar configuración a JSON
  const handleExportar = () => {
    const jsonStr = JSON.stringify(
      {
        modulo: "gestion_de_cambios",
        pantalla: "1.3.3.1",
        pestana: tabActiva,
        version: versionPublicada,
        fecha: new Date().toISOString(),
        configuracion: configSnapshot,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `config_cambios_${tabActiva}_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración desde JSON
  const handleImportar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target?.result as string);
          if (parsed.configuracion) {
            setConfigSnapshot(parsed.configuracion);
            setHayBorrador(true);
            alert("Configuración cargada en borrador. Revise y publique cuando esté listo.");
          } else {
            alert("El archivo JSON no tiene un formato válido de configuración.");
          }
        } catch (err) {
          alert("Error al leer el archivo JSON.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const pestanaActualInfo = PESTANAS_INFO[tabActiva];

  return (
    <div style={{ minWidth: 1200, backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ padding: "20px 28px 32px 28px", flex: 1 }}>
        {/* 1. Breadcrumb (Sección 3.1) */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        <Link href="/plataforma/cambios" style={{ color: "#64748b", textDecoration: "none" }}>Cambios</Link>
        <span>›</span>
        <Link href="/plataforma/admin/procesos/cambios" style={{ color: "#64748b", textDecoration: "none" }}>Configuración</Link>
        <span>›</span>
        <span style={{ color: "#0f172a", fontWeight: 700 }}>Configuración de formulario</span>
        <span>›</span>
        <span style={{ color: "#2563eb", fontWeight: 700 }}>{pestanaActualInfo.titulo}</span>
      </div>

      {/* 2. Encabezado con Indicador de Estado (Sección 3.1) */}
      <div
        className="cabecera-pagina"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Configuración de Formulario de Cambios (RFC)
            </h1>
            <span
              className="badge-itil"
              style={{
                backgroundColor: hayBorrador ? "#fef3c7" : "#dcfce7",
                color: hayBorrador ? "#92400e" : "#166534",
                border: `1px solid ${hayBorrador ? "#fde68a" : "#86efac"}`,
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {hayBorrador ? "Borrador con cambios pendientes" : `Publicada v${versionPublicada}`}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "#475569", margin: "4px 0 0 0" }}>
            {pestanaActualInfo.descripcion}
          </p>
          {fechaPublicada && (
            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
              Versión v{versionPublicada} activa publicada el {new Date(fechaPublicada).toLocaleString([], { dateStyle: "short", timeStyle: "short" })} por {autorPublicada || "Administrador del Sistema"}.
            </span>
          )}
        </div>
      </div>

      {/* Banner de Bloqueo Concurrente si otro usuario está editando */}
      {bloqueadoPorOtro && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#991b1b",
            fontSize: 12.5,
          }}
        >
          <span style={{ fontSize: 16 }}>[Bloqueado]</span>
          <span>
            Esta pestaña está actualmente en edición por <strong>{bloqueadoPorOtro}</strong>. La pantalla se encuentra en modo de <strong>solo lectura</strong> para evitar colisiones concurrentes (el bloqueo expira tras 15 min de inactividad).
          </span>
        </div>
      )}

      {/* Selector de las 7 Pestañas Numeradas (Sección 2.3) */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          gap: 4,
          marginBottom: 16,
          overflowX: "auto",
        }}
      >
        {(Object.keys(PESTANAS_INFO) as TabId[]).map((tabKey) => {
          const info = PESTANAS_INFO[tabKey];
          const esActiva = tabActiva === tabKey;
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTabActiva(tabKey)}
              style={{
                padding: "10px 16px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: esActiva ? 700 : 600,
                color: esActiva ? "#2563eb" : "#475569",
                borderBottom: `3px solid ${esActiva ? "#2563eb" : "transparent"}`,
                marginBottom: -2,
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {info.titulo}
            </button>
          );
        })}
      </div>

      {/* Contenido de la Pestaña Activa */}
      {cargando ? (
        <div style={{ padding: 48, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando configuración de {pestanaActualInfo.titulo}...
        </div>
      ) : errorCarga ? (
        <div style={{ padding: 24, backgroundColor: "#fee2e2", borderRadius: 8, color: "#991b1b", textAlign: "center" }}>
          {errorCarga}
        </div>
      ) : (
        <div>
          {tabActiva === "campos" && (
            <PestanaCampos
              secciones={configSnapshot.secciones || []}
              onChangeSecciones={(nuevas) => {
                setConfigSnapshot({ ...configSnapshot, secciones: nuevas });
                setHayBorrador(true);
              }}
              camposPersonalizados={camposPersonalizados}
              onIrACamposPersonalizados={() => setTabActiva("campos_personalizados")}
              onVistaPrevia={() => setModalVistaPreviaAbierto(true)}
            />
          )}

          {tabActiva === "campos_personalizados" && (
            <PestanaCamposPersonalizados
              campos={camposPersonalizados}
              limite={limiteCampos}
              onRecargar={cargarDatos}
            />
          )}

          {tabActiva === "catalogos" && (
            <PestanaCatalogos />
          )}

          {tabActiva === "cuestionario_riesgo" && (
            <PestanaCuestionarioRiesgo
              config={configSnapshot}
              onChangeConfig={(nueva) => {
                setConfigSnapshot(nueva);
                setHayBorrador(true);
              }}
            />
          )}

          {tabActiva === "prioridad" && (
            <PestanaPrioridad
              config={configSnapshot}
              onChangeConfig={(nueva) => {
                setConfigSnapshot(nueva);
                setHayBorrador(true);
              }}
            />
          )}

          {tabActiva === "plantillas" && (
            <PestanaPlantillas />
          )}

          {tabActiva === "vista_ticket" && (
            <PestanaVistaTicket
              config={configSnapshot}
              onChangeConfig={(nueva) => {
                setConfigSnapshot(nueva);
                setHayBorrador(true);
              }}
            />
          )}
        </div>
      )}
      </div>

      {/* 3. Barra de Acciones Fija al Pie (Sección 3.1) */}
      <BarraAccionesComun
        versionPublicada={versionPublicada}
        fechaPublicada={fechaPublicada}
        autorPublicada={autorPublicada}
        hayBorrador={hayBorrador}
        guardando={guardando}
        publicando={publicando}
        bloqueadoPorOtro={bloqueadoPorOtro}
        puedePublicar={puedePublicar}
        puedeEditar={puedeEditar}
        onGuardarBorrador={handleGuardarBorrador}
        onVistaPrevia={() => setModalVistaPreviaAbierto(true)}
        onAbrirPublicar={handleAbrirPublicar}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={handleVerHistorial}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* Modales Compartidos */}
      <ModalPublicacion
        abierto={modalPublicarAbierto}
        versionActual={versionPublicada}
        diffs={[{ tipo: "modificado", campo: `Pestaña ${tabActiva}`, anterior: "v" + versionPublicada, nuevo: "v" + (versionPublicada + 1) }]}
        ticketsAbiertosAfectados={rfcsAbiertasAfectadas}
        onConfirmar={handleConfirmarPublicacion}
        onCerrar={() => setModalPublicarAbierto(false)}
      />

      <ModalRestaurarFabrica
        abierto={modalRestaurarAbierto}
        onConfirmar={handleRestaurarFabrica}
        onCerrar={() => setModalRestaurarAbierto(false)}
      />

      <ModalHistorialVersiones
        abierto={modalHistorialAbierto}
        versiones={versionesHistorial}
        versionActual={versionPublicada}
        onRestaurarComoBorrador={(v) => {
          setConfigSnapshot(v.snapshot);
          setHayBorrador(true);
          alert(`Versión v${v.numero_version} cargada en borrador.`);
        }}
        onCerrar={() => setModalHistorialAbierto(false)}
      />

      <ModalVistaPrevia
        abierto={modalVistaPreviaAbierto}
        secciones={configSnapshot.secciones || []}
        onCerrar={() => setModalVistaPreviaAbierto(false)}
      />
    </div>
  );
}
