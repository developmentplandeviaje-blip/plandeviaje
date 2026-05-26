import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { CheckCircleIcon } from '@phosphor-icons/react';

const WhatsappSettings = () => {
    useDocumentTitle('WhatsApp');
    useDocumentTitle('WhatsApp');
    const [status, setStatus] = useState({ connected: false });
    const [pairingCode, setPairingCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [requestingCode, setRequestingCode] = useState(false);

    const checkStatus = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        if (!isPolling) setError(null);
        try {
            const statusRes = await api.get('/whatsapp/status');
            setStatus({ connected: statusRes.data.connected });

            if (statusRes.data.code && !statusRes.data.connected) {
                setPairingCode(statusRes.data.code);
            } else if (statusRes.data.connected) {
                setPairingCode(null);
            }
        } catch (err) {
            console.error('Error fetching WhatsApp status:', err);
            setError('No se pudo conectar con el microservicio de WhatsApp. ¿Está el servidor Node.js ejecutándose?');
            setStatus({ connected: false });
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const handleRequestCode = async (e) => {
        e.preventDefault();

        if (!phoneNumber) {
            setError('Por favor, ingresa un número de teléfono válido.');
            return;
        }

        setRequestingCode(true);
        setError(null);

        try {
            const res = await api.post('/whatsapp/pair', { phone: phoneNumber });

            if (res.data.code) {
                setPairingCode(res.data.code);
            } else if (res.data.connected) {
                setStatus({ connected: true });
            }
        } catch (err) {
            console.error('Error requesting pairing code:', err);
            setError('Error al solicitar el código. Verifica el número e intenta nuevamente.');
        } finally {
            setRequestingCode(false);
        }
    };

    // Poll every 5 seconds if not connected
    useEffect(() => {
        checkStatus(false);
        let interval;
        if (!status.connected) {
            interval = setInterval(() => {
                checkStatus(true);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status.connected]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001f6c]">Configuración de WhatsApp</h1>
                    <p className="text-sm text-gray-500 mt-1">Vincula el número de teléfono de la empresa usando un código de emparejamiento (Pairing Code).</p>
                </div>
            </div>

            <div id="tour-whatsapp-card" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#001f6c]">Estado de Conexión</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {status.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>

                <div className="p-6 flex flex-col items-center text-center space-y-6">
                    {error && (
                        <div className="w-full p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {loading && !pairingCode && !status.connected ? (
                        <div className="py-12 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed6f00] mb-4"></div>
                            <p className="text-gray-500">Comprobando servicio...</p>
                        </div>
                    ) : status.connected ? (
                        <div className="py-12 flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircleIcon  className="h-12 w-12 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">¡WhatsApp vinculado correctamente!</h3>
                            <p className="text-gray-500 max-w-md">
                                El sistema ahora está listo para automatizar el envío y recepción de mensajes con los asesores.
                            </p>
                        </div>
                    ) : (
                        <div className="py-6 flex flex-col items-center w-full max-w-md">

                            {!pairingCode ? (
                                <>
                                    <p className="text-gray-600 mb-6">
                                        Introduce el número de teléfono con el código de país (ej. 584121234567) del dispositivo móvil que utilizará el bot.
                                    </p>
                                    <form onSubmit={handleRequestCode} className="w-full space-y-4">
                                        <div className="flex flex-col text-left">
                                            <label className="text-sm font-bold text-[#001f6c] mb-1">Número de Teléfono</label>
                                            <input
                                                type="text"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="584141234567"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ed6f00] outline-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={requestingCode}
                                            className="w-full px-6 py-3 bg-[#ed6f00] text-white font-bold rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
                                        >
                                            {requestingCode ? 'Solicitando...' : 'Solicitar Código de Emparejamiento'}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-gray-600">
                                        Abre WhatsApp en tu teléfono, ve a <strong>Dispositivos Vinculados &gt; Vincular con el número de teléfono</strong> e introduce este código:
                                    </p>

                                    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                                        <span className="text-4xl font-mono font-bold tracking-[0.5em] text-[#001f6c]">
                                            {pairingCode}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">El sistema verificará automáticamente la comprobación. No refresques la página.</p>
                                </div>
                            )}

                            <button
                                onClick={checkStatus}
                                className="mt-8 px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                            >
                                Refrescar manualmente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsappSettings;
