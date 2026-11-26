# 🛡️ Guía de Restauración y Disaster Recovery — FlowDesk BD

Esta carpeta contiene la arquitectura consolidada de la base de datos de **FlowDesk ITSM v2.0**.
Si Supabase presenta caídas, se cambia de instancia en la nube o se desea desplegar el sistema en un PostgreSQL local o en Docker, solo se deben ejecutar estos 3 archivos en orden secuencial.

---

## 📁 Estructura de Archivos

| Archivo | Descripción | Contenido Clave |
| :--- | :--- | :--- |
| **`01_schema_completo.sql`** | Esquema DDL maestro consolidado | 129 tablas, llaves primarias, llaves foráneas, checks, vistas e índices |
| **`02_stored_procedures.sql`** | Lógica de negocio y seguridad en motor BD | 5 Stored Procedures ITIL + funciones PL/pgSQL + triggers de auditoría inmutable |
| **`03_seed_data.sql`** | Catálogos iniciales y datos base | 10 perfiles, 150+ opciones de menú jerárquico, usuario admin, servicios y credenciales API |
| **`04_menu_y_configuracion.sql`** | Menú vigente, permisos/vistas por perfil y `configuracion_sistema` | Se genera desde la BD real con `DATABASE_URL="..." node scripts/exportar_menu_actual.js`. **Sin este archivo el menú de `03` es el anterior a la reestructuración y el admin cae en 403.** |
| **`05_vista_umbral_problemas.sql`** | Pestaña "Umbral de recurrencia" en Problemas → Configuración | Idempotente |
| **`06_facturacion_electronica_proveedores.sql`** | Integración SUNAT vía Nubefact (proveedor autorizado) para comprobantes de proveedores de activos | RUC y razón social en `proveedor_ti`, tablas `comprobante_proveedor` (+ detalle y bitácora), clave `integracion_nubefact`, menú *Activos → Comprobantes electrónicos* (#21276) y vistas por perfil (9 registro/consulta, 5 conformidad, 6 consulta). Idempotente. Requiere `NUBEFACT_TOKEN` en el entorno; la ruta de la cuenta se registra en la pantalla de configuración. |
| **`07_api_integraciones_seguras.sql`** | API de Solicitantes para otros equipos y consumo de la API de clientes del Equipo 10 | Credenciales con `client_id`, vigencia, IPs permitidas y rotación; tabla `api_token_acceso` (tokens temporales hasheados); columnas `direccion`/`id_usuario`/`detalle` en la bitácora inmutable `api_log_auditoria`; clave `integracion_equipo10_clientes`; menú *Plataforma → Integraciones API* (#21277, solo Administrador). Revoca las claves del esquema anterior. Idempotente. Requiere `API_KEY_SALT` (≥ 32 caracteres) y `EQUIPO10_API_KEY`. |
| **`archive/migrations_historicas.zip`** | Respaldo histórico | Las 67 migraciones incrementales previas comprimidas para trazabilidad |

---

## 🚀 Cómo Restaurar la Base de Datos desde Cero

### Opción A: En una nueva instancia de Supabase (Web UI)
1. Inicia sesión en [Supabase Console](https://supabase.com/dashboard) y crea o abre el proyecto.
2. Ve a la pestaña **SQL Editor** en el menú lateral.
3. Ejecuta los archivos en el siguiente orden estricto:
   1. Pega y corre el contenido de **`db/01_schema_completo.sql`** *(Crea las 129 tablas y relaciones)*.
   2. Pega y corre el contenido de **`db/02_stored_procedures.sql`** *(Crea los procedimientos almacenados y triggers)*.
   3. Pega y corre el contenido de **`db/03_seed_data.sql`** *(Inserta los catálogos, roles, menús y usuarios)*.
   4. Corre en orden los complementos **`04`**, **`05`**, **`06`** y **`07`** (todos son idempotentes).
4. En el archivo `.env.local` de FlowDesk, actualiza la variable `DATABASE_URL` con la nueva cadena de conexión.
5. ¡Listo! La aplicación y la suite de pruebas estarán 100% operativas.

---

### Opción B: En PostgreSQL Local o Servidor On-Premise (CLI / psql)
1. Crear la base de datos:
   ```bash
   createdb -U postgres -h localhost flowdesk
   ```
2. Ejecutar los scripts en orden:
   ```bash
   psql -U postgres -h localhost -d flowdesk -f db/01_schema_completo.sql
   psql -U postgres -h localhost -d flowdesk -f db/02_stored_procedures.sql
   psql -U postgres -h localhost -d flowdesk -f db/03_seed_data.sql
   psql -U postgres -h localhost -d flowdesk -f db/04_menu_y_configuracion.sql
   psql -U postgres -h localhost -d flowdesk -f db/05_vista_umbral_problemas.sql
   psql -U postgres -h localhost -d flowdesk -f db/06_facturacion_electronica_proveedores.sql
   psql -U postgres -h localhost -d flowdesk -f db/07_api_integraciones_seguras.sql
   ```
3. En `.env.local`, configurar:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowdesk"
   ```

---

## 🧪 Verificación de Salud Post-Restauración

Para validar que todo quedó íntegro, ejecuta desde la raíz del proyecto:
```bash
npm run test:api-clientes
```
El resultado debe arrojar:
`🏁 RESULTADO FINAL: 14 Aprobadas, 0 Fallidas`
