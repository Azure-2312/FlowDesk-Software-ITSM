# Documento de Sistema de Autorización (Fase 0.5)

## 1. Funcionamiento de `exigirMenuPagina` y `exigirCapacidadPagina`
En FlowDesk, las guardas de seguridad a nivel de servidor residen en `src/shared/lib/page-auth.ts`:

- **`exigirMenuPagina(url: string, opciones?: { prefijo?: boolean })`**:
  Obtiene la sesión del usuario mediante la cookie segura criptográfica (`COOKIE_SESION`).
  Recupera el árbol jerárquico de navegación del usuario y su perfil activo (`obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil)`).
  Verifica si la URL (o prefijo si se especifica) está incluida dentro de las opciones asignadas en `opciones_menu_perfiles` para dicho perfil (`menuIncluyeUrl` o `menuIncluyePrefijo`). Si no está autorizado, emite una redirección server-side `redirect("/403")`.
  
- **`exigirCapacidadPagina(capacidades: Capacidad | readonly Capacidad[])`**:
  Obtiene la sesión activa y valida mediante `sesionTieneAlgunaCapacidad(sesion, lista)` si el perfil activo posee al menos una de las capacidades requeridas. Si no, emite `redirect("/403")`.

- **`exigirPerfilPagina(perfiles: number[])`**:
  Guarda de transición que valida directamente contra el arreglo de IDs de perfil permitidos (`id_perfil`).

## 2. Definición y gestión de Capacidades
- Las capacidades están catalogadas formalmente en `src/shared/lib/capacidades.ts` como constantes semánticas con el formato `dominio:accion` (e.g. `tickets:ver`, `cambios:aprobar`, `cmdb:gestionar`).
- En la línea base actual, `CAPACIDADES_POR_PERFIL` mapea en memoria los 10 perfiles del sistema (`PERFILES.ADMINISTRADOR` = 1 ... `PERFILES.GESTOR_PROBLEMAS` = 10) a sus respectivos conjuntos de capacidades.

## 3. Resolución del perfil del usuario
- El usuario se autentica vía `/api/auth/login`. Si posee múltiples perfiles, entra en pre-sesión con token de 5 minutos y selecciona el perfil activo.
- La sesión se empaqueta en un JWT firmado con `JWT_SECRET` en la cookie `sesion`.
- El token contiene `id_usuario`, `nombres`, `correo_electronico`, `perfiles` y `perfilActivo: { id_perfil, nombre }`.
- Cada petición en Next.js RSC o Route Handler decodifica `perfilActivo` para restringir datos y permisos.

## 4. Cálculo del ítem activo en el Menú Lateral
- En `src/shared/components/layout/MenuLateral.tsx`:
  - Utiliza el hook `usePathname()` de `next/navigation`, el cual devuelve **únicamente el pathname** (sin el query string `?vista=`).
  - Evalúa `const urlBase = opcion.url_menu ? opcion.url_menu.split("?")[0] : "";`.
  - La activación se evalúa comparando la ruta sin parámetros contra `pathname`, asegurando que URLs con parámetros como `?vista=` activan y resaltan limpiamente la fila principal de la pantalla.

## 5. Construcción del Grid en «Perfiles y Permisos» (#21210)
- En `src/modules/identidades/config/perfiles/VistaPerfiles.tsx`:
  - No utiliza una lista estática en duro. Consume dinámicamente los endpoints:
    - `/api/identidades/perfiles?todos=true`
    - `/api/menu/admin`
  - `/api/menu/admin` consulta la tabla `opciones_menu` directamente de la base de datos.
  - La visualización jerárquica y el marcado de permisos se actualizan automáticamente ante cambios en `opciones_menu`.

## 6. Selección de Arquetipo en `ModalDetalleTicket`
- En `src/modules/tickets/components/ModalDetalleTicket.tsx`:
  - Invoca `resolverArquetipoVista(idPerfil)` definido en `src/modules/tickets/ticket-detail/tipos.ts`.
  - Mapea el `id_perfil` activo a uno de los arquetipos de interacción (`CONSUMIDOR`, `OPERADOR_TECNICO`, `SUPERVISOR_OPERATIVO`, `GESTOR_AREA`, `AUDITORIA_FORENSE`, `APROBADOR_CAB`, etc.).
  - **No depende del query param `vista`**. Por lo tanto, un usuario con perfil Auditor que acceda a un ticket desde cualquier vista (incluyendo `todos`) siempre recibirá el arquetipo de sólo lectura `AUDITORIA_FORENSE`.
