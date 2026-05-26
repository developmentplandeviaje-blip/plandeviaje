import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getSettings, updateSettingsBulk } from '../../api/settings';

const Contenido = () => {
    useDocumentTitle('Contenido');
    useDocumentTitle('Contenido');
    const defaultSettings = {
        about_us_text: '',
        privacy_policy: '',
        terms_and_conditions: '',
        contact_hero_text: '',
        contact_location_text: ''
    };
    
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings('contenido');
            const newState = { ...defaultSettings };
            for (const key in data) {
                if (newState[key] !== undefined) {
                    newState[key] = data[key].value || '';
                }
            }
            setSettings(newState);
        } catch (error) {
            console.error('Failed to load content settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const formData = new FormData();
            for (const key in settings) {
                formData.append(key, settings[key]);
            }
            formData.append('_setting_group', 'contenido'); 

            await updateSettingsBulk(formData);
            setMessage({ type: 'success', text: 'Contenido actualizado correctamente.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[#001f6c]">Gestión de Contenido</h1>
            <p className="text-gray-500 text-sm">Edita los textos largos corporativos de la web.</p>
            
            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#001f6c]">Acerca de Nosotros</label>
                    <textarea 
                        name="about_us_text" 
                        value={settings.about_us_text} 
                        onChange={handleChange} 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-3 transition-colors text-sm min-h-[150px]" 
                        placeholder="Escribe la historia o descripción de la empresa..."
                    ></textarea>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#001f6c]">Políticas de Privacidad</label>
                    <textarea 
                        name="privacy_policy" 
                        value={settings.privacy_policy} 
                        onChange={handleChange} 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-3 transition-colors text-sm min-h-[150px]" 
                        placeholder="Políticas de privacidad de los datos..."
                    ></textarea>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#001f6c]">Términos y Condiciones</label>
                    <textarea 
                        name="terms_and_conditions" 
                        value={settings.terms_and_conditions} 
                        onChange={handleChange} 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-3 transition-colors text-sm min-h-[150px]" 
                        placeholder="Términos y condiciones de uso..."
                    ></textarea>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#001f6c]">Texto Principal de Contacto (Hero Banner)</label>
                    <textarea 
                        name="contact_hero_text" 
                        value={settings.contact_hero_text} 
                        onChange={handleChange} 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-3 transition-colors text-sm min-h-[100px]" 
                        placeholder="Somos mayoristas de viajes..."
                    ></textarea>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-[#001f6c]">Texto de Ubicación (Bajo el banner)</label>
                    <input 
                        name="contact_location_text" 
                        value={settings.contact_location_text} 
                        onChange={handleChange} 
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-3 transition-colors text-sm" 
                        placeholder="Estamos ubicados en..."
                    />
                </div>
                
                <div className="flex justify-end pt-2">
                    <button disabled={saving} type="submit" className="px-6 py-3 bg-[#ed6f00] text-white text-sm font-bold rounded-lg hover:bg-[#d66400] transition-colors disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Contenido;
