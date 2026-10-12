"use client";

import { useEffect, useState, FormEvent } from "react";
import { UsuarioConPerfiles, Perfil } from "@/types";
import { generarCorreoCorporativo, generarClaveEstandar } from "@/lib/correo-util";
import {
  validarDni,
  validarNombre,
  validarCorreo,
  validarCelular,
} from "@/lib/validaciones";
import { AlertaCampo } from "@/components/ui/AlertaCampo";

type ModoVista = "tabla" | "crear" | "editar" | "resumen";

interface FormularioUsuario {
  id_usuario: number | null; // null = creando
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  celular: string;
  correo_personal: string;
  correo_electronico: string;
  clave: string;
  perfiles: number[];
  id_departamento_empresa: number | null;
  nivel_prioridad: number;
}

interface ResumenCredenciales {
  id_usuario: number;
  nombresCompletos: string;
  nombres: string;
  dni: string;
  celular: string;
  correo_personal: string;
  correo_corporativo: string;
  clave_generada: string;
  perfiles: string[];
}

const FORMULARIO_VACIO: FormularioUsuario = {
  id_usuario: null,
  dni: "",
  nombres: "",
  apellido_paterno: "",
  apellido_materno: "",
  celular: "",
  correo_personal: "",
  correo_electronico: "",
  clave: "",
  perfiles: [],
  id_departamento_empresa: null,
  nivel_prioridad: 5,
};

const NIVELES_PRIORIDAD_USUARIO = [
  { id: 1, nombre: "Nivel 1: Prioridad VIP (Alta Dirección / Directorio / Presidencia)", corto: "VIP / Alta Dirección", color: "#fee2e2", textColor: "#991b1b" },
  { id: 2, nombre: "Nivel 2: Prioridad Ejecutiva (Gerencias de Área y Subgerencias)", corto: "Ejecutiva", color: "#ffedd5", textColor: "#9a3412" },
  { id: 3, nombre: "Nivel 3: Prioridad Preferente (Jefaturas y Coordinadores de Área)", corto: "Preferente", color: "#fef3c7", textColor: "#92400e" },
  { id: 4, nombre: "Nivel 4: Prioridad Operativa (Especialistas y Analistas Clave)", corto: "Operativa", color: "#e0e7ff", textColor: "#3730a3" },
  { id: 5, nombre: "Nivel 5: Prioridad Estándar (Colaboradores y Usuarios Generales)", corto: "Estándar", color: "#f1f5f9", textColor: "#475569" },
];

export default function PaginaUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioConPerfiles[]>([]);
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<Perfil[]>([]);
  const [departamentosEmpresa, setDepartamentosEmpresa] = useState<{ id_departamento_empresa: number; nombre: string }[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modo de vista activo: "tabla", "crear", "editar", "resumen"
  const [vista, setVista] = useState<ModoVista>("tabla");

  // Estado del formulario
  const [formulario, setFormulario] = useState<FormularioUsuario>(FORMULARIO_VACIO);
  const [resumenNuevoUsuario, setResumenNuevoUsuario] = useState<ResumenCredenciales | null>(null);

  // Estados de proceso
  const [guardando, setGuardando] = useState(false);
  const [enviandoCorreoCredenciales, setEnviandoCorreoCredenciales] = useState(false);
  const [correoCredencialesEnviado, setCorreoCredencialesEnviado] = useState(false);
  const [mostrarClaveEnResumen, setMostrarClaveEnResumen] = useState(false);
  const [copiadoCorreo, setCopiadoCorreo] = useState(false);
  const [copiadoClave, setCopiadoClave] = useState(false);

  // Mensajes y alertas
  const [error, setError] = useState<string | null>(null);
  const [errorEnvioCorreo, setErrorEnvioCorreo] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  function mostrarNotificacion(msj: string) {
    setMensajeExito(msj);
    setTimeout(() => setMensajeExito(null), 4000);
  }

  // Validación de requisitos de contraseña (al editar con nueva clave)
  const tieneLongitud = formulario.clave.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(formulario.clave);
  const tieneMinuscula = /[a-z]/.test(formulario.clave);
  const tieneNumero = /\d/.test(formulario.clave);
  const tieneSimbolo = /[\W_]/.test(formulario.clave);
  const cumpleTodosRequisitos =
    tieneLongitud && tieneMayuscula && tieneMinuscula && tieneNumero && tieneSimbolo;
  const claveEsValidaParaEdicion =
    formulario.clave.trim() === "" || cumpleTodosRequisitos;

  async function cargarDatos() {
    setCargando(true);
    const [respUsuarios, respPerfiles] = await Promise.all([
      fetch("/api/usuarios").then((r) => r.json()),
      fetch("/api/perfiles").then((r) => r.json()),
    ]);
    setUsuarios(respUsuarios.usuarios ?? []);
    setDepartamentosEmpresa(respUsuarios.departamentos_empresa ?? []);
    setPerfilesDisponibles(respPerfiles.perfiles ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirFormularioNuevo() {
    setFormulario(FORMULARIO_VACIO);
    setResumenNuevoUsuario(null);
    setError(null);
    setErrorEnvioCorreo(null);
    setCorreoCredencialesEnviado(false);
    setMostrarClaveEnResumen(false);
    setCopiadoCorreo(false);
    setCopiadoClave(false);
    setVista("crear");
  }

  function abrirFormularioEditar(usuario: UsuarioConPerfiles) {
    setFormulario({
      id_usuario: usuario.id_usuario,
      dni: usuario.dni,
      nombres: usuario.nombres,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno ?? "",
      celular: usuario.celular ?? "",
      correo_personal: usuario.correo_personal ?? "",
      correo_electronico: usuario.correo_electronico,
      clave: "", // vacío = "no cambiar la contraseña"
      perfiles: usuario.perfiles.map((p) => p.id_perfil),
      id_departamento_empresa: usuario.id_departamento_empresa ?? null,
      nivel_prioridad: usuario.nivel_prioridad ?? 5,
    });
    setResumenNuevoUsuario(null);
    setError(null);
    setVista("editar");
  }

  function volverATabla() {
    setVista("tabla");
    setFormulario(FORMULARIO_VACIO);
    setError(null);
    setErrorEnvioCorreo(null);
  }

  function alternarPerfilEnFormulario(idPerfil: number) {
    setFormulario((anterior) => {
      const yaEstaMarcado = anterior.perfiles.includes(idPerfil);
      return {
        ...anterior,
        perfiles: yaEstaMarcado
          ? anterior.perfiles.filter((id) => id !== idPerfil)
          : [...anterior.perfiles, idPerfil],
      };
    });
  }

  // ---------- CREACIÓN: Generar Credenciales y Registrar Usuario ----------
  async function manejarGenerarCredenciales(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // 1. Validaciones con estándares unificados
    const vDni = validarDni(formulario.dni);
    if (!vDni.valido) {
      setError(vDni.mensaje!);
      return;
    }
    const vNombres = validarNombre(formulario.nombres, "El nombre del nuevo usuario", true);
    if (!vNombres.valido) {
      setError(vNombres.mensaje!);
      return;
    }
    const vPaterno = validarNombre(formulario.apellido_paterno, "El apellido paterno", true);
    if (!vPaterno.valido) {
      setError(vPaterno.mensaje!);
      return;
    }
    const vMaterno = validarNombre(formulario.apellido_materno, "El apellido materno", false);
    if (!vMaterno.valido) {
      setError(vMaterno.mensaje!);
      return;
    }
    const vCelular = validarCelular(formulario.celular, false);
    if (!vCelular.valido) {
      setError(vCelular.mensaje!);
      return;
    }
    const vCorreo = validarCorreo(formulario.correo_personal, "El correo personal", true);
    if (!vCorreo.valido) {
      setError(vCorreo.mensaje!);
      return;
    }
    const dniLimpio = formulario.dni.trim();
    const correoPersonalLimpio = formulario.correo_personal.trim().toLowerCase();
    if (formulario.perfiles.length === 0) {
      setError("Debes seleccionar al menos un perfil para el usuario");
      return;
    }
    if (formulario.perfiles.includes(5) && !formulario.id_departamento_empresa) {
      setError("Selecciona el departamento empresarial del Gestor de Área.");
      return;
    }

    // 2. Generar Correo Corporativo y Contraseña Estándar
    const correosExistentes = usuarios.map((u) => u.correo_electronico);
    const correoCorporativo = generarCorreoCorporativo(
      formulario.nombres,
      formulario.apellido_paterno,
      formulario.apellido_materno,
      correosExistentes
    );
    const claveGenerada = generarClaveEstandar();

    setGuardando(true);

    try {
      const respuesta = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: dniLimpio,
          nombres: formulario.nombres.trim(),
          apellido_paterno: formulario.apellido_paterno.trim(),
          apellido_materno: formulario.apellido_materno.trim(),
          celular: formulario.celular.trim(),
          correo_personal: correoPersonalLimpio,
          correo_electronico: correoCorporativo,
          clave: claveGenerada,
          perfiles: formulario.perfiles,
          id_departamento_empresa: formulario.id_departamento_empresa,
          nivel_prioridad: formulario.nivel_prioridad,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo crear el usuario");
        return;
      }

      const perfilesNombres = perfilesDisponibles
        .filter((p) => formulario.perfiles.includes(p.id_perfil))
        .map((p) => p.nombre);

      setResumenNuevoUsuario({
        id_usuario: datos.id_usuario,
        nombresCompletos: `${formulario.nombres.trim()} ${formulario.apellido_paterno.trim()} ${formulario.apellido_materno.trim()}`.trim(),
        nombres: formulario.nombres.trim(),
        dni: dniLimpio,
        celular: formulario.celular.trim(),
        correo_personal: correoPersonalLimpio,
        correo_corporativo: correoCorporativo,
        clave_generada: claveGenerada,
        perfiles: perfilesNombres,
      });

      setCorreoCredencialesEnviado(false);
      setVista("resumen");
    } catch {
      setError("Error de conexión al generar las credenciales. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  // ---------- EDICIÓN: Guardar Cambios de Usuario Existente ----------
  async function manejarGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const vDni = validarDni(formulario.dni);
    if (!vDni.valido) {
      setError(vDni.mensaje!);
      return;
    }
    const vNombres = validarNombre(formulario.nombres, "El nombre del usuario", true);
    if (!vNombres.valido) {
      setError(vNombres.mensaje!);
      return;
    }
    const vPaterno = validarNombre(formulario.apellido_paterno, "El apellido paterno", true);
    if (!vPaterno.valido) {
      setError(vPaterno.mensaje!);
      return;
    }
    const vMaterno = validarNombre(formulario.apellido_materno, "El apellido materno", false);
    if (!vMaterno.valido) {
      setError(vMaterno.mensaje!);
      return;
    }
    const vCelular = validarCelular(formulario.celular, false);
    if (!vCelular.valido) {
      setError(vCelular.mensaje!);
      return;
    }
    const vCorreoCorp = validarCorreo(formulario.correo_electronico, "El correo corporativo", true);
    if (!vCorreoCorp.valido) {
      setError(vCorreoCorp.mensaje!);
      return;
    }
    if (formulario.correo_personal) {
      const vCorreoPers = validarCorreo(formulario.correo_personal, "El correo personal", false);
      if (!vCorreoPers.valido) {
        setError(vCorreoPers.mensaje!);
        return;
      }
    }

    if (!claveEsValidaParaEdicion) {
      setError("La nueva contraseña no cumple con los requisitos de seguridad");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(`/api/usuarios/${formulario.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo actualizar el usuario");
        return;
      }

      mostrarNotificacion("Usuario actualizado correctamente");
      setVista("tabla");
      await cargarDatos();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  // ---------- RESUMEN: Enviar Credenciales al Correo Personal ----------
  async function manejarEnviarCredencialesPorCorreo() {
    if (!resumenNuevoUsuario) return;

    setEnviandoCorreoCredenciales(true);
    setErrorEnvioCorreo(null);

    try {
      const respuesta = await fetch("/api/usuarios/enviar-credenciales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_personal: resumenNuevoUsuario.correo_personal,
          correo_corporativo: resumenNuevoUsuario.correo_corporativo,
          clave_temporal: resumenNuevoUsuario.clave_generada,
          nombres: resumenNuevoUsuario.nombres,
          perfiles: resumenNuevoUsuario.perfiles,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorEnvioCorreo(datos.error ?? "No se pudo enviar el correo de credenciales");
        return;
      }

      setCorreoCredencialesEnviado(true);
      mostrarNotificacion(`Credenciales enviadas a ${resumenNuevoUsuario.correo_personal}`);
    } catch {
      setErrorEnvioCorreo("Error de conexión al enviar el correo con credenciales");
    } finally {
      setEnviandoCorreoCredenciales(false);
    }
  }

  // ---------- RESUMEN: Finalizar y volver a la tabla ----------
  function finalizarCreacionUsuario() {
    setResumenNuevoUsuario(null);
    setFormulario(FORMULARIO_VACIO);
    setVista("tabla");
    setError(null);
    setErrorEnvioCorreo(null);
    mostrarNotificacion("Usuario dado de alta exitosamente");
    cargarDatos();
  }

  // ---------- Desactivar / Activar Usuario ----------
  async function alternarEstado(usuario: UsuarioConPerfiles) {
    const accion = usuario.estado_registro ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que quieres ${accion} a ${usuario.nombres}?`)) return;

    try {
      const res = await fetch(`/api/usuarios/${usuario.id_usuario}`, { method: "DELETE" });
      const datos = await res.json();
      if (!res.ok) {
        alert(datos.error ?? "No se pudo cambiar el estado");
        return;
      }
      mostrarNotificacion(`Usuario ${accion === "activar" ? "activado" : "desactivado"} correctamente`);
      await cargarDatos();
    } catch {
      alert("Error de conexión al cambiar estado");
    }
  }

  // ---------- Desbloquear Usuario ----------
  async function manejarDesbloquear(idUsuario: number) {
    if (!confirm("¿Deseas desbloquear a este usuario para que pueda volver a iniciar sesión?")) return;
    try {
      const res = await fetch(`/api/usuarios/${idUsuario}/desbloquear`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo desbloquear al usuario");
        return;
      }
      mostrarNotificacion(data.mensaje ?? "Usuario desbloqueado exitosamente");
      await cargarDatos();
    } catch {
      setError("Error de conexión al desbloquear");
    }
  }

  // ========================================================
  // RENDER VISTA 1: CREAR NUEVO USUARIO
  // ========================================================
  if (vista === "crear") {
    return (
      <div className="vista-contenedor">
        <div className="cabecera-pagina" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 16,
          marginBottom: 24,
        }}>
          <div>
            <h1>Crear Nuevo Usuario</h1>
            <p>
              Ingresa los datos del nuevo usuario. El correo corporativo y la contraseña se generarán de forma automática.
            </p>
          </div>
          <button
            type="button"
            className="boton-texto"
            onClick={volverATabla}
            disabled={guardando}
            style={{ fontSize: 13 }}
          >
            Volver a usuarios
          </button>
        </div>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={manejarGenerarCredenciales}>
          <div className="formulario-grid">
            <div className="campo">
              <label>Nombre(s) *</label>
              <input
                value={formulario.nombres}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
                placeholder="Ej. Miguel Angel"
                required
                autoFocus
              />
              {formulario.nombres.length > 0 && (() => {
                const v = validarNombre(formulario.nombres, "El nombre", true);
                return v.valido ? (
                  <AlertaCampo exito="Nombre válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Apellido paterno *</label>
              <input
                value={formulario.apellido_paterno}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, apellido_paterno: e.target.value })}
                placeholder="Ej. Apaza"
                required
              />
              {formulario.apellido_paterno.length > 0 && (() => {
                const v = validarNombre(formulario.apellido_paterno, "El apellido paterno", true);
                return v.valido ? (
                  <AlertaCampo exito="Apellido paterno válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Apellido materno</label>
              <input
                value={formulario.apellido_materno}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, apellido_materno: e.target.value })}
                placeholder="Ej. Pariona"
              />
              {formulario.apellido_materno.length > 0 && (() => {
                const v = validarNombre(formulario.apellido_materno, "El apellido materno", false);
                return v.valido ? (
                  <AlertaCampo exito="Apellido materno válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>DNI *</label>
              <input
                value={formulario.dni}
                maxLength={8}
                onChange={(e) => setFormulario({ ...formulario, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                placeholder="8 dígitos numéricos"
                required
              />
              {formulario.dni.length > 0 && (
                formulario.dni.length < 8 ? (
                  <AlertaCampo error={`El DNI debe tener exactamente 8 dígitos numéricos (has ingresado ${formulario.dni.length} de 8).`} />
                ) : (
                  <AlertaCampo exito="DNI completo (8 dígitos)." />
                )
              )}
            </div>

            <div className="campo">
              <label>Teléfono (Celular)</label>
              <input
                value={formulario.celular}
                maxLength={9}
                onChange={(e) => setFormulario({ ...formulario, celular: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                placeholder="Ej. 987654321"
              />
              {formulario.celular.length > 0 && (
                formulario.celular.length < 9 ? (
                  <AlertaCampo error={`El celular debe tener 9 dígitos numéricos (has ingresado ${formulario.celular.length} de 9).`} />
                ) : !formulario.celular.startsWith("9") ? (
                  <AlertaCampo error="El celular debe iniciar con 9." />
                ) : (
                  <AlertaCampo exito="Número de celular válido (9 dígitos)." />
                )
              )}
            </div>

            <div className="campo">
              <label>Correo personal *</label>
              <input
                type="email"
                value={formulario.correo_personal}
                onChange={(e) => setFormulario({ ...formulario, correo_personal: e.target.value })}
                placeholder="ejemplo@gmail.com"
                required
              />
              {formulario.correo_personal.length > 0 && (() => {
                const v = validarCorreo(formulario.correo_personal, "El correo personal", true);
                return v.valido ? (
                  <AlertaCampo exito="Formato de correo válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                A este correo se le enviarán las credenciales de acceso al registrarse el usuario
              </span>
            </div>

            <div className="campo campo-ancho">
              <label>Departamento empresarial {formulario.perfiles.includes(5) ? "*" : "(para Gestores de Área)"}</label>
              <select className="input-base" value={formulario.id_departamento_empresa ?? ""} onChange={(e) => setFormulario({ ...formulario, id_departamento_empresa: e.target.value ? Number(e.target.value) : null })} required={formulario.perfiles.includes(5)}>
                <option value="">Sin departamento asignado</option>
                {departamentosEmpresa.map((d) => <option key={d.id_departamento_empresa} value={d.id_departamento_empresa}>{d.nombre}</option>)}
              </select>
            </div>

            <div className="campo campo-ancho">
              <label>Nivel de Prioridad Institucional (Atención y SLAs) *</label>
              <select
                className="input-base"
                value={formulario.nivel_prioridad}
                onChange={(e) => setFormulario({ ...formulario, nivel_prioridad: Number(e.target.value) })}
                style={{ backgroundColor: "white", fontWeight: 600 }}
              >
                {NIVELES_PRIORIDAD_USUARIO.map((np) => (
                  <option key={np.id} value={np.id}>
                    {np.nombre}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                Permite priorizar la atención de tickets reportados por este colaborador (Directorio, Gerentes, Jefaturas, etc.). Esta información no es visible para el solicitante común.
              </span>
            </div>
            <div className="campo campo-ancho">
              <label>Selección del perfil que tendrá el usuario *</label>
              <div className="grupo-checkboxes">
                {perfilesDisponibles.map((perfil) => (
                  <label key={perfil.id_perfil} className="opcion-checkbox">
                    <input
                      type="checkbox"
                      checked={formulario.perfiles.includes(perfil.id_perfil)}
                      onChange={() => alternarPerfilEnFormulario(perfil.id_perfil)}
                    />
                    {perfil.nombre}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="acciones-formulario" style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              type="submit"
              className="boton-primario"
              style={{ width: "auto" }}
              disabled={guardando}
            >
              {guardando ? "Generando credenciales..." : "Generar credenciales"}
            </button>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto" }}
              onClick={volverATabla}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ========================================================
  // RENDER VISTA 2: RESUMEN DE CREDENCIALES GENERADAS
  // ========================================================
  if (vista === "resumen" && resumenNuevoUsuario) {
    return (
      <div className="vista-contenedor">
        <div className="cabecera-pagina" style={{
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 16,
          marginBottom: 20,
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2563eb",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            display: "block",
            marginBottom: 4,
          }}>
            Creación Exitosa
          </span>
          <h1>Resumen de Datos y Credenciales</h1>
          <p>
            El usuario ha sido registrado en la base de datos con sus credenciales corporativas estándar.
          </p>
        </div>

        {/* Bloque 1: Resumen de datos del usuario */}
        <div style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 18,
          marginBottom: 18,
        }}>
          <h4 style={{ margin: "0 0 14px 0", fontSize: 12, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Datos del Usuario
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, fontSize: 13 }}>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11, marginBottom: 2 }}>Nombre completo</span>
              <span style={{ color: "#0f172a", fontWeight: "normal" }}>{resumenNuevoUsuario.nombresCompletos}</span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11, marginBottom: 2 }}>DNI</span>
              <span style={{ color: "#0f172a", fontWeight: "normal" }}>{resumenNuevoUsuario.dni}</span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11, marginBottom: 2 }}>Teléfono (Celular)</span>
              <span style={{ color: "#0f172a", fontWeight: "normal" }}>{resumenNuevoUsuario.celular || "No especificado"}</span>
            </div>
            <div>
              <span style={{ color: "#64748b", display: "block", fontSize: 11, marginBottom: 2 }}>Correo personal</span>
              <span style={{ color: "#2563eb", fontWeight: "normal" }}>{resumenNuevoUsuario.correo_personal}</span>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ color: "#64748b", display: "block", fontSize: 11, marginBottom: 6 }}>Perfil(es) asignado(s)</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {resumenNuevoUsuario.perfiles.map((p, idx) => (
                  <span key={idx} className="chip-perfil">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 2: Credenciales Estándar Generadas */}
        <div style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
        }}>
          <h4 style={{ margin: "0 0 16px 0", fontSize: 12, color: "#1e40af", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Credenciales Corporativas de Acceso
          </h4>

          {/* Correo corporativo estándar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 600 }}>
                Correo Corporativo Estándar
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(resumenNuevoUsuario.correo_corporativo);
                  setCopiadoCorreo(true);
                  setTimeout(() => setCopiadoCorreo(false), 2000);
                }}
                style={{
                  background: "none",
                  border: "1px solid #93c5fd",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontSize: 11,
                  color: "#1d4ed8",
                  cursor: "pointer",
                  backgroundColor: "#ffffff",
                  fontWeight: 600,
                }}
              >
                {copiadoCorreo ? "Copiado" : "Copiar"}
              </button>
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: 15,
              fontWeight: 700,
              backgroundColor: "#ffffff",
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              color: "#0f172a",
            }}>
              {resumenNuevoUsuario.correo_corporativo}
            </div>
          </div>

          {/* Contraseña estándar generada */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#1e3a8a", fontWeight: 600 }}>
                Contraseña Estándar Generada
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setMostrarClaveEnResumen(!mostrarClaveEnResumen)}
                  style={{
                    background: "none",
                    border: "1px solid #93c5fd",
                    borderRadius: 4,
                    padding: "3px 10px",
                    fontSize: 11,
                    color: "#1d4ed8",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {mostrarClaveEnResumen ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resumenNuevoUsuario.clave_generada);
                    setCopiadoClave(true);
                    setTimeout(() => setCopiadoClave(false), 2000);
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #93c5fd",
                    borderRadius: 4,
                    padding: "3px 10px",
                    fontSize: 11,
                    color: "#1d4ed8",
                    cursor: "pointer",
                    backgroundColor: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {copiadoClave ? "Copiada" : "Copiar"}
                </button>
              </div>
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              backgroundColor: "#ffffff",
              padding: "10px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              letterSpacing: mostrarClaveEnResumen ? 1 : 4,
            }}>
              {mostrarClaveEnResumen ? resumenNuevoUsuario.clave_generada : "••••••••••"}
            </div>
          </div>
        </div>

        {/* Alerta de error de envío si ocurrió */}
        {errorEnvioCorreo && (
          <div className="mensaje-error" style={{ marginBottom: 16 }}>
            {errorEnvioCorreo}
          </div>
        )}

        {/* Confirmación de correo enviado */}
        {correoCredencialesEnviado && (
          <div style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
          }}>
            Credenciales enviadas exitosamente al correo personal: <strong>{resumenNuevoUsuario.correo_personal}</strong>
          </div>
        )}

        {/* Botones de acción debajo del resumen */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
          <button
            type="button"
            className="boton-primario"
            onClick={manejarEnviarCredencialesPorCorreo}
            disabled={enviandoCorreoCredenciales}
            style={{
              width: "auto",
              backgroundColor: correoCredencialesEnviado ? "#059669" : "#2563eb",
            }}
          >
            {enviandoCorreoCredenciales
              ? "Enviando credenciales..."
              : correoCredencialesEnviado
              ? "Reenviar credenciales"
              : "Enviar credenciales"}
          </button>
          <button
            type="button"
            className="boton-secundario"
            onClick={finalizarCreacionUsuario}
            style={{ width: "auto" }}
          >
            Finalizar
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER VISTA 3: EDITAR USUARIO EXISTENTE
  // ========================================================
  if (vista === "editar") {
    return (
      <div className="vista-contenedor">
        <div className="cabecera-pagina" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 16,
          marginBottom: 24,
        }}>
          <div>
            <h1>Editar Usuario</h1>
            <p>
              Actualiza los datos personales, perfil asignado o contraseña del usuario.
            </p>
          </div>
          <button
            type="button"
            className="boton-texto"
            onClick={volverATabla}
            disabled={guardando}
            style={{ fontSize: 13 }}
          >
            Volver a usuarios
          </button>
        </div>

        {error && <div className="mensaje-error">{error}</div>}

        <form onSubmit={manejarGuardarEdicion}>
          <div className="formulario-grid">
            <div className="campo">
              <label>DNI *</label>
              <input
                value={formulario.dni}
                maxLength={8}
                onChange={(e) => setFormulario({ ...formulario, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                placeholder="8 dígitos numéricos"
                required
              />
              {formulario.dni.length > 0 && (
                formulario.dni.length < 8 ? (
                  <AlertaCampo error={`El DNI debe tener exactamente 8 dígitos numéricos (has ingresado ${formulario.dni.length} de 8).`} />
                ) : (
                  <AlertaCampo exito="DNI completo (8 dígitos)." />
                )
              )}
            </div>

            <div className="campo">
              <label>Teléfono (Celular)</label>
              <input
                value={formulario.celular}
                maxLength={9}
                onChange={(e) => setFormulario({ ...formulario, celular: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                placeholder="Ej. 987654321"
              />
              {formulario.celular.length > 0 && (
                formulario.celular.length < 9 ? (
                  <AlertaCampo error={`El celular debe tener 9 dígitos numéricos (has ingresado ${formulario.celular.length} de 9).`} />
                ) : !formulario.celular.startsWith("9") ? (
                  <AlertaCampo error="El celular debe iniciar con 9." />
                ) : (
                  <AlertaCampo exito="Número de celular válido (9 dígitos)." />
                )
              )}
            </div>

            <div className="campo">
              <label>Nombre(s) *</label>
              <input
                value={formulario.nombres}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
                required
              />
              {formulario.nombres.length > 0 && (() => {
                const v = validarNombre(formulario.nombres, "El nombre", true);
                return v.valido ? (
                  <AlertaCampo exito="Nombre válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Apellido paterno *</label>
              <input
                value={formulario.apellido_paterno}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, apellido_paterno: e.target.value })}
                required
              />
              {formulario.apellido_paterno.length > 0 && (() => {
                const v = validarNombre(formulario.apellido_paterno, "El apellido paterno", true);
                return v.valido ? (
                  <AlertaCampo exito="Apellido paterno válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Apellido materno</label>
              <input
                value={formulario.apellido_materno}
                maxLength={100}
                onChange={(e) => setFormulario({ ...formulario, apellido_materno: e.target.value })}
                placeholder="Ej. Pariona"
              />
              {formulario.apellido_materno.length > 0 && (() => {
                const v = validarNombre(formulario.apellido_materno, "El apellido materno", false);
                return v.valido ? (
                  <AlertaCampo exito="Apellido materno válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Correo personal</label>
              <input
                type="email"
                value={formulario.correo_personal}
                onChange={(e) => setFormulario({ ...formulario, correo_personal: e.target.value })}
                placeholder="ejemplo@gmail.com"
              />
              {formulario.correo_personal.length > 0 && (() => {
                const v = validarCorreo(formulario.correo_personal, "El correo personal", false);
                return v.valido ? (
                  <AlertaCampo exito="Formato de correo válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo">
              <label>Correo corporativo *</label>
              <input
                type="email"
                value={formulario.correo_electronico}
                onChange={(e) => setFormulario({ ...formulario, correo_electronico: e.target.value })}
                required
              />
              {formulario.correo_electronico.length > 0 && (() => {
                const v = validarCorreo(formulario.correo_electronico, "El correo corporativo", true);
                return v.valido ? (
                  <AlertaCampo exito="Formato de correo corporativo válido." />
                ) : (
                  <AlertaCampo error={v.mensaje} />
                );
              })()}
            </div>

            <div className="campo campo-ancho">
              <label>Nueva contraseña (déjalo vacío para no cambiarla)</label>
              <input
                type="password"
                value={formulario.clave}
                onChange={(e) => setFormulario({ ...formulario, clave: e.target.value })}
                placeholder="Mínimo 8 caracteres (o vacío para mantener la actual)"
              />
            </div>

            {/* Checklist de requisitos al editar */}
            {formulario.clave.length > 0 && (
              <div className="lista-requisitos-clave campo campo-ancho" style={{ margin: "4px 0" }}>
                <div className={`requisito-item ${tieneLongitud ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Mínimo 8 caracteres
                </div>
                <div className={`requisito-item ${tieneMayuscula ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos una letra mayúscula (A-Z)
                </div>
                <div className={`requisito-item ${tieneMinuscula ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos una letra minúscula (a-z)
                </div>
                <div className={`requisito-item ${tieneNumero ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos un número (0-9)
                </div>
                <div className={`requisito-item ${tieneSimbolo ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos un signo o carácter especial (!@#$%...)
                </div>
              </div>
            )}

            <div className="campo campo-ancho">
              <label>Departamento empresarial {formulario.perfiles.includes(5) ? "*" : "(para Gestores de Área)"}</label>
              <select className="input-base" value={formulario.id_departamento_empresa ?? ""} onChange={(e) => setFormulario({ ...formulario, id_departamento_empresa: e.target.value ? Number(e.target.value) : null })} required={formulario.perfiles.includes(5)}>
                <option value="">Sin departamento asignado</option>
                {departamentosEmpresa.map((d) => <option key={d.id_departamento_empresa} value={d.id_departamento_empresa}>{d.nombre}</option>)}
              </select>
            </div>

            <div className="campo campo-ancho">
              <label>Nivel de Prioridad Institucional (Atención y SLAs) *</label>
              <select
                className="input-base"
                value={formulario.nivel_prioridad}
                onChange={(e) => setFormulario({ ...formulario, nivel_prioridad: Number(e.target.value) })}
                style={{ backgroundColor: "white", fontWeight: 600 }}
              >
                {NIVELES_PRIORIDAD_USUARIO.map((np) => (
                  <option key={np.id} value={np.id}>
                    {np.nombre}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                Permite priorizar la atención de tickets reportados por este colaborador (Directorio, Gerentes, Jefaturas, etc.). Esta información no es visible para el solicitante común.
              </span>
            </div>
            <div className="campo campo-ancho">
              <label>Perfiles asignados</label>
              <div className="grupo-checkboxes">
                {perfilesDisponibles.map((perfil) => (
                  <label key={perfil.id_perfil} className="opcion-checkbox">
                    <input
                      type="checkbox"
                      checked={formulario.perfiles.includes(perfil.id_perfil)}
                      onChange={() => alternarPerfilEnFormulario(perfil.id_perfil)}
                    />
                    {perfil.nombre}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="acciones-formulario" style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              type="submit"
              className="boton-primario"
              style={{
                width: "auto",
                opacity: !claveEsValidaParaEdicion || guardando ? 0.6 : 1,
                cursor: !claveEsValidaParaEdicion || guardando ? "not-allowed" : "pointer",
              }}
              disabled={!claveEsValidaParaEdicion || guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto" }}
              onClick={volverATabla}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ========================================================
  // RENDER VISTA 4 (DEFAULT): TABLA GENERAL DE USUARIOS
  // ========================================================
  return (
    <div className="vista-contenedor">
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

      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Usuarios</h1>
          <p>
            Administración de usuarios, perfiles asignados y generación de credenciales corporativas.
          </p>
        </div>
        <button className="boton-primario" style={{ width: "auto" }} onClick={abrirFormularioNuevo}>
          + Nuevo usuario
        </button>
      </div>

      {cargando ? (
        <p className="descripcion">Cargando usuarios...</p>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla-datos">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre completo</th>
              <th>Correos</th>
              <th>Departamento empresarial</th>
              <th>Prioridad Solicitante</th>
              <th>Perfiles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.dni}</td>
                <td>
                  {u.nombres} {u.apellido_paterno} {u.apellido_materno}
                  {u.celular && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      Tel: {u.celular}
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ color: "#0f172a" }}>
                    {u.correo_electronico}
                  </div>
                  {u.correo_personal && (
                    <div style={{ fontSize: 11, color: "#2563eb", marginTop: 2 }}>
                      Personal: {u.correo_personal}
                    </div>
                  )}
                </td>
                <td>{u.departamento_empresa_nombre || "Sin asignar"}</td>
                <td>
                  {(() => {
                    const np = NIVELES_PRIORIDAD_USUARIO.find((item) => item.id === (u.nivel_prioridad ?? 5)) || NIVELES_PRIORIDAD_USUARIO[4];
                    return (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          backgroundColor: np.color,
                          color: np.textColor,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {np.corto}
                      </span>
                    );
                  })()}
                </td>
                <td>
                  <div className="perfiles-usuario">
                    {u.perfiles.length === 0 ? (
                      <span className="texto-ayuda">Sin perfiles</span>
                    ) : (
                      u.perfiles.map((p) => (
                        <span key={p.id_perfil} className="chip-perfil">
                          {p.nombre}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                    <span className={u.estado_registro ? "badge-activo" : "badge-inactivo"}>
                      {u.estado_registro ? "Activo" : "Inactivo"}
                    </span>
                    {(u.cuenta_bloqueada || (u.intentos_fallidos ?? 0) >= 3) && (
                      <span className="badge-bloqueado" title="Usuario bloqueado por 3 intentos fallidos">
                        Bloqueado (Soporte)
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ width: 110 }}>
                  <div className="acciones-fila" style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                    {(u.cuenta_bloqueada || (u.intentos_fallidos ?? 0) >= 3) && (
                      <button
                        type="button"
                        className="boton-mini boton-mini-desbloquear"
                        title="Desbloquear usuario"
                        aria-label="Desbloquear usuario"
                        onClick={() => manejarDesbloquear(u.id_usuario)}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      className="boton-mini"
                      onClick={() => abrirFormularioEditar(u)}
                      title="Editar usuario"
                      aria-label="Editar usuario"
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={u.estado_registro ? "boton-mini boton-mini-peligro" : "boton-mini"}
                      onClick={() => alternarEstado(u)}
                      title={u.estado_registro ? "Desactivar usuario" : "Activar usuario"}
                      aria-label={u.estado_registro ? "Desactivar usuario" : "Activar usuario"}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                    >
                      {u.estado_registro ? (
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
  );
}
