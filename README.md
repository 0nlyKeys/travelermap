# Traveler Map

Aplicación web para visualizar rutas de moto con animación sobre mapas interactivos. Cada ruta es un archivo JSON; agregar un nuevo viaje es tan simple como agregar un archivo.

**Stack:** Next.js 14 · TypeScript · Leaflet · Zustand · SCSS

**Demo:** [travelermap.vercel.app](https://travelermap.vercel.app)

---

## Requisitos

- Node.js 18 o superior

---

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La home lista todas las rutas disponibles. Cada ruta vive en `/rutas/<slug>`.

---

## Comandos disponibles

| Comando              | Descripción                    |
|----------------------|--------------------------------|
| `npm run dev`        | Servidor de desarrollo         |
| `npm run build`      | Build de producción            |
| `npm run start`      | Servir el build de producción  |
| `npm run lint`       | Revisar código con ESLint      |
| `npm run format`     | Formatear código con Prettier  |
| `npm test`           | Correr tests (una vez)         |
| `npm run test:watch` | Tests en modo watch            |

---

## Estructura del proyecto

```
ruta-app/
├── data/
│   └── rutas/                  ← Rutas en formato JSON (una por archivo)
├── src/
│   ├── app/                    ← Páginas y rutas (Next.js App Router)
│   │   ├── page.tsx            Home: lista de rutas
│   │   └── rutas/[slug]/
│   │       └── page.tsx        Página individual de cada ruta
│   ├── features/
│   │   ├── rutas/              Carga y listado de rutas
│   │   └── mapa/               Toda la lógica del mapa animado
│   │       ├── components/     Componentes de UI del mapa
│   │       ├── hooks/          Lógica de mapa, animación y controles
│   │       ├── lib/            Utilidades (geometría, distancias, iconos)
│   │       └── store/          Estado global con Zustand
│   ├── shared/
│   │   └── components/Icon/    Registro de iconos SVG
│   └── styles/                 Tokens, mixins y estilos globales SCSS
└── public/                     Assets estáticos
```

---

## Cómo añadir una nueva ruta

1. Crea un archivo en `data/rutas/`, por ejemplo `tatacoa.json`:

```json
{
  "slug": "tatacoa",
  "titulo": "Desierto de la Tatacoa",
  "subtitulo": "Bogotá → Villavieja · Vstrom 250 SX",
  "paradas": [
    { "nombre": "Bogotá",     "lat": 4.7110, "lng": -74.0721 },
    { "nombre": "Girardot",   "lat": 4.3000, "lng": -74.8000 },
    { "nombre": "Neiva",      "lat": 2.9270, "lng": -75.2820 },
    { "nombre": "Villavieja", "lat": 3.2200, "lng": -75.2200 }
  ],
  "metadata": {
    "moto": "Vstrom 250 SX",
    "fecha": "2025-06"
  }
}
```

2. Reinicia `npm run dev`.
3. La ruta aparece automáticamente en la home y se accede en `/rutas/tatacoa`.

> El `slug` del JSON debe coincidir exactamente con el nombre del archivo (sin `.json`).

---

## Controles del mapa

| Acción           | Atajo     |
|------------------|-----------|
| Play / Pausa     | `Espacio` |
| Reiniciar        | `R`       |
| Cámara que sigue | `F`       |
| Ocultar UI       | `H`       |
| Modo edición     | `E`       |

**Modo edición:**
- Clic en el mapa añade una parada
- Panel lateral permite añadir paradas por coordenadas
- Botón × elimina paradas

---

## Deploy en Vercel

El proyecto está desplegado en [travelermap.vercel.app](https://travelermap.vercel.app) y conectado al repositorio de GitHub.

Cada `git push` a `main` redeploya automáticamente.

---

## Dependencias principales

| Paquete               | Uso                    |
|-----------------------|------------------------|
| `next`                | Framework (App Router) |
| `react` / `react-dom` | UI                     |
| `leaflet`             | Mapas interactivos     |
| `zustand`             | Estado global          |
| `sass`                | Estilos SCSS           |
| `vitest`              | Tests                  |
| `typescript`          | Tipos                  |
