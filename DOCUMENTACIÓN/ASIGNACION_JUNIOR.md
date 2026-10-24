# Plan de Asignación y Especificación Técnica — Junior (Seguridad, Identidades, Organización y Proveedores)

> **Documento de especificación técnica y de desarrollo para el asistente IA.**
> **Responsable:** Junior
> **Módulos Asignados (100% Independientes y Aislados):**
> 1. [src/modules/seguridad](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/seguridad) (Políticas de Seguridad y Auditoría de Acceso ISO 27001, Login, Sesiones, JWT, Captcha y Recuperación de Contraseñas)
> 2. [src/modules/identidades](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/identidades) (Gestión de Identidades y Accesos IAM ISO/IEC 27001, Usuarios, Perfiles de Rol RBAC, Matriz de Permisos Granulares y Desbloqueo Seguro)
> 3. [src/modules/organizacion](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/organizacion) (Estructura Organizacional, Departamentos Empresa, Departamentos TI / Grupos Resolutores, Técnicos, Niveles N1/N2/N3, Turnos y Ausencias)
> 4. [src/modules/proveedores](file:///c:/Users/apaza/Desktop/SISTEMA%20DE%20TICKETS/src/modules/proveedores) (Gestión de Proveedores ITIL 4 Supplier Management, Catálogo de Terceros, Contratos de Soporte UC y Homologación)
> 
> **Frontera de Trabajo Estricta:**
> - Junior **NO** interviene en la consola de auditoría (`src/modules/perfiles/auditor`) ni en ningún otro perfil. La consola de Auditoría observa datos cruzados de tickets, cambios y CMDB, por lo que su desarrollo recae en el Tech Lead (Miguel).
> - Junior no modifica pantallas ni archivos de sus compañeros. Su código, backend, controladores y componentes se restringen estrictamente a `seguridad`, `identidades`, `organizacion` y `proveedores`.

---

## 1. Visión Arquitectónica y Principios de Diseño

### 1.1 Principio de Correspondencia Menú-Directorio (Modularidad Estricta)
Cada opción de menú nace directamente de una subcarpeta o archivo dedicado:
- En `src/modules/seguridad`:
  - Vistas y componentes de login, recuperación de clave, captcha, cambio voluntario y políticas de contraseñas seguras.
- En `src/modules/identidades`:
  - Subcarpetas modulares en `config/`: `config/usuarios/`, `config/perfiles/`, `config/permisos/` y `config/politicas-acceso/`.
- En `src/modules/organizacion`:
  - `config/departamentos/` (grupos de soporte TI), `config/departamentos-empresa/` (áreas de negocio), `config/tecnicos/` y `config/turnos-ausencias/`.
- En `src/modules/proveedores`:
  - `config/proveedores/`, `config/contratos-soporte/` y `config/evaluacion-desempeno/`.

### 1.2 Mecanismo de Sincronización Multi-Perfil en Tiempo Real
Los cuatro módulos a cargo de Junior representan el Directorio Maestro y la Seguridad Perimetral de la organización:
1. **Gobierno de Accesos y Permisos RBAC en Tiempo Real:**
   - Modificaciones de roles o permisos en `identidades` invalidan inmediatamente tokens JWT o recargan permisos en memoria.
   - La barra lateral (Sidebar) redibuja sus opciones de navegación en tiempo real.
2. **Impacto de Turnos y Ausencias Técnicas en la Operación:**
   - Al registrar la ausencia de un técnico en `organizacion`, el balanceador de carga excluye automáticamente al especialista no disponible.
3. **Contratos de Proveedores y SLAs Externos (UC):**
   - Los contratos UC de proveedores homologados sincronizan sus tiempos comprometidos con las alertas de la mesa de soporte.

---

## 2. Inventario Exhaustivo Actual y Estado de Situación

### 2.1 Módulo: Seguridad & Autenticación — `src/modules/seguridad`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ISO 27001 |
| :--- | :--- | :--- | :--- |
| `src/modules/seguridad/api/loginController.ts` | API Controller | 100% avanzado | Autenticación segura de credenciales institucionales con hash bcrypt y generación de JWT. |
| `src/modules/seguridad/api/recuperarController.ts` | API Controller | 100% avanzado | Generación y validación de códigos temporales de restablecimiento de contraseña. |
| `src/modules/seguridad/api/captchaController.ts` | API Controller | 100% avanzado | Desafío captcha matemático/gráfico para protección contra ataques de fuerza bruta. |
| `src/modules/seguridad/views/VistaLogin.tsx` | Vista Pública | 100% avanzado | Portal institucional de inicio de sesión con validación de credenciales. |
| `src/modules/seguridad/views/VistaRecuperarClave.tsx` | Vista Pública | 100% avanzado | Flujo guiado de verificación por token temporal y definición de nueva clave. |

### 2.2 Módulo: Identidades & Accesos (IAM) — `src/modules/identidades`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ISO 27001 |
| :--- | :--- | :--- | :--- |
| `src/modules/identidades/config/usuarios/VistaUsuarios.tsx` | Vista Master | 100% avanzado | Catálogo maestro de usuarios corporativos con búsqueda facetada y filtros por estado. |
| `src/modules/identidades/config/perfiles/VistaPerfiles.tsx` | Vista Master | 100% avanzado | Gestión de los 10 perfiles oficiales del sistema y descripción de atribuciones SoD. |

### 2.3 Módulo: Organización — `src/modules/organizacion`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ITIL 4 |
| :--- | :--- | :--- | :--- |
| `src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx` | Vista Master | 100% avanzado | Mantenimiento de grupos resolutores de TI con asignación de líder técnico. |
| `src/modules/organizacion/config/tecnicos/VistaTecnicos.tsx` | Vista Master | 100% avanzado | Registro y clasificación de técnicos en niveles de escalamiento N1, N2 y N3. |
| `src/modules/organizacion/config/turnos-ausencias/VistaTurnosAusencias.tsx` | Vista Calendario | 100% avanzado | Planificación de jornadas de trabajo y registro de periodos de ausencia o licencias. |

### 2.4 Módulo: Proveedores — `src/modules/proveedores`

| Ruta del Archivo / Carpeta | Tipo de Elemento | Estado Actual | Evaluación Técnica frente a ITIL 4 |
| :--- | :--- | :--- | :--- |
| `src/modules/proveedores/views/VistaProveedores.tsx` | Vista Master | 100% avanzado | Directorio de contratistas tecnológicos, contratos de soporte UC y evaluación de servicio. |

---

## 3. Instrucciones Específicas de Ejecución
1. Concentrarse exclusivamente en `src/modules/seguridad`, `src/modules/identidades`, `src/modules/organizacion` y `src/modules/proveedores`.
2. Asegurar que las políticas de contraseñas seguras y expiración de tokens se apliquen con rigurosidad.
3. Verificar que los turnos y ausencias excluyan técnicos del reparto automático de tickets.
4. Compilar con `npm run build` manteniendo cero errores TypeScript y cero emojis.
