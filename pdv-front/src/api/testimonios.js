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
