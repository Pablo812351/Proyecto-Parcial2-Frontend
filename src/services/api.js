import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Diccionario de traducción de errores comunes del backend
const ERROR_TRANSLATIONS = {
  'User already exists': 'El correo electrónico o nombre de usuario ya está registrado.',
  'Invalid user data': 'Los datos de usuario proporcionados no son válidos.',
  'Invalid email or password': 'Correo electrónico o contraseña inválidos.',
  'User not found': 'Usuario no encontrado.',
  'Game not found': 'Videojuego no encontrado.',
  'Game removed': 'Videojuego eliminado correctamente.',
  'Company already exists': 'La empresa ya se encuentra registrada.',
  'Genre already exists': 'El género ya se encuentra registrado.',
  'Not authorized, no token': 'No autorizado, falta token de sesión.',
  'Not authorized, token failed': 'Sesión expirada o no autorizada.',
  'Network Error': 'Error de conexión con el servidor. Intente más tarde.'
};

export const translateErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return 'Ha ocurrido un error inesperado. Por favor intente más tarde.';
  
  const trimmed = msg.trim();
  if (ERROR_TRANSLATIONS[trimmed]) return ERROR_TRANSLATIONS[trimmed];

  // Interceptar errores de clave duplicada crudos de MongoDB
  if (trimmed.includes('duplicate key') || trimmed.includes('E11000')) {
    if (trimmed.includes('username')) return 'El nombre de usuario ya está en uso. Por favor elija otro.';
    if (trimmed.includes('email')) return 'El correo electrónico ya está registrado. Por favor utilice otro.';
    if (trimmed.includes('title')) return 'Ya existe un videojuego registrado con ese título. Por favor elija otro.';
    if (trimmed.includes('name')) return 'Ya existe un elemento registrado con ese nombre.';
    return 'Ya existe un registro con esos datos en el sistema.';
  }

  // Interceptar CastError crudo
  if (trimmed.includes('Cast to ObjectId failed')) {
    return 'El identificador proporcionado no es válido.';
  }

  // Interceptar validaciones de esquema crudas
  if (trimmed.includes('is required')) {
    return 'Todos los campos requeridos deben ser completados.';
  }

  return trimmed;
};

// Interceptor global para blindar y traducir cualquier mensaje de error devuelto por la API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data && error.response.data.message) {
      error.response.data.message = translateErrorMessage(error.response.data.message);
    } else if (error.message) {
      error.message = translateErrorMessage(error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
