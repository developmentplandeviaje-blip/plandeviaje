import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import AdminTable from '../../components/dashboard/AdminTable';
import FormCard, { FormSelect } from '../../components/dashboard/FormCard';
import api from '../../api/axios';

const Badge = ({ label }) => {
    const statusMap = {
        'pending': { text: 'Pendiente', classes: 'bg-yellow-400 text-yellow-900' },
        'esperando respuesta': { text: 'Esperando Respuesta', classes: 'bg-blue-500 text-white' },
        'en contacto': { text: 'En Contacto', classes: 'bg-green-500 text-white' },
    };

    // Default fallback
    const config = statusMap[label] || { text: label, classes: 'bg-gray-300 text-gray-700' };

    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${config.classes}`}>
            {config.text}
        </span>
    );
};

// Column definition for AdminTable
const COLUMNS = [
    { key: 'client_name', label: 'Cliente' },
    { key: 'client_email', label: 'Email' },
    { key: 'from_date', label: 'Llegada', render: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
    { key: 'consultant_name', label: 'Asesor', render: (v) => v ? v : <span className="text-gray-400 text-xs italic">No asignado</span> },
    { key: 'assigned_at', label: 'Fecha Asignado', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'assignment_status', label: 'Estado', render: (v) => <Badge label={v} /> },
];

const Consultas = () => {
    useDocumentTitle('Consultas');
    const [inquiries, setInquiries] = useState([]);
    const [consultants, setConsultants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [selectedConsultantId, setSelectedConsultantId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [inquiriesRes, consultantsRes] = await Promise.all([
                api.get('/consultas'),
                api.get('/consultants')
            ]);

            // Format data for the table
            const formattedInquiries = inquiriesRes.data.map(inq => ({
                ...inq,
                id: inq.inquiries_ID, // AdminTable requires 'id' implicitly usually, but we pass real obj
                consultant_name: inq.consultant ? inq.consultant.name : null,
            }));

            setInquiries(formattedInquiries);
            setConsultants(consultantsRes.data);
        } catch (error) {
            console.error('Error fetching data for Consultas page:', error);
            setMessage('Error al cargar la información. Refresque la página.');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedInquiry || !selectedConsultantId) return;

        setSubmitting(true);
        try {
            await api.post(`/consultas/${selectedInquiry.inquiries_ID}/assign`, {
                consultant_id: selectedConsultantId
            });

            setMessage('Se le ha enviado un mensaje al asesor. Esperando respuesta...');
            setSelectedInquiry(null); // Close the assignment interface
            fetchData(); // Refresh the list

        } catch (error) {
            console.error('Error assigning consultant:', error);
            setMessage('Ocurrió un error al intentar asignar la consulta.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c]">Buzón de Consultas</h1>
                    <p className="text-sm text-gray-500 mt-1">Supervisa las consultas y asígnalas a los asesores de ventas.</p>
                </div>
            </div>

            {message && (
                <div className="p-4 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {message}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ed6f00]"></div>
                </div>
            ) : (
                <div id="tour-consultas-table">
                    <AdminTable
                        title="Listado de Consultas"
                        columns={COLUMNS}
                        data={inquiries}
                        pageSize={10}
                        onView={(row) => setSelectedInquiry(row)}
                    />
                </div>
            )}

            {/* Assignment Form Section (Displays when a row is clicked) */}
            {selectedInquiry && (
                <div id="assignment-form" className="mt-8">
                    <FormCard
                        title={`Asignar Consulta: #${selectedInquiry.inquiries_ID}`}
                        onSubmit={handleAssign}
                        submitLabel={submitting ? "Asignando..." : "Asignar y Notificar"}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Datos del Cliente</h3>
                                <p className="text-sm"><strong>Nombre:</strong> {selectedInquiry.client_name}</p>
                                <p className="text-sm"><strong>Email:</strong> {selectedInquiry.client_email}</p>
                                <p className="text-sm"><strong>Teléfono:</strong> {selectedInquiry.client_phone || 'N/A'}</p>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Detalles de Viaje</h3>
                                <p className="text-sm"><strong>Llegada:</strong> {selectedInquiry.from_date ? new Date(selectedInquiry.from_date).toLocaleDateString() : 'N/A'}</p>
                                <p className="text-sm"><strong>Salida:</strong> {selectedInquiry.to_date ? new Date(selectedInquiry.to_date).toLocaleDateString() : 'N/A'}</p>
                                <p className="text-sm"><strong>Niños:</strong> {selectedInquiry.kids ? 'Sí' : 'No'}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#001f6c] mb-2">Seleccionar Asesor</label>
                            <select
                                required
                                value={selectedConsultantId}
                                onChange={(e) => setSelectedConsultantId(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#ed6f00] outline-none"
                            >
                                <option value="" disabled>-- Elige un asesor --</option>
                                {consultants.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-xs text-gray-500">
                            Al asignar, el sistema enviará automáticamente un mensaje de WhatsApp al asesor seleccionado. El estado quedará como "Esperando Respuesta" hasta que el asesor acepte (1) o rechace (2).
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedInquiry(null)}
                                className="mr-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </FormCard>
                </div>
            )}
        </div>
    );
};

export default Consultas;
