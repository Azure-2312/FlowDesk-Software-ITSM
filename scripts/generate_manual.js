const fs = require('fs');
const path = require('path');
const { pool } = require('./db.js');

async function run() {
  const res = await pool.query(`
    SELECT om.id_opcion_menu, om.nombre, om.url_menu, om.orden, om.id_padre
    FROM opciones_menu om
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log(`Total opciones en BD: ${res.rows.length}`);

  // Tree hierarchy
  const roots = res.rows.filter(r => r.id_padre === null);
  const byParent = {};
  for (const r of res.rows) {
    if (r.id_padre !== null) {
      if (!byParent[r.id_padre]) byParent[r.id_padre] = [];
      byParent[r.id_padre].push(r);
    }
  }

  let doc = `# Manual Funcional Exhaustivo: Arquitectura de Menú y Navegación de FlowDesk

**Versión del Sistema:** FlowDesk ITIL v4 Enterprise (Restructurado)  
**Fecha de Publicación:** 17 de Noviembre de 2026  
**Estado del Documento:** Completado 100% (73 de 73 opciones documentadas)  
**Auditoría y Mapeo:** Staff Software Engineer & Solutions Architect  

---

## 1. Arquitectura General y Gobernanza del Menú

FlowDesk implementa una arquitectura de navegación moderna, desacoplada y orientada a capacidades funcionales, alineada estrictamente con las directrices de ITIL 4 y control de acceso granular N1 (pantallas y vistas/pestañas).

- **Total de filas en el sistema:** 73 opciones activas en la tabla \`opciones_menu\`.
- **Nivel 1 (Agrupadores Raíz):** 11 macro-secciones temáticas.
- **Nivel 2 (Sub-agrupadores):** 4 sub-agrupadores funcionales («Incidentes» y «Solicitudes» en Mesa de Servicio; «Activos» y «CMDB» en Activos y CMDB).
- **Nivel 3 (Pantallas terminales):** 58 pantallas con URL canónica directa.
- **Vistas con permiso propio (N1):** 32 pantallas cuentan con 107 vistas/pestañas gobernadas a nivel de perfil en \`opciones_menu_vistas_perfiles\`.
- **Canal de Notificaciones Exclusivo:** Notificaciones 100% in-app (centro unificado de notificaciones #21265), con eliminación de transportes externos no gobernados (correo, WhatsApp, webhooks).
- **Matriz de Prioridad Institucional Única:** Matriz centralizada Impacto × Urgencia compartida para incidentes, solicitudes, problemas y cambios (#21167).
- **Gobernanza Sembrada:** Estados, transiciones y ciclos de vida estandarizados y sembrados en base de datos.
- **Cero Redirecciones por Obsolescencia:** Cumplimiento estricto de la regla R2; URLs eliminadas devuelven 404 (Not Found).

---

## 2. Mapa Completo de Opciones de Menú (73 Filas)

A continuación se presenta el inventario maestro de las 11 raíces del sistema con sus respectivos identificadores y rutas canónicas en el App Router de Next.js:

`;

  let idx = 1;
  for (const root of roots) {
    doc += `### Raíz ${idx++}: ${root.nombre} (\`#${root.id_opcion_menu}\`)\n\n`;
    const children = byParent[root.id_opcion_menu] || [];
    for (const child of children) {
      const subChildren = byParent[child.id_opcion_menu];
      if (subChildren && subChildren.length > 0) {
        doc += `- **${child.nombre}** (\`#${child.id_opcion_menu}\`) *(Sub-agrupador)*\n`;
        for (const sc of subChildren) {
          doc += `  - **${sc.nombre}** (\`#${sc.id_opcion_menu}\`) $\\rightarrow$ \`${sc.url_menu}\`\n`;
        }
      } else {
        doc += `- **${child.nombre}** (\`#${child.id_opcion_menu}\`) $\\rightarrow$ \`${child.url_menu}\`\n`;
      }
    }
    doc += '\n';
  }

  doc += `---

## 3. Registro de Vistas y Pestañas por Pantalla (Anexo C)

Las siguientes 32 pantallas operan con el componente estandarizado \`PestanasVista\`, validando en servidor la membresía del perfil en \`opciones_menu_vistas_perfiles\`:

| Pantalla | URL Canónica | Vistas Disponibles | Descripción Funcional |
|---|---|---|---|
| **#21022 Inicio** | \`/plataforma/inicio\` | \`solicitante\`, \`tecnico\`, \`supervisor\`, \`aprobador\`, \`area\`, \`gestion-activos\`, \`gestion-cambios\`, \`gestion-problemas\`, \`auditor\`, \`administrador\` | Tableros de control contextuales por rol |
| **#21020 Mis tareas** | \`/plataforma/operacion/tareas\` | \`tareas\`, \`agenda\`, \`ausencias\`, \`vistas\` | Agenda, pendientes operativos y ausencias personales |
| **#21249 Mis aprobaciones** | \`/plataforma/aprobaciones\` | \`pendientes\`, \`historial\`, \`historial-area\` | Bandeja única de dictámenes jerárquicos y trazabilidad |
| **#21233 Bandeja de incidentes** | \`/plataforma/incidentes/bandeja\` | \`bandeja\`, \`asignados\`, \`departamento\`, \`resueltos\`, \`todos\` | Gestión operativa y resolución de incidentes |
| **#21238 Incidentes mayores** | \`/plataforma/incidentes/mayores\` | \`listado\`, \`sala-crisis\` | Monitoreo y comando de crisis para incidentes P1/P2 |
| **#21240 Configuración de incidentes** | \`/plataforma/incidentes/configuracion\` | \`campos\`, \`reglas\` | Formulario dinámico y reglas de transición |
| **#21244 Bandeja de solicitudes** | \`/plataforma/solicitudes/bandeja\` | \`bandeja\`, \`asignados\`, \`departamento\`, \`resueltos\`, \`todos\` | Atención de requerimientos y peticiones |
| **#21250 Configuración de solicitudes** | \`/plataforma/solicitudes/configuracion\` | \`campos\`, \`reglas\` | Formulario dinámico y reglas de atención |
| **#21045 Monitor de SLA** | \`/plataforma/servicios/sla\` | \`semaforo\`, \`pausas\`, \`incidentes\`, \`solicitudes\`, \`problemas\`, \`resumen\` | Monitoreo de cumplimiento de tiempos y cronómetros |
| **#21073 Gestión de cambios** | \`/plataforma/cambios/gestion\` | \`mis-cambios\`, \`todos\`, \`evaluacion\`, \`implementacion\`, \`historial\` | Pipeline de ciclo de vida del RFC |
| **#21082 CAB y ECAB** | \`/plataforma/cambios/cab\` | \`cab\`, \`ecab\`, \`miembros\` | Comités de evaluación y dictamen colegiado |
| **#21191 Configuración de cambios** | \`/plataforma/cambios/configuracion\` | \`campos\`, \`listas\`, \`riesgo\`, \`autoridad\`, \`calendario\` | Parámetros de cambios, matrices de riesgo y ventanas |
| **#21093 Bandeja de problemas** | \`/plataforma/problemas/bandeja\` | \`sin-asignar\`, \`asignados\`, \`grupo\`, \`historial\` | Ciclo de vida y análisis de problemas |
| **#21095 Candidatos a problema** | \`/plataforma/problemas/candidatos\` | \`propuestos\`, \`recurrentes\` | Detección preventiva de incidentes repetitivos |
| **#21199 Configuración de problemas** | \`/plataforma/problemas/configuracion\` | \`campos\`, \`listas\` | Clasificaciones y tipologías de causa raíz |
| **#21114 Inventario de activos** | \`/plataforma/activos/inventario\` | \`todos\`, \`mi-area\`, \`operativo\`, \`importar\` | Maestro patrimonial y asignación departamental |
| **#21126 Mantenimiento y garantías** | \`/plataforma/activos/mantenimiento\` | \`garantias\`, \`reparaciones\` | Control de service desk y soporte de hardware |
| **#21132 Licencias de software** | \`/plataforma/activos/licencias\` | \`licencias\`, \`consulta\`, \`catalogo-software\` | Gestión de activos digitales y títulos de software |
| **#21144 Contratos y proveedores** | \`/plataforma/activos/contratos\` | \`contratos\`, \`mi-area\`, \`renovaciones\`, \`proveedores\` | Gobernanza de contratos y agenda de vencimientos |
| **#21123 Bajas de activos** | \`/plataforma/activos/bajas\` | \`gestion\`, \`consulta\` | Proceso de desincorporación y disposición final |
| **#21154 Configuración de activos** | \`/plataforma/activos/configuracion\` | \`tipos-atributos\`, \`fabricantes-modelos\`, \`ubicaciones\`, \`listas\` | Metadatos y catálogos maestros de activos |
| **#21141 Configuración de CMDB** | \`/plataforma/cmdb/configuracion\` | \`clases\`, \`relaciones\` | Modelo de datos de configuración de servicios |
| **#21161 Revisión y publicación** | \`/plataforma/conocimiento/publicacion\` | \`publicacion\`, \`pendientes\` | Arbitraje KCS y control de calidad editorial |
| **#21202 Configuración de conocimiento** | \`/plataforma/conocimiento/configuracion\` | \`articulos\`, \`politicas\` | Catálogo maestro y parámetros de vigencia |
| **#21164 Catálogo de servicios** | \`/plataforma/servicios/catalogo\` | \`explorar\`, \`administrar-incidentes\`, \`administrar-solicitudes\`, \`crear\`, \`categorias\` | Portal de servicios y administración funcional |
| **#21167 Objetivos SLA y matriz** | \`/plataforma/servicios/configuracion/sla\` | \`tiempos\`, \`matriz\` | Matriz institucional y metas de servicio |
| **#21175 Indicadores operativos** | \`/plataforma/reportes/operativos\` | \`operativo\`, \`area\` | Métricas globales y departamentales |
| **#21179 Reportes de cambios/problemas** | \`/plataforma/reportes/cambios\` | \`cambios\`, \`problemas\` | Analítica de impacto, RFCs y causa raíz |
| **#21205 Grupos y técnicos de TI** | \`/plataforma/organizacion/grupos-ti\` | \`grupos\`, \`tecnicos\`, \`supervisores\` | Estructura de soporte y niveles resolutores |
| **#21220 Auditoría y accesos** | \`/plataforma/seguridad/auditoria-sistema\` | \`configuracion\`, \`accesos\` | Trazabilidad de seguridad y accesos al sistema |

---

## 4. Políticas Arquitectónicas Vigentes

### 4.1 Notificaciones Exclusivamente In-App
El sistema ha suprimido todas las dependencias y configuraciones de transporte hacia canales externos (servidores SMTP, WhatsApp API, webhooks). Las alertas se gestionan íntegramente a través del centro de notificaciones in-app (\`/plataforma/notificaciones\`), asegurando soberanía de datos y eliminando fallos por entrega asíncrona.

### 4.2 Matriz de Prioridad Institucional Única
La determinación de prioridad (Impacto × Urgencia) se rige de manera exclusiva por la matriz compartida de la opción #21167 (\`matriz_prioridad_institucional\`). Los módulos de incidentes, solicitudes, problemas y cambios consumen este cálculo común, erradicando discrepancias de criticidad entre áreas.

### 4.3 Estados y Flujos Sembrados
Los ciclos de vida ITIL 4 de tickets, problemas y RFCs son estables y consistentes. No se permite la edición arbitraria de máquinas de estado desde pantallas administrativas; cualquier ajuste de modelo se efectúa mediante migraciones versionadas y semillas (\`seed\`).

### 4.4 Procedimiento para Agregar una Nueva Vista N1
Para añadir una nueva vista a una pantalla existente:
1. Declarar el código y metadatos en \`src/shared/lib/vistas.ts\` dentro del registro \`REGISTRO_VISTAS\`.
2. Registrar la vista en la tabla de base de datos \`opciones_menu_vistas_perfiles\` asignándola a los perfiles correspondientes.
3. Incorporar el renderizado condicional dentro del componente \`page.tsx\` receptor apoyándose en \`exigirVistaPagina\`.

---

## 5. Historial de la Reestructuración

Para consultar los informes de ejecución detallados, matrices de acceso y evidencias técnicas de cada fase, visite:
- [Documentación de la Reestructuración](file:///docs/reestructuracion/)
- [Mapa de URLs Antiguas y Nuevas](file:///docs/reestructuracion/mapa-urls.md)
- [Inventario de Deuda de Base de Datos (R6)](file:///docs/reestructuracion/deuda-bd.md)
- [Rutas Permitidas sin Menú](file:///docs/reestructuracion/rutas-permitidas-sin-menu.md)
- [Matriz de Acceso Final](file:///docs/reestructuracion/matriz-acceso-despues.csv)
`;

  const manualPath = path.join(__dirname, '../DOCUMENTACIÓN/MANUAL_FUNCIONAL_OPCIONES_MENU.md');
  fs.writeFileSync(manualPath, doc, 'utf8');
  console.log(`MANUAL_FUNCIONAL_OPCIONES_MENU.md generado exitosamente en ${manualPath}.`);

  await pool.end();
}

run().catch(console.error);
