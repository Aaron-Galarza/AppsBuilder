# Getting Started

## Prerrequisitos

- Node.js >= 20
- pnpm >= 9
- Git

## Comando único (recomendado)

Desde la raíz de AppsBuilder, un solo comando detecta prerequisitos, instala si falta,
levanta los servicios que no estén corriendo y abre el navegador en el form:

```bash
pnpm start
```

- Form (builder-ui): `http://localhost:3001`
- Admin (web-admin): `http://localhost:3002`
- Backend: `http://localhost:4000`

Si MongoDB no responde en `27017`, el backend arranca directo contra el mock store
(`data.json`) sin esperar los reintentos.

## Instalación

```bash
git clone https://github.com/tuuser/appsbuilder.git
cd appsbuilder
pnpm install
```

## Levantar el Builder

```bash
cd apps/builder-ui
pnpm dev
```

El builder queda disponible en `http://localhost:3001`.

## Levantar el Backend de Prueba

```bash
cd apps/backend
pnpm dev
```

El backend queda disponible en `http://localhost:4000`.

## Generar un Proyecto

1. Abrir `http://localhost:3001`
2. Seguir el wizard de 7 pasos:
   - **Paso 1:** Elegir producto (webOrders o landingPages)
   - **Paso 2:** Elegir plantilla (basic, standard o premium)
   - **Paso 3:** Seleccionar bloques
   - **Paso 4:** Configurar colores, tipografía y nombre
   - **Paso 5:** Configurar textos de cada bloque
   - **Paso 6:** Subir imágenes (logo, favicon, hero, about)
   - **Paso 7:** Revisar y descargar el ZIP
3. Hacer clic en "Generar y Descargar"
4. El browser descargará un archivo `.zip` con el proyecto completo

## Post-Descarga

1. Descomprimir el ZIP
2. Seguir las instrucciones del `README.md` generado
3. Configurar variables de entorno en `.env.local` de cada app
4. Deployar según las instrucciones del README
