const fs = require('fs');

let code = fs.readFileSync('src/app/(app)/admin/perfiles/page.tsx', 'utf8');

// Replace the render part
const startIdx = code.indexOf('      <div className="cabecera-pagina"');
const endIdx = code.lastIndexOf('    </div>\n  );');

const newRender = `      {mostrarFormulario ? (
        /* VISTA DEDICADA: ALTA / EDICIÓN DE PERFIL A PANTALLA COMPLETA */
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
              borderBottom: "1px solid #e2e8f0"
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
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
                  padding: 0
                }}
              >
                ← Volver a la lista de perfiles
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {formulario.id_perfil === null
                  ? "Crear Nuevo Perfil de Usuario"
                  : \`Editando Permisos del Perfil: "\${formulario.nombre}"\`}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure las identidades de acceso y los privilegios jerárquicos sobre las opciones de menú (RBAC / SoD).
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="formulario-perfil"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : formulario.id_perfil === null ? "Crear Perfil" : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="formulario-perfil" onSubmit={manejarEnvioFormulario}>
            {error && <div className="mensaje-error">{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="campo">
                <label>Nombre del perfil *</label>
                <input
                  className="input-base"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Ej. Auditor, Soporte Nivel 2"
                  required
                  autoFocus
                />
              </div>

              <div className="campo">
                <label>Descripción del Perfil</label>
                <input
                  className="input-base"
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  placeholder="Detalle de las responsabilidades funcionales y alcance de este rol"
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8
                }}
              >
                <div>
                  <label style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                    Matriz de Permisos y Opciones de Menú
                  </label>
                  <span style={{ fontSize: 12.5, color: "#64748b", marginLeft: 8 }}>
                    ({formulario.opciones_ids.length} de {opcionesMenu.length} seleccionadas)
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={marcarTodasOpciones}
                    style={{
                      fontSize: 12,
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    Marcar todas
                  </button>
                  <span style={{ color: "#cbd5e1" }}>|</span>
                  <button
                    type="button"
                    onClick={desmarcarTodasOpciones}
                    style={{
                      fontSize: 12,
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: 600,
                    }}
                  >
                    Desmarcar todas
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: "65vh",
                  overflowY: "auto",
                  padding: "16px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                {construirArbolPermisos(opcionesMenu).map((raiz) => renderizarNodo(raiz))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : formulario.id_perfil === null ? "Crear Perfil" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VISTA DE TABLA PRINCIPAL DE PERFILES */
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <h1>Perfiles y Permisos (RBAC)</h1>
              <p>
                Catálogo de roles del sistema, asignación de permisos de acceso a las opciones del menú y gobierno de privilegios.
              </p>
            </div>
            <button className="boton-primario" style={{ width: "auto", padding: "8px 16px", fontSize: 13 }} onClick={abrirFormularioNuevo}>
              + Nuevo perfil
            </button>
          </div>

          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              Cargando perfiles del sistema...
            </div>
          ) : perfiles.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              No hay perfiles registrados en el sistema.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Permisos</th>
                    <th>Usuarios asignados</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {perfiles.map((perfil) => {
                    const esAdmin = perfil.id_perfil === 1;
                    return (
                      <tr key={perfil.id_perfil}>
                        <td style={{ color: "#9ca3af" }}>{perfil.id_perfil}</td>
                        <td style={{ fontWeight: 600 }}>{perfil.nombre}</td>
                        <td style={{ color: "#4b5563", fontSize: 13, maxWidth: 320 }}>
                          {perfil.descripcion || "—"}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                            {perfil.opciones_ids?.length ?? 0} opciones
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "#4b5563" }}>
                            {perfil.total_usuarios ?? 0} usuario{(perfil.total_usuarios ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td>
                          <span className={"badge " + (perfil.estado_registro ? "badge-activo" : "badge-inactivo")}>
                            {perfil.estado_registro ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button
                              type="button"
                              className="boton-accion-icono"
                              title="Editar permisos"
                              onClick={() => abrirFormularioEditar(perfil)}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            {!esAdmin && (
                              <button
                                type="button"
                                className="boton-accion-icono boton-accion-peligro"
                                title={perfil.estado_registro ? "Desactivar perfil" : "Activar perfil"}
                                onClick={() => alternarEstado(perfil)}
                              >
                                {perfil.estado_registro ? (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                ) : (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}`;

const updatedCode = code.slice(0, startIdx) + newRender + '\n    </div>\n  );\n}\n';
fs.writeFileSync('src/app/(app)/admin/perfiles/page.tsx', updatedCode, 'utf8');
console.log('src/app/(app)/admin/perfiles/page.tsx updated');
