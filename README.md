# Ruta App

Aplicación de mapas animados para videos de viajes en moto. Cada ruta vive como un archivo JSON; añadir un nuevo viaje es agregar un archivo.

Stack: **Next.js 14 (App Router) + TypeScript + Leaflet**.

---

## 🚀 Cómo correr el proyecto

Necesitas Node.js 18 o superior.

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

La home (`/`) lista todas las rutas disponibles. Cada ruta vive en `/rutas/<slug>`.

---

## 📁 Estructura del proyecto

```
ruta-app/
├── app/                          ← App Router de Next.js
│   ├── layout.tsx                Layout raíz (envuelve todas las páginas)
│   ├── page.tsx                  Home: lista de rutas
│   ├── globals.css               CSS global (fuentes + Leaflet base)
│   └── rutas/
│       └── [slug]/
│           └── page.tsx          Página dinámica para cada ruta
├── components/
│   ├── MapaAnimado.tsx           Componente principal del mapa (cliente)
│   └── MapaAnimado.module.css    Estilos del mapa (CSS modules)
├── lib/
│   ├── rutas.ts                  Helper para cargar JSONs de rutas
│   └── routeGeometry.ts          OSRM fetch + fallback con curvas
├── types/
│   └── ruta.ts                   Tipos TypeScript compartidos
├── data/
│   └── rutas/
│       └── nevados.json          ← Tus rutas viven aquí
└── public/                       Assets estáticos
```

---

## ➕ Cómo añadir una nueva ruta

1. Crea un archivo en `data/rutas/`, por ejemplo `tatacoa.json`:

```json
{
  "slug": "tatacoa",
  "titulo": "Desierto de la Tatacoa",
  "subtitulo": "Bogotá → Villavieja · Vstrom 250 SX",
  "paradas": [
    { "nombre": "Bogotá",    "lat": 4.7110, "lng": -74.0721 },
    { "nombre": "Girardot",  "lat": 4.3000, "lng": -74.8000 },
    { "nombre": "Neiva",     "lat": 2.9270, "lng": -75.2820 },
    { "nombre": "Villavieja","lat": 3.2200, "lng": -75.2200 }
  ],
  "metadata": {
    "moto": "Vstrom 250 SX",
    "fecha": "2025-06"
  }
}
```

2. Reinicia `npm run dev` (Next.js detecta el nuevo archivo).
3. La ruta aparece automáticamente en la home y se accede en `/rutas/tatacoa`.

El `slug` del JSON debe coincidir con el nombre del archivo.

---

## ☁️ Deploy en Vercel

Vercel y Next.js son del mismo equipo, así que el deploy es trivial:

```bash
# 1. Inicializar git (si no lo hiciste)
git init
git add .
git commit -m "Initial commit"

# 2. Subir a GitHub
gh repo create ruta-app --public --source=. --push
# o crea el repo manualmente en github.com y sigue las instrucciones

# 3. En vercel.com:
#    - Click "Add New Project"
#    - Conecta tu repo de GitHub
#    - Deploy (sin configuración adicional)
```

Cada `git push` redeploya automáticamente.

---

## 🧠 Conceptos clave de Next.js que usa este proyecto

### App Router (`app/` directory)
- Cada `page.tsx` es una página automática.
- Rutas dinámicas con `[slug]` capturan cualquier valor en la URL.
- Por defecto, las páginas son **Server Components** (corren en el servidor).

### `'use client'` en `MapaAnimado.tsx`
Leaflet necesita el objeto `window` que solo existe en el navegador. Marcamos el componente como cliente para que React lo renderice solo en el browser.

### `dynamic()` con `ssr: false`
En `app/rutas/[slug]/page.tsx` cargamos `MapaAnimado` con import dinámico. Esto evita que Next.js intente renderizar el mapa en el servidor durante el build (lo cual fallaría).

### `generateStaticParams()`
Le dice a Next.js qué slugs existen en build time para pre-generar las páginas estáticas (más rápido, mejor SEO).

### CSS Modules
Los archivos `.module.css` scopean los estilos al componente automáticamente. `styles.brandTitle` se convierte en una clase única como `MapaAnimado_brandTitle__a1b2c`.

---

## 🎮 Controles de la app

| Acción              | Atajo       |
|---------------------|-------------|
| Play / Pausa        | `Espacio`   |
| Reiniciar           | `R`         |
| Cámara que sigue    | `F`         |
| Ocultar UI          | `H`         |
| Modo edición        | `E`         |

En modo edición:
- Clic en el mapa añade una parada
- Inputs en el panel izquierdo permiten añadir por coordenadas
- Botón × elimina paradas

---

## 🛠️ Ideas para iterar (próximos pasos)

- Exportar/importar archivos GPX del GPS de la moto
- Etiquetas con datos curiosos sincronizadas con tramos del recorrido
- Personalizar colores/tema por ruta
- Iconos personalizados por tipo de parada (hotel, comida, paisaje)
- Modo "guardar JSON" desde el editor para descargar la ruta editada
- Selector de estilo de mapa (claro/oscuro/satélite)
- Generación de video MP4 server-side con Puppeteer + ffmpeg

---

## 📦 Dependencias

- `next` — framework
- `react`, `react-dom` — UI
- `leaflet` + `@types/leaflet` — mapas
- `typescript` — tipos

Sin librerías de UI, sin Tailwind. CSS puro con CSS Modules para mantener el código minimalista.
