import api from './axios';

/**
 * Obtiene la información de Legalidad y Vigencia para el panel de administración (protegido)
 */
export const getLegalidadAdmin = async () => {
    const response = await api.get('/legalidad');
    return response.data;
};

/**
 * Actualiza el contenido (título, texto informativo y url_video) (protegido)
 */
export const updateLegalidad = async (data) => {
    const response = await api.post('/legalidad', data);
    return response.data;
};

/**
 * Regenera el token único para compartir el enlace (protegido)
 */
export const regenerateLegalidadToken = async () => {
    const response = await api.post('/legalidad/token');
    return response.data;
};

/**
 * Sube múltiples imágenes para el carrusel de legalidad (protegido)
 */
export const uploadLegalidadImages = async (formData) => {
    const response = await api.post('/legalidad/imagenes', formData, {
        headers: {
            'Content-Type': undefined,
        },
    });
    return response.data;
};

/**
 * Actualiza el orden de las imágenes en el carrusel (protegido)
 */
export const updateLegalidadImagesOrder = async (orderedIds) => {
    const response = await api.post('/legalidad/imagenes/orden', { ordered_ids: orderedIds });
    return response.data;
};

/**
 * Elimina una imagen del carrusel por su ID (protegido)
 */
export const deleteLegalidadImage = async (id) => {
    const response = await api.delete(`/legalidad/imagenes/${id}`);
    return response.data;
};

/**
 * Sube un archivo de video para el módulo de legalidad (protegido)
 */
export const uploadLegalidadVideo = async (formData, onUploadProgress) => {
    const response = await api.post('/legalidad/upload-video', formData, {
        headers: {
            'Content-Type': undefined,
        },
        timeout: 300000, // 5 minutos de tiempo límite para videos pesados
        onUploadProgress,
    });
    return response.data;
};

/**
 * Sube una imagen de portada (poster/thumbnail) para el video (protegido)
 */
export const uploadLegalidadPortadaVideo = async (formData) => {
    const response = await api.post('/legalidad/upload-portada', formData, {
        headers: {
            'Content-Type': undefined,
        },
    });
    return response.data;
};

/**
 * Elimina la imagen de portada del video (protegido)
 */
export const deleteLegalidadPortadaVideo = async () => {
    const response = await api.delete('/legalidad/portada-video');
    return response.data;
};

/**
 * Obtiene la información pública de legalidad mediante el token exclusivo (público)
 */
export const getLegalidadPublic = async (token) => {
    const response = await api.get(`/public/legalidad/${encodeURIComponent(token)}`);
    return response.data;
};
