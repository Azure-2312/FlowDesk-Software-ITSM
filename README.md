# FlowDesk Software ITSM - Sistema de Gestion de Servicios de TI

Plataforma empresarial de gestion de servicios de tecnologias de la informacion alineada a las mejores practicas internacionales de **ITIL v4**, **ISO/IEC 20000-1** e **ISO/IEC 27001**.

Desarrollada con **Next.js 14 (App Router)**, **TypeScript 5 (Strict Mode)**, **React 18** y **PostgreSQL 15 (Supabase)** utilizando acceso a datos relacional directo con pooling optimizado (`pg`).

---

## Documentacion Tecnica Maestra

Toda la documentacion de arquitectura, base de datos, APIs, codigo fuente, reglas de negocio y marcos normativos se encuentra en el directorio [`DOCUMENTACION/`](./DOCUMENTACIÓN/):

* **[Documentacion Completa de Arquitectura y Codigo](./DOCUMENTACIÓN/DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md)**: Manual tecnico exhaustivo (mas de 14,000 lineas) que detalla las 77 tablas de base de datos, las 119 rutas de backend API, las 108 paginas de la aplicacion, componentes, bibliotecas, seguridad, reglas de negocio y guia para agentes de Inteligencia Artificial.
* **[Indice Maestro de Documentacion](./DOCUMENTACIÓN/README.md)**: Catalogo de especificaciones de requerimientos, historias de usuario BDD, reglas de negocio y catalogo de servicios.
* **[Reglas de Negocio](./DOCUMENTACIÓN/reglas_de_negocio.md)**: Compendio de politicas y directivas tecnicas del sistema.
* **[Requerimientos Funcionales](./DOCUMENTACIÓN/requerimientos_funcionales.md)**: Alcance de capacidades del Service Desk.
* **[Historias de Usuario](./DOCUMENTACIÓN/historias_de_usuario.md)**: Backlog con criterios BDD Gherkin y matrices de trazabilidad.

---

## Modulos y Capacidades Implementadas

* **Gestion de Incidentes (Incident Management)**: Ciclo de vida completo, temporizadores de SLA en tiempo real, colas de atencion y presentadores personalizados por rol.
* **Gestion de Solicitudes de Servicio (Service Request Management)**: Catalogo interactivo de autoservicio con filtrado reactivo por categorias, control de SLAs y flujos de aprobacion.
* **Gestion de Problemas y KEDB (Problem Management)**: Analisis de causa raiz (RCA), soluciones temporales (Workarounds) y Base de Errores Conocidos.
* **Habilitacion del Cambio (Change Enablement / RFC)**: Comite Asesor de Cambios (CAB), evaluacion de riesgos, ventanas de congelamiento y segregacion de funciones (SoD).
* **Gestion de Configuraciones y Activos (CMDB & ITAM)**: Inventario de infraestructura, relaciones de dependencia de CIs, control de licencias y hardware.
* **Gestion de Niveles de Servicio (SLA/OLA)**: Metas de primera respuesta y resolucion, matriz de Urgencia vs Impacto y semaforos de cumplimiento en tiempo real.
* **Base de Conocimientos (KCS)**: Repositorio de articulos tecnicos y de autoservicio con gestion de estados y politicas de visibilidad.
* **Encuestas de Satisfaccion (CSAT)**: Calificacion de 1 a 5 estrellas al resolver tickets con retroalimentacion cualitativa para mejora continua.
* **Control de Acceso Basado en Roles (RBAC Multi-Perfil)**: Cinco perfiles oficiales (Administrador, Tecnico, Solicitante, Supervisor, Auditor) con conmutacion de perfil en caliente sin reinicio de sesion.
* **Seguridad Defensiva**: Autenticacion JWT en cookies HTTP-only seguras, desafio Captcha matematico, bloqueo preventivo por fuerza bruta, restriccion de dominio corporativo y recuperacion de contrasena via OTP por correo electronico.

---

## Requisitos Previos

* Node.js version 18.18.0 o superior (recomendado Node.js 20 LTS).
* npm version 9 o superior.
* Instancia de PostgreSQL 14+ o proyecto activo en Supabase.
* Git 2.40+.

---

## Instalacion y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Azure-2312/FlowDesk-Software-ITSM.git
cd FlowDesk-Software-ITSM
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear el archivo `.env.local` en la raiz tomando como referencia `.env.example`:
```env
# Conexion a PostgreSQL / Supabase
DATABASE_URL="postgresql://postgres.[tenant]:[password]@[host]:6543/postgres"

# Clave secreta para firma de tokens JWT
JWT_SECRET="flowdesk-secret-key-2026-itsm"

# Configuracion SMTP para recuperacion de clave (Opcional)
GMAIL_USER="tu-correo@gmail.com"
GMAIL_APP_PASSWORD="tu-password-de-aplicacion"
```

> **Nota de Seguridad**: El archivo `.env.local` se encuentra excluido del control de versiones mediante `.gitignore` para proteger las credenciales institucionales.

### 4. Inicializar base de datos
Si se inicia desde cero:
1. Ejecutar `db/schema.sql` en el SQL Editor de PostgreSQL / Supabase.
2. Ejecutar `db/seed.sql` para cargar catalogos iniciales y usuarios de prueba.
3. Ejecutar las migraciones pendientes en `db/migrations/` en orden cronologico.

### 5. Verificar compilacion de TypeScript
```bash
npx tsc --noEmit
```

### 6. Iniciar en modo desarrollo
```bash
npm run dev
```
Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### 7. Compilar para produccion
```bash
npm run build
npm run start
```

---

## Estructura del Proyecto

```
FlowDesk-Software-ITSM/
|-- db/                                 # Scripts DDL, seed y migraciones de base de datos
|   |-- schema.sql
|   |-- seed.sql
|   `-- migrations/                     # 15 migraciones SQL incrementales
|-- DOCUMENTACION/                      # Manuales tecnicos y especificaciones
|   |-- DOCUMENTACION_COMPLETA_ARQUITECTURA_Y_CODIGO.md  # Manual maestro (+14,000 lineas)
|   |-- reglas_de_negocio.md
|   |-- requerimientos_funcionales.md
|   |-- requerimientos_no_funcionales.md
|   |-- historias_de_usuario.md
|   |-- matriz_trazabilidad_funciones_hu_rf_rn.md
|   |-- catalogo_maestro_jerarquia_menu_por_perfil_itsm.md
|   `-- carga_servicios_catalogo_30.md
|-- public/                             # Recursos graficos estaticos
|-- scripts/                            # Scripts de migracion y mantenimiento
|-- src/
|   |-- app/
|   |   |-- (app)/                      # Rutas autenticadas de la aplicacion (108 paginas)
|   |   |-- api/                        # Route Handlers RESTful (119 endpoints)
|   |   |-- login/                      # Portal de autenticacion y recuperacion
|   |   |-- globals.css                 # Estilos globales corporativos
|   |   `-- layout.tsx                  # Layout raiz
|   |-- components/                     # Componentes React reutilizables (28 modulos)
|   |-- lib/                            # Bibliotecas del servidor (db, auth, validaciones, sla)
|   |-- middleware.ts                   # Middleware de proteccion de rutas
|   `-- types/                          # Definiciones TypeScript de dominio
|-- .env.example
|-- .gitignore
|-- package.json
|-- README.md
`-- tsconfig.json
```
