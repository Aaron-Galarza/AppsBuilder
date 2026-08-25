# Builder Guide

Guía paso a paso del wizard de AppsBuilder.

## Paso 1: Elegir Producto

Seleccionar el tipo de proyecto a generar:

- **webOrders:** Tienda online con carrito, checkout, pedidos y panel admin
- **landingPages:** Página de aterrizaje con secciones estáticas

## Paso 2: Elegir Plantilla

Seleccionar el nivel de personalización:

- **basic:** Estructura mínima con header, footer y secciones principales
- **standard:** Incluye panel de administración y páginas adicionales
- **premium:** Incluye galería, testimonios, ofertas y newsletter

## Paso 3: Seleccionar Bloques

Elegir qué secciones incluir en el proyecto. Algunos bloques son obligatorios según el producto:

### webOrders (obligatorios)
- menu
- cart
- checkout
- admin

### landingPages (opcionales)
- hero
- about
- cta
- contact
- features
- pricing
- testimonials
- gallery
- newsletter
- offer

## Paso 4: Configurar Colores y Tipografía

- **Nombre del proyecto:** Nombre que aparecerá en el ZIP y en la config
- **Slug:** Identificador kebab-case (ej: `pizzaya`)
- **Color primario:** Botones, accents principales
- **Color secundario:** Backgrounds, secciones
- **Color accent:** Borders, dividers
- **Fuente de títulos:** Tipografía para headings
- **Fuente de cuerpo:** Tipografía para texto normal

## Paso 5: Configurar Textos

Editar los textos de cada bloque seleccionado. Los campos varían según el bloque:

- **hero:** Título, subtítulo, texto del CTA
- **about:** Título, descripción
- **cta:** Título, subtítulo, texto del botón
- **menu:** Título, descripción
- **contact:** Título, dirección, teléfono, horarios
- **gallery:** Título
- **testimonials:** Título
- **offer:** Título
- **newsletter:** Título
- **features:** Título
- **pricing:** Título, subtítulo

## Paso 6: Subir Imágenes

Subir las imágenes del proyecto:

- **Logo:** 512x512px, PNG o SVG
- **Favicon:** 32x32px, ICO o PNG
- **Imagen del Hero:** 1920x1080px, JPG o WebP (si hero está seleccionado)
- **Imagen del About:** 800x600px, JPG o WebP (si about está seleccionado)
- **Imágenes de Galería:** 1200x800px, JPG o WebP (si gallery está seleccionado)

Las imágenes se suben automáticamente a Cloudinary y se redimensionan según el tipo.

## Paso 7: Generar y Descarga

1. Revisar el resumen de la configuración
2. Verificar que todos los campos obligatorios estén completos
3. Hacer clic en "Generar y Descargar"
4. El browser descargará un archivo `.zip` con el proyecto completo

## Post-Degramado

1. Descomprimir el ZIP
2. Seguir las instrucciones del `README.md` generado
3. Configurar variables de entorno en `.env.local` de cada app:
   - **Backend:** MONGODB_URI, JWT_SECRET, PORT
   - **Web Admin:** NEXT_PUBLIC_API_URL, NEXT_PUBLIC_TENANT_NAME
   - **Web:** NEXT_PUBLIC_API_URL, NEXT_PUBLIC_TENANT_NAME
4. Ejecutar `sync-master.sh` para sincronizar con el master de AppsBuilder
5. Deployar según las instrucciones del README
