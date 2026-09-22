import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { submitTestimonio, validarEnlaceTestimonio } from '../api/testimonios';
import logo from '../assets/logo.png';
import { Star, CheckCircle, ThumbsUp, ThumbsDown, PaperPlaneRight, ArrowLeft, Sparkle, WarningOctagon, Headset } from '@phosphor-icons/react';

const STAR_QUESTIONS = [
    {
        key: 'atencion_calificacion',
        title: 'Atención y Asesoría',
        question: '¿Cómo califica la atención recibida por parte de nuestro equipo durante la planificación de su viaje?',
    },
    {
        key: 'itinerario_calificacion',
        title: 'Cumplimiento del Itinerario',
        question: '¿Qué tan satisfecho está con la puntualidad y el cumplimiento de los servicios contratados (vuelos, hoteles, traslados)?',
    },
    {
        key: 'experiencia_calificacion',
        title: 'Experiencia General',
        question: '¿En qué medida el viaje cumplió o superó sus expectativas de disfrute y descanso?',
    },
];

const YES_NO_QUESTIONS = [
    {
        key: 'desempeno_ventas',
        number: 4,
        title: 'Desempeño del Personal de Ventas',
        question: '¿El representante de ventas le proporciono información clara, completa y oportuna sobre las excursiones?',
    },
    {
        key: 'recomendacion',
        number: 5,
        title: 'Recomendación',
        question: '¿Recomendaría nuestra agencia de viajes a sus familiares o amigos?',
    },
    {
        key: 'fidelidad',
        number: 6,
        title: 'Fidelidad',
        question: '¿Volvería a planificar sus próximas vacaciones o viajes con nosotros?',
    },
];

const RATING_LABELS = {
    1: 'Muy insatisfecho',
    2: 'Insatisfecho',
    3: 'Neutral',
    4: 'Satisfecho',
    5: 'Excelente',
};

const QUESTION_LABELS = {
    atencion_calificacion: 'Atención y Asesoría',
    itinerario_calificacion: 'Cumplimiento Itinerario',
    experiencia_calificacion: 'Experiencia General',
    desempeno_ventas: 'Desempeño Ventas',
    recomendacion: 'Recomendación',
    fidelidad: 'Fidelidad',
};

const EvaluarExperiencia = () => {
    const [searchParams] = useSearchParams();
    const tokenParam = searchParams.get('token') || searchParams.get('ref') || '';

    const [validatingLink, setValidatingLink] = useState(true);
    const [linkStatus, setLinkStatus] = useState({ valido: true });

    const referenciaViaje = searchParams.get('ref') || searchParams.get('token') || '';

    const [form, setForm] = useState({
        atencion_calificacion: 0,
        itinerario_calificacion: 0,
        experiencia_calificacion: 0,
        desempeno_ventas: null, // boolean
        recomendacion: null,    // boolean
        fidelidad: null,        // boolean
    });

    // Comentarios opcionales individuales por cada pregunta
    const [comments, setComments] = useState({
        atencion_calificacion: '',
        itinerario_calificacion: '',
        experiencia_calificacion: '',
        desempeno_ventas: '',
        recomendacion: '',
        fidelidad: '',
    });

    const [hoverStates, setHoverStates] = useState({
        atencion_calificacion: 0,
        itinerario_calificacion: 0,
        experiencia_calificacion: 0,
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Validación de acceso al enlace (Máximo 3 accesos por enlace)
    useEffect(() => {
        let isMounted = true;
        const checkLinkValidity = async () => {
            setValidatingLink(true);
            try {
                const res = await validarEnlaceTestimonio(tokenParam);
                if (isMounted) {
                    setLinkStatus(res);
                }
            } catch (err) {
                console.error('Error al validar enlace de encuesta:', err);
                if (isMounted) {
                    setLinkStatus({ valido: true });
                }
            } finally {
                if (isMounted) {
                    setValidatingLink(false);
                }
            }
        };

        checkLinkValidity();

        return () => {
            isMounted = false;
        };
    }, [tokenParam]);

    const handleStarClick = (key, rating) => {
        setForm((prev) => ({ ...prev, [key]: rating }));
    };

    const handleStarHover = (key, rating) => {
        setHoverStates((prev) => ({ ...prev, [key]: rating }));
    };

    const handleBooleanChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleCommentChange = (key, value) => {
        setComments((prev) => ({ ...prev, [key]: value }));
    };

    const allStarKeys = [
        'atencion_calificacion',
        'itinerario_calificacion',
        'experiencia_calificacion'
    ];
    const allStarsSelected = allStarKeys.every((k) => form[k] > 0);

    const isFormValid =
        allStarsSelected &&
        form.desempeno_ventas !== null &&
        form.recomendacion !== null &&
        form.fidelidad !== null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Por favor responda todas las preguntas marcadas antes de enviar.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            // Combinar todos los comentarios opcionales escritos por pregunta
            const activeCommentsList = Object.entries(comments)
                .filter(([_, text]) => text && text.trim() !== '')
                .map(([key, text]) => {
                    const label = QUESTION_LABELS[key] || key;
                    return `[${label}]: ${text.trim()}`;
                });

            const combinedComentarios = activeCommentsList.join('\n\n');

            const payload = {
                ...form,
                comentarios: combinedComentarios || null,
                referencia_viaje: referenciaViaje || null,
            };

            await submitTestimonio(payload);
            setSubmitted(true);
        } catch (err) {
            console.error('Error al enviar testimonio:', err);
            setError(err.response?.data?.message || 'Ocurrió un error al enviar su evaluación. Por favor intente nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    if (validatingLink) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#001f6c]/5 via-white to-[#f4f7fb] flex items-center justify-center p-6 font-sans">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-sm w-full space-y-4">
                    <div className="w-12 h-12 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-[#001f6c]">Verificando enlace de encuesta...</p>
                </div>
            </div>
        );
    }

    if (linkStatus && linkStatus.valido === false) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#001f6c]/5 via-white to-[#f4f7fb] py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-orange-100 text-[#ed6f00] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <WarningOctagon size={48} weight="fill" />
                    </div>

                    <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-extrabold uppercase tracking-wider rounded-full mb-3 border border-rose-100">
                        Acceso Limitado
                    </span>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001f6c] tracking-tight mb-3">
                        Límite de accesos alcanzado
                    </h1>

                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                        Este enlace ha alcanzado el límite máximo de <strong>3 accesos permitidos</strong>.
                    </p>

                    <div className="bg-orange-50/80 border border-orange-200/70 p-4 rounded-2xl mb-8 text-left text-xs sm:text-sm text-gray-700 space-y-2">
                        <div className="flex items-start gap-2.5">
                            <Headset size={20} weight="fill" className="text-[#ed6f00] shrink-0 mt-0.5" />
                            <p className="font-medium leading-relaxed">
                                Por favor, comuníquese con nuestro departamento de <strong>Atención al Cliente</strong> si desea obtener un nuevo enlace de evaluación.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/contacto"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ed6f00] text-white font-bold rounded-xl hover:bg-[#ed6f00]/90 transition-all shadow-md active:scale-95 text-sm"
                        >
                            <Headset size={20} weight="bold" /> Contactar Atención al Cliente
                        </Link>

                        <Link to="/" className="text-xs font-semibold text-gray-400 hover:text-[#001f6c] transition-colors py-2">
                            Volver a la página principal
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#001f6c]/5 via-white to-[#f4f7fb] py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* Header Brand Banner */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                        <img src={logo} alt="Plan de Viaje" className="h-12 w-auto mx-auto object-contain mb-3" />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001f6c] tracking-tight">
                        Cuestionario de Experiencia de Viaje
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
                        Su opinión nos ayuda a perfeccionar cada detalle de nuestros servicios.
                    </p>
                    {referenciaViaje && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-[#ed6f00] rounded-full text-xs font-semibold">
                            <Sparkle size={14} weight="fill" /> Ref: {referenciaViaje}
                        </div>
                    )}
                </div>

                {/* Submitted State - Interactive Thank You Card */}
                {submitted ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                            <CheckCircle size={48} weight="fill" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold text-[#001f6c] mb-3">
                            ¡Gracias por su opinión!
                        </h2>

                        <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                            Tu experiencia nos ayuda a seguir mejorando y brindar momentos inolvidables a nuestros viajeros.
                        </p>

                        <div className="bg-[#001f6c]/5 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border border-[#001f6c]/10">
                            <h3 className="text-xs font-bold text-[#001f6c] uppercase tracking-wider mb-3">Resumen de tu evaluación</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between items-center">
                                    <span>Atención y Asesoría:</span>
                                    <span className="font-bold text-[#ed6f00]">★ {form.atencion_calificacion}/5</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Cumplimiento Itinerario:</span>
                                    <span className="font-bold text-[#ed6f00]">★ {form.itinerario_calificacion}/5</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Experiencia General:</span>
                                    <span className="font-bold text-[#ed6f00]">★ {form.experiencia_calificacion}/5</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#001f6c] text-white font-semibold rounded-xl hover:bg-[#001f6c]/90 transition-all shadow-md active:scale-95"
                            >
                                <ArrowLeft size={18} weight="bold" /> Volver a Plan de Viaje
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Active Questionnaire Form */
                    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl">
                                {error}
                            </div>
                        )}

                        {/* SECTION A: Star Rating Questions */}
                        <div className="space-y-8">
                            <div className="border-b border-gray-100 pb-3">
                                <span className="text-xs font-bold text-[#ed6f00] uppercase tracking-widest block mb-1">Sección A</span>
                                <h2 className="text-lg font-bold text-[#001f6c]">Evaluación de Servicios (1 a 5 Estrellas)</h2>
                            </div>

                            {STAR_QUESTIONS.map((q, idx) => {
                                const currentRating = form[q.key];
                                const activeHover = hoverStates[q.key];
                                const displayRating = activeHover || currentRating;

                                return (
                                    <div key={q.key} className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 hover:border-[#001f6c]/20 transition-all">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="w-6 h-6 rounded-full bg-[#001f6c] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-[#001f6c] text-base">{q.title}</h3>
                                                <p className="text-sm text-gray-600 mt-0.5">{q.question}</p>
                                            </div>
                                        </div>

                                        {/* Stars interactive selector */}
                                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const isFilled = star <= displayRating;
                                                    return (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => handleStarClick(q.key, star)}
                                                            onMouseEnter={() => handleStarHover(q.key, star)}
                                                            onMouseLeave={() => handleStarHover(q.key, 0)}
                                                            className="p-1 rounded-lg hover:scale-125 focus:outline-none transition-transform duration-150"
                                                            aria-label={`${star} estrellas`}
                                                        >
                                                            <Star
                                                                size={32}
                                                                weight={isFilled ? 'fill' : 'regular'}
                                                                className={isFilled ? 'text-amber-400 drop-shadow-sm' : 'text-gray-300 hover:text-amber-300'}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <span className="text-xs font-semibold text-[#001f6c] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 min-w-[120px] text-center">
                                                {displayRating ? RATING_LABELS[displayRating] : 'Seleccionar estrellas'}
                                            </span>
                                        </div>

                                        {/* DYNAMIC TEXTAREA UNFORDS UPON RATING */}
                                        {currentRating > 0 && (
                                            <div className="mt-4 pt-3 border-t border-gray-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="mb-1.5 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-[#001f6c]">
                                                        ¿Alguna observación sobre esta calificación?
                                                    </span>
                                                    <span className="text-[11px] font-medium text-gray-400 italic">
                                                        Su respuesta es opcional
                                                    </span>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={comments[q.key] || ''}
                                                    onChange={(e) => handleCommentChange(q.key, e.target.value)}
                                                    placeholder={
                                                        currentRating === 5
                                                            ? '¿Desea dejar algún comentario sobre nuestro servicio?...'
                                                            : '¿Cómo podríamos mejorar nuestra atención?...'
                                                    }
                                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#ed6f00] focus:ring-2 focus:ring-[#ed6f00]/20 transition-all outline-none text-xs text-gray-800 placeholder-gray-400 bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* SECTION B: Short Answer (Yes / No) Questions */}
                        <div className="space-y-6 pt-4">
                            <div className="border-b border-gray-100 pb-3">
                                <span className="text-xs font-bold text-[#ed6f00] uppercase tracking-widest block mb-1">Sección B</span>
                                <h2 className="text-lg font-bold text-[#001f6c]">Preguntas de Respuesta Corta</h2>
                            </div>

                            {YES_NO_QUESTIONS.map((q) => {
                                const currentAnswer = form[q.key];

                                return (
                                    <div key={q.key} className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 hover:border-[#001f6c]/20 transition-all">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="w-6 h-6 rounded-full bg-[#001f6c] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                                {q.number}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-[#001f6c] text-base">{q.title}</h3>
                                                <p className="text-sm text-gray-600 mt-0.5">{q.question}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 max-w-md">
                                            <button
                                                type="button"
                                                onClick={() => handleBooleanChange(q.key, true)}
                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${currentAnswer === true
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                                                    }`}
                                            >
                                                <ThumbsUp size={18} weight={currentAnswer === true ? 'fill' : 'regular'} /> Sí
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleBooleanChange(q.key, false)}
                                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${currentAnswer === false
                                                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
                                                    }`}
                                            >
                                                <ThumbsDown size={18} weight={currentAnswer === false ? 'fill' : 'regular'} /> No
                                            </button>
                                        </div>

                                        {/* DYNAMIC TEXTAREA UNFORDS UPON ANSWERING */}
                                        {currentAnswer !== null && (
                                            <div className="mt-4 pt-3 border-t border-gray-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="mb-1.5 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-[#001f6c]">
                                                        ¿Alguna observación sobre tu respuesta?
                                                    </span>
                                                    <span className="text-[11px] font-medium text-gray-400 italic">
                                                        Su respuesta es opcional
                                                    </span>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={comments[q.key] || ''}
                                                    onChange={(e) => handleCommentChange(q.key, e.target.value)}
                                                    placeholder={
                                                        currentAnswer === false
                                                            ? '¿Cómo podríamos mejorar nuestra atención?...'
                                                            : '¿Desea dejar algún comentario sobre nuestro servicio?...'
                                                    }
                                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#ed6f00] focus:ring-2 focus:ring-[#ed6f00]/20 transition-all outline-none text-xs text-gray-800 placeholder-gray-400 bg-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={submitting || !isFormValid}
                                className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${isFormValid && !submitting
                                        ? 'bg-[#ed6f00] text-white hover:bg-[#ed6f00]/90 hover:shadow-orange-200 active:scale-[0.99]'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Enviando respuestas...
                                    </>
                                ) : (
                                    <>
                                        <PaperPlaneRight size={20} weight="bold" /> Enviar Cuestionario
                                    </>
                                )}
                            </button>
                            {!isFormValid && (
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    * Complete las 5 calificaciones de estrellas y las 3 preguntas de Sí/No para activar el botón.
                                </p>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EvaluarExperiencia;
