import api from './axios';

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