import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showSuccess, showError, showConfirm } from '../../utils/swal';
import AdminTable from '../../components/dashboard/AdminTable';
import FormCard, {
    FormInput,
    FormSelect,
    FormSelectCreatable,
    FormPlaceSearch,
    FormTextarea,
    FormCheckbox,
    FormFeatureList,
    FormDynamicList,
    FormInteractiveMap,
    FormImageUpload,
    FormGalleryUpload,
} from '../../components/dashboard/FormCard';
import { getImageUrl } from '../../utils/imageHandler';
import { 
    CheckIcon, PencilSimpleIcon, ArrowLeftIcon, ArrowRightIcon, 
    MapPinIcon, GlobeIcon, CheckCircleIcon, XCircleIcon, 
    HouseIcon, ImageIcon, ArticleIcon, AirplaneTiltIcon, 
    SuitcaseRollingIcon, TagIcon 
} from '@phosphor-icons/react';

// ── Thumbnail cell ────────────────────────────────────────────────────────────
const Thumb = ({ image }) => (
    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 mx-auto border border-gray-100"
        style={{ background: 'linear-gradient(135deg, #001f6c, #001f6ccc)' }}>
        {image
            ? <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">VL</div>}
    </div>
);

// ── Table columns (Actualizada con nuevos campos para visualización) ──────────
const COLUMNS = [
    { key: 'thumb', label: 'Portada', tdClass: 'px-3 py-2 align-middle w-24', render: (_, row) => <Thumb image={row.post?.thumbnail || row.post?.banner} /> },
    { key: 'post.name', label: 'Nombre', sortable: true },
    { key: 'destination', label: 'Destino', sortable: true, render: (v) => <span className="inline-flex items-center gap-1"><MapPinIcon size={12} className="text-[#ed6f00]" /> {v}</span> },
    { key: 'trip_type', label: 'Tipo', sortable: true, render: (v) => <span className="text-[10px] font-bold uppercase bg-blue-50 text-[#001f6c] px-2 py-1 rounded-lg">{v || 'Ida y Vuelta'}</span> },
    { key: 'starting_price', label: 'Precio ($)', sortable: true, render: (v) => <span className="font-bold text-[#ed6f00]">${v}</span> },
    { key: 'isActive', label: 'Activo', sortable: true, render: (v) => v ? <CheckCircleIcon weight="fill" className="w-5 h-5 text-green-500 mx-auto" /> : <XCircleIcon weight="fill" className="w-5 h-5 text-red-500 mx-auto" /> },
];

// ── Steps configuration ───────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: 'General', icon: <HouseIcon className="w-5 h-5" /> },
    { id: 2, label: 'Imágenes', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 3, label: 'Contenido', icon: <ArticleIcon className="w-5 h-5" /> },
];

// ── Default empty form ────────────────────────────────────────────────────────
const defaultForm = () => ({
    name: '',
    destination: '',
    country_FK: '',
    map_location: '',
    starting_price: '',
    requirements: [],
    features: [],
    overview: '',
    information: '',
    banner: '',
    thumbnail: '',
    images: [],
    isActive: true,
    trip_type: 'Ida y Vuelta',
    baggage_info: '',
    additional_label: '',
});

// ── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
    <div className="flex items-center gap-0 mb-6">
        {STEPS.map((step, idx) => {
            const done = step.id < current;
            const active = step.id === current;
            const last = idx === STEPS.length - 1;
            return (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1 min-w-[70px]">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                            ${done ? 'bg-[#ed6f00] border-[#ed6f00] text-white' : ''}
                            ${active ? 'bg-[#001f6c] border-[#001f6c] text-white ring-4 ring-[#001f6c]/20' : ''}
                            ${!done && !active ? 'bg-white border-gray-200 text-gray-400' : ''}
                        `}>
                            {done ? <CheckIcon className="w-4 h-4" /> : <span className="flex items-center justify-center -translate-y-px">{step.icon}</span>}
                        </div>
                        <span className={`text-[11px] font-semibold text-center leading-tight ${active ? 'text-[#001f6c]' : done ? 'text-[#ed6f00]' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                    {!last && <div className={`flex-1 h-0.5 mb-4 mx-1 rounded transition-all ${done ? 'bg-[#ed6f00]' : 'bg-gray-200'}`} />}
                </React.Fragment>
            );
        })}
    </div>
);

// ── Vuelo Form ────────────────────────────────────────────────────────────────
const VueloForm = ({ lookups, editRow, onSaved, onCancelEdit }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(defaultForm());
    const [saving, setSaving] = useState(false);
    const [mapCoords, setMapCoords] = useState(null);
    const isEditing = !!editRow;

    useEffect(() => {
        if (editRow) {
            setForm({
                name: editRow.post?.name || '',
                destination: editRow.destination || '',
                country_FK: editRow.country_FK != null ? String(editRow.country_FK) : '',
                map_location: editRow.map_location || '',
                starting_price: String(editRow.starting_price || ''),
                requirements: Array.isArray(editRow.requirements) ? editRow.requirements : [],
                features: Array.isArray(editRow.features) ? editRow.features : [],
                overview: editRow.post?.overview || '',
                information: editRow.post?.information || '',
                banner: editRow.post?.banner || '',
                thumbnail: editRow.post?.thumbnail || '',
                images: (editRow.post?.images || []).map(i => i.url),
                isActive: editRow.isActive ?? true,
                trip_type: editRow.trip_type || 'Ida y Vuelta',
                baggage_info: editRow.baggage_info || '',
                additional_label: editRow.additional_label || '',
            });
            setMapCoords(null);
        } else {
            setForm(defaultForm());
            setMapCoords(null);
        }
        setStep(1);
    }, [editRow]);

    const set = (k) => (e) =>
        setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handlePlaceSelect = (place) => {
        setMapCoords({ lat: Number(place.lat), lon: Number(place.lon) });
        setForm(f => {
            const updated = { ...f, map_location: `${place.lat},${place.lon}` };
            if (place.address?.country) {
                const countryMatch = lookups.countries.find(c => c.name.toLowerCase() === place.address.country.toLowerCase());
                if (countryMatch) updated.country_FK = String(countryMatch.country_ID);
            }
            if (place.address && (place.address.city || place.address.town || place.address.village)) {
                updated.destination = place.address.city || place.address.town || place.address.village;
            }
            return updated;
        });
    };

    const handleGallery = (urls) => {
        setForm(f => ({ ...f, images: urls }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        const parsedPrice = parseFloat(form.starting_price);
        const parsedCountryFK = parseInt(form.country_FK, 10);

        const payload = {
            ...form,
            starting_price: isNaN(parsedPrice) ? 0 : parsedPrice,
            country_FK: isNaN(parsedCountryFK) ? null : parsedCountryFK,
            images: form.images.filter(Boolean),
        };

        try {
            if (isEditing) {
                await api.put(`/flights/${editRow.flights_ID}`, payload);
                showSuccess('¡Vuelo actualizado exitosamente!');
            } else {
                await api.post('/flights', payload);
                showSuccess('¡Vuelo creado exitosamente!');
            }
            setForm(defaultForm());
            setStep(1);
            if (onSaved) onSaved();
        } catch (err) {
            console.error('❌ Error saving flight:', err);
            let errorMessage = 'Error interno del servidor.';
            if (err.response && err.response.data) {
                errorMessage = err.response.data.message || err.response.data.error || errorMessage;
            }
            showError(`Error al guardar: ${errorMessage}`);
        } finally { 
            setSaving(false); 
        }
    };

    const handleCreateLookup = (type) => async (newValue) => {
        try {
            const res = await api.post(`/lookups/${type}`, type === 'countries' ? { name: newValue } : { type: newValue });
            const idKey = type === 'countries' ? 'country_ID' : 'other_ID';
            const formKey = type === 'countries' ? 'country_FK' : 'other_FK';
            setForm(f => ({ ...f, [formKey]: String(res.data[idKey]) }));
            if (onSaved) onSaved();
        } catch (err) { showError('Error al crear opción.'); }
    };

    return (
        <div id="form-vuelo">
            {isEditing && (
                <div className="mb-3 flex items-center justify-between bg-amber-50 border border-amber-300 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                        <PencilSimpleIcon className="w-5 h-5" /> Editando: <span className="font-bold">{editRow?.post?.name}</span>
                    </div>
                    <button type="button" onClick={() => { setForm(defaultForm()); setStep(1); onCancelEdit(); }} className="text-sm text-amber-700 hover:text-red-600 font-bold underline transition-colors">Cancelar edición</button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-[#ed6f00] shadow-sm overflow-visible">
                <div className="bg-[#f4f7fb] border-b border-[#ed6f00]/30 px-6 py-4">
                    <h2 className="text-lg font-extrabold text-[#001f6c]">{isEditing ? 'Editar Vuelo / Destino' : 'Crear un Nuevo Vuelo / Destino'}</h2>
                </div>
                <div className="p-6">
                    <StepIndicator current={step} />
                    <div>
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <FormInput label="Nombre del Vuelo/Destino" id="vl-name" value={form.name} onChange={set('name')} required />
                                    <FormInput label="Ciudad Destino" id="vl-destination" value={form.destination} onChange={set('destination')} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormSelectCreatable label="País" id="vl-country" options={lookups.countries.map(c => ({ value: c.country_ID, label: c.name }))} value={form.country_FK} onChange={set('country_FK')} onCreateOption={handleCreateLookup('countries')} createPlaceholder="Añadir nuevo país…" required />
                                    <FormInput label="Precio ($)" id="vl-precio" type="number" min="0" step="0.01" value={form.starting_price} onChange={set('starting_price')} required />
                                </div>

                                {/* --- SECCIÓN DE DATOS DE VUELO --- */}
                                <div className="p-5 bg-[#001f6c]/5 rounded-2xl border border-[#001f6c]/10 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AirplaneTiltIcon size={18} weight="bold" className="text-[#001f6c]" />
                                        <h3 className="text-sm font-bold text-[#001f6c] uppercase tracking-wider">Detalles del Trayecto</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormSelect 
                                            label="Tipo de Trayecto" 
                                            id="vl-trip-type" 
                                            value={form.trip_type} 
                                            onChange={set('trip_type')}
                                            options={[
                                                { value: 'Ida y Vuelta', label: 'Ida y Vuelta' },
                                                { value: 'Solo Ida', label: 'Solo Ida' }
                                            ]} 
                                        />
                                        <FormInput 
                                            label="Info. Maleta" 
                                            id="vl-baggage" 
                                            placeholder="Ej: 23kg Incluida" 
                                            value={form.baggage_info} 
                                            onChange={set('baggage_info')} 
                                            icon={<SuitcaseRollingIcon />}
                                        />
                                        <FormInput 
                                            label="Etiqueta" 
                                            id="vl-label" 
                                            placeholder="Ej: ¡Últimos cupos!" 
                                            value={form.additional_label} 
                                            onChange={set('additional_label')} 
                                            icon={<TagIcon />}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <FormPlaceSearch label="Buscar Ubicación (Aeropuerto)" id="vl-map_search" value={form.map_location && !form.map_location.includes(',') ? form.map_location : ''} onChange={(e) => setForm(f => ({ ...f, map_location: e.target.value }))} onSelect={handlePlaceSelect} category="aeropuerto" />
                                    <FormInteractiveMap label="Ubicación en Mapa" id="vl-map_location" value={form.map_location} onChange={set('map_location')} centerCoords={mapCoords} />
                                </div>
                                <FormCheckbox label="Vuelo Activo en la Web" id="vl-activo" checked={form.isActive} onChange={set('isActive')} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormImageUpload label="URL del Banner (Horizontal)" id="vl-banner" value={form.banner} onChange={set('banner')} />
                                        <FormImageUpload label="URL del Thumbnail (Cuadrado)" id="vl-thumbnail" value={form.thumbnail} onChange={set('thumbnail')} />
                                    </div>
                                    <div className="flex flex-col justify-center items-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
                                        {(form.banner || form.thumbnail) ? (
                                            <div className="w-full space-y-4">
                                                {form.banner && <div><p className="text-[10px] font-bold text-[#001f6c] uppercase mb-1">Previsualización Banner</p><img src={getImageUrl(form.banner)} alt="" className="w-full h-28 object-cover rounded-xl shadow-md" /></div>}
                                                {form.thumbnail && <div className="flex justify-center"><div><p className="text-[10px] font-bold text-[#001f6c] uppercase mb-1 text-center">Thumbnail</p><img src={getImageUrl(form.thumbnail)} alt="" className="w-24 h-24 object-cover rounded-xl shadow-md mx-auto" /></div></div>}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm italic text-center">Sube imágenes para ver la previsualización</p>
                                        )}
                                    </div>
                                </div>
                                <FormGalleryUpload label="Galería de Fotos del Destino" id="vl-images" value={form.images} onChange={handleGallery} />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <FormTextarea label="Resumen del Vuelo (Overview)" id="vl-overview" rows={5} value={form.overview} onChange={set('overview')} required />
                                    <FormTextarea label="Información Adicional / Política" id="vl-info" rows={5} value={form.information} onChange={set('information')} />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <FormFeatureList label="Servicios / Características" id="vl-features" value={form.features} onChange={(arr) => setForm(f => ({ ...f, features: arr }))} />
                                    <FormDynamicList label="Requisitos Obligatorios" id="vl-reqs" value={form.requirements} onChange={(arr) => setForm(f => ({ ...f, requirements: arr }))} placeholder="Ej: Pasaporte vigente, Visa..." />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                            <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#001f6c]/60 hover:border-[#001f6c]/30 hover:text-[#001f6c] disabled:opacity-30 transition-all"><ArrowLeftIcon className="w-4 h-4" /> Anterior</button>
                            <div className="flex items-center gap-2">{STEPS.map(s => <button key={s.id} type="button" onClick={() => setStep(s.id)} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-[#001f6c] w-4' : step > s.id ? 'bg-[#ed6f00]' : 'bg-gray-200'}`} />)}</div>
                            {step < STEPS.length ? (
                                <button type="button" onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001f6c] text-white text-sm font-semibold hover:bg-[#001f6c]/90 transition-all"><ArrowRightIcon className="w-4 h-4" /> Siguiente</button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#ed6f00] text-white text-sm font-bold hover:bg-[#ed6f00]/90 disabled:opacity-60 transition-all">{saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Vuelo'}</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Page Component ────────────────────────────────────────────────────────────
const Vuelos = () => {
    useDocumentTitle('Vuelos');
    const [flights, setFlights] = useState([]);
    const [lookups, setLookups] = useState({ countries: [] });
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [flightsRes, lookupsRes] = await Promise.all([api.get('/flights'), api.get('/lookups')]);
            setFlights(flightsRes.data.map(f => ({ 
                ...f, 
                'post.name': f.post?.name, 
                'country.name': f.country?.name 
            })));
            setLookups({ countries: lookupsRes.data.countries || [] });
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleArchive = async (row) => {
        if (!await showConfirm(`¿Eliminar "${row['post.name']}"?`)) return;
        try { await api.delete(`/flights/${row.flights_ID}`); fetchData(); } catch (err) { showError('Error al eliminar.'); }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-300">
            {loading ? <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-b-2 border-[#ed6f00] rounded-full" /></div> : (
                <AdminTable title="Vuelos / Destinos" newLabel="Nuevo Vuelo" columns={COLUMNS} data={flights} pageSize={10} onNew={() => { setEditRow(null); document.getElementById('form-vuelo')?.scrollIntoView({ behavior: 'smooth' }); }} onEdit={(r) => { setEditRow(r); document.getElementById('form-vuelo')?.scrollIntoView({ behavior: 'smooth' }); }} onArchive={handleArchive} />
            )}
            <VueloForm lookups={lookups} editRow={editRow} onSaved={() => { setEditRow(null); fetchData(); }} onCancelEdit={() => setEditRow(null)} />
        </div>
    );
};

export default Vuelos;