import api from './axios';

/**
 * Envia la retroalimentacion del cuestionario de experiencia (publico)
 */
export const submitTestimonio = async (data) => {
    const response = await api.post('/testimonios', data);
    return response.data;
};

/**
 * Obtiene los testimonios y metricas para el panel de administracion (protegido)
 */
export const getTestimonios = async (params = {}) => {
    const response = await api.get('/testimonios', { params });
    return response.data;
};

/**
 * Elimina un testimonio por su ID (protegido)
 */
export const deleteTestimonio = async (id) => {
    const response = await api.delete(`/testimonios/${id}`);
    return response.data;
};

/**
 * Valida un enlace/token de cuestionario y verifica su limite de accesos
 */
export const validarEnlaceTestimonio = async (token) => {
    const response = await api.post('/testimonios/validar-enlace', { token });
    return response.data;
};

/**
 * Genera un enlace unico con limite de 3 usos (protegido)
 */
export const generarEnlaceTestimonio = async (data = {}) => {
    const response = await api.post('/testimonios/enlaces/generar', data);
    return response.data;
};

/**
 * Obtiene la lista de asesores / consultores
 */
export const getConsultants = async () => {
    const response = await api.get('/consultants');
    return response.data;
};


