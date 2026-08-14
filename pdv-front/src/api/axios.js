import axios from 'axios';

// Función para obtener la URL base de la API
export const getRawBaseURL = () => {
    const hostname = window.location.hostname;

    // 1. Si estamos en el dominio de producción, usamos el origen del navegador directamente.
    // Esto previene fallos si el frontend fue compilado localmente con variables de entorno de desarrollo.
    if (hostname === 'plandeviaje.com.ve' || hostname === 'www.plandeviaje.com.ve') {
        return window.location.origin;
    }

    // 2. Si estamos en desarrollo local, usamos localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080';
    }

    // 3. Si se define explícitamente en el entorno de compilación (ej. desde GitHub Actions o .env)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/$/, "").replace(/\/api$/, "");
    }

    // Fallback general (por si usas subdominio)
    return 'https://plandeviaje.com.ve';
};

const getBaseURL = () => {
    const rawURL = getRawBaseURL();
    return `${rawURL}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para el Token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Interceptor para errores
api.interceptors.response.use(
    response => response,
    error => {
        // Si el servidor responde con 401 (No autorizado), limpiamos el token
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;