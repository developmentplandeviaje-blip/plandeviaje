import React, { useState } from 'react';
import { XIcon, PaperPlaneRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import api from '../../api/axios';

/**
 * Formulario de consulta con precio visible.
 *
 * Se adapta según el tipo de producto:
 * - Vuelos: opción de incluir vuelo de regreso
 * - Alojamientos: selector de tipo de habitación
 * - Paquetes: campos estándar de fechas y huéspedes
 */
const BookingForm = ({ postId, price = '$0', priceLabel = '/ persona', isFlight = false, isAccommodation = false, roomTypes = [] }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        dateFrom: '',
        dateTo: '',
        room: '',
        guests: 1,
        children: false,
        kidsCount: 0,
        returnFlight: false,
    });
    
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const update = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => {
            const nextForm = { ...prev, [field]: val };
            if (field === 'children' && !val) nextForm.kidsCount = 0;
            if (field === 'children' && val && nextForm.kidsCount === 0) nextForm.kidsCount = 1;
            return nextForm;
        });
    };

    React.useEffect(() => {
        if (isAccommodation && roomTypes.length > 0 && !form.room) {
            setForm(prev => ({ ...prev, room: roomTypes[0].id }));
        }
    }, [isAccommodation, roomTypes, form.room]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            const payload = {
                post_FK: postId,
                client_name: form.name,
                client_email: form.email,
                client_phone: form.phone,
                from_date: form.dateFrom || null,
                to_date: form.dateTo || null,
                kids: form.children ? 1 : 0,
                data: {
                    guests: form.guests,
                    kidsCount: form.kidsCount,
                }
            };

            if (isFlight) payload.data.returnFlight = form.returnFlight;
            if (isAccommodation && form.room) {
                payload.data.roomType = form.room;
                const rt = roomTypes.find(r => Number(r.id) === Number(form.room));
                if (rt) payload.data.roomTypeName = rt.name;
            }

            await api.post('/consultas', payload);
            setSuccess(true);
            setForm({ name: '', email: '', phone: '', dateFrom: '', dateTo: '', room: roomTypes.length > 0 ? roomTypes[0].id : '', guests: 1, children: false, kidsCount: 0, returnFlight: false });
        } catch (err) {
            console.error('Error submitting inquiry:', err);
            setError('Error al enviar la consulta. Inténtelo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 sticky top-20">
            {/* ── Price ───────────────────────────────────────────── */}
            <div className="mb-1 pb-1 border-b border-gray-100">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-[#ed6f00]">{price}</span>
                    <span className="text-sm font-medium text-gray-400">{priceLabel}</span>
                </div>
            </div>

            {/* ── Form ────────────────────────────────────────────── */}
            <h3 className="text-2xl font-bold text-[#ed6f00] mb-2 text-center">Consulta</h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                        Nombre y Apellido
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm text-[#001f6c] placeholder-gray-400 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        placeholder="Juan Pérez"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm text-[#001f6c] placeholder-gray-400 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        placeholder="correo@ejemplo.com"
                        required
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                        Número de Teléfono
                    </label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm text-[#001f6c] placeholder-gray-400 outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        placeholder="+58 412 123 4567"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                            {isFlight ? (form.returnFlight ? 'Fecha de Ida' : 'Fecha Vuelo') : 'Desde'}
                        </label>
                        <input
                            type="date"
                            value={form.dateFrom}
                            onChange={update('dateFrom')}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-[#001f6c] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                            required
                        />
                    </div>
                    {(!isFlight || form.returnFlight) && (
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                                {isFlight ? 'Fecha de Regreso' : 'Hasta'}
                            </label>
                            <input
                                type="date"
                                value={form.dateTo}
                                onChange={update('dateTo')}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-[#001f6c] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                                required={!isFlight || form.returnFlight}
                            />
                        </div>
                    )}
                </div>

                {isFlight && (
                    <div className="flex items-center pt-1 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.returnFlight}
                                onChange={update('returnFlight')}
                                className="h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]/30"
                            />
                            <span className="text-sm font-medium text-[#001f6c]/70">Incluir vuelo de regreso</span>
                        </label>
                    </div>
                )}

                {/* Room Selection */}
                {isAccommodation && roomTypes.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                            Tipo de Habitación
                        </label>
                        <select
                            value={form.room}
                            onChange={update('room')}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-[#001f6c] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all appearance-none"
                            required
                        >
                            {roomTypes.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Guests + Children */}
                <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                            Nº de Adultos
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={form.guests}
                            onChange={update('guests')}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 text-sm text-[#001f6c] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                        />
                    </div>

                    <div>
                        {form.children ? (
                            <>
                                <label className="block text-xs font-bold uppercase tracking-wide text-[#001f6c]/60 mb-1 pl-0.5">
                                    Nº de Niños
                                </label>
                                <div className="flex relative">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.kidsCount}
                                        onChange={update('kidsCount')}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-2.5 pr-8 text-sm text-[#001f6c] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => update('children')({ target: { type: 'checkbox', checked: false } })}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Quitar niños"
                                    >
                                        <XIcon className="w-4 h-4"  />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="flex items-center gap-2 pb-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.children}
                                    onChange={update('children')}
                                    className="h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6]/30"
                                />
                                <span className="text-sm font-medium text-[#001f6c]/70">Incluye niños</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full mt-2 rounded-xl bg-[#ed6f00] text-white font-semibold py-3 text-sm shadow-md hover:bg-[#ed6f00]/90 hover:shadow-lg active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                    Enviar Consulta
                    <PaperPlaneRightIcon className="w-4 h-4"  />
                </button>


            </form>
        </div>
    );
};

export default BookingForm;
