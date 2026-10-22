"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";
import ConfiguracionObjetivosSla from "./ConfiguracionObjetivosSla";
import GestionCategorias from "./GestionCategorias";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

type ModoVista = "tabla" | "nuevo" | "editar" | "workflow" | "desactivar" | "asignar";

type Categoria = {
  id_categoria: number;
  id_tipo_ticket: number | null;
  nombre: string;
  codigo_corto?: string;
  sla_default_respuesta?: number;
  sla_default_resolucion?: number;
  descripcion?: string | null;
  estado_registro?: boolean;
};

const TODOS_LOS_PERFILES = [2, 3, 4, 5, 6, 7, 8, 9];

function IconoCategoria({ nombre, codigo }: { nombre: string; codigo?: string }) {
  const n = (nombre || "").toLowerCase();
  const c = (codigo || "").toUpperCase();

  if (n.includes("red") || c === "RED") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("seguridad") || n.includes("certificado") || c === "SEC") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (n.includes("hardware") || n.includes("equipo") || c === "HW") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (n.includes("software") || n.includes("aplicaci") || n.includes("instalaci") || c === "SW") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (n.includes("usuario") || n.includes("acceso") || c === "ACC") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (n.includes("servidor") || n.includes("infraestructura") || c === "INF") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
        <line x1="10" y1="6" x2="10.01" y2="6" />
        <line x1="10" y1="18" x2="10.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("base de datos") || n.includes("almacenamiento") || c === "DB") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  if (n.includes("telefon") || c === "TEL") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (n.includes("impresi") || c === "PRN") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    );
  }
  if (n.includes("correo") || n.includes("mensajer") || c === "MAIL") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (n.includes("cloud") || n.includes("nube") || c === "CLD") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    );
  }
  if (n.includes("copia") || n.includes("backup") || n.includes("dato") || c === "BKP") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    );
  }
  if (n.includes("capacita") || c === "CAP") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export function VistaCatalogoServicios({
  tipoForzado,
  vistaForzada,
}: {
  tipoForzado?: number;
  vistaForzada?: ModoVista;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");
  const vistaParam = searchParams.get("vista");
  const tipoActual = tipoForzado !== undefined ? tipoForzado : (tipoParam === "2" ? 2 : 1);

  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Estado para la asignación de servicios sin categoría
  const [serviciosSeleccionadosParaAsignar, setServiciosSeleccionadosParaAsignar] = useState<number[]>([]);
  const [busquedaAsignar, setBusquedaAsignar] = useState<string>("");

  // Modo de vista: sin modales flotantes
  const [vista, setVista] = useState<ModoVista>(vistaForzada || (vistaParam === "crear" ? "nuevo" : "tabla"));
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioCatalogo | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (vistaForzada) {
      setVista(vistaForzada);
    } else if (vistaParam === "crear") {
      setVista("nuevo");
      setCategoriaSeleccionada(null);
    } else {
      setVista("tabla");
      setCategoriaSeleccionada(null);
      setServicioSeleccionado(null);
      setBusqueda("");
      setServiciosSeleccionadosParaAsignar([]);
      setBusquedaAsignar("");
    }
  }, [vistaParam, tipoParam, vistaForzada]);

  // Formulario de edición de servicio
  const [formNombre, setFormNombre] = useState("");
  const [formTipo, setFormTipo] = useState<number>(2);
  const [formCategoria, setFormCategoria] = useState<number>(4);
  const [formSlaRespuesta, setFormSlaRespuesta] = useState<number>(4);
  const [formSlaResolucion, setFormSlaResolucion] = useState<number>(24);
  const [formRequiereAprobacion, setFormRequiereAprobacion] = useState<boolean>(false);
  const [formCosto, setFormCosto] = useState<number>(0);
  const [formEntregable, setFormEntregable] = useState<string>("");
  const [formDescripcion, setFormDescripcion] = useState<string>("");

  // Formulario de nuevo servicio
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<number>(2);
  const [nuevaCategoria, setNuevaCategoria] = useState<number>(4);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoEntregable, setNuevoEntregable] = useState("");
  const [nuevoRequiereAprobacion, setNuevoRequiereAprobacion] = useState(false);
  const [nuevoSlaRespuesta, setNuevoSlaRespuesta] = useState<number>(2);
  const [nuevoSlaResolucion, setNuevoSlaResolucion] = useState<number>(24);
  const [nuevoCosto, setNuevoCosto] = useState<number>(0);

  // Validaciones en tiempo real para creación de servicios (ITIL v4)
  const valSlaNuevo = validarSlaTiempos(nuevoSlaRespuesta, nuevoSlaResolucion);
  const slaNuevoInvalido = !valSlaNuevo.valido;
  const nuevoNombreInvalido = nuevoNombre.trim().length < 3 || nuevoNombre.trim().length > 120;
  const nuevaDescInvalida = nuevaDescripcion.trim().length < 10 || nuevaDescripcion.trim().length > 1000;
  const nuevoEntregableInvalido = nuevoEntregable.trim().length < 3 || nuevoEntregable.trim().length > 300;
  const formNuevoInvalido = slaNuevoInvalido || nuevoNombreInvalido || nuevaDescInvalida || nuevoEntregableInvalido;

  // Validaciones en tiempo real para edición de servicios (ITIL v4)
  const valSlaEdicion = validarSlaTiempos(formSlaRespuesta, formSlaResolucion);
  const slaEdicionInvalido = !valSlaEdicion.valido;
  const formNombreInvalido = formNombre.trim().length < 3 || formNombre.trim().length > 120;
  const formDescInvalida = formDescripcion.trim().length < 10 || formDescripcion.trim().length > 1000;
  const formEntregableInvalido = formEntregable.trim().length < 3 || formEntregable.trim().length > 300;
  const formEdicionInvalido = slaEdicionInvalido || formNombreInvalido || formDescInvalida || formEntregableInvalido;

  // Gestión de Workflow dinámico
  const [pasosWorkflow, setPasosWorkflow] = useState<ServicioWorkflowPaso[]>([]);

  // Gestión de Desactivación con motivo obligatorio
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");

  async function cargarServicios() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("id_tipo", String(tipoActual));
      if (filtroEstado) params.set("estado", filtroEstado);
      if (busqueda.trim() && categoriaSeleccionada) params.set("buscar", busqueda.trim());

      const [res, catRes] = await Promise.all([
        fetch(`/api/servicios?${params.toString()}`),
        fetch("/api/tickets/catalogos"),
      ]);
      const [datos, catalogos] = await Promise.all([res.json(), catRes.json()]);
      if (catRes.ok) setCategorias(catalogos.categorias || []);
      if (!res.ok) {
        setError(datos.error || "No se pudo cargar el catálogo");
        return;
      }
      setServicios(datos.servicios || []);
    } catch {
      setError("Error de conexión al cargar servicios");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarServicios();
  }, [tipoActual, filtroEstado, busqueda, categoriaSeleccionada]);

  function categoriaPorId(id: number) {
    return categorias.find((c) => c.id_categoria === id);
  }

  function codigoServicio(tipo: number, idCategoria: number) {
    if (!idCategoria || idCategoria === 0) {
      return `SRV-${tipo === 1 ? "INC" : "SOL"}-GEN-NNN (Sin categoría asignada)`;
    }
    const cat = categoriaPorId(idCategoria);
    return cat ? `SRV-${tipo === 1 ? "INC" : "SOL"}-${cat.codigo_corto}-NNN` : "Se genera al guardar";
  }

  function abrirNuevoConCategoria(cat?: Categoria | null) {
    const c = cat || categoriaSeleccionada || null;
    setNuevoTipo(tipoActual);
    setNuevaCategoria(c?.id_categoria || 0);
    setNuevoNombre("");
    setNuevaDescripcion("");
    setNuevoEntregable("");
    setNuevoRequiereAprobacion(tipoActual === 2);
    setNuevoSlaRespuesta(c?.sla_default_respuesta || 4);
    setNuevoSlaResolucion(c?.sla_default_resolucion || 24);
    setNuevoCosto(0);
    setError(null);
    setMensajeExito(null);
    setVista("nuevo");
  }

  function abrirNuevo() {
    abrirNuevoConCategoria(categoriaSeleccionada);
  }

  function abrirEdicion(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setFormNombre(s.nombre);
    setFormTipo(s.id_tipo_ticket);
    setFormCategoria(s.id_categoria);
    setFormSlaRespuesta(s.sla_horas_respuesta);
    setFormSlaResolucion(s.sla_horas_resolucion);
    setFormRequiereAprobacion(s.requiere_aprobacion);
    setFormCosto(Number(s.costo_referencial) || 0);
    setFormEntregable(s.entregable);
    setFormDescripcion(s.descripcion_comercial);
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  function abrirWorkflow(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setPasosWorkflow(
      s.pasos && s.pasos.length > 0
        ? JSON.parse(JSON.stringify(s.pasos))
        : [
            {
              id_paso: 1,
              id_servicio: s.id_servicio,
              orden: 1,
              codigo_paso: "PASO-01",
              nombre_paso: "Recepción y Registro",
              rol_ejecutor: "Mesa de Ayuda (N1)",
              es_compuerta_aprobacion: false,
              pausa_sla: false,
              estado_registro: true,
            },
          ]
    );
    setError(null);
    setMensajeExito(null);
    setVista("workflow");
  }

  function abrirDesactivar(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setMotivoDesactivacion("");
    setError(null);
    setMensajeExito(null);
    setVista("desactivar");
  }

  async function registrarNuevoServicio(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const vNom = validarTexto(nuevoNombre, 3, 100, "El nombre del servicio", true);
    if (!vNom.valido) { setError(vNom.mensaje!); return; }

    const vDesc = validarTexto(nuevaDescripcion, 10, 1000, "La descripción comercial", true);
    if (!vDesc.valido) { setError(vDesc.mensaje!); return; }

    const vEnt = validarTexto(nuevoEntregable, 3, 300, "El entregable del servicio", true);
    if (!vEnt.valido) { setError(vEnt.mensaje!); return; }

    const vResp = validarNumeroPositivo(nuevoSlaRespuesta, "El SLA de respuesta (horas)", 0.5, 720);
    if (!vResp.valido) { setError(vResp.mensaje!); return; }

    const vReso = validarNumeroPositivo(nuevoSlaResolucion, "El SLA de resolución (horas)", 1, 1440);
    if (!vReso.valido) { setError(vReso.mensaje!); return; }

    const vSla = validarSlaTiempos(nuevoSlaRespuesta, nuevoSlaResolucion);
    if (!vSla.valido) { setError(vSla.mensaje!); return; }

    if (nuevoCosto !== undefined && nuevoCosto !== null && String(nuevoCosto).trim() !== "") {
      const vCost = validarNumeroPositivo(nuevoCosto, "El costo referencial", 0, 999999);
      if (!vCost.valido) { setError(vCost.mensaje!); return; }
    }

    setGuardando(true);

    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tipo_ticket: nuevoTipo,
          id_categoria: nuevaCategoria > 0 ? nuevaCategoria : null,
          nombre: nuevoNombre,
          descripcion_comercial: nuevaDescripcion,
          entregable: nuevoEntregable,
          requiere_aprobacion: nuevoRequiereAprobacion,
          sla_horas_respuesta: nuevoSlaRespuesta,
          sla_horas_resolucion: nuevoSlaResolucion,
          costo_referencial: nuevoCosto,
          perfiles_habilitados: TODOS_LOS_PERFILES,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo registrar el nuevo servicio");
        return;
      }

      setMensajeExito(`Servicio [${datos.servicio?.codigo_servicio}] registrado exitosamente.`);
      if (vistaParam === "crear") {
        router.push(`/admin/servicios?tipo=${nuevoTipo}`);
      } else {
        setVista("tabla");
        await cargarServicios();
      }
    } catch {
      setError("Error de conexión al registrar el servicio");
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarAsignacionServicios() {
    if (!categoriaSeleccionada || serviciosSeleccionadosParaAsignar.length === 0) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/servicios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_categoria: categoriaSeleccionada.id_categoria,
          ids_servicios: serviciosSeleccionadosParaAsignar,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudieron agregar los servicios a la categoría");
        return;
      }

      setMensajeExito(`Se agregaron ${serviciosSeleccionadosParaAsignar.length} servicio(s) a la categoría "${categoriaSeleccionada.nombre}" exitosamente.`);
      setServiciosSeleccionadosParaAsignar([]);
      setVista("tabla");
      await cargarServicios();
    } catch {
      setError("Error de conexión al agregar los servicios a la categoría");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambiosServicio(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setError(null);
    setMensajeExito(null);

    const vNom = validarTexto(formNombre, 3, 100, "El nombre del servicio", true);
    if (!vNom.valido) { setError(vNom.mensaje!); return; }

    const vDesc = validarTexto(formDescripcion, 10, 1000, "La descripción comercial", true);
    if (!vDesc.valido) { setError(vDesc.mensaje!); return; }

    const vEnt = validarTexto(formEntregable, 3, 300, "El entregable del servicio", true);
    if (!vEnt.valido) { setError(vEnt.mensaje!); return; }

    const vResp = validarNumeroPositivo(formSlaRespuesta, "El SLA de respuesta (horas)", 0.5, 720);
    if (!vResp.valido) { setError(vResp.mensaje!); return; }

    const vReso = validarNumeroPositivo(formSlaResolucion, "El SLA de resolución (horas)", 1, 1440);
    if (!vReso.valido) { setError(vReso.mensaje!); return; }

    const vSla = validarSlaTiempos(formSlaRespuesta, formSlaResolucion);
    if (!vSla.valido) { setError(vSla.mensaje!); return; }

    if (formCosto !== undefined && formCosto !== null && String(formCosto).trim() !== "") {
      const vCost = validarNumeroPositivo(formCosto, "El costo referencial", 0, 999999);
      if (!vCost.valido) { setError(vCost.mensaje!); return; }
    }

    setGuardando(true);

    try {
      const res = await fetch(`/api/servicios/${servicioSeleccionado.id_servicio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          id_tipo_ticket: formTipo,
          id_categoria: formCategoria,
          sla_horas_respuesta: formSlaRespuesta,
          sla_horas_resolucion: formSlaResolucion,
          requiere_aprobacion: formRequiereAprobacion,
          costo_referencial: formCosto,
          entregable: formEntregable,
          descripcion_comercial: formDescripcion,
          perfiles_habilitados: TODOS_LOS_PERFILES,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo guardar la configuración");
        return;
      }

      setMensajeExito(`Servicio [${servicioSeleccionado.codigo_servicio}] actualizado correctamente.`);
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al actualizar el servicio");
    } finally {
      setGuardando(false);
    }
  }

  // Funciones de gestión de workflow
  function agregarPasoWorkflow() {
    const nuevoOrden = pasosWorkflow.length + 1;
    const nuevoPaso: ServicioWorkflowPaso = {
      id_paso: Date.now(),
      id_servicio: servicioSeleccionado?.id_servicio || 0,
      orden: nuevoOrden,
      codigo_paso: `PASO-0${nuevoOrden}`,
      nombre_paso: `Paso ${nuevoOrden}`,
      rol_ejecutor: "Soporte Nivel 2",
      es_compuerta_aprobacion: false,
      pausa_sla: false,
      estado_registro: true,
    };
    setPasosWorkflow([...pasosWorkflow, nuevoPaso]);
  }

  function eliminarPasoWorkflow(indice: number) {
    if (pasosWorkflow.length <= 1) {
      alert("El workflow debe contener al menos un paso.");
      return;
    }
    const filtrados = pasosWorkflow.filter((_, i) => i !== indice);
    // Reordenar
    const reordenados = filtrados.map((p, i) => ({
      ...p,
      orden: i + 1,
      codigo_paso: `PASO-0${i + 1}`,
    }));
    setPasosWorkflow(reordenados);
  }

  function actualizarPasoWorkflow(indice: number, campo: keyof ServicioWorkflowPaso, valor: any) {
    const copia = [...pasosWorkflow];
    copia[indice] = { ...copia[indice], [campo]: valor };
    setPasosWorkflow(copia);
  }

  async function guardarWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/servicios/${servicioSeleccionado.id_servicio}/workflow`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pasos: pasosWorkflow }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo actualizar el workflow");
        return;
      }

      setMensajeExito(`Workflow del servicio [${servicioSeleccionado.codigo_servicio}] guardado exitosamente.`);
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al guardar el workflow");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarCambioEstado(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    const nuevoEstado = !servicioSeleccionado.estado_registro;

    if (!nuevoEstado && motivoDesactivacion.trim().length < 5) {
      setError("Debe ingresar una justificación detallada (mínimo 5 caracteres) para deshabilitar el servicio.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/servicios/${servicioSeleccionado.id_servicio}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado_registro: nuevoEstado,
          motivo_inactivacion: nuevoEstado ? null : motivoDesactivacion.trim(),
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo actualizar el estado del servicio");
        return;
      }

      setMensajeExito(
        nuevoEstado
          ? `Servicio [${servicioSeleccionado.codigo_servicio}] reactivado exitosamente.`
          : `Servicio [${servicioSeleccionado.codigo_servicio}] deshabilitado. Motivo registrado para auditoría.`
      );
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al cambiar estado del servicio");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {error && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mensajeExito && (
        <div style={{
          backgroundColor: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 500,
        }}>
          {mensajeExito}
        </div>
      )}

      {/* 1. VISTA DEDICADA: NUEVO SERVICIO A PANTALLA COMPLETA */}
      {vista === "nuevo" && (
        <div>
          <div
            style={{
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  if (vistaParam === "crear") {
                    router.push(`/admin/servicios?tipo=${nuevoTipo}`);
                  } else {
                    setVista("tabla");
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {vistaParam === "crear" ? "Crear Nuevo Servicio en el Catálogo (Formulario Oficial)" : "Registrar Nuevo Servicio en el Catálogo (ITIL v4)"}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Defina los acuerdos de nivel de servicio (SLA), entregables oficiales, costos referenciales y requisitos de aprobación.
              </p>
            </div>
          </div>

          <form id="form-nuevo-servicio" onSubmit={registrarNuevoServicio}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código oficial (generado automáticamente)</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace" }}
                  value={codigoServicio(nuevoTipo,nuevaCategoria)}
                  readOnly
                />
              </div>

              <div className="campo">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>Nombre Comercial del Servicio *</label>
                  <span style={{ fontSize: 11, color: nuevoNombre.length >= 110 ? "#dc2626" : "#64748b" }}>
                    {nuevoNombre.length} / 120
                  </span>
                </div>
                <input
                  type="text"
                  className="input-base"
                  maxLength={120}
                  placeholder="Ej: Aprovisionamiento de Laptop Corporativa para Nuevo Ingreso"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  autoFocus
                />
                {nuevoNombre.length > 0 && (
                  nuevoNombre.trim().length < 3 ? (
                    <AlertaCampo error={`El nombre del servicio debe tener al menos 3 caracteres (has ingresado ${nuevoNombre.trim().length}).`} />
                  ) : (
                    <AlertaCampo exito="Nombre comercial válido." />
                  )
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo ITIL v4 *</label>
                <select
                  className="input-base"
                  value={nuevoTipo}
                  onChange={(e) => {
                    const tipo = Number(e.target.value);
                    const cat = categorias.find((c) => c.id_tipo_ticket === tipo);
                    setNuevoTipo(tipo);
                    if (cat) {
                      setNuevaCategoria(cat.id_categoria);
                      setNuevoSlaRespuesta(cat.sla_default_respuesta ?? 2);
                      setNuevoSlaResolucion(cat.sla_default_resolucion ?? 24);
                    }
                  }}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={1}>Incidente</option>
                  <option value={2}>Solicitud de servicio</option>
                </select>
              </div>

              <div className="campo">
                <label>Categoría Funcional</label>
                <select
                  className="input-base"
                  value={nuevaCategoria}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const cat = categoriaPorId(id);
                    setNuevaCategoria(id);
                    if (cat) {
                      setNuevoSlaRespuesta(cat.sla_default_respuesta ?? 2);
                      setNuevoSlaResolucion(cat.sla_default_resolucion ?? 24);
                    }
                  }}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={0}>-- Sin categoría asignada (Asignar posteriormente) --</option>
                  {categorias.filter((c) => c.id_tipo_ticket === nuevoTipo).map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>SLA Primera Respuesta (Horas) *</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="168"
                  className="input-base"
                  value={nuevoSlaRespuesta}
                  onChange={(e) => setNuevoSlaRespuesta(parseFloat(e.target.value) || 0)}
                  style={{
                    borderColor: slaNuevoInvalido ? "#ef4444" : undefined,
                    backgroundColor: slaNuevoInvalido ? "#fef2f2" : "white",
                  }}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Contacto técnico inicial normativo.
                </span>
              </div>

              <div className="campo">
                <label>SLA Resolución Total (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  max="720"
                  className="input-base"
                  value={nuevoSlaResolucion}
                  onChange={(e) => setNuevoSlaResolucion(parseFloat(e.target.value) || 0)}
                  style={{
                    borderColor: slaNuevoInvalido ? "#ef4444" : undefined,
                    backgroundColor: slaNuevoInvalido ? "#fef2f2" : "white",
                  }}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo máximo de entrega y cierre.
                </span>
              </div>

              <div className="campo">
                <label>Costo Referencial (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={nuevoCosto}
                  onChange={(e) => setNuevoCosto(parseFloat(e.target.value) || 0)}
                  style={{ backgroundColor: "white" }}
                />
                {nuevoTipo === 1 && (
                  <span style={{ fontSize: 11, color: "#0369a1", marginTop: 4, display: "block" }}>
                    En ITIL v4, los incidentes no son facturables por catálogo (restablecimiento de servicio).
                  </span>
                )}
              </div>

              <div style={{ gridColumn: "span 3", marginTop: -6 }}>
                {slaNuevoInvalido ? (
                  <AlertaCampo error={valSlaNuevo.mensaje} />
                ) : (
                  <AlertaCampo exito={`Compromisos SLA coherentes: contacto inicial a las ${nuevoSlaRespuesta}h y resolución a las ${nuevoSlaResolucion}h.`} />
                )}
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Entregable Oficial del Servicio (Criterio de Aceptación) *</label>
                <span style={{ fontSize: 11, color: nuevoEntregable.length >= 280 ? "#dc2626" : "#64748b" }}>
                  {nuevoEntregable.length} / 300
                </span>
              </div>
              <textarea
                className="input-base"
                rows={2}
                maxLength={300}
                placeholder="Ej. Equipo configurado con imagen corporativa entregado con acta de conformidad firmada."
                value={nuevoEntregable}
                onChange={(e) => setNuevoEntregable(e.target.value)}
                required
                style={{
                  borderColor: nuevoEntregable.length > 0 && nuevoEntregable.trim().length < 3 ? "#ef4444" : undefined,
                  backgroundColor: nuevoEntregable.length > 0 && nuevoEntregable.trim().length < 3 ? "#fef2f2" : "white",
                }}
              />
              {nuevoEntregable.length > 0 && (
                nuevoEntregable.trim().length < 3 ? (
                  <AlertaCampo error={`El entregable debe tener al menos 3 caracteres (has ingresado ${nuevoEntregable.trim().length}).`} />
                ) : (
                  <AlertaCampo exito="Criterio de aceptación y entregable oficial especificado." />
                )
              )}
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Descripción Comercial y Alcance Detallado *</label>
                <span style={{ fontSize: 11, color: nuevaDescripcion.length >= 950 ? "#dc2626" : "#64748b" }}>
                  {nuevaDescripcion.length} / 1000
                </span>
              </div>
              <textarea
                className="input-base"
                rows={3}
                maxLength={1000}
                placeholder="Detalle de qué incluye y qué no incluye este servicio del catálogo..."
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                required
                style={{
                  borderColor: nuevaDescripcion.length > 0 && nuevaDescripcion.trim().length < 10 ? "#ef4444" : undefined,
                  backgroundColor: nuevaDescripcion.length > 0 && nuevaDescripcion.trim().length < 10 ? "#fef2f2" : "white",
                }}
              />
              {nuevaDescripcion.length > 0 && (
                nuevaDescripcion.trim().length < 10 ? (
                  <AlertaCampo error={`La descripción comercial debe tener al menos 10 caracteres (has ingresado ${nuevaDescripcion.trim().length} de 10).`} />
                ) : (
                  <AlertaCampo exito="Descripción comercial y alcance institucional adecuado." />
                )
              )}
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={nuevoRequiereAprobacion}
                  onChange={(e) => setNuevoRequiereAprobacion(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                  Requiere Aprobación Previa de Jefatura / Gestor de Área
                </span>
              </label>
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Si se activa, el ticket pasará por una compuerta jerárquica de validación antes de ser despachado a los técnicos.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  if (vistaParam === "crear") {
                    router.push(`/admin/servicios?tipo=${nuevoTipo}`);
                  } else {
                    setVista("tabla");
                  }
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "8px 24px",
                  fontSize: 13,
                  opacity: formNuevoInvalido || guardando ? 0.6 : 1,
                  cursor: formNuevoInvalido || guardando ? "not-allowed" : "pointer",
                }}
                disabled={guardando || formNuevoInvalido}
                title={formNuevoInvalido ? "Complete correctamente todos los campos y verifique los tiempos SLA para continuar." : ""}
              >
                {guardando ? "Registrando..." : "Registrar Servicio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. VISTA DEDICADA: EDITAR PARÁMETROS DEL SERVICIO */}
      {vista === "editar" && servicioSeleccionado && (
        <div>
          <div
            style={{
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Editar Servicio: [{servicioSeleccionado.codigo_servicio}] {servicioSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Ajuste los Acuerdos de Nivel de Servicio (SLA), entregables oficiales, costos y compuertas de aprobación.
              </p>
            </div>
          </div>

          <form id="form-editar-servicio" onSubmit={guardarCambiosServicio}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>Nombre del Servicio *</label>
                  <span style={{ fontSize: 11, color: formNombre.length >= 110 ? "#dc2626" : "#64748b" }}>
                    {formNombre.length} / 120
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={120}
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  style={{
                    borderColor: formNombre.length > 0 && formNombre.trim().length < 3 ? "#ef4444" : undefined,
                    backgroundColor: formNombre.length > 0 && formNombre.trim().length < 3 ? "#fef2f2" : "white",
                  }}
                />
                {formNombre.length > 0 && (
                  formNombre.trim().length < 3 ? (
                    <AlertaCampo error={`El nombre del servicio debe tener al menos 3 caracteres (has ingresado ${formNombre.trim().length}).`} />
                  ) : (
                    <AlertaCampo exito="Nombre comercial válido." />
                  )
                )}
              </div>

              <div className="campo">
                <label>Tipo ITIL *</label>
                <select
                  className="input-base"
                  value={formTipo}
                  onChange={(e) => {
                    const tipo = Number(e.target.value);
                    const cat = categorias.find((c) => c.id_tipo_ticket === tipo);
                    setFormTipo(tipo);
                    if (cat) {
                      setFormCategoria(cat.id_categoria);
                      setFormSlaRespuesta(cat.sla_default_respuesta ?? 2);
                      setFormSlaResolucion(cat.sla_default_resolucion ?? 24);
                    }
                  }}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={1}>Incidente</option>
                  <option value={2}>Solicitud de servicio</option>
                </select>
              </div>
            </div>

            <div className="campo" style={{ maxWidth: 520, marginBottom: 16 }}>
              <label>Categoría *</label>
              <select
                className="input-base"
                value={formCategoria}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const cat = categoriaPorId(id);
                  setFormCategoria(id);
                  if (cat) {
                    setFormSlaRespuesta(cat.sla_default_respuesta ?? 2);
                    setFormSlaResolucion(cat.sla_default_resolucion ?? 24);
                  }
                }}
              >
                {categorias.filter((c) => c.id_tipo_ticket === formTipo).map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
              <small>El código cambia automáticamente si se modifica el tipo o la categoría. El SLA se precarga desde la categoría y puede ajustarse para esta oferta.</small>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>SLA Primera Respuesta (Horas) *</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="168"
                  className="input-base"
                  value={formSlaRespuesta}
                  onChange={(e) => setFormSlaRespuesta(parseFloat(e.target.value) || 0)}
                  style={{
                    borderColor: slaEdicionInvalido ? "#ef4444" : undefined,
                    backgroundColor: slaEdicionInvalido ? "#fef2f2" : "white",
                  }}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo límite de contacto inicial.
                </span>
              </div>

              <div className="campo">
                <label>SLA Resolución Total (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  max="720"
                  className="input-base"
                  value={formSlaResolucion}
                  onChange={(e) => setFormSlaResolucion(parseFloat(e.target.value) || 0)}
                  style={{
                    borderColor: slaEdicionInvalido ? "#ef4444" : undefined,
                    backgroundColor: slaEdicionInvalido ? "#fef2f2" : "white",
                  }}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo máximo de entrega y cierre.
                </span>
              </div>

              <div className="campo">
                <label>Costo Referencial (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={formCosto}
                  onChange={(e) => setFormCosto(parseFloat(e.target.value) || 0)}
                  style={{ backgroundColor: "white" }}
                />
                {formTipo === 1 && (
                  <span style={{ fontSize: 11, color: "#0369a1", marginTop: 4, display: "block" }}>
                    En ITIL v4, los incidentes no son facturables por catálogo (restablecimiento de servicio).
                  </span>
                )}
              </div>

              <div style={{ gridColumn: "span 3", marginTop: -6 }}>
                {slaEdicionInvalido ? (
                  <AlertaCampo error={valSlaEdicion.mensaje} />
                ) : (
                  <AlertaCampo exito={`Compromisos SLA coherentes: contacto inicial a las ${formSlaRespuesta}h y resolución a las ${formSlaResolucion}h.`} />
                )}
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Entregable Oficial del Servicio *</label>
                <span style={{ fontSize: 11, color: formEntregable.length >= 280 ? "#dc2626" : "#64748b" }}>
                  {formEntregable.length} / 300
                </span>
              </div>
              <textarea
                className="input-base"
                rows={2}
                maxLength={300}
                value={formEntregable}
                onChange={(e) => setFormEntregable(e.target.value)}
                required
                style={{
                  borderColor: formEntregable.length > 0 && formEntregable.trim().length < 3 ? "#ef4444" : undefined,
                  backgroundColor: formEntregable.length > 0 && formEntregable.trim().length < 3 ? "#fef2f2" : "white",
                }}
              />
              {formEntregable.length > 0 && (
                formEntregable.trim().length < 3 ? (
                  <AlertaCampo error={`El entregable debe tener al menos 3 caracteres (has ingresado ${formEntregable.trim().length}).`} />
                ) : (
                  <AlertaCampo exito="Criterio de aceptación y entregable oficial especificado." />
                )
              )}
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Descripción Comercial / Alcance *</label>
                <span style={{ fontSize: 11, color: formDescripcion.length >= 950 ? "#dc2626" : "#64748b" }}>
                  {formDescripcion.length} / 1000
                </span>
              </div>
              <textarea
                className="input-base"
                rows={3}
                maxLength={1000}
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                required
                style={{
                  borderColor: formDescripcion.length > 0 && formDescripcion.trim().length < 10 ? "#ef4444" : undefined,
                  backgroundColor: formDescripcion.length > 0 && formDescripcion.trim().length < 10 ? "#fef2f2" : "white",
                }}
              />
              {formDescripcion.length > 0 && (
                formDescripcion.trim().length < 10 ? (
                  <AlertaCampo error={`La descripción comercial debe tener al menos 10 caracteres (has ingresado ${formDescripcion.trim().length} de 10).`} />
                ) : (
                  <AlertaCampo exito="Descripción comercial y alcance institucional adecuado." />
                )
              )}
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formRequiereAprobacion}
                  onChange={(e) => setFormRequiereAprobacion(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                  Requiere Aprobación de Jefatura (Compuerta Jerárquica)
                </span>
              </label>
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Si se activa, el ticket pasará por validación del Gestor de Área antes de ser asignado a un técnico.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "8px 24px",
                  fontSize: 13,
                  opacity: formEdicionInvalido || guardando ? 0.6 : 1,
                  cursor: formEdicionInvalido || guardando ? "not-allowed" : "pointer",
                }}
                disabled={guardando || formEdicionInvalido}
                title={formEdicionInvalido ? "Complete correctamente todos los campos y verifique los tiempos SLA para continuar." : ""}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. VISTA DEDICADA: CONFIGURADOR DE WORKFLOW DEL SERVICIO */}
      {vista === "workflow" && servicioSeleccionado && (
        <div>
          <div
            style={{
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Diseñador de Workflow: [{servicioSeleccionado.codigo_servicio}] {servicioSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure los pasos secuenciales de atención, compuertas de aprobación jerárquica, roles ejecutores y reglas de pausa de SLA.
              </p>
            </div>
          </div>

          <form id="form-workflow" onSubmit={guardarWorkflow}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Pasos del Flujo de Trabajo ({pasosWorkflow.length} definidos)
              </span>
              <button
                type="button"
                className="boton-secundario"
                onClick={agregarPasoWorkflow}
                style={{ width: "auto", padding: "6px 14px", fontSize: 12.5, fontWeight: 600, color: "#2563eb", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }}
              >
                Agregar Paso Operativo
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {pasosWorkflow.map((paso, idx) => (
                <div
                  key={paso.id_paso || idx}
                  style={{
                    backgroundColor: "#ffffff",
                    border: paso.es_compuerta_aprobacion ? "1px solid #fef08a" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          backgroundColor: paso.es_compuerta_aprobacion ? "#ca8a04" : "#2563eb",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>
                        Paso #{idx + 1}: {paso.nombre_paso || "Sin título"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarPasoWorkflow(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Eliminar este paso
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 14, marginBottom: 12 }}>
                    <div className="campo">
                      <label>Código de Paso *</label>
                      <input
                        type="text"
                        className="input-base"
                        style={{ fontFamily: "monospace", fontSize: 12.5 }}
                        value={paso.codigo_paso}
                        onChange={(e) => actualizarPasoWorkflow(idx, "codigo_paso", e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className="campo">
                      <label>Nombre del Paso Operativo *</label>
                      <input
                        type="text"
                        className="input-base"
                        value={paso.nombre_paso}
                        onChange={(e) => actualizarPasoWorkflow(idx, "nombre_paso", e.target.value)}
                        placeholder="Ej. Diagnóstico Técnico L1, Instalación de Software, etc."
                        required
                      />
                    </div>

                    <div className="campo">
                      <label>Rol o Perfil Ejecutor *</label>
                      <select
                        className="input-base"
                        value={paso.rol_ejecutor}
                        onChange={(e) => actualizarPasoWorkflow(idx, "rol_ejecutor", e.target.value)}
                        style={{ backgroundColor: "white" }}
                        required
                      >
                        <option value="Mesa de Ayuda (N1)">Mesa de Ayuda (N1)</option>
                        <option value="Soporte Nivel 2">Soporte Nivel 2 (Campo)</option>
                        <option value="Ingeniería Nivel 3">Ingeniería Nivel 3</option>
                        <option value="Jefe de Área / Supervisor">Jefe de Área / Supervisor</option>
                        <option value="Gestor de Activos">Gestor de Activos</option>
                        <option value="Aprobador CAB">Aprobador CAB</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, alignItems: "center", paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={paso.es_compuerta_aprobacion}
                        onChange={(e) => actualizarPasoWorkflow(idx, "es_compuerta_aprobacion", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                        Es Compuerta de Aprobación Jerárquica (Gateway)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={paso.pausa_sla}
                        onChange={(e) => actualizarPasoWorkflow(idx, "pausa_sla", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0369a1" }}>
                        Pausar temporizador de SLA en este paso
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Workflow"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. VISTA DEDICADA: DESHABILITAR / REACTIVAR SERVICIO CON JUSTIFICACIÓN OBLIGATORIA */}
      {vista === "desactivar" && servicioSeleccionado && (
        <div style={{ maxWidth: 700, margin: "0 auto", backgroundColor: "#ffffff", padding: 28, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <button
            type="button"
            onClick={() => {
              setVista("tabla");
              setServicioSeleccionado(null);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 14,
              padding: 0,
            }}
          >
            Volver al Catálogo de Servicios
          </button>

          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: servicioSeleccionado.estado_registro ? "#b91c1c" : "#16a34a" }}>
            {servicioSeleccionado.estado_registro
              ? `Deshabilitar Servicio: [${servicioSeleccionado.codigo_servicio}] ${servicioSeleccionado.nombre}`
              : `Reactivar Servicio: [${servicioSeleccionado.codigo_servicio}] ${servicioSeleccionado.nombre}`}
          </h2>

          <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13 }}>
            {servicioSeleccionado.estado_registro
              ? "Al deshabilitar un servicio, los usuarios solicitantes ya no podrán seleccionarlo en el Portal de Autoservicio. Para mantener la trazabilidad y que los demás administradores y auditores conozcan el motivo, debe registrar una justificación formal."
              : "Al reactivar este servicio, volverá a estar disponible de inmediato en el catálogo corporativo para todos los usuarios autorizados."}
          </p>

          {servicioSeleccionado.motivo_inactivacion && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>Último motivo de desactivación registrado:</div>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#7f1d1d" }}>
                "{servicioSeleccionado.motivo_inactivacion}"
              </p>
              {servicioSeleccionado.usuario_inactivacion_nombre && (
                <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}>
                  Registrado por: <strong>{servicioSeleccionado.usuario_inactivacion_nombre}</strong> el {new Date(servicioSeleccionado.fecha_inactivacion || "").toLocaleString()}
                </div>
              )}
            </div>
          )}

          <form onSubmit={confirmarCambioEstado}>
            {servicioSeleccionado.estado_registro && (
              <div className="campo" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  Motivo o Justificación de la Desactivación *
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Explique detalladamente por qué se da de baja este servicio (ej. Reemplazado por nueva plataforma SaaS, obsolescencia técnica, cambio de proveedor, etc.)..."
                  value={motivoDesactivacion}
                  onChange={(e) => setMotivoDesactivacion(e.target.value)}
                  required
                  autoFocus
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Este registro quedará grabado en los registros de auditoría y será visible para todos los administradores.
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={servicioSeleccionado.estado_registro ? "boton-primario" : "boton-primario"}
                style={{
                  width: "auto",
                  padding: "8px 24px",
                  fontSize: 13,
                  backgroundColor: servicioSeleccionado.estado_registro ? "#dc2626" : "#16a34a",
                }}
                disabled={guardando}
              >
                {guardando
                  ? "Procesando..."
                  : servicioSeleccionado.estado_registro
                  ? "Confirmar Desactivación"
                  : "Confirmar Reactivación"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4.5. VISTA DEDICADA: ASIGNACIÓN DE SERVICIOS SIN CATEGORÍA CON CHECKBOXES */}
      {vista === "asignar" && categoriaSeleccionada && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setVista("tabla")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                Volver a Categoría: {categoriaSeleccionada.nombre}
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Asignar Servicios a la Categoría: {categoriaSeleccionada.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Lista general de servicios no asignados para {tipoActual === 1 ? "incidentes" : "solicitudes"}. Marque con el selector los servicios que desea incorporar a esta categoría.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setVista("tabla")}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                onClick={ejecutarAsignacionServicios}
                disabled={serviciosSeleccionadosParaAsignar.length === 0 || guardando}
              >
                {guardando
                  ? "Agregando servicios..."
                  : `Agregar servicios${serviciosSeleccionadosParaAsignar.length > 0 ? ` (${serviciosSeleccionadosParaAsignar.length})` : ""}`}
              </button>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar servicio sin asignar por código, nombre o entregable..."
                value={busquedaAsignar}
                onChange={(e) => setBusquedaAsignar(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            <div style={{ fontSize: 13, color: "#64748b", alignSelf: "center" }}>
              {serviciosSeleccionadosParaAsignar.length} servicio(s) marcado(s) para incorporar
            </div>
          </div>

          {/* Contenido de la Tabla */}
          {(() => {
            const serviciosSinCat = servicios.filter(
              (s) => (!s.id_categoria || s.id_categoria === null) && s.id_tipo_ticket === tipoActual
            );
            const filtrados = serviciosSinCat.filter((s) => {
              if (!busquedaAsignar.trim()) return true;
              const q = busquedaAsignar.toLowerCase();
              return (
                s.nombre.toLowerCase().includes(q) ||
                s.codigo_servicio.toLowerCase().includes(q) ||
                (s.entregable && s.entregable.toLowerCase().includes(q))
              );
            });

            if (serviciosSinCat.length === 0) {
              return (
                <div style={{ padding: "48px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1" }}>
                  <p style={{ margin: "0 0 12px 0", color: "#64748b", fontSize: 14 }}>
                    No hay servicios pendientes de asignación para el tipo <strong>{tipoActual === 1 ? "Incidente" : "Solicitud"}</strong>.
                  </p>
                  <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: 13 }}>
                    Todos los servicios existentes ya cuentan con una categoría asignada. Puede dar de alta un nuevo servicio desde la opción oficial.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                    <Link
                      href="/admin/servicios?vista=crear"
                      className="boton-primario"
                      style={{ width: "auto", padding: "8px 20px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      Ir a registrar servicio
                    </Link>
                    <button
                      type="button"
                      className="boton-secundario"
                      style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                      onClick={() => setVista("tabla")}
                    >
                      Volver a la categoría
                    </button>
                  </div>
                </div>
              );
            }

            if (filtrados.length === 0) {
              return (
                <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: 8 }}>
                  No se encontraron servicios sin asignar que coincidan con "{busquedaAsignar}".
                </div>
              );
            }

            const todosSeleccionados =
              filtrados.length > 0 &&
              filtrados.every((s) => serviciosSeleccionadosParaAsignar.includes(s.id_servicio));

            return (
              <div>
                <div className="contenedor-tabla">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th style={{ width: 44, textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={todosSeleccionados}
                            onChange={() => {
                              if (todosSeleccionados) {
                                const ids = filtrados.map((s) => s.id_servicio);
                                setServiciosSeleccionadosParaAsignar((prev) => prev.filter((id) => !ids.includes(id)));
                              } else {
                                const ids = filtrados.map((s) => s.id_servicio);
                                setServiciosSeleccionadosParaAsignar((prev) => Array.from(new Set([...prev, ...ids])));
                              }
                            }}
                            title="Marcar / Desmarcar todos los visibles"
                            style={{ cursor: "pointer", width: 16, height: 16 }}
                          />
                        </th>
                        <th>Código</th>
                        <th>Nombre del Servicio / Entregable</th>
                        <th>SLA Resp.</th>
                        <th>SLA Resol.</th>
                        <th>Aprobación</th>
                        <th>Costo Ref.</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtrados.map((s) => {
                        const marcado = serviciosSeleccionadosParaAsignar.includes(s.id_servicio);
                        return (
                          <tr
                            key={s.id_servicio}
                            style={{
                              backgroundColor: marcado ? "#eff6ff" : undefined,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setServiciosSeleccionadosParaAsignar((prev) =>
                                prev.includes(s.id_servicio)
                                  ? prev.filter((x) => x !== s.id_servicio)
                                  : [...prev, s.id_servicio]
                              );
                            }}
                          >
                            <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={marcado}
                                onChange={() => {
                                  setServiciosSeleccionadosParaAsignar((prev) =>
                                    prev.includes(s.id_servicio)
                                      ? prev.filter((x) => x !== s.id_servicio)
                                      : [...prev, s.id_servicio]
                                  );
                                }}
                                style={{ cursor: "pointer", width: 16, height: 16 }}
                              />
                            </td>
                            <td>
                              <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                                {s.codigo_servicio}
                              </strong>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.nombre}</div>
                              <div style={{ fontSize: 12, color: "#64748b", maxWidth: 420 }}>
                                Entregable: {s.entregable}
                              </div>
                            </td>
                            <td style={{ fontSize: 12.5, fontWeight: 500 }}>{s.sla_horas_respuesta}h</td>
                            <td style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{s.sla_horas_resolucion}h</td>
                            <td>
                              {s.requiere_aprobacion ? (
                                <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: 11 }}>
                                  Requiere Jefatura
                                </span>
                              ) : (
                                <span style={{ fontSize: 11.5, color: "#64748b" }}>Pre-aprobado</span>
                              )}
                            </td>
                            <td style={{ fontSize: 12.5, color: "#334155" }}>
                              S/. {Number(s.costo_referencial || 0).toFixed(2)}
                            </td>
                            <td>
                              <span className={"badge " + (s.estado_registro ? "badge-activo" : "badge-inactivo")}>
                                {s.estado_registro ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Botón en la esquina derecha inferior */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <button
                    type="button"
                    className="boton-secundario"
                    style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                    onClick={() => setVista("tabla")}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="boton-primario"
                    style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                    disabled={serviciosSeleccionadosParaAsignar.length === 0 || guardando}
                    onClick={ejecutarAsignacionServicios}
                  >
                    {guardando
                      ? "Agregando servicios..."
                      : `Agregar servicios${serviciosSeleccionadosParaAsignar.length > 0 ? ` (${serviciosSeleccionadosParaAsignar.length})` : ""}`}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 5. VISTA PRINCIPAL: AGRUPACIÓN POR CATEGORÍAS O TABLA DE SERVICIOS */}
      {vista === "tabla" && (
        <div>
          {categoriaSeleccionada === null ? (
            /* A. VISTA DE CATEGORÍAS TÉCNICAS CON LOGOS REPRESENTATIVOS */
            <div>
              <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1>{tipoActual === 1 ? "Servicios de Incidentes" : "Servicios de Solicitudes"}</h1>
                  <p>
                    {tipoActual === 1
                      ? "Seleccione una categoría para consultar, parametrizar y administrar los servicios técnicos de reporte y atención de incidentes."
                      : "Seleccione una categoría para consultar, parametrizar y administrar las ofertas de solicitudes de servicio y requerimientos."}
                  </p>
                </div>
                <button
                  type="button"
                  className="boton-primario"
                  style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                  onClick={abrirNuevo}
                >
                  Nuevo Servicio
                </button>
              </div>

              {/* Barra de Filtro de Categorías */}
              <div className="barra-filtros" style={{ marginBottom: 20 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Buscar categoría por nombre o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "100%", fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Grid de Categorías */}
              {cargando ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                  Cargando categorías oficiales...
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
                  {categorias
                    .filter((c) => c.id_tipo_ticket === tipoActual && c.estado_registro)
                    .filter((c) => {
                      if (!busqueda.trim()) return true;
                      const q = busqueda.toLowerCase();
                      return c.nombre.toLowerCase().includes(q) || (c.descripcion && c.descripcion.toLowerCase().includes(q));
                    })
                    .map((cat) => {
                      const serviciosDeCat = servicios.filter((s) => s.id_categoria === cat.id_categoria);
                      const activosDeCat = serviciosDeCat.filter((s) => s.estado_registro).length;

                      return (
                        <div
                          key={cat.id_categoria}
                          onClick={() => {
                            setCategoriaSeleccionada(cat);
                            setBusqueda("");
                          }}
                          className="tarjeta"
                          style={{
                            cursor: "pointer",
                            padding: 20,
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#ffffff",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 16,
                            transition: "all 0.15s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconoCategoria nombre={cat.nombre} codigo={cat.codigo_corto} />
                            </div>
                            <div>
                              <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                                {cat.nombre}
                              </h3>
                              <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                                {cat.descripcion || `Gestión y servicios de ${cat.nombre}`}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: serviciosDeCat.length > 0 ? "#2563eb" : "#94a3b8" }}>
                              {serviciosDeCat.length} {serviciosDeCat.length === 1 ? "servicio" : "servicios"} ({activosDeCat} activos)
                            </span>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              Ver servicios
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            /* B. VISTA DE SERVICIOS DE LA CATEGORÍA SELECCIONADA */
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                  flexWrap: "wrap",
                  gap: 12,
                  paddingBottom: 14,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriaSeleccionada(null);
                      setBusqueda("");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "transparent",
                      border: "none",
                      color: "#2563eb",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      marginBottom: 8,
                      padding: 0,
                    }}
                  >
                    Volver a Categorías de {tipoActual === 1 ? "Incidentes" : "Solicitudes"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 6,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconoCategoria nombre={categoriaSeleccionada.nombre} codigo={categoriaSeleccionada.codigo_corto} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                        Categoría: {categoriaSeleccionada.nombre}
                      </h2>
                      <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: 12.5 }}>
                        {categoriaSeleccionada.descripcion || "Servicios catalogados en esta categoría técnica."} (SLA defecto: {categoriaSeleccionada.sla_default_respuesta}h resp. / {categoriaSeleccionada.sla_default_resolucion}h resol.)
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="boton-primario"
                    style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                    onClick={() => {
                      setServiciosSeleccionadosParaAsignar([]);
                      setBusquedaAsignar("");
                      setVista("asignar");
                    }}
                  >
                    Nuevo servicio en esta categoría
                  </button>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda para Servicios de esta Categoría */}
              <div className="barra-filtros" style={{ marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Buscar servicio por código o nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "100%", fontSize: 13 }}
                  />
                </div>

                <div>
                  <select
                    className="input-base"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    style={{ fontSize: 13, backgroundColor: "#ffffff" }}
                  >
                    <option value="activos">Servicios Activos</option>
                    <option value="inactivos">Servicios Deshabilitados</option>
                    <option value="todos">Todos los Estados</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Servicios de esta Categoría */}
              {cargando ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
                  Cargando servicios de la categoría...
                </div>
              ) : servicios.filter((s) => s.id_categoria === categoriaSeleccionada.id_categoria).length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                  <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: 14 }}>
                    No hay servicios registrados en la categoría <strong>{categoriaSeleccionada.nombre}</strong> con los filtros actuales.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <Link
                      href="/admin/servicios?vista=crear"
                      className="boton-secundario"
                      style={{ width: "auto", padding: "8px 18px", fontSize: 13, textDecoration: "none" }}
                    >
                      Ir a registrar servicio
                    </Link>
                    <button
                      type="button"
                      className="boton-primario"
                      style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                      onClick={() => {
                        setServiciosSeleccionadosParaAsignar([]);
                        setBusquedaAsignar("");
                        setVista("asignar");
                      }}
                    >
                      Nuevo servicio en esta categoría
                    </button>
                  </div>
                </div>
              ) : (
                <div className="contenedor-tabla">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Servicio / Entregable</th>
                        <th>SLA Resp.</th>
                        <th>SLA Resol.</th>
                        <th>Aprobación</th>
                        <th>Costo Ref.</th>
                        <th>Estado</th>
                        <th style={{ textAlign: "right" }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicios
                        .filter((s) => s.id_categoria === categoriaSeleccionada.id_categoria)
                        .map((s) => (
                          <tr key={s.id_servicio}>
                            <td>
                              <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                                {s.codigo_servicio}
                              </strong>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.nombre}</div>
                              <div style={{ fontSize: 12, color: "#64748b", maxWidth: 360 }}>
                                Entregable: {s.entregable}
                              </div>
                              {!s.estado_registro && s.motivo_inactivacion && (
                                <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2, fontStyle: "italic" }}>
                                  Motivo baja: {s.motivo_inactivacion}
                                </div>
                              )}
                            </td>
                            <td style={{ fontSize: 12.5, fontWeight: 500 }}>{s.sla_horas_respuesta}h</td>
                            <td style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{s.sla_horas_resolucion}h</td>
                            <td>
                              {s.requiere_aprobacion ? (
                                <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: 11 }}>
                                  Requiere Jefatura
                                </span>
                              ) : (
                                <span style={{ fontSize: 11.5, color: "#64748b" }}>Pre-aprobado</span>
                              )}
                            </td>
                            <td style={{ fontSize: 12.5, color: "#334155" }}>
                              S/. {Number(s.costo_referencial || 0).toFixed(2)}
                            </td>
                            <td>
                              <span className={"badge " + (s.estado_registro ? "badge-activo" : "badge-inactivo")}>
                                {s.estado_registro ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: 5 }}>
                                <Link
                                  href={`/admin/servicios/${s.id_servicio}/formulario`}
                                  className="boton-accion-icono"
                                  title="Configurar formulario y grupo resolutor"
                                  aria-label="Configurar formulario y grupo resolutor"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                  </svg>
                                </Link>
                                <button
                                  type="button"
                                  className="boton-accion-icono"
                                  title="Editar parámetros y SLA del servicio"
                                  aria-label="Editar parámetros y SLA del servicio"
                                  onClick={() => abrirEdicion(s)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="boton-accion-icono"
                                  title="Diseñar workflow de pasos"
                                  aria-label="Diseñar workflow de pasos"
                                  onClick={() => abrirWorkflow(s)}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className={"boton-accion-icono " + (s.estado_registro ? "boton-accion-peligro" : "")}
                                  title={s.estado_registro ? "Deshabilitar servicio con justificación" : "Reactivar servicio"}
                                  aria-label={s.estado_registro ? "Deshabilitar servicio" : "Reactivar servicio"}
                                  onClick={() => abrirDesactivar(s)}
                                >
                                  {s.estado_registro ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                      <line x1="12" y1="2" x2="12" y2="12" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContenidoAdminServicios() {
  const searchParams = useSearchParams();
  const vistaParam = searchParams.get("vista");
  const tipoParam = searchParams.get("tipo");

  if (vistaParam === "categorias") {
    return (
      <div className="vista-contenedor">
        <GestionCategorias />
      </div>
    );
  }

  if (vistaParam === "sla") {
    return (
      <div className="vista-contenedor">
        <ConfiguracionObjetivosSla />
      </div>
    );
  }

  const keyDinamica = `${vistaParam || "catalogo"}-${tipoParam || "1"}`;

  return <VistaCatalogoServicios key={keyDinamica} />;
}

export default function PaginaAdminServicios() {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando catálogo de servicios...</p></div>}>
      <ContenidoAdminServicios />
    </Suspense>
  );
}
