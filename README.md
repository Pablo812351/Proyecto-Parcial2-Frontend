# 🎮 Gaming Hub - Frontend (Single Page Application)

SPA moderna, responsiva e interactiva desarrollada con **React** y **Vite**, estilizada con **TailwindCSS**, diseñada para la exploración, catalogación y gestión personalizada de videojuegos.

* **Materia:** Programación III (Comisión 3-601 TM)
* **Profesor:** Carlos E. Cimino
* **Institución:** UTN INSPT - Tec. Sup. en Informática Aplicada
* **Despliegue en producción:** [https://remarkable-basbousa-3ca60b.netlify.app](https://remarkable-basbousa-3ca60b.netlify.app)
* **Repositorio del Backend:** [https://github.com/Pablo812351/Proyecto-Parcial2-Backend](https://github.com/Pablo812351/Proyecto-Parcial2-Backend)

---

## 🚀 1. Configuración del Entorno y Ejecución

### 📋 Requisitos Previos
* **Node.js:** Versión 18.0.0 o superior instalada.
* **npm:** Gestor de paquetes incluido con Node.js (v9+).
* **Navegador web moderno:** Chrome, Firefox, Edge o Safari.

### 📥 Pasos de Instalación
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Pablo812351/Proyecto-Parcial2-Frontend.git
   cd Proyecto-Parcial2-Frontend
   ```
2. Instalar las dependencias del proyecto:
   ```bash
   npm install
   ```

### ⚙️ Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (puedes basarte en `.env.example`):
```env
# URL base de la API REST del backend (local o producción)
VITE_API_URL=http://localhost:5000
```

### 💻 Modos de Ejecución
* **Modo Desarrollo (con Hot Module Replacement):**
  ```bash
  npm run dev
  ```
  Abre tu navegador en `http://localhost:5173`.

* **Compilación para Producción (Build):**
  ```bash
  npm run build
  ```
  Genera los archivos optimizados y minificados en la carpeta `dist/`.

* **Previsualización de la versión de Producción local:**
  ```bash
  npm run preview
  ```

---

## 📁 2. Estructura del Proyecto

```text
Proyecto-Parcial2-Frontend/
├── public/                 # Recursos estáticos públicos (favicons, logos)
├── src/
│   ├── assets/             # Recursos multimedia (imágenes, SVGs)
│   ├── components/         # Componentes reutilizables de la UI
│   │   └── Navbar.jsx      # Barra de navegación principal con enlaces condicionales por rol
│   ├── context/            # Context API para gestión global del estado
│   │   └── AuthContext.jsx # Proveedor de autenticación (Login, Logout, persistencia en localStorage)
│   ├── pages/              # Vistas y pantallas principales (rutas de la SPA)
│   │   ├── Home.jsx        # Catálogo general con buscador universal en tiempo real
│   │   ├── GameDetail.jsx  # Ficha técnica, enlace a Steam, favoritos y selector de estado
│   │   ├── Library.jsx     # Biblioteca personal con métricas en vivo y clasificación por estados
│   │   ├── AdminPanel.jsx  # Panel CRUD de administración (restringido a ADMIN_ROLE)
│   │   ├── Login.jsx       # Formulario de inicio de sesión con feedback asíncrono
│   │   ├── Register.jsx    # Formulario de registro con validaciones de contraseña
│   │   └── NotFound.jsx    # Pantalla 404 para rutas inexistentes
│   ├── services/           # Capa de comunicación con la API externa
│   │   └── api.js          # Instancia centralizada de Axios con baseURL configurable
│   ├── App.jsx             # Configuración central de rutas y layout general
│   ├── index.css           # Directivas base de TailwindCSS y estilos globales
│   └── main.jsx            # Punto de montaje de React en el DOM
├── index.html              # Plantilla HTML5 raíz
├── package.json            # Scripts y dependencias del proyecto
├── postcss.config.js       # Configuración de PostCSS para Tailwind
├── tailwind.config.js      # Paleta de colores, breakpoints y temas de TailwindCSS
└── vite.config.js          # Configuración del empaquetador Vite
```

---

## 📚 3. Librerías Utilizadas y Propósito

| Librería | Versión | Propósito en el Proyecto |
| :--- | :---: | :--- |
| **react** | `^18.2.0` | Biblioteca principal para la construcción de interfaces de usuario basada en componentes reactivos y hooks (`useState`, `useEffect`, `useContext`). |
| **react-dom** | `^18.2.0` | Paquete que permite el renderizado eficiente de componentes React sobre el DOM del navegador. |
| **react-router-dom** | `^6.22.3` | Enrutador client-side para navegación tipo SPA sin recarga de página (`BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`, `useParams`, `useSearchParams`, `Navigate`). |
| **axios** | `^1.6.8` | Cliente HTTP basado en promesas para consumir los endpoints de la API REST del backend, enviando tokens JWT en headers y procesando respuestas asíncronas. |
| **tailwindcss** | `^3.4.3` | Framework CSS utilitario para diseño moderno, responsive (móvil y escritorio), estética dark mode y micro-animaciones sin escribir CSS acoplado. |
| **postcss** / **autoprefixer** | `^8.4.38` | Herramientas de procesamiento CSS para compatibilidad cross-browser automática de estilos. |
| **vite** | `^5.2.0` | Herramienta de compilación y servidor de desarrollo ultra-rápido con Hot Module Replacement (HMR). |

---

## 🛡️ 4. Roles, Permisos y Casos de Uso en el Frontend

1. **Visitante (No autenticado):**
   * Exploración del catálogo general en `/` con búsqueda de texto en tiempo real.
   * Consulta del detalle técnico de cada juego (`/games/:id`).
   * Alertas informativas al intentar guardar favoritos o usar la biblioteca si no ha iniciado sesión.
2. **Usuario Autenticado (`USER_ROLE`):**
   * Acceso completo a **Mi Biblioteca** (`/library`).
   * Clasificación interactiva en estados: *Jugando*, *Pendiente*, *Completado* o *Abandonado*, o solo en *Favoritos*.
   * Marcado / desmarcado instantáneo de favoritos con sincronización en base de datos.
3. **Usuario Administrador (`ADMIN_ROLE`):**
   * Acceso al **Panel de Administración** (`/admin`).
   * Operaciones CRUD completas sobre videojuegos (Crear, Editar, Listar y Eliminar con borrado en cascada).
