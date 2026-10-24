# Plan de Asignación y Especificación Técnica — Lourdes (Catálogo de Servicios y Gestión de Activos TI)

> **Documento de especificación técnica y de desarrollo para el asistente IA.**
> **Responsable:** Lourdes
> **Módulos Asignados (100% Independientes y Aislados):**
> 1. [src/modules/servicios](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/servicios) (Catálogo de Servicios de Negocio y Técnicos, Acuerdos de Nivel de Servicio SLA / OLA / UC ITIL 4, Diseñador de Formularios de Servicio)
> 2. [src/modules/activos](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/activos) (Gestión de Activos TI HAM/SAM ISO/IEC 19770-1, Inventario Físico/Lógico, Licenciamiento de Software, Contratos de Mantenimiento y Bajas Seguras)
> 
> **Frontera de Trabajo Estricta:**
> - Lourdes **NO** modifica consolas de perfiles (`src/modules/perfiles/*`), ni interviene en pantallas de otros compañeros.
> - Lourdes no interviene en CMDB (`src/modules/cmdb`) ni en Cambios (`src/modules/cambios`), módulos asignados a Nain.
> - Todo su desarrollo frontend, backend, controladores, componentes y vistas se encuentra estrictamente confinado dentro de `src/modules/servicios` y `src/modules/activos`.
> - Las vistas que Lourdes desarrolle serán consumidas o enlazadas en los perfiles correspondientes por el Tech Lead (Miguel).

---

## 1. Visión Arquitectónica y Principios de Diseño

### 1.1 Principio de Correspondencia Menú-Directorio (Modularidad Estricta)
Cada opción visible en el menú lateral relacionada con catálogo de servicios y activos nace directamente de una carpeta o archivo modular especializado:
- En `src/modules/servicios`:
  1. **Catálogo de Servicios al Cliente / Negocio:** Orientado a los usuarios finales y solicitantes. Describe el servicio en términos de valor, entregables y requisitos de aprobación.
  2. **Catálogo de Servicios Técnicos:** Orientado a grupos resolutores y especialistas de TI. Vincula CIs, grupos de soporte y acuerdos OLA.
  3. **Configuración Modular:** En `config/catalogo/`, `config/categorias/`, `config/sla/` y `config/formularios/`.
- En `src/modules/activos`:
  1. **Inventario de Activos (HAM):** Equipos físicos, número de serie, marca, modelo, custodio y estado de stock.
  2. **Gestión de Licencias de Software (SAM):** Control de paquetes adquiridos vs asignados con semáforo preventivo.
  3. **Configuración Modular:** En `config/tipos-modelos-atributos/`, `config/ciclos-vida-transiciones/` y `config/licencias-contratos/`.

### 1.2 Mecanismo de Sincronización Multi-Perfil en Tiempo Real
La sinergia entre Catálogo de Servicios y Gestión de Activos es el núcleo de aprovisionamiento tecnológico de la empresa:
1. **Solicitud de Equipos y Licencias desde el Catálogo:**
   - Cuando un usuario solicita una nueva estación de trabajo o software desde el catálogo:
     - El módulo de activos valida la disponibilidad en stock o licencias SAM disponibles.
     - Si el activo se asigna, su custodia cambia en tiempo real a nombre del colaborador.
2. **Control Semafórico SAM ante Asignaciones:**
   - La asignación de software descuenta automáticamente cupos del fondo común contratado.
   - Si se alcanza el 95% del total comprado, el panel de activos despliega el semáforo ámbar/rojo previniendo sobreuso.

---

## 2. Inventario Exhaustivo Actual y Estado de Situación

### 2.1 Módulo: Catálogo de Servicios — `src/modules/servicios`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ITIL 4 |
| :--- | :--- | :--- | :--- |
| `src/modules/servicios/admin/servicios/page.tsx` | Vista Master | Bien avanzado | Listado maestro de servicios configurados en la plataforma. Permite filtrar por estado (Borrador, Activo, Retirado) y categoría. |
| `src/modules/servicios/admin/servicios/ConfiguracionObjetivosSla.tsx` | Componente | Bien avanzado | Formulario para asociar tiempos límite de primera respuesta y tiempo total de resolución según prioridad. |
| `src/modules/servicios/admin/servicios/GestionCategorias.tsx` | Componente | Bien avanzado | Administrador visual de la jerarquía de categorías y subcategorías. |
| `src/modules/servicios/admin/servicios/sla/page.tsx` | Vista | Bien avanzado | Pantalla de mantenimiento de acuerdos SLA globales y políticas de cobertura horaria (24x7 vs 8x5 hábiles). |
| `src/modules/servicios/admin/servicios/sla/components/MatrizPrioridadSla.tsx` | Componente | 100% avanzado | Matriz estándar ITIL 4 que cruza Impacto con Urgencia para calcular automáticamente Prioridad y SLAs. |
| `src/modules/servicios/admin/servicios/[id]/formulario/page.tsx` | Vista Dinámica | Bien avanzado | Diseñador de campos dinámicos específicos por servicio. |
| `src/modules/servicios/catalogo/VistaCatalogoServicios.tsx` | Vista Pública | Bien avanzado | Vitrina de servicios orientada al solicitante con buscador predictivo. |
| `src/modules/servicios/catalogo-tecnico/VistaTecnicoCatalogo.tsx` | Vista Técnica | Bien avanzado | Catálogo técnico que visibiliza CIs subyacentes, acuerdos OLA y grupos resolutores N1/N2/N3. |

### 2.2 Módulo: Gestión de Activos TI (HAM/SAM) — `src/modules/activos`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ISO 19770-1 |
| :--- | :--- | :--- | :--- |
| `src/modules/activos/views/VistaActivos.tsx` | Vista Master | 100% avanzado | Grilla patrimonial de activos con filtros facetados por tipo, estado, custodio y ubicación. |
| `src/modules/activos/views/VistaActivosStock.tsx` | Vista Almacén | 100% avanzado | Control de existencias disponibles en bodega listas para asignación. |
| `src/modules/activos/views/VistaActivosAsignados.tsx` | Vista Custodia | 100% avanzado | Bienes informáticos actualmente en posesión de colaboradores. |
| `src/modules/activos/views/VistaActivosMantenimiento.tsx` | Vista Taller | 100% avanzado | Equipos en reparación técnica o revisión preventiva. |
| `src/modules/activos/views/VistaActivosBajas.tsx` | Vista Disposición | 100% avanzado | Equipos desincorporados con certificado de borrado seguro y dictamen de baja. |
| `src/modules/activos/views/VistaActivosLicencias.tsx` | Vista SAM | 100% avanzado | Panel semafórico de licencias de software (compradas vs instaladas). |
| `src/modules/activos/views/VistaActivosContratos.tsx` | Vista Contratos | 100% avanzado | Gestión de garantías, pólizas y contratos de mantenimiento de hardware. |
| `src/modules/activos/config/tipos-modelos-atributos/` | Submódulo Config | 100% avanzado | Taxonomía de fabricantes, familias de equipos y atributos dinámicos. |
| `src/modules/activos/config/ciclos-vida-transiciones/` | Submódulo Config | 100% avanzado | Definición de etapas válidas del activo (Stock -> Asignado -> Taller -> Baja). |
| `src/modules/activos/config/licencias-contratos/` | Submódulo Config | 100% avanzado | Modelos de licenciamiento (per-user, per-device, OEM, suscripción). |

---

## 3. Instrucciones Específicas de Ejecución
1. Concentrarse exclusivamente en `src/modules/servicios` y `src/modules/activos`. No editar archivos fuera de estos dominios.
2. Garantizar que los formularios dinámicos de servicios validen esquemas Zod en cliente y servidor.
3. Verificar que el inventario de activos mantenga sincronización estricta de stock y licenciamiento SAM.
4. Compilación limpia ejecutando `npm run build` con cero errores TypeScript y sin emojis.
