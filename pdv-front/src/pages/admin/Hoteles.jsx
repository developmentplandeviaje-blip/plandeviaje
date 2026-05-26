import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showSuccess, showError, showConfirm, showInfo } from '../../utils/swal';
import AdminTable from '../../components/dashboard/AdminTable';
import FormCard, {
    FormInput,
    FormSelect,
    FormSelectCreatable,
    FormMultiSelect,
    FormFeatureList,
    FormPlaceSearch,
    FormTextarea,
    FormCheckbox,
    FormImageUpload,
    FormGalleryUpload,
} from '../../components/dashboard/FormCard';
import { getImageUrl } from '../../utils/imageHandler';
import { 
    CheckIcon, PencilSimpleIcon, ArrowLeftIcon, ArrowRightIcon, 
    ForkKnifeIcon, BedIcon, SparkleIcon, StarIcon, 
    CheckCircleIcon, XCircleIcon, HouseIcon, ImageIcon, ArticleIcon 
} from '@phosphor-icons/react';

// --- Mapeo de Regímenes ---
const BOARD_TYPE_ES = {
    'All Inclusive': 'Todo Incluido',
    'Breakfast Only': 'Solo Desayuno',
    'Half Board': 'Media Pensión',
    'Full Board': 'Pensión Completa',
    'Room Only': 'Solo Habitación',
    'No Meals': 'Sin Comidas',
};
const boardLabel = (type) => BOARD_TYPE_ES[type] ?? type;

// --- Componentes de Celda ---
const Thumb = ({ image }) => (
    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 mx-auto bg-slate-100">
        {image ? (
            <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-[#001f6c] text-xs font-bold">HT</div>
        )}
    </div>
);

const RegimeCell = ({ row }) => {
    const rawBoard = typeof row.board_type === 'object' ? row.board_type?.type : row.board_type;
    const regime = boardLabel(rawBoard) || '—';
    return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#001f6c] bg-[#f4f7fb] px-2.5 py-1 rounded-full border border-[#001f6c]/10">
            <ForkKnifeIcon className="w-3.5 h-3.5" /> {regime}
        </span>
    );
};

const StatsCell = ({ row }) => {
    const roomCount = (row.roomTypes || row.room_types)?.length ?? 0;
    const serviceCount = Array.isArray(row.features) ? row.features.length : 0;
    return (
        <div className="flex flex-wrap justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#001f6c]/70 bg-[#f4f7fb] px-2 py-0.5 rounded-full border border-[#001f6c]/10">
                <BedIcon className="w-3.5 h-3.5" /> {roomCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#001f6c]/70 bg-[#f4f7fb] px-2 py-0.5 rounded-full border border-[#001f6c]/10">
                <SparkleIcon className="w-3.5 h-3.5" /> {serviceCount}
            </span>
        </div>
    );
};

const COLUMNS = [
    { key: 'thumb', label: 'Portada', render: (_, row) => <Thumb image={row.post?.thumbnail || row.post?.banner} /> },
    { key: 'post.name', label: 'Nombre', sortable: true },
    { key: 'destination', label: 'Ubicación', sortable: true },
    { key: 'stars', label: 'Cat.', render: (v) => <div className="flex items-center justify-center gap-0.5">{v}<StarIcon weight="fill" className="text-amber-500 w-3" /></div> },
    { key: 'starting_price', label: 'Precio ($)', sortable: true },
    { key: 'regime', label: 'Régimen', render: (_, row) => <RegimeCell row={row} /> },
    { key: 'stats', label: 'Info', render: (_, row) => <StatsCell row={row} /> },
    { key: 'isActive', label: 'Estado', render: (v) => v ? <CheckCircleIcon weight="fill" className="text-green-500 w-5 mx-auto" /> : <XCircleIcon weight="fill" className="text-red-400 w-5 mx-auto" /> },
];

const STEPS = [
    { id: 1, label: 'General', icon: <HouseIcon /> },
    { id: 2, label: 'Imágenes', icon: <ImageIcon /> },
    { id: 3, label: 'Contenido', icon: <ArticleIcon /> },
];

const defaultForm = {
    name: '',
    destination: '',
    map_location: '',
    stars: '3',
    starting_price: '',
    board_type_FK: '',
    room_types: [],
    isActive: true,
    banner: '',
    thumbnail: '',
    images: [],
    overview: '',
    information: '',
    features: [],
};

const HotelForm = ({ lookups, editRow, onSaved, onCancelEdit }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (editRow) {
            setForm({
                name: editRow.post?.name || '',
                destination: editRow.destination || '',
                map_location: editRow.map_location || '',
                stars: String(editRow.stars || '3'),
                starting_price: String(editRow.starting_price || ''),
                board_type_FK: editRow.board_type_FK ? String(editRow.board_type_FK) : '',
                room_types: (editRow.roomTypes || []).map(r => r.room_type_ID),
                isActive: editRow.isActive ?? true,
                banner: editRow.post?.banner || '',
                thumbnail: editRow.post?.thumbnail || '',
                images: (editRow.post?.images || []).map(i => i.url || i),
                overview: editRow.post?.overview || '',
                information: editRow.post?.information || '',
                features: Array.isArray(editRow.features) ? editRow.features : [],
            });
        } else {
            setForm(defaultForm);
        }
        setStep(1);
    }, [editRow]);

    const set = (k) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(f => ({ ...f, [k]: val }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.destination) return showError('Nombre y Ubicación son obligatorios');
        
        setSaving(true);
        const payload = {
            ...form,
            stars: parseInt(form.stars),
            starting_price: parseFloat(form.starting_price) || 0,
            board_type_FK: form.board_type_FK || null,
        };

        try {
            if (editRow) {
                await api.put(`/accommodations/${editRow.accommodation_ID}`, payload);
                showSuccess('¡Actualizado con éxito!');
            } else {
                await api.post('/accommodations', payload);
                showSuccess('¡Creado con éxito!');
            }
            onSaved();
        } catch (err) {
            showError('Error al procesar la solicitud');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div id="form-hotel" className="scroll-mt-10">
            {editRow && (
                <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-amber-800 font-medium flex items-center gap-2">
                        <PencilSimpleIcon weight="bold" /> Editando: <b>{editRow.post?.name}</b>
                    </span>
                    <button onClick={onCancelEdit} className="text-xs font-bold text-amber-600 underline">Cancelar</button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-[#ed6f00]/30 shadow-xl overflow-hidden">
                <div className="bg-[#001f6c] p-6 text-white">
                    <h2 className="text-xl font-bold">{editRow ? 'Modificar Alojamiento' : 'Registrar Nuevo Hotel'}</h2>
                    <p className="text-white/70 text-sm">Completa los pasos para {editRow ? 'actualizar' : 'publicar'} el hotel.</p>
                </div>

                <div className="p-6">
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-10 px-4">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 
                                        ${step >= s.id ? 'bg-[#ed6f00] border-[#ed6f00] text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                        {step > s.id ? <CheckIcon weight="bold" /> : s.icon}
                                    </div>
                                    <span className={`text-xs font-bold ${step >= s.id ? 'text-[#001f6c]' : 'text-gray-400'}`}>{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 rounded ${step > s.id ? 'bg-[#ed6f00]' : 'bg-gray-100'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[350px]">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Nombre del Hotel" value={form.name} onChange={set('name')} placeholder="Ej: Hotel Gran Caribe" />
                                    <FormInput label="Ciudad / Destino" value={form.destination} onChange={set('destination')} placeholder="Ej: Punta Cana" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <FormSelect label="Categoría" value={form.stars} onChange={set('stars')} 
                                        options={[1,2,3,4,5].map(n => ({ value: n, label: `${n} Estrellas` }))} />
                                    <FormInput label="Precio desde ($)" type="number" value={form.starting_price} onChange={set('starting_price')} />
                                    <FormCheckbox label="Disponible" checked={form.isActive} onChange={set('isActive')} className="mt-8" />
                                </div>
                                <FormPlaceSearch label="Dirección en Google Maps" value={form.map_location} onChange={set('map_location')} category="hotel" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormSelectCreatable label="Régimen" options={lookups.boardTypes.map(b => ({ value: b.board_type_ID, label: boardLabel(b.type) }))}
                                        value={form.board_type_FK} onChange={set('board_type_FK')} />
                                    <FormMultiSelect label="Tipos de Habitación" options={lookups.roomTypes.map(r => ({ value: r.room_type_ID, label: r.type }))}
                                        value={form.room_types} onChange={(vals) => setForm(f => ({ ...f, room_types: vals }))} />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormImageUpload label="Imagen Principal (Banner)" value={form.banner} onChange={set('banner')} />
                                    <FormImageUpload label="Miniatura (Thumbnail)" value={form.thumbnail} onChange={set('thumbnail')} />
                                </div>
                                <FormGalleryUpload label="Galería de Fotos" value={form.images} onChange={(urls) => setForm(f => ({ ...f, images: urls }))} />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-4">
                                    <FormTextarea label="Resumen rápido" value={form.overview} onChange={set('overview')} rows={3} />
                                    <FormTextarea label="Descripción detallada" value={form.information} onChange={set('information')} rows={8} />
                                </div>
                                <FormFeatureList label="Servicios Incluidos" value={form.features} onChange={(arr) => setForm(f => ({ ...f, features: arr }))} />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                        <button disabled={step === 1} onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-gray-400 hover:text-[#001f6c] disabled:opacity-0 transition-all">
                            <ArrowLeftIcon /> Volver
                        </button>

                        {step < 3 ? (
                            <button onClick={() => setStep(s => s + 1)}
                                className="flex items-center gap-2 bg-[#001f6c] text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-[#001240] transition-all">
                                Siguiente <ArrowRightIcon />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={saving}
                                className="flex items-center gap-2 bg-[#ed6f00] text-white px-10 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50">
                                {saving ? 'Guardando...' : <><CheckIcon weight="bold" /> {editRow ? 'Actualizar Hotel' : 'Finalizar Registro'}</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Hoteles = () => {
    useDocumentTitle('Gestión de Hoteles');
    const [accommodations, setAccommodations] = useState([]);
    const [lookups, setLookups] = useState({ boardTypes: [], roomTypes: [] });
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [accRes, lookRes] = await Promise.all([api.get('/accommodations'), api.get('/lookups')]);
            setAccommodations(accRes.data.map(a => ({ ...a, 'post.name': a.post?.name })));
            setLookups({ boardTypes: lookRes.data.board_types || [], roomTypes: lookRes.data.room_types || [] });
        } catch (err) {
            showError('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleEdit = (row) => {
        setEditRow(row);
        document.getElementById('form-hotel')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleArchive = async (row) => {
        if (!await showConfirm(`¿Eliminar "${row.post?.name}"?`)) return;
        try {
            await api.delete(`/accommodations/${row.accommodation_ID}`);
            showSuccess('Eliminado correctamente');
            fetchData();
        } catch (err) {
            showError('No se pudo eliminar');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10">
            <AdminTable 
                title="Lista de Hoteles" 
                columns={COLUMNS} 
                data={accommodations} 
                loading={loading}
                onEdit={handleEdit} 
                onArchive={handleArchive}
                onNew={() => { setEditRow(null); document.getElementById('form-hotel')?.scrollIntoView({ behavior: 'smooth' }); }}
            />
            
            <HotelForm 
                lookups={lookups} 
                editRow={editRow} 
                onSaved={() => { setEditRow(null); fetchData(); }} 
                onCancelEdit={() => setEditRow(null)} 
            />
        </div>
    );
};

export default Hoteles;