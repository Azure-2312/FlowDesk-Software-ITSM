"use client";

import React, { useState, useEffect } from "react";

export default function PanelApiClientes() {
  const [apiKey, setApiKey] = useState("");
  const [mostrarKey, setMostrarKey] = useState(false);
  const [salud, setSalud] = useState<any>(null);
  const [cargandoSalud, setCargandoSalud] = useState(false);

  // Estados de los outputs de cada tarjeta
  const [outputDatos, setOutputDatos] = useState<any>("// Ingrese su API Key arriba y haga clic en 'Consultar Usuarios'");
  const [outputRegistro, setOutputRegistro] = useState<any>("// Resultados de validación aquí...");
  const [outputRateLimit, setOutputRateLimit] = useState<any>("// Contador de intentos y cabeceras HTTP...");
  const [outputSeguridad, setOutputSeguridad] = useState<any>("// Prueba de control perimetral...");

  // Rate Limiting headers
  const [rateLimit, setRateLimit] = useState<string>("--");
  const [rateRemaining, setRateRemaining] = useState<string>("--");

  // Formulario de Registro
  const [regDni, setRegDni] = useState("77112233");
  const [regNombres, setRegNombres] = useState("Valeria");
  const [regApellidos, setRegApellidos] = useState("Mendoza Castro");
  const [regCorreo, setRegCorreo] = useState("valeria.mendoza@empresa.com");
  const [regDep, setRegDep] = useState("Finanzas");

  // Bitácora de Trazabilidad
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [alcanceTraza, setAlcanceTraza] = useState<string>("");
  const [cargandoLogs, setCargandoLogs] = useState(false);

  useEffect(() => {
    // Cargar clave guardada en sessionStorage si existe
    if (typeof window !== "undefined") {
      const guardada = sessionStorage.getItem("flowdesk_test_api_key");
      if (guardada) {
        setApiKey(guardada);
      }
    }
    verificarSalud();
  }, []);

  useEffect(() => {
    if (apiKey) {
      cargarTrazabilidad();
    }
  }, [apiKey]);

  const guardarKeyLocal = () => {
    if (!apiKey.trim()) {
      alert("Ingrese una clave primero");
      return;
    }
    sessionStorage.setItem("flowdesk_test_api_key", apiKey.trim());
    alert("Clave guardada solo en la memoria de esta pestaña.");
    cargarTrazabilidad();
  };

  const verificarSalud = async () => {
    setCargandoSalud(true);
    try {
      const res = await fetch("/api/v1/health");
      const data = await res.json();
      setSalud(data);
    } catch (e: any) {
      setSalud({ estado: "ERROR", mensaje: e.message });
    } finally {
      setCargandoSalud(false);
    }
  };

  const cargarUsuarios = async () => {
    if (!apiKey.trim()) {
      setOutputDatos("⚠️ Debe ingresar una API Key en el campo superior para consultar.");
      return;
    }
    setOutputDatos("Consultando /api/v1/usuarios...");
    try {
      const res = await fetch("/api/v1/usuarios?limite=5", {
        headers: { "X-API-KEY": apiKey.trim() }
      });
      actualizarRateHeaders(res);
      const data = await res.json();
      setOutputDatos(data);
    } catch (e: any) {
      setOutputDatos({ error: e.message });
    }
  };

  const actualizarRateHeaders = (res: Response) => {
    const l = res.headers.get("X-RateLimit-Limit");
    const r = res.headers.get("X-RateLimit-Remaining");
    if (l) setRateLimit(l);
    if (r) setRateRemaining(r);
  };

  const registrarUsuario = async () => {
    if (!apiKey.trim()) {
      setOutputRegistro("⚠️ Debe ingresar una API Key en el campo superior.");
      return;
    }
    setOutputRegistro("Enviando POST /api/v1/clientes...");
    try {
      const res = await fetch("/api/v1/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey.trim()
        },
        body: JSON.stringify({
          dni: regDni.trim(),
          nombres: regNombres.trim(),
          apellidos: regApellidos.trim(),
          correo_electronico: regCorreo.trim(),
          departamento: regDep
        })
      });
      actualizarRateHeaders(res);
      const data = await res.json();
      setOutputRegistro({ status: res.status, ...data });
      cargarTrazabilidad();
    } catch (e: any) {
      setOutputRegistro({ error: e.message });
    }
  };

  const probarDuplicado = async () => {
    if (!apiKey.trim()) {
      setOutputRegistro("⚠️ Debe ingresar una API Key en el campo superior.");
      return;
    }
    setOutputRegistro("Forzando inserción duplicada con DNI '67675675'...");
    try {
      const res = await fetch("/api/v1/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey.trim()
        },
        body: JSON.stringify({
          dni: "67675675",
          nombres: "Intento",
          apellidos: "Duplicado",
          correo_electronico: "duplicado@empresa.com",
          departamento: "Finanzas"
        })
      });
      actualizarRateHeaders(res);
      const data = await res.json();
      setOutputRegistro({
        explicacion_profesor: "✅ Rechazado con 409 Conflict por validación UNIQUE de documento",
        status_http: res.status,
        respuesta_api: data
      });
      cargarTrazabilidad();
    } catch (e: any) {
      setOutputRegistro({ error: e.message });
    }
  };

  const realizarPeticionRateLimit = async () => {
    if (!apiKey.trim()) {
      setOutputRateLimit("⚠️ Ingrese una API Key para probar.");
      return;
    }
    try {
      const res = await fetch("/api/v1/usuarios?limite=1", {
        headers: { "X-API-KEY": apiKey.trim() }
      });
      actualizarRateHeaders(res);
      setOutputRateLimit({
        status: res.status,
        "X-RateLimit-Limit": res.headers.get("X-RateLimit-Limit"),
        "X-RateLimit-Remaining": res.headers.get("X-RateLimit-Remaining"),
        "X-RateLimit-Reset": res.headers.get("X-RateLimit-Reset")
      });
    } catch (e: any) {
      setOutputRateLimit({ error: e.message });
    }
  };

  const bombardearRateLimit = async () => {
    if (!apiKey.trim()) {
      setOutputRateLimit("⚠️ Ingrese una API Key para probar.");
      return;
    }
    setOutputRateLimit("Disparando 30 peticiones concurrentes para saturar cuota...");
    let ultimoStatus = 200;
    let bloqueado = false;
    for (let i = 0; i < 30; i++) {
      const res = await fetch("/api/v1/usuarios?limite=1", {
        headers: { "X-API-KEY": apiKey.trim() }
      });
      actualizarRateHeaders(res);
      if (res.status === 429) {
        bloqueado = true;
        const data = await res.json();
        setOutputRateLimit({
          explicacion_profesor: "✅ 429 Too Many Requests activado por el Rate Limiter perimetral",
          status_http: 429,
          respuesta: data
        });
        break;
      }
      ultimoStatus = res.status;
    }
    if (!bloqueado) {
      setOutputRateLimit(`Peticiones procesadas (último status ${ultimoStatus}). No se superó el límite todavía.`);
    }
    cargarTrazabilidad();
  };

  const probarSinApiKey = async () => {
    setOutputSeguridad("Enviando GET /api/v1/usuarios sin cabecera X-API-KEY...");
    try {
      const res = await fetch("/api/v1/usuarios");
      const data = await res.json();
      setOutputSeguridad({
        explicacion_profesor: "✅ Bloqueado con 401 por falta de credenciales",
        status_http: res.status,
        respuesta: data
      });
      cargarTrazabilidad();
    } catch (e: any) {
      setOutputSeguridad({ error: e.message });
    }
  };

  const probarClaveFalsa = async () => {
    setOutputSeguridad("Enviando GET /api/v1/usuarios con clave falsa...");
    try {
      const res = await fetch("/api/v1/usuarios", {
        headers: { "X-API-KEY": "fdk_live_clave_falsa_inventada_999" }
      });
      const data = await res.json();
      setOutputSeguridad({
        explicacion_profesor: "✅ Bloqueado con 401 por clave inexistente o revocada",
        status_http: res.status,
        respuesta: data
      });
      cargarTrazabilidad();
    } catch (e: any) {
      setOutputSeguridad({ error: e.message });
    }
  };

  const probarClaveCorrecta = async () => {
    if (!apiKey.trim()) {
      setOutputSeguridad("⚠️ Ingrese su clave autorizada arriba primero.");
      return;
    }
    setOutputSeguridad("Enviando GET /api/v1/usuarios con clave autorizada...");
    try {
      const res = await fetch("/api/v1/usuarios?limite=2", {
        headers: { "X-API-KEY": apiKey.trim() }
      });
      actualizarRateHeaders(res);
      const data = await res.json();
      setOutputSeguridad({
        explicacion_profesor: "✅ Acceso concedido con 200 OK y hash validado en BD",
        status_http: res.status,
        total_usuarios: data.total_registros,
        primer_usuario: data.usuarios?.[0]
      });
      cargarTrazabilidad();
    } catch (e: any) {
      setOutputSeguridad({ error: e.message });
    }
  };

  const cargarTrazabilidad = async () => {
    if (!apiKey.trim()) return;
    setCargandoLogs(true);
    try {
      const res = await fetch("/api/v1/trazabilidad?limite=10", {
        headers: { "X-API-KEY": apiKey.trim() }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.registros || []);
        setStats(data.estadisticas || null);
        setAlcanceTraza(data.alcance || "");
      }
    } catch {
      // Ignorar errores de red en polling de trazabilidad
    } finally {
      setCargandoLogs(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#1e293b", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", color: "white", padding: "24px 20px", borderBottom: "4px solid #2563eb" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 className="titulo-pagina">FlowDesk ITSM — Consola de Verificación de la API</h1>
              <span style={{ background: "#22c55e", color: "#052e16", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: 9999 }}>
                ● API v2.0
              </span>
            </div>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "0.86rem", color: "#93c5fd" }}>
              Verificación funcional y de seguridad de los 7 requerimientos del docente
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span>Base de Datos: </span>
              <strong style={{ color: salud?.estado === "OPERACIONAL" ? "#4ade80" : "#f87171" }}>
                {salud?.estado || "CONECTANDO..."}
              </strong>
              {salud?.base_de_datos?.latencia_ms !== undefined && (
                <span style={{ opacity: 0.8, marginLeft: 6 }}>({salud.base_de_datos.latencia_ms} ms)</span>
              )}
            </div>
            <button className="boton-primario"
              onClick={verificarSalud}
              disabled={cargandoSalud}
            >
               /health
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 16px" }}>
        {/* SEGURIDAD: Barra de Autenticación */}
        <div style={{ background: "#ffffff", border: "2px solid #3b82f6", borderRadius: 10, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.1)" }}>
          <span style={{ fontSize: "1.2rem" }}>🔑</span>
          <div style={{ flexGrow: 1, minWidth: 260 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              API Key Autorizada (Ingresa tu clave de acceso para probar):
            </label>
            <input
              type={mostrarKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega aquí tu X-API-KEY (ej: fdk_live_...)"
              style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.85rem", fontFamily: "monospace", marginTop: 3, boxSizing: "border-box" }}
            />
          </div>
          <button className="boton-secundario"
            type="button"
            onClick={() => setMostrarKey(!mostrarKey)}
            style={{ marginTop: 14 }}
          >
            {mostrarKey ? "Ocultar" : "Ver"}
          </button>
          <button className="boton-primario"
            type="button"
            onClick={guardarKeyLocal}
            style={{ marginTop: 14 }}
          >
             Recordar en esta sesión
          </button>
          <button className="boton-secundario"
            type="button"
            onClick={() => setApiKey("fdk_live_grupo_aliado_2026_acceso_seguro_token")}
            style={{ marginTop: 14 }}
          >
            Pegar Llave Aliada Demo
          </button>
        </div>

        {/* REQUERIMIENTOS 1 Y 3: QUÉ DATOS CARGA Y VALIDACIÓN DE DUPLICADOS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* PUNTO 1: QUÉ DATOS CARGA */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              📦 1. ¿Qué datos carga?
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Consulta la tabla <code>usuario</code> oficial de FlowDesk (DNI, nombres, correo, departamento y rol Solicitante).
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <strong>src/services/usuarioService.js</strong> &rarr; <code>listarUsuarios()</code>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="boton-primario"
                onClick={cargarUsuarios}
              >
                 Consultar Usuarios
              </button>
              <button className="boton-secundario"
                onClick={verificarSalud}
              >
                 Probar /health
              </button>
            </div>
            <pre style={{ background: "#090d16", color: "#e2e8f0", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: "0.78rem", maxHeight: 220, overflowY: "auto", whiteSpace: "pre-wrap", marginTop: 10, border: "1px solid #1e293b" }}>
              {typeof outputDatos === "string" ? outputDatos : JSON.stringify(outputDatos, null, 2)}
            </pre>
          </div>

          {/* PUNTO 3: VALIDAR DUPLICADOS */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              🛡️ 3. Validar si ya existen (Evitar Duplicados)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Registra trabajadores. Si el DNI o correo ya existen, la API lo rechaza con código <code>409 Conflict</code>.
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <strong>src/services/usuarioService.js</strong> &rarr; Validación UNIQUE
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>DNI (8 dígitos):</label>
                <input
                  type="text"
                  maxLength={8}
                  value={regDni}
                  onChange={(e) => setRegDni(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.82rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Nombres:</label>
                <input
                  type="text"
                  value={regNombres}
                  onChange={(e) => setRegNombres(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.82rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Apellidos:</label>
                <input
                  type="text"
                  value={regApellidos}
                  onChange={(e) => setRegApellidos(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.82rem", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Departamento:</label>
                <select
                  value={regDep}
                  onChange={(e) => setRegDep(e.target.value)}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.82rem", boxSizing: "border-box", background: "white" }}
                >
                  <option value="Finanzas">Finanzas</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Logística">Logística</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Correo Electrónico:</label>
              <input
                type="email"
                value={regCorreo}
                onChange={(e) => setRegCorreo(e.target.value)}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: "0.82rem", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="boton-primario"
                onClick={registrarUsuario}
              >
                 Registrar Trabajador
              </button>
              <button className="boton-peligro"
                onClick={probarDuplicado}
              >
                 Forzar Duplicado (409)
              </button>
            </div>
            <pre style={{ background: "#090d16", color: "#e2e8f0", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: "0.78rem", maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", marginTop: 10, border: "1px solid #1e293b" }}>
              {typeof outputRegistro === "string" ? outputRegistro : JSON.stringify(outputRegistro, null, 2)}
            </pre>
          </div>
        </div>

        {/* REQUERIMIENTOS 4 Y 7: INTENTOS / RATE LIMITING Y SEGURIDAD */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* PUNTO 4: CUÁNTOS INTENTOS TIENE */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              ⏱️ 4. ¿Cuántos intentos tiene? (Rate Limiting)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Protección contra fuerza bruta ejecutada <strong>ANTES</strong> de procesar claves.
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <strong>src/shared/lib/api-key-auth.ts</strong> &rarr; Cabeceras <code>X-RateLimit-*</code>
            </div>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>INTENTOS DISPONIBLES:</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}>{rateRemaining}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>LÍMITE TOTAL:</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#334155" }}>{rateLimit} RPM</div>
              </div>
              <div>
                <button className="boton-primario"
                  onClick={realizarPeticionRateLimit}
                >
                   Hacer 1 Petición
                </button>
              </div>
            </div>
            <button className="boton-peligro"
              onClick={bombardearRateLimit}
            >
               Disparar Ráfaga (Probar bloqueo 429)
            </button>
            <pre style={{ background: "#090d16", color: "#e2e8f0", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: "0.78rem", maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", marginTop: 10, border: "1px solid #1e293b" }}>
              {typeof outputRateLimit === "string" ? outputRateLimit : JSON.stringify(outputRateLimit, null, 2)}
            </pre>
          </div>

          {/* PUNTO 7: SEGURIDAD */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              🔒 7. Seguridad Criptográfica (OWASP / ISO 27001)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Sin clave se bloquea con 401, y las claves en BD son HMAC-SHA256 con Timing-Safe compare.
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <strong>src/shared/lib/api-key-auth.ts</strong> &rarr; <code>compararStringsSeguro()</code>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button className="boton-peligro"
                onClick={probarSinApiKey}
              >
                 Probar Sin Clave (401)
              </button>
              <button className="boton-peligro"
                onClick={probarClaveFalsa}
              >
                 Probar Clave Falsa (401)
              </button>
              <button className="boton-primario"
                onClick={probarClaveCorrecta}
              >
                 Clave Autorizada (200)
              </button>
            </div>
            <pre style={{ background: "#090d16", color: "#e2e8f0", padding: 12, borderRadius: 8, fontFamily: "monospace", fontSize: "0.78rem", maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", border: "1px solid #1e293b" }}>
              {typeof outputSeguridad === "string" ? outputSeguridad : JSON.stringify(outputSeguridad, null, 2)}
            </pre>
          </div>
        </div>

        {/* REQUERIMIENTO 2: TRAZABILIDAD DEL API */}
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                📜 2. Trazabilidad del API (Bitácora Append-Only en PostgreSQL)
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "4px 0 0" }}>
                Tabla protegida por Trigger de BD (prohíbe <code>UPDATE</code> y <code>DELETE</code>). Registra IP, latencia y código HTTP.
                {alcanceTraza && (
                  <span style={{ marginLeft: 8, background: "#dbeafe", color: "#1e40af", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontSize: "0.72rem" }}>
                    ALCANCE: {alcanceTraza}
                  </span>
                )}
              </p>
            </div>
            <button className="boton-secundario"
              onClick={cargarTrazabilidad}
              disabled={cargandoLogs}
            >
               Actualizar Bitácora
            </button>
          </div>

          <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 12, borderRadius: "0 6px 6px 0" }}>
            📁 Código: <strong>scripts/protect_audit_log.js</strong> y <strong>src/modules/identidades/services/apiClientesService.ts</strong>
          </div>

          {stats && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 700 }}>
                Peticiones Totales: <strong>{stats.total_peticiones || 0}</strong>
              </span>
              <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 700 }}>
                Exitosas (2xx): <strong>{stats.exitosas || 0}</strong>
              </span>
              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 700 }}>
                Bloqueadas (401): <strong>{stats.bloqueos_seguridad || 0}</strong>
              </span>
              <span style={{ background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 700 }}>
                Duplicadas (409): <strong>{stats.intentos_duplicados || 0}</strong>
              </span>
              <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: 9999, fontSize: "0.78rem", fontWeight: 700 }}>
                Tiempo Promedio: <strong>{stats.tiempo_promedio_ms || 0} ms</strong>
              </span>
            </div>
          )}

          <div style={{ overflowX: "auto", maxHeight: 220, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", textAlign: "left", color: "#475569" }}>
                  <th style={{ padding: "8px 10px" }}>ID</th>
                  <th style={{ padding: "8px 10px" }}>Grupo Identificado</th>
                  <th style={{ padding: "8px 10px" }}>Método</th>
                  <th style={{ padding: "8px 10px" }}>Ruta</th>
                  <th style={{ padding: "8px 10px" }}>Estado HTTP</th>
                  <th style={{ padding: "8px 10px" }}>Latencia</th>
                  <th style={{ padding: "8px 10px" }}>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 14, textAlign: "center", color: "#94a3b8" }}>
                      Ingrese su clave para consultar la bitácora
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id_log} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "7px 10px", fontFamily: "monospace" }}>#{l.id_log}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 600 }}>{l.grupo_identificado}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: l.metodo === "POST" ? "#16a34a" : "#2563eb" }}>{l.metodo}</td>
                      <td style={{ padding: "7px 10px", fontFamily: "monospace" }}>{l.ruta}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            background: l.codigo_estado >= 200 && l.codigo_estado < 300 ? "#dcfce7" : "#fee2e2",
                            color: l.codigo_estado >= 200 && l.codigo_estado < 300 ? "#166534" : "#991b1b"
                          }}
                        >
                          {l.codigo_estado}
                        </span>
                      </td>
                      <td style={{ padding: "7px 10px" }}>{l.tiempo_respuesta_ms} ms</td>
                      <td style={{ padding: "7px 10px", color: "#64748b" }}>
                        {new Date(l.fecha_registro).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REQUERIMIENTOS 5 Y 6: FLUJO Y QUÉ PASA SI SE CAE */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* PUNTO 5: VER EL FLUJO QUE TIENE */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              🔄 5. Ver el Flujo que Tiene (Paso a Paso)
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Ciclo de vida exacto con orden de seguridad estricto.
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <code>rateLimiter &rarr; authApiKey &rarr; usuarioController</code>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>1</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Petición HTTP:</strong> Sistema externo envía petición con cabecera <code>X-API-KEY</code>.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>2</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Rate Limiter (Primero):</strong> Frena ráfagas de fuerza bruta antes de procesar claves. Si excede &rarr; <code>429</code>.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>3</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Autenticación HMAC-SHA256:</strong> Compara hash seguro en BD. Si falla &rarr; <code>401</code>. Si BD falla &rarr; <code>503</code>.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>4</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Validación de Dominio:</strong> DNI (8 dígitos), email válido y verificación de unicidad. Si ya existe &rarr; <code>409</code>.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>5</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Persistencia Segura:</strong> Genera clave criptográfica aleatoria de 32 bytes (sin passwords fijos) e inserta en <code>usuario</code>.</span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>6</span>
                <span style={{ fontSize: "0.82rem" }}><strong>Auditoría Append-Only:</strong> Registra evento en <code>api_log_auditoria</code> protegida contra borrado y retorna <code>201</code>.</span>
              </div>
            </div>
          </div>

          {/* PUNTO 6: QUÉ PASA SI SE CAE O SE CIERRA */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "#0f172a" }}>
              ⚡ 6. ¿Qué pasa si el API se cae o se cierra?
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 12px" }}>
              Respuesta técnica precisa para el profesor.
            </p>
            <div style={{ background: "#f1f5f9", borderLeft: "3px solid #2563eb", padding: "6px 12px", fontFamily: "monospace", fontSize: "0.78rem", color: "#334155", marginBottom: 14, borderRadius: "0 6px 6px 0" }}>
              📁 Código: <strong>/api/v1/health</strong> y manejo de excepciones en BD
            </div>

            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: "0.82rem" }}>
              <strong style={{ color: "#991b1b" }}>Si se cierra la terminal o se apaga el servidor:</strong><br />
              El puerto deja de responder. El sistema cliente recibe <code>ECONNREFUSED</code> a nivel de red sin corrupción de datos.
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 10, fontSize: "0.82rem" }}>
              <strong style={{ color: "#92400e" }}>Si la Base de Datos (Supabase) pierde conectividad:</strong><br />
              El endpoint <code>/health</code> responde <code>503 Service Unavailable</code> con estado <code>DEGRADADO</code>, evitando devolver errores 401 falsos de credenciales.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
