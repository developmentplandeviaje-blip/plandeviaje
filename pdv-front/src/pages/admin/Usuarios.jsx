import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { SpinnerIcon } from '@phosphor-icons/react';

const ROLE_NAMES = {
    1: 'Administrador',
    2: 'Editor',
    3: 'Manager'
};

const Usuarios = () => {
    useDocumentTitle('Usuarios');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 1
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Carga de usuarios con limpieza de montaje
    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                if (isMounted) {
                    setUsers(response.data);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching users:', error);
                    setMessage({ type: 'error', text: 'Error al cargar usuarios.' });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'role' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/users', formData);
            setMessage({ type: 'success', text: 'Usuario creado exitosamente.' });
            setFormData({ name: '', email: '', password: '', role: 1 });
            
            // Recargar la lista después de crear
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error creating user:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error al crear el usuario. Por favor verifique los datos.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c]">Gestión de Usuarios</h1>
                    <p className="text-sm text-gray-500 mt-1">Crea nuevos usuarios y asigna roles del sistema</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* List of Users */}
            <div id="tour-usuarios-table" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#001f6c]">Usuarios Existentes</h2>
                </div>
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Nombre</th>
                                    <th className="px-6 py-3 font-medium">Email</th>
                                    <th className="px-6 py-3 font-medium">Rol</th>
                                    <th className="px-6 py-3 font-medium text-right">Fecha de Creación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user, index) => (
                                    /* Cambio CRÍTICO: Key única combinando ID e Index */
                                    <tr key={`${user.user_ID}-${index}`} className="bg-white hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                                                ${user.role === 1 ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 2 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'}`}
                                            >
                                                {ROLE_NAMES[user.role] || 'Desconocido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-500">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create User Form */}
            <div id="tour-usuarios-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-[#001f6c]">Crear Nuevo Usuario</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength="8"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all"
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol del Sistema</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value={1}>Administrador (Acceso Total)</option>
                                    <option value={2}>Editor (Gestión de Contenido)</option>
                                    <option value={3}>Manager (Consultas / Lectura)</option>
                                </select>
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
                                        Creando usuario...
                                    </>
                                ) : (
                                    'Crear Usuario'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;