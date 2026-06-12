import axios from 'axios';

// Función para obtener la URL base de la API
export const getRawBaseURL = () => {
    // URL base del servidor (sin /api)
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return url.replace(/\/$/, "").replace(/\/api$/, "");
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