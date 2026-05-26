import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showSuccess, showError, showConfirm } from '../../utils/swal';
import AdminTable from '../../components/dashboard/AdminTable';
import FormCard, {
    FormInput,
    FormSelectCreatable,
    FormFeatureList,
    FormTextarea,
    FormCheckbox,
    FormImageUpload,
    FormGalleryUpload,
} from '../../components/dashboard/FormCard';
import { getImageUrl } from '../../utils/imageHandler';
import { CheckIcon, PencilSimpleIcon, ArrowLeftIcon, ArrowRightIcon, ForkKnifeIcon, CalendarIcon, UsersIcon, BedIcon, StarIcon, CheckCircleIcon, XCircleIcon, HouseIcon, ImageIcon, ArticleIcon } from '@phosphor-icons/react';

// ── Board-type Spanish label map ─────────────────────────────────────────────
const BOARD_TYPE_ES = {
    'All Inclusive': 'Todo Incluido',
    'Breakfast Only': 'Solo Desayuno',
    'Half Board': 'Media Pensión',
    'Full Board': 'Pensión Completa',
    'Room Only': 'Solo Habitación',
    'No Meals': 'Sin Comidas',
};
const boardLabel = (type) => BOARD_TYPE_ES[type] ?? type;

// ── Thumbnail cell ────────────────────────────────────────────────────────────
const Thumb = ({ image }) => (
    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 mx-auto"
        style={{ background: 'linear-gradient(135deg, #001f6c, #001f6ccc)' }}>
        {image
            ? <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">PQ</div>}
    </div>
);

// ── Table columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
    { key: 'thumb', label: 'Portada', tdClass: 'px-3 py-2 align-middle w-24', render: (_, row) => <Thumb image={row.post?.thumbnail || row.post?.banner} /> },
    { key: 'post.name', label: 'Nombre', sortable: true },
    { key: 'accommodation.post.name', label: 'Alojamiento', sortable: true, render: (v) => <span className="inline-flex items-center gap-1"><BedIcon size={12} className="text-[#ed6f00]" /> {v || 'Región'}</span> },
    { key: 'days', label: 'Duración', sortable: true, render: (v) => v ? <span className="inline-flex items-center gap-1"><CalendarIcon size={12} /> {v}</span> : '—' },
    { key: 'starting_price', label: 'Precio ($)', sortable: true, render: (v) => <span className="font-bold text-[#ed6f00]">${v}</span> },
    { key: 'guest_type.name', label: 'Huéspedes', sortable: true, render: (v) => v ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#001f6c] bg-[#f4f7fb] px-2.5 py-1 rounded-full border border-[#001f6c]/10"><UsersIcon className="w-3.5 h-3.5" /> {v}</span> : '—' },
    { key: 'board_type.name', label: 'Régimen', sortable: true, render: (v) => v ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#001f6c] bg-[#f4f7fb] px-2.5 py-1 rounded-full border border-[#001f6c]/10"><ForkKnifeIcon className="w-3.5 h-3.5" /> {boardLabel(v)}</span> : '—' },
    { key: 'isActive', label: 'Estado', sortable: true, render: (v) => v 
        ? <div className="flex flex-col items-center text-green-600"><CheckCircleIcon weight="fill" className="w-5 h-5" /><span className="text-[10px] font-bold">ACTIVO</span></div> 
        : <div className="flex flex-col items-center text-gray-400"><XCircleIcon weight="fill" className="w-5 h-5" /><span className="text-[10px] font-bold">ARCHIVADO</span></div> 
    },
];

const STEPS = [
    { id: 1, label: 'General', icon: <HouseIcon className="w-5 h-5" /> },
    { id: 2, label: 'Imágenes', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 3, label: 'Contenido', icon: <ArticleIcon className="w-5 h-5" /> },
];

const defaultForm = () => ({
    name: '',
    accommodation_FK: '',
    days: '',
    starting_price: '',
    end_date: '',
    guest_type_FK: '',
    board_type_FK: '',
    features: [],
    overview: '',
    information: '',
    banner: '',
    thumbnail: '',
    images: [],
    isActive: true,
    isFeatured: false,
});

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
                            {done ? <CheckIcon className="w-4 h-4" /> : <span className="flex items-center justify-center translate-y-[-1px]">{step.icon}</span>}
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

const PaqueteForm = ({ lookups, editRow, onSaved, onCancelEdit }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(defaultForm());
    const [daysCount, setDaysCount] = useState(0);
    const [nightsCount, setNightsCount] = useState(0);
    const [saving, setSaving] = useState(false);
    const isEditing = !!editRow;

    useEffect(() => {
        if (editRow) {
            setForm({
                name: editRow.post?.name || '',
                accommodation_FK: editRow.accommodation_FK != null ? String(editRow.accommodation_FK) : '',
                days: editRow.days || '',
                starting_price: String(editRow.starting_price || ''),
                end_date: editRow.end_date ? editRow.end_date.split('T')[0] : '',
                guest_type_FK: editRow.guest_type_FK != null ? String(editRow.guest_type_FK) : '',
                board_type_FK: editRow.board_type_FK != null ? String(editRow.board_type_FK) : '',
                features: Array.isArray(editRow.features) ? editRow.features : [],
                overview: editRow.post?.overview || '',
                information: editRow.post?.information || '',
                banner: editRow.post?.banner || '',
                thumbnail: editRow.post?.thumbnail || '',
                images: (editRow.post?.images || []).map(i => i.url),
                isActive: editRow.isActive ?? true,
                isFeatured: editRow.isFeatured ?? false,
            });
            const match = (editRow.days || '').match(/(\d+)\s*Días\s*\/\s*(\d+)\s*Noches/i);
            if (match) {
                setDaysCount(parseInt(match[1], 10));
                setNightsCount(parseInt(match[2], 10));
            } else {
                setDaysCount(0); setNightsCount(0);
            }
        } else {
            setForm(defaultForm());
            setDaysCount(0); setNightsCount(0);
        }
        setStep(1);
    }, [editRow]);

    useEffect(() => {
        if (daysCount > 0 || nightsCount > 0) {
            setForm(f => ({ ...f, days: `${daysCount} Días / ${nightsCount} Noches` }));
        }
    }, [daysCount, nightsCount]);

    const set = (k) => (e) =>
        setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleAccommodationChange = async (e) => {
        const id = e.target.value;
        setForm(f => ({ ...f, accommodation_FK: id }));
        if (!id) return;
        try {
            const res = await api.get(`/accommodations/${id}`);
            const acc = res.data;
            setForm(f => ({
                ...f,
                board_type_FK: acc.board_type_FK ? String(acc.board_type_FK) : f.board_type_FK,
                features: Array.isArray(acc.features) ? [...f.features, ...acc.features.filter(af => !f.features.some(ff => ff.label === af.label))] : f.features,
                images: acc.post?.images?.map(i => i.url) || f.images,
                banner: f.banner || acc.post?.banner || '',
                thumbnail: f.thumbnail || acc.post?.thumbnail || '',
            }));
        } catch (err) { console.error('Error fetching accommodation details:', err); }
    };

    const handleDaysChange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        setDaysCount(val);
        if (nightsCount > val) setNightsCount(val);
    };

    const handleNightsChange = (e) => {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        setNightsCount(Math.min(daysCount, val));
    };

    const handleGallery = (urls) => {
        setForm(f => ({ ...f, images: urls }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        const payload = {
            ...form,
            starting_price: form.starting_price ? parseFloat(form.starting_price) : null,
            accommodation_FK: form.accommodation_FK ? parseInt(form.accommodation_FK, 10) : null,
            guest_type_FK: form.guest_type_FK ? parseInt(form.guest_type_FK, 10) : null,
            board_type_FK: form.board_type_FK ? parseInt(form.board_type_FK, 10) : null,
            images: form.images.filter(Boolean),
            end_date: form.end_date || null,
        };
        
        try {
            if (isEditing) {
                await api.put(`/packages/${editRow.packages_ID}`, payload);
                showSuccess('Paquete actualizado exitosamente!');
            } else {
                await api.post('/packages', payload);
                showSuccess('Paquete creado exitosamente!');
            }
            setForm(defaultForm());
            setStep(1);
            if (onSaved) onSaved();
        } catch (err) {
            console.error('Error saving package:', err);
            showError('Error al guardar el paquete.');
        } finally { setSaving(false); }
    };

    const handleCreateLookup = (type) => async (newValue) => {
        try {
            const res = await api.post(`/lookups/${type}`, type === 'accommodations' ? { name: newValue } : { type: newValue });
            const idKey = type === 'accommodations' ? 'accommodation_ID' : type === 'guest-types' ? 'guest_type_ID' : 'board_type_ID';
            const formKey = type === 'accommodations' ? 'accommodation_FK' : type === 'guest-types' ? 'guest_type_FK' : 'board_type_FK';
            setForm(f => ({ ...f, [formKey]: String(res.data[idKey]) }));
            if (onSaved) onSaved();
        } catch (err) { showError('Error al crear opción.'); }
    };

    return (
        <div id="form-paquete">
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
                    <h2 className="text-lg font-extrabold text-[#001f6c]">{isEditing ? 'Editar Paquete' : 'Crear un Nuevo Paquete'}</h2>
                </div>
                <div className="p-6">
                    <StepIndicator current={step} />
                    <div>
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <FormInput label="Nombre del Paquete" id="pkg-name" value={form.name} onChange={set('name')} required />
                                    <FormSelectCreatable label="Alojamiento / Hotel" id="pkg-accommodation" options={lookups.accommodations.map(a => ({ value: a.accommodation_ID, label: a.name }))} value={form.accommodation_FK} onChange={handleAccommodationChange} onCreateOption={handleCreateLookup('accommodations')} createPlaceholder="Añadir nuevo alojamiento…" required />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormInput label="Días" type="number" min="0" value={daysCount} onChange={handleDaysChange} />
                                        <FormInput label="Noches" type="number" min="0" max={daysCount} value={nightsCount} onChange={handleNightsChange} />
                                    </div>
                                    <FormInput label="Precio ($)" id="pkg-precio" type="number" min="0" step="0.01" value={form.starting_price} onChange={set('starting_price')} required />
                                    <FormInput label="Fecha Fin (Opcional)" id="pkg-end_date" type="date" value={form.end_date} onChange={set('end_date')} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormSelectCreatable label="Modalidad de Tarifa" id="pkg-guest" options={lookups.guestTypes.map(g => ({ value: g.guest_type_ID, label: g.type }))} value={form.guest_type_FK} onChange={set('guest_type_FK')} onCreateOption={handleCreateLookup('guest-types')} createPlaceholder="Añadir tarifa (Ej: Por Persona)…" required />
                                    <FormSelectCreatable label="Régimen" id="pkg-board" options={lookups.boardTypes.map(b => ({ value: b.board_type_ID, label: boardLabel(b.type) }))} value={form.board_type_FK} onChange={set('board_type_FK')} onCreateOption={handleCreateLookup('board-types')} createPlaceholder="Añadir nuevo régimen…" required />
                                </div>
                                <div className="flex gap-6">
                                    <FormCheckbox label="Paquete Activo" id="pkg-activo" checked={form.isActive} onChange={set('isActive')} />
                                    <FormCheckbox label="Paquete Destacado" id="pkg-destacado" checked={form.isFeatured} onChange={set('isFeatured')} />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormImageUpload label="URL del Banner" id="pkg-banner" value={form.banner} onChange={set('banner')} />
                                        <FormImageUpload label="URL del Thumbnail" id="pkg-thumbnail" value={form.thumbnail} onChange={set('thumbnail')} />
                                    </div>
                                    <div>
                                        {(form.banner || form.thumbnail) && (
                                            <div className="flex gap-3 mb-2">
                                                {form.banner && <div className="flex-1"><p className="text-[10px] font-semibold text-[#001f6c]/60 uppercase mb-1">Banner</p><img src={getImageUrl(form.banner)} alt="Banner" className="w-full h-24 object-cover rounded-lg border border-gray-200" onError={(e) => e.target.style.display = 'none'} /></div>}
                                                {form.thumbnail && <div className="w-24"><p className="text-[10px] font-semibold text-[#001f6c]/60 uppercase mb-1">Thumbnail</p><img src={getImageUrl(form.thumbnail)} alt="Thumbnail" className="w-24 h-24 object-cover rounded-lg border border-gray-200" onError={(e) => e.target.style.display = 'none'} /></div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <FormGalleryUpload label="URLs de Galería" id="pkg-images" value={form.images} onChange={handleGallery} />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormTextarea label="Resumen Corto" id="pkg-overview" rows={3} value={form.overview} onChange={set('overview')} required />
                                        <FormTextarea label="Información Completa" id="pkg-info" rows={6} value={form.information} onChange={set('information')} />
                                    </div>
                                    <FormFeatureList label="Servicios y Amenidades Incluidos" id="pkg-features" value={form.features} onChange={(arr) => setForm(f => ({ ...f, features: arr }))} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                            <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#001f6c]/60 hover:border-[#001f6c]/30 hover:text-[#001f6c] disabled:opacity-30 transition-all"><ArrowLeftIcon className="w-4 h-4" /> Anterior</button>
                            <div className="flex items-center gap-2">{STEPS.map(s => <button key={s.id} type="button" onClick={() => setStep(s.id)} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-[#001f6c] w-4' : step > s.id ? 'bg-[#ed6f00]' : 'bg-gray-200'}`} />)}</div>
                            {step < STEPS.length ? (
                                <button type="button" onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001f6c] text-white text-sm font-semibold hover:bg-[#001f6c]/90 transition-all"><ArrowRightIcon className="w-4 h-4" /> Siguiente</button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#ed6f00] text-white text-sm font-bold hover:bg-[#ed6f00]/90 disabled:opacity-60 transition-all">{saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Paquete'}</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Page Main Component ───────────────────────────────────────────────────────
const Paquetes = () => {
    useDocumentTitle('Paquetes');
    const [packages, setPackages] = useState([]);
    const [lookups, setLookups] = useState({ accommodations: [], guestTypes: [], boardTypes: [] });
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pkgRes, lookupsRes] = await Promise.all([api.get('/packages'), api.get('/lookups')]);
            
            const rawPackages = Array.isArray(pkgRes.data) ? pkgRes.data : [];
            // Lógica de des-duplicación por ID para asegurar limpieza en la tabla
            const uniquePackages = Array.from(new Map(rawPackages.map(item => [item.packages_ID, item])).values());

            setPackages(uniquePackages.map(p => ({ 
                ...p, 
                'post.name': p.post?.name, 
                'accommodation.post.name': p.accommodation?.post?.name, 
                'guest_type.name': p.guestType?.type, 
                'board_type.name': p.boardType?.type 
            })));
            
            setLookups({ 
                accommodations: lookupsRes.data.accommodations || [], 
                guestTypes: lookupsRes.data.guest_types || [], 
                boardTypes: lookupsRes.data.board_types || [] 
            });
        } catch (err) { 
            console.error(err);
            showError('Error de conexión con el servidor.');
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    // ── Acción de Archivar / Reactivar ──────────────────────────────────────
    const handleArchive = async (row) => {
        const accion = row.isActive ? 'archivar (desactivar)' : 'reactivar';
        if (!await showConfirm(`¿Deseas ${accion} "${row['post.name']}"?`)) return;
        
        try {
            // Enviamos solo el cambio de estado al controlador
            await api.put(`/packages/${row.packages_ID}`, { isActive: !row.isActive });
            fetchData();
            showSuccess(`Paquete ${row.isActive ? 'archivado' : 'reactivado'} exitosamente.`);
        } catch (err) { showError('Error al cambiar el estado.'); }
    };

    // ── Acción de Eliminar Definitivamente ──────────────────────────
    const handleDelete = async (row) => {
        if (!await showConfirm(`¿ELIMINAR DEFINITIVAMENTE "${row['post.name']}"?\nEsta acción borrará el post y las imágenes asociadas.`)) return;
        
        try {
            await api.delete(`/packages/${row.packages_ID}`);
            fetchData();
            showSuccess('Paquete eliminado definitivamente.');
        } catch (err) { showError('Error al eliminar el paquete.'); }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-300">
            {loading ? <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-b-2 border-[#ed6f00] rounded-full" /></div> : (
                <AdminTable 
                    title="Paquetes" 
                    newLabel="Nuevo Paquete" 
                    columns={COLUMNS} 
                    data={packages} 
                    pageSize={10} 
                    onNew={() => { setEditRow(null); document.getElementById('form-paquete')?.scrollIntoView({ behavior: 'smooth' }); }} 
                    onEdit={(r) => { setEditRow(r); document.getElementById('form-paquete')?.scrollIntoView({ behavior: 'smooth' }); }} 
                    onArchive={handleArchive} 
                    onDelete={handleDelete} 
                />
            )}
            <PaqueteForm lookups={lookups} editRow={editRow} onSaved={() => { setEditRow(null); fetchData(); }} onCancelEdit={() => setEditRow(null)} />
        </div>
    );
};

export default Paquetes;