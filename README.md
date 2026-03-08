# Explora España 🇪🇸

Una herramienta educativa interactiva diseñada para ayudar a estudiantes y mentes curiosas a aprender la geografía de España de una manera divertida y visual.

## 🚀 Características

- **Modos de Juego:**
  - **Comunidades Autónomas:** Aprende a ubicar las 17 comunidades y las 2 ciudades autónomas.
  - **Provincias:** Un reto mayor para dominar las 50 provincias españolas.
- **Mapa Interactivo:** Desarrollado con D3.js para una visualización precisa y fluida.
- **Algoritmo de Coloración:** Implementa el teorema de los cuatro colores para asegurar que regiones adyacentes tengan colores distintos.
- **Feedback Visual:** Animaciones y colores para indicar aciertos y errores en tiempo real.
- **Diseño Moderno:** Interfaz limpia, responsiva y accesible construida con React y Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, TypeScript, Vite.
- **Estilos:** Tailwind CSS.
- **Visualización de Datos:** D3.js.
- **Animaciones:** Motion (framer-motion).
- **Iconos:** Lucide React.

---

## 💻 Desarrollo Local

Si deseas ejecutar este proyecto en tu propia máquina, sigue estos pasos:

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- [npm](https://www.npmjs.com/) (incluido con Node.js).

### Pasos para la Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd explora-espana
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000` (o el puerto que indique la terminal).

---

## 📦 Publicación en GitHub Pages

Este proyecto está configurado para ser desplegado fácilmente en GitHub Pages.

### 1. Configuración de Vite

Asegúrate de que el archivo `vite.config.ts` tenga la propiedad `base` configurada con el nombre de tu repositorio:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/nombre-del-repositorio/', // IMPORTANTE: Cambia esto por el nombre de tu repo
  // ... resto de la configuración
})
```

### 2. Despliegue Automático

La forma más sencilla es usar el paquete `gh-pages`:

1. **Instalar el paquete:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Añadir scripts al `package.json`:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Ejecutar el despliegue:**
   ```bash
   npm run deploy
   ```

### 3. Configuración en GitHub

- Ve a la pestaña **Settings** de tu repositorio en GitHub.
- En la sección **Pages** (menú lateral izquierdo), asegúrate de que la fuente esté configurada como `Deploy from a branch` y la rama sea `gh-pages`.

---

## 🗺️ Datos Geográficos

Los mapas se cargan dinámicamente desde fuentes GeoJSON públicas:
- Comunidades: [Click That Hood](https://github.com/codeforamerica/click_that_hood)
- Provincias: [Click That Hood](https://github.com/codeforamerica/click_that_hood)
- Fronteras Mundiales: [Datasets World Boundaries](https://github.com/datasets/geo-boundaries-world-110m)

---

Desarrollado con ❤️ para la educación.
