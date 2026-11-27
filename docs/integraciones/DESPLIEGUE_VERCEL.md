# Publicar FlowDesk en Vercel

FlowDesk (Next.js) se publica en **Vercel**, y la base de datos sigue en **Supabase**. Vercel no se "duerme": la primera petición responde en alrededor de un segundo.

## 1. Preparar la base de datos (Supabase → SQL Editor)

Ejecute, en este orden, los scripts que aún no estén aplicados en producción. Todos son idempotentes:

1. `db/05_vista_umbral_problemas.sql`
2. `db/06_facturacion_electronica_proveedores.sql`
3. `db/07_api_integraciones_seguras.sql`
4. `db/08_comprobantes_archivos.sql`

## 2. Crear el proyecto en Vercel

1. Entre a <https://vercel.com> y regístrese con su cuenta de **GitHub**.
2. Elija **Add New → Project** e importe el repositorio de FlowDesk. Vercel detecta Next.js solo; no cambie los comandos.
3. Antes de **Deploy**, cargue las variables de entorno (sección 3).
4. Desde entonces, cada `git push` a `main` se publica automáticamente.

## 3. Variables de entorno (Settings → Environment Variables)

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Cadena del **Transaction pooler** de Supabase (puerto **6543**), en *Connect → Transaction pooler*. No use la conexión directa (5432), porque en Vercel se agotan las conexiones. |
| `JWT_SECRET` | Texto aleatorio largo (puede ser el mismo de `.env.local`) |
| `API_KEY_SALT` | **Nuevo**, de al menos 32 caracteres. Se genera con `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. No reutilice el valor antiguo, que estaba en el repositorio. |
| `EQUIPO10_API_KEY` | La clave que el Equipo 10 les entregó por privado |
| `NUBEFACT_TOKEN` | Token de la cuenta de Nubefact (*API Integración*). La ruta se registra en *Activos → Configuración → Facturación electrónica (SUNAT)* |

**Nunca** suba al repositorio `.env.local` ni `APIS COMPARTIDAS/FlowDesk-API-Clientes/.env`.

## 4. Después del primer despliegue

1. Abra `https://<su-proyecto>.vercel.app/api/v1/health`. Debe responder `"estado": "operativo"`.
2. Inicie sesión como **Administrador** y vaya a **Plataforma → Integraciones API**.
3. En **Credenciales de acceso**, pulse **Emitir credencial** para el Equipo 10. Copie el `client_id` y el `client_secret`, y envíelos por privado (no por un grupo público).
4. Entregue al Equipo 10 la URL del proyecto y la guía `docs/integraciones/GUIA_API_SOLICITANTES.md`.
5. En **Clientes de empresa externa**, pulse **Listar clientes** y descargue el Excel, PDF, CSV o JSON.
6. Revise la **Bitácora de la API**: ahí aparecen las consultas del otro equipo y sus propias extracciones.

## 5. Notas del plan gratuito

- **Tiempo máximo por petición:** la ruta de extracción declara `maxDuration = 120` s, porque la API del Equipo 10 está en Render y puede tardar alrededor de un minuto en despertar.
  - Los proyectos nuevos de Vercel usan *Fluid compute*, que en el plan Hobby permite hasta 300 s.
  - Si su proyecto tiene *Fluid compute* desactivado, actívelo en *Settings → Functions*.
- **Pausa de Supabase:** el plan gratuito pausa el proyecto tras una semana sin uso. Abra el sistema de vez en cuando, o reactívelo desde el panel de Supabase.
