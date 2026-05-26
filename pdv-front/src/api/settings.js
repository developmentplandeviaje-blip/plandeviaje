import api from './axios'; // El que ya tiene el baseURL: 'http://66.228.40.133/api'

export const getSettings = async (group = '') => {
    try {
        const url = group ? `/settings?group=${group}` : '/settings';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error al obtener configuraciones:", error);
        throw error;
    }
};

export const updateSettingsBulk = async (formData) => {
    try {
        const response = await api.post('/settings/bulk', formData, {
            headers: {
                // Axios detectará automáticamente el boundary para multipart/form-data
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar configuraciones:", error);
        throw error;
    }
};