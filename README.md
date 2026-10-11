# Sistema de tickets — Programación Aplicada III

Proyecto base: PostgreSQL (Supabase) + Next.js 14 + TypeScript + CSS normal.
Sin ORM: el acceso a datos se hace con SQL directo usando el driver `pg`,
para poder estudiar cada consulta.

> **DOCUMENTACION DEL SISTEMA:**
> Toda la documentacion tecnica, marcos normativos (ITIL v4, ISO/IEC 20000-1, COBIT 2019, ISO/IEC 27001), historias de usuario BDD, catalogo de 18 servicios y guia metodologica completa de ingenieria de software se encuentra centralizada en la carpeta [`DOCUMENTACIÓN/`](./DOCUMENTACIÓN/README.md).

## Qué incluye esta primera entrega

- **Base de datos completa** (`db/schema.sql` y `db/seed.sql`): las tablas
  del profesor (Usuario, Perfiles, OpcionesMenu, Usuario_Perfiles,
  OpcionesMenu_Perfiles) traducidas a PostgreSQL, más las tablas propias
  del sistema de tickets.
- **Login básico** con contraseña hasheada (bcrypt), bloqueo tras 5 intentos
  fallidos, y registro de auditoría de accesos (`log_acceso`).
- **Sesión** manejada con JWT guardado en una cookie httpOnly (no en
  localStorage, para evitar robos de sesión vía JavaScript malicioso).
- **Menú dinámico de hasta 3 niveles**, armado según los perfiles del
  usuario logueado (un usuario puede tener varios perfiles a la vez).

Lo que falta (siguientes entregas): CRUD de Usuario/Perfiles/OpcionesMenu,
y el módulo de tickets en sí (crear, listar, comentar, cambiar estado).

## 1. Requisitos previos

- Node.js 18 o superior instalado (`node -v` para comprobar)
- Una cuenta gratuita en [supabase.com](https://supabase.com)
- VS Code (o el editor que prefieras)

## 2. Crear el proyecto en Supabase

1. Entra a supabase.com → **New project**.
2. Elige un nombre y una contraseña para la base de datos (guárdala, la
   vas a necesitar).
3. Espera 1-2 minutos a que se aprovisione el proyecto.
4. Ve a **Project Settings → Database → Connection string → URI**, y
   copia esa cadena de conexión (se ve algo así:
   `postgresql://postgres:[TU-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`).

## 3. Crear las tablas

1. En Supabase, ve a **SQL Editor** (panel izquierdo).
2. Pega el contenido completo de `db/schema.sql` y dale **Run**.
3. Cuando termine, abre una nueva consulta, pega `db/seed.sql` y dale
   **Run** también (esto crea el usuario de prueba y el menú de ejemplo).
4. Puedes verificar en **Table Editor** que las tablas se crearon con datos.

## 4. Configurar el proyecto en tu laptop

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Luego crea el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

Abre `.env.local` en VS Code y reemplaza:

- `DATABASE_URL` → pega la cadena de conexión que copiaste de Supabase en
  el paso 2.
- `JWT_SECRET` → escribe cualquier texto largo y aleatorio (por ejemplo,
  generado en https://generate-secret.vercel.app/32).

**Importante:** `.env.local` nunca se sube a GitHub (ya está en
`.gitignore`) porque contiene credenciales.

## 5. Correr el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
Deberías caer en la pantalla de login. Entra con:

- **Correo:** `admin@sistema.com`
- **Contraseña:** `admin123`

Si el login funciona, vas a ver el dashboard con el menú de 3 niveles
armado dinámicamente a la izquierda.

## 6. Estructura del proyecto

```
db/
  schema.sql          → todas las tablas (CREATE TABLE)
  seed.sql             → datos de prueba (perfiles, menú, usuario admin)
src/
  lib/
    db.ts               → conexión a PostgreSQL (pool de pg)
    auth.ts              → hash de contraseñas, generar/verificar sesión (JWT)
    menu.ts               → arma el árbol de menú según los perfiles del usuario
    constants.ts           → nombre de la cookie de sesión
  types/
    index.ts               → interfaces de TypeScript (Usuario, Perfil, etc.)
  middleware.ts             → protege /dashboard si no hay sesión
  app/
    login/page.tsx            → pantalla de login
    dashboard/page.tsx         → pantalla protegida con el menú
    api/auth/login/route.ts     → valida credenciales, crea la sesión
    api/auth/logout/route.ts     → cierra sesión
    api/menu/route.ts             → devuelve el menú del usuario (para uso futuro desde el cliente)
  components/
    Menu.tsx                       → componente recursivo que pinta el menú
    BotonCerrarSesion.tsx           → botón de logout
```

## 7. Publicar en Vercel (cuando quieras mostrarlo desplegado)

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), **Add New → Project**, e importa
   el repositorio.
3. En **Environment Variables**, agrega `DATABASE_URL` y `JWT_SECRET` con
   los mismos valores de tu `.env.local`.
4. Dale **Deploy**. Cada `git push` a partir de ahí vuelve a desplegar
   automáticamente.
