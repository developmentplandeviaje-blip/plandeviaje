import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showConfirm } from '../../utils/swal';
import { UserIcon, PhoneIcon, SpinnerIcon } from '@phosphor-icons/react';
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

    useEffect(() => {
        fetchConsultants();
    }, []);

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

        try {
            await api.post('/consultants', formData);
            setMessage({ type: 'success', text: 'Asesor creado exitosamente.' });
            setFormData({ name: '', img: '', phone: '' });
            fetchConsultants();
        } catch (error) {
            console.error('Error creating consultant:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al crear el asesor.'
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
                    <p className="text-sm text-gray-500 mt-1">Crea nuevos asesores para asignarles consultas.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* List of Consultants */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#001f6c]">Asesores Existentes</h2>
                </div>
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed6f00]"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {consultants.map(consultant => (
                            <div key={consultant.id} className="border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                    {consultant.img ? (
                                        <img src={getImageUrl(consultant.img)} alt={consultant.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{consultant.name}</h3>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                                    <PhoneIcon  className="w-4 h-4" />
                                    {consultant.phone}
                                </div>
                                <button
                                    onClick={() => handleDelete(consultant.id)}
                                    className="px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 mt-auto"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                        {consultants.length === 0 && (
                            <div className="col-span-full py-8 text-center text-gray-500">
                                No hay asesores registrados.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Consultant Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#001f6c]">Nuevo Asesor</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
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
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
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
                                    'Guardar Asesor'
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
