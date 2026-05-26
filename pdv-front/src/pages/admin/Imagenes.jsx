import React, { useState, useEffect, useRef } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getSettings, updateSettingsBulk } from '../../api/settings';

const Imagenes = () => {
    useDocumentTitle('Imágenes');
    useDocumentTitle('Imágenes');
    const defaultSettings = {
        home_banner_main: '',
        home_banner_sub: '',
        default_hotel_thumbnail: '',
        contact_banner: '',
        contact_video_thumbnail: ''
    };
    
    const [settings, setSettings] = useState(defaultSettings);
    const [newFiles, setNewFiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Provide a way to view a local preview of newly uploaded images
    const [previews, setPreviews] = useState({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings('imagenes');
            const newState = { ...defaultSettings };
            for (const key in data) {
                if (newState[key] !== undefined) {
                    // It will contain the storage URL path like /storage/settings/...
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

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            setNewFiles(prev => ({ ...prev, [key]: file }));
            setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const formData = new FormData();
            
            // Only send files if there are new ones to upload
            for (const key in newFiles) {
                formData.append(key, newFiles[key]);
            }
            
            // Hint for backend on newly created records
            formData.append('_setting_group', 'imagenes'); 

            await updateSettingsBulk(formData);
            setMessage({ type: 'success', text: 'Imágenes actualizadas correctamente.' });
            
            // Reset previews and refresh
            setNewFiles({});
            await fetchSettings();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al actualizar imágenes.' });
        } finally {
            setSaving(false);
        }
    };

    const ImageBox = ({ label, settingKey, helperText }) => {
        const fileInputRef = useRef(null);
        const imageUrl = previews[settingKey] || (settings[settingKey] ? `http://127.0.0.1:8000${settings[settingKey]}` : null);

        return (
            <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center space-y-4">
                <div className="text-center w-full">
                    <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
                    {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
                </div>
                
                <div className="w-full aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {imageUrl ? (
                        <>
                            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white text-[#001f6c] text-xs font-bold rounded-lg shadow-lg">
                                    Cambiar Imagen
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400">
                            <span className="text-sm mb-2">Sin imagen</span>
                            <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg">
                                Subir Imagen
                            </button>
                        </div>
                    )}
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileChange(e, settingKey)} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>
        );
    };

    if (loading) return <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c]">Imágenes del Sistema</h1>
                    <p className="text-gray-500 text-sm">Gestiona los banners y las imágenes por defecto del sitio web.</p>
                </div>
                <button disabled={saving || Object.keys(newFiles).length === 0} onClick={handleSubmit} className="px-5 py-2.5 bg-[#ed6f00] text-white text-sm font-bold rounded-lg hover:bg-[#d66400] transition-colors disabled:opacity-50 disabled:bg-gray-300">
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
            
            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageBox 
                    label="Banner Principal (Inicio)" 
                    settingKey="home_banner_main" 
                    helperText="Resolución recomendada: 1920x1080px"
                />
                <ImageBox 
                    label="Banner Secundario (Ofertas)" 
                    settingKey="home_banner_sub" 
                    helperText="Resolución recomendada: 1200x400px"
                />
                <ImageBox 
                    label="Thumbnail Hoteles por defecto" 
                    settingKey="default_hotel_thumbnail" 
                    helperText="Se muestra cuando un hotel no tiene imagen. (800x800px)"
                />
                <ImageBox 
                    label="Banner de Contacto" 
                    settingKey="contact_banner" 
                    helperText="Banner azul superior de la página de contacto"
                />
                <ImageBox 
                    label="Thumbnail Video de Contacto" 
                    settingKey="contact_video_thumbnail" 
                    helperText="Portada del video ¿Ya sabes cómo ubicarnos?"
                />
            </div>
        </div>
    );
};

export default Imagenes;
