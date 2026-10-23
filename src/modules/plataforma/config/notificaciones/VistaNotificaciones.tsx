"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface MedioContacto {
  id: string;
  nombre: string;
  descripcion: string;
  etiqueta_campo: string;
  placeholder?: string;
  valor: string;
  activo: boolean;
  es_personalizado?: boolean;
}

const MEDIOS_PREDETERMINADOS: MedioContacto[] = [
  {
    id: "whatsapp",
    nombre: "WhatsApp Business API",
    descripcion: "Despacho de notificaciones y confirmaciones de ticket a números móviles de colaboradores vía plantilla HSM.",
    etiqueta_campo: "Teléfono Emisor Verificado",
    placeholder: "+51 900 000 000",
    valor: "+51 900 000 000",
    activo: false,
  },
  {
    id: "sms",
    nombre: "SMS Gateway (Twilio / Pasarela Móvil)",
    descripcion: "Envío de alertas SMS prioritarias para caídas críticas de infraestructura y autenticación segura.",
    etiqueta_campo: "Identificador de Remitente (Sender ID) o Número Gateway",
    placeholder: "MESA_TI o +1234567890",
    valor: "MESA_TI",
    activo: false,
  },
  {
    id: "slack",
    nombre: "Slack Webhook",
    descripcion: "Publicación automática de incidentes P1 y alertas de monitoreo en canal técnico corporativo.",
    etiqueta_campo: "Webhook URL de Canal",
    placeholder: "https://hooks.slack.com/services/T00/B00/XXXXX",
    valor: "https://hooks.slack.com/services/T00/B00/XXXXX",
    activo: true,
  },
  {
    id: "teams",
    nombre: "Microsoft Teams",
    descripcion: "Tarjetas adaptativas de notificación y enlaces de atención rápida en el canal de soporte TI.",
    etiqueta_campo: "Webhook URL de Canal",
    placeholder: "https://outlook.office.com/webhook/XXXXX",
    valor: "https://outlook.office.com/webhook/XXXXX",
    activo: false,
  },
];

function ContenidoConfiguracionNotificaciones({
  seccionForzada,
}: {
  seccionForzada?: "plantillas" | "contacto";
}) {
  const searchParams = useSearchParams();
  const seccionParam = searchParams.get("seccion");

  const [pestana, setPestana] = useState<"plantillas" | "contacto">(
    seccionForzada || (seccionParam === "contacto" || seccionParam === "canales" ? "contacto" : "plantillas")
  );

  useEffect(() => {
    if (seccionForzada) {
      setPestana(seccionForzada);
    } else if (seccionParam === "contacto" || seccionParam === "canales") {
      setPestana("contacto");
    } else if (seccionParam === "plantillas") {
      setPestana("plantillas");
    }
  }, [seccionParam, seccionForzada]);

  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<
    "ticket_creado" | "ticket_resuelto" | "cambio_cab" | "recuperacion_clave" | "credenciales_nuevas"
  >("ticket_creado");

  const [colorPrimario, setColorPrimario] = useState("#2563eb");
  const [nombreEmpresa, setNombreEmpresa] = useState("Sistema Institucional de Gestión de Servicios TI");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80");

  const [plantillas, setPlantillas] = useState<any>({
    ticket_creado: {
      asunto: "Ticket Registrado: [{{codigo_ticket}}] {{titulo}}",
      encabezado: "Su requerimiento ha sido registrado formalmente",
      cuerpo: "Estimado/a {{solicitante_nombre}},\n\nHemos recibido satisfactoriamente su requerimiento en la Mesa de Servicio. Un especialista asignado procederá a su atención dentro del plazo comprometido por el acuerdo de nivel de servicio (SLA).\n\nPuede consultar el avance y la línea de tiempo en el portal corporativo.",
      destinatarios: { solicitante: true, tecnico: false, supervisor: true },
    },
    ticket_resuelto: {
      asunto: "Ticket Resuelto: [{{codigo_ticket}}] {{titulo}}",
      encabezado: "El servicio ha sido restablecido exitosamente",
      cuerpo: "Estimado/a {{solicitante_nombre}},\n\nLe informamos que el caso {{codigo_ticket}} ha sido resuelto por el equipo técnico resolutor.\n\nPor favor ingrese al sistema para calificar la satisfacción del servicio y confirmar el cierre definitivo del caso.",
      destinatarios: { solicitante: true, tecnico: true, supervisor: true },
    },
    cambio_cab: {
      asunto: "Convocatoria CAB para Solicitud de Cambio: [{{codigo_cambio}}]",
      encabezado: "Revisión y Dictamen Colegiado del Comité CAB",
      cuerpo: "Estimado Miembro del Comité Asesor de Cambios (CAB),\n\nSe ha programado una solicitud de cambio que requiere evaluación técnica de riesgos, contingencias y análisis de impacto en la infraestructura.",
      destinatarios: { solicitante: false, tecnico: true, supervisor: true, cab: true },
    },
    recuperacion_clave: {
      asunto: "Código de Seguridad para Restablecimiento de Contraseña",
      encabezado: "Verificación de Identidad y Restablecimiento de Credenciales",
      cuerpo: "Estimado/a {{usuario_nombre}},\n\nHemos recibido una solicitud para restablecer la contraseña de su usuario institucional. Su código de seguridad temporal es:\n\n{{codigo_seguridad}}\n\nEste código tiene una vigencia de 15 minutos. Si usted no realizó esta solicitud, ignore este mensaje o comuníquese de inmediato con la Mesa de Ayuda.",
      destinatarios: { solicitante: true, tecnico: false, supervisor: false },
    },
    credenciales_nuevas: {
      asunto: "Bienvenido/a a la Plataforma Institucional: Sus Credenciales de Acceso",
      encabezado: "Alta de Usuario y Asignación de Roles en la Plataforma",
      cuerpo: "Estimado/a {{usuario_nombre}},\n\nSe ha completado el alta de su usuario en la plataforma de servicios TI. Sus credenciales de acceso inicial son:\n\nUsuario: {{correo_electronico}}\nContraseña temporal: {{clave_temporal}}\n\nAl iniciar sesión por primera vez, se le solicitará actualizar su contraseña obligatoriamente por política de seguridad.",
      destinatarios: { solicitante: true, tecnico: false, supervisor: true },
    },
  });

  // Lista de Medios de Contacto Institucionales
  const [mediosContacto, setMediosContacto] = useState<MedioContacto[]>(MEDIOS_PREDETERMINADOS);

  // Estados para Modal de Agregar Nuevo Medio de Contacto
  const [modalNuevoMedioAbierto, setModalNuevoMedioAbierto] = useState(false);
  const [nuevoMedioNombre, setNuevoMedioNombre] = useState("");
  const [nuevoMedioDescripcion, setNuevoMedioDescripcion] = useState("");
  const [nuevoMedioEtiquetaCampo, setNuevoMedioEtiquetaCampo] = useState("");
  const [nuevoMedioValorInicial, setNuevoMedioValorInicial] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargarConfiguraciones() {
    setCargando(true);
    try {
      const [resPlantillas, resCanales] = await Promise.all([
        fetch("/api/operacion/configuracion?clave=plantillas_correo_html").then((r) => r.json()),
        fetch("/api/operacion/configuracion?clave=canales_comunicacion").then((r) => r.json()),
      ]);

      if (resPlantillas.configuracion?.valor) {
        const val = resPlantillas.configuracion.valor;
        if (val.color_primario) setColorPrimario(val.color_primario);
        if (val.nombre_empresa) setNombreEmpresa(val.nombre_empresa);
        if (val.logo_url) setLogoUrl(val.logo_url);
        if (val.plantillas) setPlantillas(val.plantillas);
      }

      if (resCanales.configuracion?.valor) {
        const val = resCanales.configuracion.valor;
        if (Array.isArray(val)) {
          setMediosContacto(val);
        } else if (Array.isArray(val.medios_contacto)) {
          setMediosContacto(val.medios_contacto);
        } else if (typeof val === "object") {
          // Mapear desde estructura de canales previa
          const base: MedioContacto[] = [
            {
              id: "whatsapp",
              nombre: "WhatsApp Business API",
              descripcion: "Despacho de notificaciones y confirmaciones de ticket a números móviles de colaboradores vía plantilla HSM.",
              etiqueta_campo: "Teléfono Emisor Verificado",
              placeholder: "+51 900 000 000",
              valor: val.whatsapp?.telefono_remitente || "+51 900 000 000",
              activo: Boolean(val.whatsapp?.activo),
            },
            {
              id: "sms",
              nombre: "SMS Gateway (Twilio / Pasarela Móvil)",
              descripcion: "Envío de alertas SMS prioritarias para caídas críticas de infraestructura y autenticación segura.",
              etiqueta_campo: "Identificador de Remitente (Sender ID) o Número Gateway",
              placeholder: "MESA_TI o +1234567890",
              valor: val.sms?.remitente || "MESA_TI",
              activo: Boolean(val.sms?.activo),
            },
            {
              id: "slack",
              nombre: "Slack Webhook",
              descripcion: "Publicación automática de incidentes P1 y alertas de monitoreo en canal técnico corporativo.",
              etiqueta_campo: "Webhook URL de Canal",
              placeholder: "https://hooks.slack.com/services/T00/B00/XXXXX",
              valor: val.slack?.webhook_url || "https://hooks.slack.com/services/T00/B00/XXXXX",
              activo: Boolean(val.slack?.activo),
            },
            {
              id: "teams",
              nombre: "Microsoft Teams",
              descripcion: "Tarjetas adaptativas de notificación y enlaces de atención rápida en el canal de soporte TI.",
              etiqueta_campo: "Webhook URL de Canal",
              placeholder: "https://outlook.office.com/webhook/XXXXX",
              valor: val.teams?.webhook_url || "https://outlook.office.com/webhook/XXXXX",
              activo: Boolean(val.teams?.activo),
            },
          ];

          if (Array.isArray(val.personalizados)) {
            setMediosContacto([...base, ...val.personalizados]);
          } else {
            setMediosContacto(base);
          }
        }
      }
    } catch {
      setError("Error al cargar configuraciones de notificaciones y contacto.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  // Actualizar valor de texto de un medio de contacto
  function actualizarValorMedio(id: string, nuevoValor: string) {
    setMediosContacto((prev) =>
      prev.map((m) => (m.id === id ? { ...m, valor: nuevoValor } : m))
    );
  }

  // Alternar estado activo de un medio de contacto
  function toggleActivoMedio(id: string) {
    setMediosContacto((prev) =>
      prev.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m))
    );
  }

  // Eliminar un medio de contacto personalizado
  function eliminarMedio(id: string, nombre: string) {
    const confirmar = window.confirm(`¿Está seguro de que desea eliminar el medio de contacto "${nombre}"?`);
    if (!confirmar) return;

    setMediosContacto((prev) => prev.filter((m) => m.id !== id));
    setMensajeExito(`Medio de contacto "${nombre}" eliminado.`);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  // Agregar nuevo medio de contacto
  function agregarNuevoMedio(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoMedioNombre.trim()) {
      alert("Ingrese el nombre del medio de contacto.");
      return;
    }
    if (!nuevoMedioEtiquetaCampo.trim()) {
      alert("Especifique qué se requiere ingresar en el campo de texto (ej. URL del Webhook, Correo, etc.).");
      return;
    }

    const idGenerado = "medio_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 5);
    const nuevo: MedioContacto = {
      id: idGenerado,
      nombre: nuevoMedioNombre.trim(),
      descripcion: nuevoMedioDescripcion.trim() || "Medio de contacto y notificación institucional configurado por el administrador.",
      etiqueta_campo: nuevoMedioEtiquetaCampo.trim(),
      placeholder: `Ingrese ${nuevoMedioEtiquetaCampo.trim().toLowerCase()}...`,
      valor: nuevoMedioValorInicial.trim(),
      activo: true,
      es_personalizado: true,
    };

    setMediosContacto((prev) => [...prev, nuevo]);
    setModalNuevoMedioAbierto(false);
    setNuevoMedioNombre("");
    setNuevoMedioDescripcion("");
    setNuevoMedioEtiquetaCampo("");
    setNuevoMedioValorInicial("");

    setMensajeExito(`Medio de contacto "${nuevo.nombre}" agregado exitosamente.`);
    setTimeout(() => setMensajeExito(null), 3500);
  }

  // Guardar configuración de contacto en el servidor
  async function guardarConfiguracionContacto() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      // Estructura de compatibilidad para clientes existentes
      const whatsapp = mediosContacto.find((m) => m.id === "whatsapp");
      const sms = mediosContacto.find((m) => m.id === "sms");
      const slack = mediosContacto.find((m) => m.id === "slack");
      const teams = mediosContacto.find((m) => m.id === "teams");

      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "canales_comunicacion",
          valor: {
            whatsapp: {
              activo: whatsapp?.activo ?? false,
              proveedor: "Meta Cloud API",
              telefono_remitente: whatsapp?.valor ?? "",
            },
            sms: {
              activo: sms?.activo ?? false,
              proveedor: "Twilio Gateway",
              remitente: sms?.valor ?? "",
            },
            slack: {
              activo: slack?.activo ?? false,
              webhook_url: slack?.valor ?? "",
            },
            teams: {
              activo: teams?.activo ?? false,
              webhook_url: teams?.valor ?? "",
            },
            medios_contacto: mediosContacto,
          },
          descripcion: "Configuración institucional de medios de contacto y canales de notificación corporativos",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración de contacto.");
        return;
      }

      setMensajeExito("Configuración de medios de contacto corporativos guardada exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar configuración de contacto.");
    } finally {
      setGuardando(false);
    }
  }

  // Guardar plantillas de correo
  async function guardarPlantillas() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "plantillas_correo_html",
          valor: {
            color_primario: colorPrimario,
            nombre_empresa: nombreEmpresa,
            logo_url: logoUrl,
            plantillas,
          },
          descripcion: "Diseño corporativo y plantillas de correo electrónico HTML del sistema",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudieron guardar las plantillas.");
        return;
      }

      setMensajeExito("Plantillas de correo HTML guardadas exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar plantillas.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
            {pestana === "contacto"
              ? "Configuración de Contacto y Canales Institucionales"
              : "Comunicaciones y Notificaciones"}
          </h1>
          <p className="subtitulo" style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
            {pestana === "contacto"
              ? "Administre las vías de comunicación y contacto oficiales de la entidad (WhatsApp, SMS, Slack, Microsoft Teams y medios personalizados). Los datos configurados rigen a nivel empresarial para todos los procesos del servicio."
              : "Configure el diseño visual institucional, logotipos corporativos y plantillas de correo electrónico para los avisos del sistema."}
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}



      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
          Cargando configuración institucional...
        </div>
      ) : pestana === "contacto" ? (
        /* PESTAÑA: CONFIGURACIÓN DE CONTACTO */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Barra de Acciones Superior */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
                Medios y Canales de Contacto Corporativos
              </h2>
              <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
                Configure los parámetros técnicos de cada medio o añada nuevos canales de soporte según las necesidades de la entidad.
              </p>
            </div>

            <button
              type="button"
              className="boton-primario"
              onClick={() => setModalNuevoMedioAbierto(true)}
              style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
            >
              + Agregar otro medio de contacto
            </button>
          </div>

          {/* Cuadrícula de Medios de Contacto */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 18 }}>
            {mediosContacto.map((medio) => (
              <div
                key={medio.id}
                className="tarjeta"
                style={{
                  padding: 20,
                  backgroundColor: "#ffffff",
                  borderRadius: 10,
                  border: `1px solid ${medio.activo ? "#cbd5e1" : "#e2e8f0"}`,
                  boxShadow: medio.activo ? "0 2px 6px rgba(0,0,0,0.03)" : "none",
                  opacity: medio.activo ? 1 : 0.75,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Cabecera del Medio */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                          {medio.nombre}
                        </h3>
                        {medio.es_personalizado && (
                          <span style={{ fontSize: 10.5, padding: "2px 6px", borderRadius: 4, backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 700 }}>
                            Personalizado
                          </span>
                        )}
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
                        {medio.descripcion}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", fontWeight: 600, color: medio.activo ? "#1e40af" : "#64748b" }}>
                        <input
                          type="checkbox"
                          checked={medio.activo}
                          onChange={() => toggleActivoMedio(medio.id)}
                          style={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer" }}
                        />
                        {medio.activo ? "Activo" : "Inactivo"}
                      </label>

                      {medio.es_personalizado && (
                        <button
                          type="button"
                          onClick={() => eliminarMedio(medio.id, medio.nombre)}
                          style={{
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#dc2626",
                            padding: "4px 8px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                          title="Eliminar medio de contacto"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Campo de Texto Requerido para Configurar */}
                  <div className="campo" style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
                      {medio.etiqueta_campo} *
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      value={medio.valor}
                      placeholder={medio.placeholder || `Ingrese ${medio.etiqueta_campo.toLowerCase()}...`}
                      onChange={(e) => actualizarValorMedio(medio.id, e.target.value)}
                      disabled={!medio.activo}
                      style={{
                        backgroundColor: medio.activo ? "#ffffff" : "#f1f5f9",
                        fontSize: 12.5,
                        cursor: medio.activo ? "text" : "not-allowed",
                      }}
                    />
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                      Dato corporativo que rige para los envíos institucionales por este medio.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de Guardar al fondo */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", padding: "11px 28px", fontSize: 13.5 }}
              onClick={guardarConfiguracionContacto}
              disabled={guardando || cargando}
            >
              {guardando ? "Guardando..." : "Guardar Configuración de Contacto"}
            </button>
          </div>
        </div>
      ) : (
        /* PESTAÑA: PLANTILLAS DE CORREO */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          {/* Columna Izquierda: Editor de Plantilla y Marca Corporativa */}
          <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
              Editor de Plantilla y Marca Institucional
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div className="campo">
                <label className="etiqueta" style={{ fontWeight: 600 }}>Nombre Institucional</label>
                <input
                  type="text"
                  className="input-base"
                  value={nombreEmpresa}
                  onChange={(e) => setNombreEmpresa(e.target.value)}
                />
              </div>

              <div className="campo">
                <label className="etiqueta" style={{ fontWeight: 600 }}>Color Institucional</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="color"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    style={{ width: 40, height: 38, padding: 0, border: "none", borderRadius: 4, cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    className="input-base"
                    value={colorPrimario}
                    onChange={(e) => setColorPrimario(e.target.value)}
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <label className="etiqueta" style={{ fontWeight: 600 }}>Seleccionar Plantilla a Personalizar</label>
              <select
                className="input-base"
                value={plantillaSeleccionada}
                onChange={(e: any) => setPlantillaSeleccionada(e.target.value)}
                style={{ backgroundColor: "white", fontSize: 13 }}
              >
                <option value="ticket_creado">Ticket Creado (Confirmación al Solicitante)</option>
                <option value="ticket_resuelto">Ticket Resuelto (Solicitud de Visto Bueno y Cierre)</option>
                <option value="cambio_cab">Convocatoria CAB (Evaluación Colegiada de Cambio)</option>
                <option value="recuperacion_clave">Restablecimiento de Contraseña (Código Temporal)</option>
                <option value="credenciales_nuevas">Alta de Usuario (Entrega Inicial de Credenciales)</option>
              </select>
            </div>

            <div className="campo" style={{ marginBottom: 14 }}>
              <label className="etiqueta" style={{ fontWeight: 600 }}>Asunto del Correo Electrónico</label>
              <input
                type="text"
                className="input-base"
                value={plantillas[plantillaSeleccionada]?.asunto || ""}
                onChange={(e) =>
                  setPlantillas((prev: any) => ({
                    ...prev,
                    [plantillaSeleccionada]: { ...prev[plantillaSeleccionada], asunto: e.target.value },
                  }))
                }
              />
            </div>

            <div className="campo" style={{ marginBottom: 14 }}>
              <label className="etiqueta" style={{ fontWeight: 600 }}>Encabezado del Mensaje</label>
              <input
                type="text"
                className="input-base"
                value={plantillas[plantillaSeleccionada]?.encabezado || ""}
                onChange={(e) =>
                  setPlantillas((prev: any) => ({
                    ...prev,
                    [plantillaSeleccionada]: { ...prev[plantillaSeleccionada], encabezado: e.target.value },
                  }))
                }
              />
            </div>

            <div className="campo" style={{ marginBottom: 14 }}>
              <label className="etiqueta" style={{ fontWeight: 600 }}>Cuerpo del Mensaje</label>
              <textarea
                className="input-base"
                rows={5}
                value={plantillas[plantillaSeleccionada]?.cuerpo || ""}
                onChange={(e) =>
                  setPlantillas((prev: any) => ({
                    ...prev,
                    [plantillaSeleccionada]: { ...prev[plantillaSeleccionada], cuerpo: e.target.value },
                  }))
                }
              />
            </div>

            {/* Botón de Guardar al fondo */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "10px 24px", fontSize: 13 }}
                onClick={guardarPlantillas}
                disabled={guardando || cargando}
              >
                {guardando ? "Guardando..." : "Guardar Plantillas de Correo"}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa Fiel del Correo HTML */}
          <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
              Vista Previa en Tiempo Real del Correo
            </h2>

            <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", backgroundColor: "#f8fafc" }}>
              <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 18px", fontSize: 12.5, fontWeight: 600 }}>
                Asunto: {plantillas[plantillaSeleccionada]?.asunto || ""}
              </div>

              <div style={{ backgroundColor: colorPrimario, padding: "20px 24px", color: "#ffffff" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  {nombreEmpresa}
                </h3>
                <span style={{ fontSize: 12, opacity: 0.9 }}>
                  Mesa de Ayuda y Gestión de Servicios de TI
                </span>
              </div>

              <div style={{ padding: 24, backgroundColor: "#ffffff" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  {plantillas[plantillaSeleccionada]?.encabezado || ""}
                </h4>
                <div style={{ fontSize: 13, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-line" }}>
                  {plantillas[plantillaSeleccionada]?.cuerpo || ""}
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: colorPrimario,
                      color: "#ffffff",
                      padding: "8px 20px",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    Ver en el Portal Institucional
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: "#f8fafc", padding: "10px 18px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
                Este es un mensaje institucional generado automáticamente. No responda a este buzón.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR OTRO MEDIO DE CONTACTO */}
      {modalNuevoMedioAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setModalNuevoMedioAbierto(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
              maxWidth: 520,
              width: "100%",
              padding: 24,
              border: "1px solid #cbd5e1",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Agregar Nuevo Medio de Contacto
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Defina el canal y el parámetro que se requerirá configurar en el campo de texto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoMedioAbierto(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 4,
                }}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={agregarNuevoMedio} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Nombre del Medio de Contacto *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Discord Servidor Soporte, Telegram Bot, Correo Alterno..."
                  value={nuevoMedioNombre}
                  onChange={(e) => setNuevoMedioNombre(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Descripción Breve</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Canal de voz y texto para la comunidad técnica y soporte..."
                  value={nuevoMedioDescripcion}
                  onChange={(e) => setNuevoMedioDescripcion(e.target.value)}
                />
              </div>

              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 600 }}>
                  ¿Qué se requiere ingresar en el campo de texto? (Etiqueta del dato) *
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. URL del Webhook de Discord, Correo Institucional, Token de API..."
                  value={nuevoMedioEtiquetaCampo}
                  onChange={(e) => setNuevoMedioEtiquetaCampo(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Este será el nombre del campo de texto que aparecerá debajo para que el administrador configure el valor.
                </span>
              </div>

              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Valor Inicial del Campo (Opcional)</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. https://discord.com/api/webhooks/..."
                  value={nuevoMedioValorInicial}
                  onChange={(e) => setNuevoMedioValorInicial(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setModalNuevoMedioAbierto(false)}
                  style={{ width: "auto", fontSize: 12.5 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  style={{ width: "auto", fontSize: 12.5 }}
                >
                  Guardar y Agregar Medio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaginaConfiguracionNotificaciones({
  seccionForzada,
}: {
  seccionForzada?: "plantillas" | "contacto";
} = {}) {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando configuración de notificaciones y contacto...</p></div>}>
      <ContenidoConfiguracionNotificaciones seccionForzada={seccionForzada} />
    </Suspense>
  );
}
