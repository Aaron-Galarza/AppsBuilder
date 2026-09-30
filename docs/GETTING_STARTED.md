# Arrancar AppsBuilder — guía completa desde cero

AppsBuilder genera **proyectos de cliente listos para producción**: un backend, una web y un panel de administración,
armados con un wizard. Vos configurás el proyecto en 7 pasos, bajás un `.zip` y tenés un monorepo completo.

Esta guía te lleva desde "cloné el repo" hasta "tengo un proyecto andando". Si algo no coincide con lo que leés acá,
eso es un bug de la documentación: reportalo.

---

## 1. Requisitos

| Necesitás | Versión | Para qué |
|---|---|---|
| Node.js | >= 20 | corre todo el proyecto |
| pnpm | >= 9 | gestor de dependencias del monorepo |
| Git | cualquiera | clonar el repo |
| PowerShell 5.1 | en Windows | los scripts de arranque son `.ps1` |
| MongoDB | local o Atlas | base de datos |

> **Sobre el sistema operativo:** los scripts de arranque están escritos para **Windows**. En macOS y Linux el
> comando `appsbuilder` no funciona, pero podés levantar cada servicio por separado (ver [Paso 6](#8-paso-6--levantar-los-servicios-a-mano)).

---

## 2. Los tres servicios y dónde se entra

AppsBuilder levanta 3 servicios. Esta es la parte más importante para ubicarte:

| Servicio | Puerto | URL | Qué es |
|---|---|---|---|
| **builder-ui** | 3001 | **http://localhost:3001** | **Acá empezás.** El wizard de 7 pasos y el generador del ZIP. |
| **backend** | 4000 | http://localhost:4000 | API de datos. Menú, pedidos, admin, métricas. |
| **web-admin** | 3002 | http://localhost:3002 | Panel de administración del master. Sirve para probar. |

El wizard y el panel **consumen** el backend: si el backend no está caído, el preview del wizard y el panel te van a
fallar. El backend, a su vez, necesita la base de datos conectada.

```
navegador ──► builder-ui (3001) ──┐
                                  ├──► backend (4000) ──► MongoDB
navegador ──► web-admin (3002) ──┘
```

**En el proyecto generado** los puertos son distintos: la web pasa a **3000** y el admin se queda en 3002.

---

## 3. Paso 1 — Obtener el código

```bash
git clone <url-del-repo>
cd AppsBuilder
```

## 4. Paso 2 — Preparar el `.env` del backend

El backend necesita un archivo de configuración en **`apps/backend/.env`**. Si no existe, no va a poder conectarse a
ninguna base y todo lo demás va a fallar en cascada.

```bash
cp apps/backend/.env.example apps/backend/.env
```

`apps/backend/.env` **nunca se sube al repositorio** (está en el `.gitignore`). Para trabajar en equipo, coordiná con
tu compañeros cómo se comparte.

Como mínimo tenés que completar:

| Variable | Qué es |
|---|---|
| `MONGODB_URI` | Conexión a tu base. Local: `mongodb://localhost:27017/saas-orders`. O una URI de MongoDB Atlas. |
| `JWT_SECRET` | Secreto largo y aleatorio para firmar los tokens de sesión. En local no importa qué valor tenga. |
| `STATUS_MODE` | Ver la nota más abajo, es importante. |

El resto de las variables del archivo tienen valores por defecto razonables. La referencia completa, comentada, está en
`apps/backend/.env.example`.

> ### `STATUS_MODE`: si el botón de abrir/cerrar el local no funciona
>
> Esta variable decide **cómo se calcula si el negocio está abierto**:
>
> - `STATUS_MODE=manual` — el local **no tiene horarios**. El estado lo maneja únicamente el botón "cerrar/reabrir
>   local" del panel. **Es el valor para la plantilla `basic`.**
> - `STATUS_MODE=schedule` — manda el horario semanal que configures en el panel. **Para `standard` y `premium`.**
>
> Si la variable falta (o queda con el texto `INJECT_STATUS_MODE` del ejemplo), el backend asume `schedule` y te
> avisa por consola. El síntoma es que el botón de abrir/cerrar no puede abrir el local: nunca lo abre, porque decide
> por horario.
>
> Si estás trabajando sobre `basic`, poné `STATUS_MODE=manual`. Cambios en el `.env` requieren reiniciar el backend.

## 5. Paso 3 — Instalar dependencias

```bash
pnpm install
```

Instala todo el monorepo (los 3 servicios y los paquetes compartidos). Tarda un rato la primera vez.

Si querés que también lo verifique por vos: `pnpm install && pnpm start` alcanza; el script detecta que faltan
dependencias y las instala.

---

## 6. Paso 4 — Levantar todo

```bash
pnpm start
```

(equivalente a `appsbuilder`, o al comando global si lo instalaste — ver [Paso 5](#7-paso-5--instalar-el-comando-global))

Qué hace el script, en orden:

1. Chequea que Node y pnpm estén bien.
2. Instala dependencias si faltan.
3. Verifica que MongoDB responda.
4. Levanta **solo los servicios que no estén corriendo** (si ya tenés el backend andando, no lo toca).
5. Abre el navegador en el wizard.
6. Queda **monitoreando en vivo** hasta que presiones `q`. No mata los servicios al salir.

Cada servicio escribe su log en `logs/`:

| Log | Servicio |
|---|---|
| `logs/form.log` | builder-ui (3001) |
| `logs/backend.log` | backend (4000) |
| `logs/admin.log` | web-admin (3002) |

Mientras monitorea vas a ver en vivo en qué paso del wizard está, qué consultas pega el preview al backend y el
progreso de la generación del ZIP.

### Qué tenés que ver

```
[db] MongoDB conectado (saas-orders)
[seed] Base vacía: sembrando datos demo...
[server] Escuchando en http://localhost:4000
```

Si aparece `db: down`, el backend arrancó pero **no tiene base de datos**. Volvé al [Paso 2](#4-paso-2--preparar-el-env-del-backend).

### Detener

```bash
pnpm stop
```

## 7. Paso 5 — Instalar el comando global

Opcional, pero muy cómodo: te permite levantar todo desde cualquier carpeta.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-command.ps1
```

- **¿Dónde lo corro?** Desde la raíz del repo, o con la ruta completa. El script calcula la raíz por sí mismo, así
  que la carpeta actual no importa siempre que la ruta que le pases sea correcta.
- Después **abrí una terminal nueva** y ya podés tipear `appsbuilder` desde donde quieras. Funciona en CMD, PowerShell
  y Git Bash.
- Si abrís la terminal nueva y no lo encuentra, es que el PATH todavía no se propagó: cerrá y abrí de nuevo.

Sin instalar nada, `appsbuilder` también funciona **desde dentro de la carpeta del repo**, porque los wrappers
`appsbuilder` y `appsbuilder.cmd` viven en la raíz.

## 8. Paso 6 — Levantar los servicios a mano

Útil para depurar, o si no estás en Windows.

```bash
pnpm --filter @saas/backend dev     # 4000
pnpm --filter appsbuilder-ui dev    # 3001
pnpm --filter appsbuilder-admin dev # 3002
```

---

## 9. Generar tu primer proyecto (el wizard)

Abrí **http://localhost:3001** y seguí los 7 pasos. El wizard es el corazón de la herramienta.

### Paso 1/7 — Producto

Elegí qué querés generar:

| Producto | Qué es | Trae |
|---|---|---|
| **webOrders** | App de pedidos (menú + carrito + checkout) | web, **admin**, backend |
| **landingPages** | Landing page estética | web, backend (sin admin) |

### Paso 2/7 — Plantilla

`basic`, `standard` o `premium`. Define cuánto contenido trae y **qué tan lindo es**.

### Paso 3/7 — Bloques

Las secciones de la página. Depende del producto y la plantilla:

| | basic | standard | premium |
|---|---|---|---|
| **webOrders** | Menú | + Hero, Sobre Nosotros, CTA, Contacto | + Galería, Ofertas |
| **landingPages** | Hero, CTA, Contacto | + Sobre Nosotros | + Galería, Testimonios, Ofertas, Newsletter |

Dos cosas importantes:

- En **webOrders** el bloque *Menú* es **obligatorio** y no se puede desmarcar.
- En el ZIP de webOrders siempre entran además **carrito, checkout, admin, hero, about, layout y auth**, los uses o
  quitás en el wizard. Son estructura esencial de la app: sin ellos la web no funciona.

### Paso 4/7 — Config

Nombre del negocio, **slug** (se usa en las URLs, tiene que estar en kebab-case: `mi-negocio`), colores
(primario/secundario/acento) y tipografías.

### Paso 5/7 — Textos

Los textos de cada bloque, ya precargados con valores por defecto que podés cambiar.

### Paso 6/7 — Imágenes

Las imágenes se **redimensionan solas**, así que subí la mejor que tengas. Medidas finales a las que se ajustan:

| Imagen | Medida final | Ajuste |
|---|---|---|
| Logo | 500×200 | conserva proporción |
| Favicon | 32×32 | recorta al centro |
| Hero | 1200×600 | recorta |
| Sobre nosotros | 800×800 | recorta |
| Ofertas | 1600×800 | recorta |
| Galería | 1200×900 c/u | recorta |

> **Sin Cloudinary las imágenes no se suben.** El wizard **no da error**: simplemente genera el proyecto sin imágenes.
> Para que salgan, creá `apps/builder-ui/.env.local` con `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y
> `CLOUDINARY_API_SECRET`. Es la única parte de la herramienta que necesita un servicio externo.

### Paso 7/7 — Descargar

Vas a ver un resumen y el botón **Generar y Descargar**. Antes de generar te va a preguntar cómo completar las
variables de entorno del proyecto (ver abajo). El navegador baja un `.zip`.

### Los 3 modos de variables de entorno

En el paso 7 (o al tocar el ícono de base de datos) se abre el modal de `.env`. Elegí según para qué es el proyecto:

| Modo | Qué hace | Usalo para |
|---|---|---|
| **preview** *(por defecto)* | Copia el `.env` de tu master, así el ZIP queda conectado a **la misma base** que estás probando. | Probar en tu máquina. |
| **custom** | Pegás tus pares `CLAVE:valor`. | Cuando ya tenés el destino real. |
| **template** | Usa los valores por defecto, **sin credenciales**, y genera un `JWT_SECRET` aleatorio nuevo. | **Entregarle el ZIP a un cliente.** |

> **Ojo con el modo `preview` en proyectos que van a producción:** copia tu `MONGODB_URI` y tu `JWT_SECRET` reales
> dentro del ZIP. Para la entrega final usá `template` o `custom` y poné valores nuevos.

---

## 10. Qué viene dentro del ZIP

Un monorepo pnpm independiente y listo para developear:

```
proyecto-generado/
├── apps/
│   ├── backend/                    API completa (productos, pedidos, métricas, panel)
│   ├── web-admin/                  Panel de administración  (solo en webOrders)
│   └── products/<producto>/templates/<plantilla>/    La web
├── packages/                       Código compartido (ui, blocks, hooks, types, configs)
├── README.md                       Instrucciones del proyecto
├── sync-master.sh                  Trae los packages actualizados del master
├── tsconfig.base.json
└── package.json                    Script `dev` que levanta todas las apps
```

Las variables de entorno del backend salen **vacías a propósito** (salvo que elijas `preview` o `custom`).

## 11. Levantar el proyecto generado

```bash
# 1. Descomprimí el ZIP
cd proyecto-generado

# 2. Dependencias
pnpm install

# 3. Completá apps/backend/.env  →  MONGODB_URI y JWT_SECRET
#    (las variables de la web ya vienen con http://localhost:4000)

# 4. Arrancá
pnpm dev
```

| Servicio | Puerto | URL |
|---|---|---|
| Web | **3000** | http://localhost:3000 |
| Backend | 4000 | http://localhost:4000 |
| Admin | 3002 | http://localhost:3002 |

**Logueate en el admin con `admin@local.dev` / `admin123`.** Es la cuenta que crea el seed.

Si la base está vacía, el backend **se siembra solo** con datos de demo: productos, categorías, adicionales, cupones,
horarios, galería, admin y pedidos de los últimos días.

### Traer actualizaciones del master

```bash
chmod +x sync-master.sh   # solo la primera vez (en Windows: sin este paso)
./sync-master.sh
```

Copia los `packages/*` compartidos desde el master de AppsBuilder, así el proyecto se beneficia de las mejoras
compartidas sin pisar lo tuyo.

## 12. Deploy

| Pieza | Dónde | Cómo |
|---|---|---|
| Web | Vercel | `cd apps/products/<producto>/templates/<plantilla>` → `vercel deploy --prod` |
| Admin | Vercel | `cd apps/web-admin` → `vercel deploy --prod` (solo webOrders) |
| Backend | Render | Hay un `render.yaml` en `apps/backend`. Subilo y cargá las variables. |

**Después de deployar**, en el panel de cada proveedor cargá las **mismas variables** que pusiste en
`apps/backend/.env`, y completá `NEXT_PUBLIC_API_URL` en el `.env.local` de cada frontend con la URL pública del
backend. Si te queda el default `localhost`, en producción va a apuntar a tu propia máquina.

> **La web tiene que permitir el origen del admin en el CORS.** En el `.env` del backend, `CLIENT_URL` es la lista de
> orígenes permitidos separados por coma. Si dejás el default y desplegás, la web no va a poder hablar con el backend.

---

## 13. Datos de prueba (seed)

El seed corre solo si la base está **vacía**. Para dispararlo a mano:

```bash
pnpm --filter @saas/backend seed
```

Es idempotente: podés correrlo las veces que quieras, no duplica nada.

**Re-generar los pedidos de demostración** (útil cuando pasan los días y el panel "hoy" queda en cero):

```bash
SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed
```

Para cambiar las credenciales del admin que crea el seed: `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`.

---

## 14. Problemas conocidos

### `next build` falla en los proyectos generados

Al compilar un proyecto generado para producción puede fallar con errores de tipos de React. La causa es que el
master tiene **dos versiones de React**: `web-admin` usa React 18, y las plantillas usan React 19, y ambas comparten
`packages/ui` y `packages/blocks`. El typecheck de Next traverse los JSX de las dos y se chocan.

**Mientras tanto, `pnpm dev` funciona bien** — el problema es solo del build de producción. Para entregar, alineá
las versiones de React entre `web-admin` y las plantillas antes de compilar.

### Las imágenes no salen en el proyecto generado

Es el tema de Cloudinary del [Paso 6/7](#paso-67--imágenes). No da error, solo salen vacías.

---

## 15. Si algo no anda

### El backend dice `db: down` o todo da 503

**No encuentra la base de datos.** Es lo primero que hay que descartar.

```bash
# ¿Está tu .env?
ls apps/backend/.env

# ¿Conecta la URI que pusiste? (revisá usuario y contraseña)
```

Si usás Atlas, el motivo más común es que **la IP de tu máquina no esté habilitada** en *Network Access* del cluster.

### El wizard o el panel cargan pero no muestran productos

Casi siempre es el backend caído o sin base. Mirá `logs/backend.log`.

### `GET /api/config/status` devuelve 304

**Es normal y no es un bug.** El endpoint usa ETag: la segunda lectura devuelve 304 Not Modified sin mandar el cuerpo
de nuevo. Es el polling del estado del local.

### El botón de abrir/cerrar el local no abre el negocio

`STATUS_MODE=manual` en el `.env` y reiniciar el backend. Detalle en el [Paso 2](#4-paso-2--preparar-el-env-del-backend).

### El ZIP sale con `MONGODB_URI` vacío

Tu `.env` del master no tenía la variable, y elegiste el modo `preview` en el wizard (que copia tu `.env`). Pasá
por el [Paso 2](#4-paso-2--preparar-el-env-del-backend) o elegí el modo `custom`/`template`.

### El panel me saca y me manda al login

El navegador guardó un token viejo. Se resuelve con logout y entrando de nuevo. Si pasa seguido, el `JWT_SECRET`
cambió entre arranques y por eso los tokens viejos no validan.

### Un puerto está ocupado

```powershell
# Ver quién escucha
netstat -ano | Select-String "3000|3001|3002|4000"

# Liberar el del backend
Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess }
```

Si queda un `esbuild.exe` colgado en Windows, es un proceso zombi de una corrida anterior: matá los procesos `node` y
volvé a arrancar.

### Levantar a mano

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 16. Referencia rápida

### En el master (AppsBuilder)

| Qué | Comando |
|---|---|
| Instalar dependencias | `pnpm install` |
| Levantar todo | `pnpm start` (= `appsbuilder`) |
| Detener todo | `pnpm stop` |
| Instalar el comando global | `powershell -ExecutionPolicy Bypass -File scripts\install-command.ps1` |
| Backend solo | `pnpm --filter @saas/backend dev` |
| Seed | `pnpm --filter @saas/backend seed` |
| Seed + pedidos de hoy | `SEED_REFRESH_DEMO=1 pnpm --filter @saas/backend seed` |
| Typecheck | `pnpm type-check` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |

### En el proyecto generado

| Qué | Comando |
|---|---|
| Instalar | `pnpm install` |
| Levantar todo | `pnpm dev` |
| Traer packages del master | `./sync-master.sh` |
| Deploy web | `vercel deploy --prod` (desde la carpeta de la plantilla) |

### Archivos que conviene conocer

| Ruta | Qué hay |
|---|---|
| `apps/builder-ui/` | El wizard y el generador |
| `apps/backend/` | La API |
| `apps/web-admin/` | El panel del master |
| `apps/products/` | Productos y plantillas generables |
| `packages/` | Código compartido por todos los proyectos |
| `scripts/` | Los `.ps1` de arranque y parada |
| `docs/ARCHITECTURE.md` | Cómo está hecho el sistema por dentro |
| `logs/` | Logs de los servicios |
