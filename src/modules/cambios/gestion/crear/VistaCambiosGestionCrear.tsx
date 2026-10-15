"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ElementoConfiguracion, Problema, SesionUsuario } from "@/types";
import { validarTexto, validarFechaNoPasada } from "@/shared/lib/validaciones";

export default function PaginaCrearRFC() {
  const router = useRouter();

  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [configRfc, setConfigRfc] = useState<{
    perfiles_solicitantes: number[];
    tipos_rfc: string[];
    exige_ci: boolean;
    exige_plan_pruebas: boolean;
    permite_emergencia: boolean;
    campos_personalizados: Array<{
      clave: string;
      etiqueta: string;
      tipo: "texto" | "area" | "numero" | "fecha" | "correo" | "lista";
      obligatorio: boolean;
      opciones?: string[];
      ayuda?: string;
    }>;
    exige_rollback: boolean;
    duracion_maxima_horas: number;
  }>({
    perfiles_solicitantes: [2, 8],
    tipos_rfc: ["ESTANDAR", "NORMAL", "EMERGENCIA"],
    exige_ci: false,
    exige_plan_pruebas: false,
    permite_emergencia: true,
    campos_personalizados: [],
    exige_rollback: true,
    duracion_maxima_horas: 24,
  });
  const [camposPersonalizados, setCamposPersonalizados] = useState<Record<string, any>>({});
  const [cis, setCis] = useState<ElementoConfiguracion[]>([]);
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [cargando, setCargando] = useState(true);

  // Campos del formulario RFC
  const [titulo, setTitulo] = useState("");
  const [tipoCambio, setTipoCambio] = useState<"NORMAL" | "ESTANDAR" | "EMERGENCIA">("NORMAL");
  const [idImpacto, setIdImpacto] = useState<number>(2);
  const [idUrgencia, setIdUrgencia] = useState<number>(2);
  const [ventanaInicio, setVentanaInicio] = useState("");
  const [ventanaFin, setVentanaFin] = useState("");
  const [idCiAfectado, setIdCiAfectado] = useState<number | "">("");
  const [idProblemaOrigen, setIdProblemaOrigen] = useState<number | "">("");
  const [justificacion, setJustificacion] = useState("");
  const [planImplementacion, setPlanImplementacion] = useState("");
  const [planRollback, setPlanRollback] = useState("");
  const [planPruebas, setPlanPruebas] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modelos de Cambio Estándar (Submódulo 1.3.3.2)
  const [modelosEstandar, setModelosEstandar] = useState<any[]>([]);
  const [modeloSeleccionadoId, setModeloSeleccionadoId] = useState<number | "">("");
  const [elegibilidadConfirmada, setElegibilidadConfirmada] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function inicializar() {
      try {
        const [resSesion, resCis, resPrb, resConfig, resModelos] = await Promise.all([
          fetch("/api/menu").then((r) => r.json()),
          fetch("/api/activos/cmdb").then((r) => r.json()),
          fetch("/api/problemas").then((r) => r.json()),
          fetch("/api/admin/rfc-config").then((r) => r.json()),
          fetch("/api/admin/cambios/modelos-estandar").then((r) => r.json()).catch(() => ({ modelos: [] })),
        ]);

        if (resSesion?.sesion) setSesion(resSesion.sesion);
        if (resCis?.elementos) setCis(resCis.elementos);
        if (Array.isArray(resPrb)) setProblemas(resPrb);
        if (Array.isArray(resModelos?.modelos)) setModelosEstandar(resModelos.modelos);
        if (resConfig && Array.isArray(resConfig.perfiles_solicitantes)) {
          setConfigRfc({
            perfiles_solicitantes: resConfig.perfiles_solicitantes,
            tipos_rfc: Array.isArray(resConfig.tipos_rfc) ? resConfig.tipos_rfc : ["ESTANDAR", "NORMAL", "EMERGENCIA"],
            exige_ci: Boolean(resConfig.exige_ci),
            exige_plan_pruebas: Boolean(resConfig.exige_plan_pruebas),
            permite_emergencia: resConfig.permite_emergencia !== false,
            campos_personalizados: Array.isArray(resConfig.campos_personalizados) ? resConfig.campos_personalizados : [],
            exige_rollback: resConfig.exige_rollback !== false,
            duracion_maxima_horas: Number(resConfig.duracion_maxima_horas) || 24,
          });
          if (Array.isArray(resConfig.tipos_rfc) && resConfig.tipos_rfc.length && !resConfig.tipos_rfc.includes("NORMAL")) {
            setTipoCambio(resConfig.tipos_rfc[0]);
          }
        }

        // Ventana por defecto: sábado siguiente a las 22:00
        const d = new Date();
        d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
        d.setHours(22, 0, 0, 0);
        const isoIni = d.toISOString().slice(0, 16);
        d.setHours(26, 0, 0, 0);
        const isoFin = d.toISOString().slice(0, 16);
        setVentanaInicio(isoIni);
        setVentanaFin(isoFin);
      } catch {
        setError("Error al cargar dependencias de configuración.");
      } finally {
        setCargando(false);
      }
    }
    inicializar();
  }, []);

  const perfilActivoNombre = sesion?.perfilActivo?.nombre || "";
  const esAdmin = perfilActivoNombre.toLowerCase().includes("administrador");

  const seleccionarModelo = (id: number | "") => {
    setModeloSeleccionadoId(id);
    setElegibilidadConfirmada({});
    if (!id) return;
    const modelo = modelosEstandar.find((m) => m.id_modelo === id);
    if (!modelo) return;
    if (modelo.nombre) setTitulo(modelo.nombre);
    if (modelo.contenido_prellenado) {
      if (modelo.contenido_prellenado.motivo) setJustificacion(modelo.contenido_prellenado.motivo);
      if (modelo.contenido_prellenado.plan_implementacion) setPlanImplementacion(modelo.contenido_prellenado.plan_implementacion);
      if (modelo.contenido_prellenado.plan_rollback) setPlanRollback(modelo.contenido_prellenado.plan_rollback);
      if (modelo.contenido_prellenado.plan_pruebas) setPlanPruebas(modelo.contenido_prellenado.plan_pruebas);
    }
    setIdImpacto(1);
    setIdUrgencia(1);
  };

  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const perfilId = sesion?.perfilActivo?.id_perfil || 0;
    if (!configRfc.perfiles_solicitantes.includes(perfilId) && perfilId !== 1) {
      setError("El perfil activo no está habilitado para presentar RFC según la configuración del sistema.");
      return;
    }

    if (tipoCambio === "ESTANDAR") {
      if (!modeloSeleccionadoId) {
        setError("Debe seleccionar un Modelo de Cambio Estándar preautorizado para registrar un cambio de tipo Estándar.");
        return;
      }
      const modelo = modelosEstandar.find((m) => m.id_modelo === Number(modeloSeleccionadoId));
      const elegibles = Array.isArray(modelo?.lista_elegibilidad) ? modelo.lista_elegibilidad : [];
      const todasConfirmadas = elegibles.length > 0 && elegibles.every((_: any, idx: number) => elegibilidadConfirmada[idx] === true);
      if (!todasConfirmadas) {
        setError("Debe confirmar todas las condiciones de elegibilidad del procedimiento estándar antes de registrar el cambio.");
        return;
      }
    }
    if (configRfc.exige_ci && !idCiAfectado) {
      setError("La configuración actual requiere seleccionar el CI afectado.");
      return;
    }
    if (configRfc.exige_plan_pruebas && !planPruebas.trim()) {
      setError("La configuración actual requiere documentar el plan de pruebas.");
      return;
    }
    if (!configRfc.permite_emergencia && tipoCambio === "EMERGENCIA") {
      setError("La configuración actual no permite registrar RFC de emergencia.");
      return;
    }
    const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
    if (!vTit.valido) { setError(vTit.mensaje!); return; }

    const vJust = validarTexto(justificacion, 10, 2000, "La justificación del cambio", true);
    if (!vJust.valido) { setError(vJust.mensaje!); return; }

    const vPlan = validarTexto(planImplementacion, 10, 3000, "El plan de implementación", true);
    if (!vPlan.valido) { setError(vPlan.mensaje!); return; }

    if (configRfc.exige_rollback && !planRollback.trim()) {
      setError("El plan de rollback es obligatorio según la política configurada.");
      return;
    }

    if (!ventanaInicio || !ventanaFin) {
      setError("Por favor indique el inicio y fin de la ventana de cambio.");
      return;
    }

    const vFecha = validarFechaNoPasada(ventanaInicio, "El inicio de la ventana de cambio");
    if (!vFecha.valido) { setError(vFecha.mensaje!); return; }

    const iniMs = new Date(ventanaInicio).getTime();
    const finMs = new Date(ventanaFin).getTime();
    if (finMs <= iniMs) {
      setError("La fecha y hora de fin debe ser posterior al inicio.");
      return;
    }
    const diffHoras = (finMs - iniMs) / 3600000;
    if (diffHoras > configRfc.duracion_maxima_horas) {
      setError(`La ventana seleccionada (${diffHoras.toFixed(1)} hrs) supera la duración máxima permitida de ${configRfc.duracion_maxima_horas} horas.`);
      return;
    }

    for (const c of configRfc.campos_personalizados) {
      const valor = camposPersonalizados[c.clave];
      if (c.obligatorio && (valor === undefined || valor === null || String(valor).trim() === "")) {
        setError(`El campo personalizado "${c.etiqueta}" es obligatorio.`);
        return;
      }
    }

    setGuardando(true);
    try {
      const res = await fetch("/api/cambios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: `[RFC ${tipoCambio}] ${titulo.trim()}`,
          tipo_cambio: tipoCambio,
          id_impacto: idImpacto,
          id_urgencia: idUrgencia,
          justificacion: justificacion.trim(),
          plan_implementacion: planImplementacion.trim(),
          plan_rollback: planRollback.trim() || null,
          plan_pruebas: planPruebas.trim() || null,
          campos_personalizados: camposPersonalizados,
          ventana_inicio: new Date(ventanaInicio).toISOString(),
          ventana_fin: new Date(ventanaFin).toISOString(),
          id_ci_afectado: idCiAfectado || null,
          id_problema_origen: idProblemaOrigen || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar la solicitud de cambio.");
        return;
      }

      setMensajeExito(`Cambio ${data.codigo_cambio} registrado formalmente.`);
      setTimeout(() => {
        router.push("/cambios/gestion/todos");
      }, 1500);
    } catch {
      setError("Error de conexión al guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "#2563eb", fontWeight: 600 }}>Cargando catálogo CMDB y formulario ITIL...</p>
      </div>
    );
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Registrar Solicitud de Cambio (RFC - Request for Change)</h1>
          <p>
            Alineación ITIL v4 y Norma ISO/IEC 20000: Justificación técnica, CI afectado, planes de implementación y rollback.
          </p>
        </div>
        <Link href="/cambios/gestion/todos" className="boton-mini" style={{ textDecoration: "none" }}>
          Volver al Historial
        </Link>
      </div>

      {esAdmin ? (
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 20,
            fontSize: 13,
            color: "#1e40af",
          }}
        >
          <strong>Formulario Oficial de Cambio (RFC):</strong> Vista unificada del formulario configurado en la política de cambios. Los técnicos de soporte y gestores autorizados registran y procesan los cambios a través de este mismo formulario.
        </div>
      ) : null}

      {error && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mensajeExito && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {mensajeExito} Redirigiendo al panel de cambios...
        </div>
      )}

      <form onSubmit={manejarSubmit}>
        {/* Fila 1: Título y Tipo */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Título Descriptivo del Cambio *</label>
            <input
              type="text"
              className="input-base"
              placeholder="Ej. Actualización de firmware en switches de distribución piso 4"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={guardando}
              required
            />
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Tipo de Cambio (ITIL v4) *</label>
            <select
              className="input-base"
              value={tipoCambio}
              onChange={(e) => setTipoCambio(e.target.value as any)}
              disabled={guardando}
            >
              {configRfc.tipos_rfc.includes("NORMAL") && <option value="NORMAL">Cambio Normal (Requiere evaluación CAB)</option>}
              {configRfc.tipos_rfc.includes("ESTANDAR") && <option value="ESTANDAR">Cambio Estándar (Pre-aprobado / Bajo riesgo)</option>}
              {configRfc.permite_emergencia && configRfc.tipos_rfc.includes("EMERGENCIA") && <option value="EMERGENCIA">Cambio de Emergencia (ECAB inmediato)</option>}
            </select>
          </div>
        </div>

        {/* Sección Especial: Selección de Modelo de Cambio Estándar y Elegibilidad */}
        {tipoCambio === "ESTANDAR" && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <label className="etiqueta" style={{ color: "#166534", fontWeight: 700 }}>
                Procedimiento / Modelo de Cambio Estándar Autorizado *
              </label>
              <select
                className="input-base"
                value={modeloSeleccionadoId}
                onChange={(e) => seleccionarModelo(e.target.value ? Number(e.target.value) : "")}
                disabled={guardando}
                style={{ borderColor: "#86efac", backgroundColor: "#ffffff" }}
                required
              >
                <option value="">Seleccione el modelo estándar preautorizado...</option>
                {modelosEstandar.map((m) => (
                  <option key={m.id_modelo} value={m.id_modelo}>
                    [{m.codigo}] {m.nombre} (v{m.version_modelo})
                  </option>
                ))}
              </select>
            </div>

            {modeloSeleccionadoId !== "" && (() => {
              const mod = modelosEstandar.find((m) => m.id_modelo === Number(modeloSeleccionadoId));
              const elegibles = Array.isArray(mod?.lista_elegibilidad) ? mod.lista_elegibilidad : [];
              return (
                <div>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 6 }}>
                    Lista de Verificación de Elegibilidad (Todas las condiciones deben ser confirmadas):
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {elegibles.map((texto: string, idx: number) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12.5,
                          color: "#1e293b",
                          padding: "6px 10px",
                          borderRadius: 4,
                          backgroundColor: elegibilidadConfirmada[idx] ? "#dcfce7" : "#ffffff",
                          border: "1px solid #bbf7d0",
                          cursor: "pointer"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!elegibilidadConfirmada[idx]}
                          onChange={(e) =>
                            setElegibilidadConfirmada({
                              ...elegibilidadConfirmada,
                              [idx]: e.target.checked
                            })
                          }
                        />
                        <span>{texto}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Fila 2: Impacto y Urgencia */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Impacto en el Negocio</label>
            <select
              className="input-base"
              value={idImpacto}
              onChange={(e) => setIdImpacto(Number(e.target.value))}
              disabled={guardando}
            >
              <option value={3}>Alto - Sede completa o core de negocio</option>
              <option value={2}>Medio - Área o departamento específico</option>
              <option value={1}>Bajo - Sin impacto directo a usuarios</option>
            </select>
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Urgencia Técnica</label>
            <select
              className="input-base"
              value={idUrgencia}
              onChange={(e) => setIdUrgencia(Number(e.target.value))}
              disabled={guardando}
            >
              <option value={3}>Crítica - Vulnerabilidad activa o falla recurrente</option>
              <option value={2}>Media - Mantenimiento preventivo programable</option>
              <option value={1}>Baja - Mejora operativa planificada</option>
            </select>
          </div>
        </div>

        {/* Fila 3: CI Afectado y Problema de Origen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">CI Afectado (CMDB) {configRfc.exige_ci ? "*" : ""}</label>
            <select
              className="input-base"
              value={idCiAfectado}
              onChange={(e) => setIdCiAfectado(e.target.value ? Number(e.target.value) : "")}
              disabled={guardando}
              required={configRfc.exige_ci}
            >
              <option value="">Seleccionar elemento de configuración...</option>
              {cis.map((ci) => (
                <option key={ci.id_ci} value={ci.id_ci}>
                  [{ci.codigo_ci}] {ci.nombre} ({ci.ambiente})
                </option>
              ))}
            </select>
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Problema de Origen (Opcional)</label>
            <select
              className="input-base"
              value={idProblemaOrigen}
              onChange={(e) => setIdProblemaOrigen(e.target.value ? Number(e.target.value) : "")}
              disabled={guardando}
            >
              <option value="">Ninguno / Cambio independiente</option>
              {problemas.map((prb) => (
                <option key={prb.id_problema} value={prb.id_problema}>
                  [{prb.codigo_problema}] {prb.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 4: Ventanas de Mantenimiento */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Ventana de Inicio de Mantenimiento *</label>
            <input
              type="datetime-local"
              className="input-base"
              value={ventanaInicio}
              onChange={(e) => setVentanaInicio(e.target.value)}
              disabled={guardando}
              required
            />
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Ventana de Fin de Mantenimiento *</label>
            <input
              type="datetime-local"
              className="input-base"
              value={ventanaFin}
              onChange={(e) => setVentanaFin(e.target.value)}
              disabled={guardando}
              required
            />
          </div>
        </div>

        {/* Fila 5: Justificación Técnica */}
        <div className="campo" style={{ marginBottom: 16 }}>
          <label className="etiqueta">Justificación Técnica del Cambio *</label>
          <textarea
            className="input-base"
            rows={4}
            style={{ width: "100%", minHeight: 90 }}
            placeholder="Sustento técnico, riesgos de no aplicar el cambio y valor aportado al negocio..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            disabled={guardando}
            required
          />
        </div>

        {/* Fila 6: Plan de Implementación y Plan de Rollback */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Plan Paso a Paso de Implementación *</label>
            <textarea
              className="input-base"
              rows={5}
              style={{ width: "100%", minHeight: 120 }}
              placeholder="1. Generar backup.&#10;2. Detener servicios.&#10;3. Aplicar parche o actualización.&#10;4. Reiniciar y verificar servicios..."
              value={planImplementacion}
              onChange={(e) => setPlanImplementacion(e.target.value)}
              disabled={guardando}
              required
            />
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Plan de Contingencia / Rollback {configRfc.exige_rollback ? "*" : "(Opcional)"}</label>
            <textarea
              className="input-base"
              rows={5}
              style={{ width: "100%", minHeight: 120 }}
              placeholder="Procedimiento exacto para restaurar el servicio al estado previo si se superan los tiempos límite o falla la validación..."
              value={planRollback}
              onChange={(e) => setPlanRollback(e.target.value)}
              disabled={guardando}
              required={configRfc.exige_rollback}
            />
          </div>
        </div>

        {/* Fila 7: Plan de Pruebas de Calidad */}
        <div className="campo" style={{ marginBottom: 20 }}>
          <label className="etiqueta">Plan de Pruebas de Calidad Post-Cambio {configRfc.exige_plan_pruebas ? "*" : "(Opcional)"}</label>
          <textarea
            className="input-base"
            rows={3}
            style={{ width: "100%", minHeight: 75 }}
            placeholder="Criterios de éxito y pruebas funcionales para declarar la intervención como exitosa..."
            value={planPruebas}
            onChange={(e) => setPlanPruebas(e.target.value)}
            disabled={guardando}
            required={configRfc.exige_plan_pruebas}
          />
        </div>

        {configRfc.campos_personalizados.length > 0 && (
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#1e293b" }}>
              Campos Complementarios del Cambio
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              {configRfc.campos_personalizados.map((c) => (
                <div key={c.clave} style={{ gridColumn: c.tipo === "area" ? "1 / -1" : undefined }}>
                  <label className="etiqueta">
                    {c.etiqueta} {c.obligatorio && <span style={{ color: "#dc2626" }}>*</span>}
                  </label>
                  {c.tipo === "lista" ? (
                    <select
                      className="input-base"
                      value={camposPersonalizados[c.clave] || ""}
                      onChange={(e) => setCamposPersonalizados((prev) => ({ ...prev, [c.clave]: e.target.value }))}
                      required={c.obligatorio}
                      disabled={guardando}
                    >
                      <option value="">Selecciona...</option>
                      {(c.opciones || []).map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  ) : c.tipo === "area" ? (
                    <textarea
                      className="input-base"
                      style={{ minHeight: 70 }}
                      placeholder={c.ayuda || ""}
                      value={camposPersonalizados[c.clave] || ""}
                      onChange={(e) => setCamposPersonalizados((prev) => ({ ...prev, [c.clave]: e.target.value }))}
                      required={c.obligatorio}
                      disabled={guardando}
                    />
                  ) : (
                    <input
                      type={c.tipo === "correo" ? "email" : c.tipo === "numero" ? "number" : c.tipo === "fecha" ? "date" : "text"}
                      className="input-base"
                      placeholder={c.ayuda || ""}
                      value={camposPersonalizados[c.clave] || ""}
                      onChange={(e) => setCamposPersonalizados((prev) => ({ ...prev, [c.clave]: e.target.value }))}
                      required={c.obligatorio}
                      disabled={guardando}
                    />
                  )}
                  {c.ayuda && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>{c.ayuda}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Link href="/cambios/gestion/todos" className="boton-mini" style={{ textDecoration: "none", padding: "8px 16px" }}>
            Cancelar
          </Link>
          <button
            type="submit"
            className="boton-primario"
            style={{ width: "auto", padding: "8px 20px" }}
            disabled={guardando}
          >
            {guardando ? "Registrando RFC..." : "Registrar Solicitud de Cambio"}
          </button>
        </div>
      </form>
    </div>
  );
}
