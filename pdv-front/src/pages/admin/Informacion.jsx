import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getSettings, updateSettingsBulk } from '../../api/settings';

const Informacion = () => {
    useDocumentTitle('Información');
    useDocumentTitle('Información');
    const defaultSettings = {
        contact_phone: '',
        contact_email: '',
        contact_address: '',
        social_facebook: '',
        social_instagram: '',
        contact_whatsapp: '',
        contact_hours_weekdays: '',
        contact_hours_saturday: '',
        contact_hours_sunday: '',
        contact_map_frame: '',
        contact_video_url: ''
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
            // Group 'informacion' contains these details
            const data = await getSettings('informacion');
            const newState = { ...defaultSettings };
            for (const key in data) {
                if (newState[key] !== undefined) {
                    newState[key] = data[key].value || '';
                }
            }
            setSettings(newState);
        } catch (error) {
            console.error('Failed to load settings', error);
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
            
            // Provide a hint for backend if needed
            formData.append('_setting_group', 'informacion'); 

            await updateSettingsBulk(formData);
            setMessage({ type: 'success', text: 'Información actualizada correctamente.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[#001f6c]">Información de Contacto y Redes</h1>
            <p className="text-gray-500 text-sm">Edita la información de contacto que se muestra en el sitio web.</p>
            
            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono Principal</label>
                        <input name="contact_phone" value={settings.contact_phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="+58 414 1234567" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                        <input name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="info@planiaturuta.com" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección Física</label>
                        <textarea name="contact_address" value={settings.contact_address} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm min-h-[80px]" placeholder="Ej: Av. Principal, Edificio Centro Viajes..."></textarea>
                    </div>
                </div>
                
                <h2 className="text-lg font-bold text-[#001f6c] pt-4 border-t border-gray-100">Horarios de Servicio</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Lunes a Viernes</label>
                        <input name="contact_hours_weekdays" value={settings.contact_hours_weekdays} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="7:00AM - 3:30PM" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Sábados</label>
                        <input name="contact_hours_saturday" value={settings.contact_hours_saturday} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="7:00AM - 3:30PM" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Domingos</label>
                        <input name="contact_hours_sunday" value={settings.contact_hours_sunday} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="Cerrado / 7:00AM - 3:30PM" />
                    </div>
                </div>
                
                <h2 className="text-lg font-bold text-[#001f6c] pt-4 border-t border-gray-100">Social y Enlaces Externos</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp (Número sin +)</label>
                        <input name="contact_whatsapp" value={settings.contact_whatsapp} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="584120933867" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook URL</label>
                        <input name="social_facebook" value={settings.social_facebook} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram URL</label>
                        <input name="social_instagram" value={settings.social_instagram} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Enlace del Video Promo (YouTube/Local)</label>
                        <input name="contact_video_url" value={settings.contact_video_url} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="https://youtube.com/..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Código o Link de Google Maps (Iframe SRC o URL)</label>
                        <input name="contact_map_frame" value={settings.contact_map_frame} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#001f6c] outline-none rounded-lg p-2.5 transition-colors text-sm" placeholder="https://www.google.com/maps/embed?pb=..." />
                    </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                    <button disabled={saving} type="submit" className="px-5 py-2.5 bg-[#ed6f00] text-white text-sm font-bold rounded-lg hover:bg-[#d66400] transition-colors disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Informacion;
