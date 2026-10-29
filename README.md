# 🎮 Gaming Hub - Frontend (Single Page Application)

SPA moderna, responsiva e interactiva desarrollada con **React** y **Vite**, estilizada con **TailwindCSS**, diseñada para la exploración, catalogación y gestión personalizada de videojuegos.

* **Materia:** Programación III (Comisión 3-601 TM)
* **Profesor:** Carlos E. Cimino
* **Institución:** UTN INSPT - Tec. Sup. en Informática Aplicada
* **Despliegue en producción:** [https://remarkable-basbousa-3ca60b.netlify.app](https://remarkable-basbousa-3ca60b.netlify.app)
* **Repositorio del Backend:** [https://github.com/Pablo812351/Proyecto-Parcial2-Backend](https://github.com/Pablo812351/Proyecto-Parcial2-Backend)

---

## ⚙️ 1. Configuración del Entorno y Ejecución

### 💻 Requisitos Previos
* **Node.js:** Versión 18.0.0 o superior instalada ([Descargar Node.js](https://nodejs.org/)).
* **npm:** Gestor de paquetes incluido con Node.js (v9+ recomendado).
* **Navegador web moderno:** Google Chrome, Firefox, Microsoft Edge o Safari.

### 🚀 Pasos de Instalación
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Pablo812351/Proyecto-Parcial2-Frontend.git
   cd Proyecto-Parcial2-Frontend
   ```
2. **Instalar las dependencias del proyecto:**
   ```bash
   npm install
   ```

### 🔐 Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`:
```env
# URL base de la API REST del backend (local o producción)
VITE_API_URL=http://localhost:5000
```

### ⚡ Modos de Ejecución
* **Modo Desarrollo (con Hot Module Replacement - HMR):**
  ```bash
  npm run dev
  ```
  Inicia el servidor local en `http://localhost:5173` con recarga instantánea en caliente.

* **Compilación para Producción (Build):**
  ```bash
  npm run build
  ```
  Genera el paquete optimizado y minificado listo para desplegar en la carpeta `dist/`.

* **Previsualización de la versión de Producción local:**
  ```bash
  npm run preview
  ```

---

## 📁 2. Estructura del Proyecto y Responsabilidades

```text
Proyecto-Parcial2-Frontend/
├── public/                 # Recursos estáticos públicos (favicons, logos)
├── src/
│   ├── assets/             # Recursos multimedia (imágenes, SVGs)
│   ├── components/         # Componentes reutilizables de la interfaz de usuario (UI)
│   │   ├── Navbar.jsx      # Barra de navegación responsiva (desktop y menú hamburguesa en mobile)
│   │   └── ConfirmModal.jsx # Modal modalizado con estética glassmorphism para confirmación de acciones críticas
│   ├── context/            # Context API de React para gestión global del estado
│   │   └── AuthContext.jsx # Proveedor de autenticación (Login, Logout, persistencia en localStorage)
│   ├── pages/              # Vistas y pantallas principales (rutas de la SPA)
│   │   ├── Home.jsx        # Catálogo general con buscador universal en tiempo real (título, género, desarrolladora)
│   │   ├── GameDetail.jsx  # Ficha técnica ampliada, fondo ambiental dinámico, enlaces externos, favoritos y estados
│   │   ├── Library.jsx     # Biblioteca personal con métricas en vivo, filtros rápidos y clasificación de estados
│   │   ├── AdminPanel.jsx  # Panel de administración dual: Catálogo de Juegos (CRUD) y Gestión de Usuarios (RBAC)
│   │   ├── Favorites.jsx   # Vista de favoritos del usuario autenticado (redirige a /library)
│   │   ├── Login.jsx       # Formulario de inicio de sesión con validaciones y feedback asíncrono
│   │   ├── Register.jsx    # Formulario de creación de cuenta con validaciones de contraseña y correo
│   │   └── NotFound.jsx    # Pantalla 404 para rutas no existentes
│   ├── services/           # Capa de comunicación con la API REST externa
│   │   └── api.js          # Instancia centralizada de Axios con interceptor global y traducción de errores
│   ├── App.jsx             # Configuración central de rutas (React Router) y layout general
│   ├── index.css           # Directivas base de TailwindCSS y estilos globales
│   └── main.jsx            # Punto de entrada y montaje de React en el DOM
├── index.html              # Plantilla HTML5 raíz
├── package.json            # Manifiesto de dependencias y scripts de ejecución
├── postcss.config.js       # Configuración de PostCSS para TailwindCSS
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
| **axios** | `^1.6.8` | Cliente HTTP basado en promesas para consumir los endpoints de la API REST del backend, inyectando tokens JWT en headers y procesando respuestas asíncronas con interceptores. |
| **tailwindcss** | `^3.4.3` | Framework CSS utilitario para diseño moderno, responsive (móvil y escritorio), estética dark mode y micro-animaciones sin escribir CSS acoplado. |
| **postcss** / **autoprefixer** | `^8.4.38` | Herramientas de procesamiento CSS para compatibilidad cross-browser automática de estilos. |
| **vite** | `^5.2.0` | Herramienta de compilación y servidor de desarrollo ultra-rápido con Hot Module Replacement (HMR). |

---

## 🛡️ 4. Roles, Permisos y Casos de Uso en el Frontend

1. **Visitante (No autenticado):**
   * Exploración del catálogo general en `/` con búsqueda de texto en tiempo real.
   * Consulta del detalle técnico de cada juego (`/games/:id`).
   * Alertas informativas al intentar interactuar con favoritos o la biblioteca sin sesión activa.
2. **Usuario Autenticado (`USER_ROLE`):**
   * Acceso completo a **Mi Biblioteca** (`/library`).
   * Clasificación interactiva en estados: *Jugando*, *Pendiente*, *Completado* o *Abandonado*, o solo en *Favoritos*.
   * Marcado / desmarcado instantáneo de favoritos con sincronización bidireccional en base de datos.
3. **Usuario Administrador (`ADMIN_ROLE`):**
   * Acceso exclusivo al **Panel de Administración** (`/admin`) con navegación por pestañas:
     * **🎮 Catálogo de Videojuegos:** Operaciones CRUD completas (Crear, Editar, Listar y Eliminar con borrado en cascada y confirmación mediante `ConfirmModal`).
     * **👥 Gestión de Usuarios:** Búsqueda en tiempo real por nombre de usuario o email, contador de coincidencias, visualización de roles (👑 Admin / 👤 Usuario) y fechas de registro, posibilidad de ascender a Administrador o revocar el rol, y eliminar cuentas de usuario.
     * **🔒 Blindaje de Seguridad del Único Admin:** Si solo queda 1 administrador activo en el sistema, los botones de revocar rol y eliminar cuenta se deshabilitan visualmente con tooltip explicativo y el backend rechaza cualquier intento de bloqueo accidental.
