import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showConfirm } from '../../utils/swal';
import { UserIcon, PhoneIcon, SpinnerIcon, ArrowsCounterClockwise } from '@phosphor-icons/react';
import { FormImageUpload } from '../../components/dashboard/FormCard';
import { getImageUrl } from '../../utils/imageHandler';

const Asesores = () => {
    useDocumentTitle('Asesores');
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        img: '',
        phone: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [syncing, setSyncing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchConsultants();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await api.post('/consultants/sync');
            setMessage({ type: 'success', text: response.data.message || 'Sincronización completada exitosamente.' });
            fetchConsultants();
        } catch (error) {
            console.error('Error syncing consultants:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error durante la sincronización.'
            });
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectEdit = (consultant) => {
        setEditingId(consultant.id);
        setFormData({
            name: consultant.name,
            img: consultant.img || '',
            phone: consultant.phone
        });
        setMessage({ type: '', text: '' });
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', img: '', phone: '' });
        setMessage({ type: '', text: '' });
    };

    const handleToggleActive = async (consultant) => {
        setMessage({ type: '', text: '' });
        try {
            const updatedStatus = !consultant.is_active;
            await api.post('/consultants', {
                id_asesor: consultant.id,
                is_active: updatedStatus
            });
            setMessage({
                type: 'success',
                text: `Asesor ${updatedStatus ? 'activado' : 'desactivado'} correctamente.`
            });
            fetchConsultants();
        } catch (error) {
            console.error('Error toggling active status:', error);
            setMessage({
                type: 'error',
                text: 'Error al cambiar el estado del asesor.'
            });
        }
    };

    const handleRevert = async (consultant) => {
        setMessage({ type: '', text: '' });
        try {
            const response = await api.post(`/consultants/${consultant.id}/revert`);
            setMessage({
                type: 'success',
                text: response.data.message || 'Sincronización automática restablecida.'
            });
            fetchConsultants();
        } catch (error) {
            console.error('Error reverting sync:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al restablecer la sincronización.'
            });
        }
    };

    const fetchConsultants = async () => {
        try {
            const response = await api.get('/consultants');
            setConsultants(response.data);
        } catch (error) {
            console.error('Error fetching consultants:', error);
            setMessage({ type: 'error', text: 'Error al cargar asesores.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        const payload = {
            ...formData,
            id_asesor: editingId
        };

        try {
            await api.post('/consultants', payload);
            setMessage({ 
                type: 'success', 
                text: editingId ? 'Cambios guardados exitosamente.' : 'Asesor creado exitosamente.' 
            });
            setFormData({ name: '', img: '', phone: '' });
            setEditingId(null);
            fetchConsultants();
        } catch (error) {
            console.error('Error creating consultant:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al guardar el asesor.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!await showConfirm('¿Está seguro de eliminar este asesor?')) return;
        try {
            await api.delete(`/consultants/${id}`);
            setMessage({ type: 'success', text: 'Asesor eliminado correctamente.' });
            fetchConsultants();
        } catch (error) {
            console.error('Error deleting consultant:', error);
            setMessage({ type: 'error', text: 'Error al eliminar el asesor.' });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c]">Gestión de Asesores</h1>
                    <p className="text-sm text-gray-500 mt-1">Crea nuevos asesores para asignarles consultas o sincronízalos con el cotizador.</p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing || loading}
                    className="px-4 py-2 bg-[#001f6c] hover:bg-[#00164c] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                    {syncing ? (
                        <>
                            <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
                            Sincronizando...
                        </>
                    ) : (
                        <>
                            <ArrowsCounterClockwise className="h-5 w-5 text-white" />
                            Sincronizar con Cotizador
                        </>
                    )}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* List of Consultants */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-[#001f6c]">Asesores Existentes</h2>
                    <input
                        type="text"
                        placeholder="Buscar asesor por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:max-w-xs px-4 py-1.5 border border-[#ed6f00]/30 rounded-xl focus:ring-2 focus:ring-[#ed6f00]/40 focus:border-transparent outline-none transition-all text-sm text-[#001f6c] placeholder-gray-400"
                    />
                </div>
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed6f00]"></div>
                    </div>
                ) : (
                    (() => {
                        const filtered = consultants.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
                        return (
                            <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 p-6 custom-scrollbar pb-8" style={{ scrollBehavior: 'smooth' }}>
                                {filtered.map(consultant => (
                                    <div 
                                        key={consultant.id} 
                                        onClick={() => handleSelectEdit(consultant)}
                                        className={`card relative ${!consultant.is_active ? 'opacity-70' : ''}`}
                                        style={{ 
                                            flexShrink: 0, 
                                            flexDirection: 'column', 
                                            justifyContent: 'space-between', 
                                            padding: '16px',
                                            display: 'flex'
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gray-100 mb-2 overflow-hidden border border-white shadow-sm flex items-center justify-center mx-auto">
                                            {consultant.img ? (
                                                <img src={getImageUrl(consultant.img)} alt={consultant.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <h3 className="font-bold text-gray-900 text-sm mb-0.5 max-w-full truncate flex items-center justify-center gap-1">
                                                {consultant.name}
                                            </h3>
                                            {!consultant.is_active && (
                                                <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-red-100 text-red-800 rounded-full border border-red-200">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 text-gray-500 text-xs my-1 w-full">
                                            <PhoneIcon className="w-3.5 h-3.5" />
                                            <span className="truncate max-w-[130px]">{consultant.phone}</span>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1 mt-auto pt-2 w-full border-t border-gray-100/30 z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleActive(consultant); }}
                                                className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-all ${consultant.is_active ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'}`}
                                            >
                                                {consultant.is_active ? 'Desactivar' : 'Activar'}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(consultant.id); }}
                                                className="px-2 py-1 text-[10px] text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200"
                                            >
                                                Eliminar
                                            </button>
                                            {consultant.is_edited_manually && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRevert(consultant); }}
                                                    className="w-full mt-1 px-2 py-1 text-[9px] text-[#001f6c] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md font-medium transition-all flex items-center justify-center gap-1"
                                                    title="Restablecer sincronización automática con los datos del cotizador"
                                                >
                                                    <ArrowsCounterClockwise className="w-2.5 h-2.5" />
                                                    Sincronizar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {filtered.length === 0 && (
                                    <div className="col-span-full py-8 text-center text-gray-500 w-full flex items-center justify-center">
                                        No se encontraron asesores.
                                    </div>
                                )}
                            </div>
                        );
                    })()
                )}
            </div>

            {/* Create / Edit Consultant Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#001f6c]">
                        {editingId ? 'Editar Asesor' : 'Nuevo Asesor'}
                    </h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <input type="hidden" name="id_asesor" value={editingId || ''} />
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. María Sánchez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Celular / WhatsApp</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. +1234567890 (Incluir código de país)"
                                />
                                <p className="text-xs text-gray-500 mt-1">El número debe incluir el código de país para que el botón de WhatsApp funcione.</p>
                            </div>

                            <div>
                                <FormImageUpload 
                                    label="Foto del Asesor (Opcional)" 
                                    id="ase-img" 
                                    value={formData.img} 
                                    onChange={(e) => handleInputChange({ target: { name: 'img', value: e.target.value } })} 
                                />
                                {formData.img && (
                                    <div className="mt-3 flex items-center gap-3">
                                        <span className="text-xs text-gray-500">Vista previa de la foto actual:</span>
                                        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                                            <img src={getImageUrl(formData.img)} alt="Vista previa" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-[#ed6f00] hover:bg-[#d86500] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
                                        Guardando...
                                    </>
                                ) : (
                                    editingId ? 'Guardar Cambios' : 'Guardar Asesor'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Asesores;
