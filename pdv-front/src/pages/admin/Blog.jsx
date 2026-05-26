import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { showSuccess, showError, showConfirm } from '../../utils/swal';
import AdminTable from '../../components/dashboard/AdminTable';
import FormCard, {
    FormInput,
    FormSelectCreatable,
    FormMultiSelect,
    FormTextarea,
    FormImageUpload,
    FormGalleryUpload,
} from '../../components/dashboard/FormCard';
import { getImageUrl } from '../../utils/imageHandler';
import { 
    CheckIcon, 
    PencilSimpleIcon, 
    ArrowLeftIcon, 
    ArrowRightIcon, 
    ArticleIcon, 
    TagIcon, 
    ListIcon, 
    HouseIcon, 
    ImageIcon 
} from '@phosphor-icons/react';

// ── Thumbnail cell ────────────────────────────────────────────────────────────
const Thumb = ({ image }) => (
    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 mx-auto"
        style={{ background: 'linear-gradient(135deg, #001f6c, #001f6ccc)' }}>
        {image
            ? <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">BL</div>}
    </div>
);

// ── Table columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
    { key: 'thumb', label: 'Portada', tdClass: 'px-3 py-2 align-middle w-24', render: (_, row) => <Thumb image={row.post?.thumbnail || row.post?.banner} /> },
    { key: 'post.name', label: 'Título', sortable: true },
    { key: 'category.name', label: 'Categoría', sortable: true, render: (v) => v ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#001f6c] bg-[#f4f7fb] px-2.5 py-1 rounded-full border border-[#001f6c]/10"><ListIcon className="w-3.5 h-3.5" /> {v}</span> : '—' },
    { key: 'tags', label: 'Etiquetas', render: (_, row) => {
        const tags = row.tags || [];
        if (tags.length === 0) return '—';
        return (
            <div className="flex flex-wrap gap-1 max-w-[200px] mx-auto justify-center">
                {tags.slice(0, 2).map((t, i) => <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{t.name}</span>)}
                {tags.length > 2 && <span className="text-[10px] text-gray-400">+{tags.length - 2}</span>}
            </div>
        );
    }},
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
    blog_category_FK: '',
    tags: [], // array of IDs
    overview: '',
    information: '',
    banner: '',
    thumbnail: '',
    images: [],
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

// ── Blog Form ─────────────────────────────────────────────────────────────────
const BlogForm = ({ lookups, editRow, onSaved, onCancelEdit }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState(defaultForm());
    const [saving, setSaving] = useState(false);
    const isEditing = !!editRow;

    useEffect(() => {
        if (editRow) {
            setForm({
                name: editRow.post?.name || '',
                blog_category_FK: editRow.blog_category_FK != null ? String(editRow.blog_category_FK) : '',
                tags: (editRow.tags || []).map(t => t.blog_tag_ID),
                overview: editRow.post?.overview || '',
                information: editRow.post?.information || '',
                banner: editRow.post?.banner || '',
                thumbnail: editRow.post?.thumbnail || '',
                images: (editRow.post?.images || []).map(i => i.url),
            });
        } else {
            setForm(defaultForm());
        }
        setStep(1);
    }, [editRow]);

    const set = (k) => (e) =>
        setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleGallery = (urls) => {
        setForm(f => ({ ...f, images: urls }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        
        // Limpieza de datos antes del envío para evitar errores 500 en el servidor
        const payload = {
            ...form,
            // Convertimos a entero para la base de datos
            blog_category_FK: form.blog_category_FK ? parseInt(form.blog_category_FK, 10) : null,
            // Aseguramos que los tags sean un array de números
            tags: (form.tags || []).map(t => parseInt(t, 10)),
            // Sanitizamos URLs vacías
            banner: form.banner || null,
            thumbnail: form.thumbnail || null,
            images: (form.images || []).filter(Boolean),
        };

        try {
            if (isEditing) {
                await api.put(`/blog-posts/${editRow.blog_post_ID}`, payload);
                showSuccess('¡Publicación actualizada exitosamente!');
            } else {
                await api.post('/blog-posts', payload);
                showSuccess('¡Publicación creada exitosamente!');
            }
            setForm(defaultForm());
            setStep(1);
            if (onSaved) onSaved();
        } catch (err) {
            console.error('Error saving blog post:', err);
            showError(err.response?.data?.message || 'Error al guardar la publicación.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateLookup = (type) => async (newValue) => {
        try {
            const endpoint = type === 'blog-categories' ? 'blog-category' : 'blog-tag';
            const res = await api.post(`/lookups/${endpoint}`, { name: newValue });
            const idKey = type === 'blog-categories' ? 'blog_category_ID' : 'blog_tag_ID';
            
            if (type === 'blog-categories') {
                setForm(f => ({ ...f, blog_category_FK: String(res.data[idKey]) }));
            }
            if (onSaved) onSaved();
        } catch (err) {
            showError('Error al crear opción.');
        }
    };

    return (
        <div id="form-blog">
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
                    <h2 className="text-lg font-extrabold text-[#001f6c]">{isEditing ? 'Editar Publicación' : 'Crear Publicación de Blog'}</h2>
                </div>
                <div className="p-6">
                    <StepIndicator current={step} />
                    <div>
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in duration-200">
                                <FormInput label="Título de la Publicación" id="bl-name" value={form.name} onChange={set('name')} required />
                                <div className="grid grid-cols-1 gap-4">
                                    <FormSelectCreatable label="Categoría" id="bl-category" options={lookups.blogCategories.map(c => ({ value: c.blog_category_ID, label: c.name }))} value={form.blog_category_FK} onChange={set('blog_category_FK')} onCreateOption={handleCreateLookup('blog-categories')} createPlaceholder="Añadir nueva categoría…" required />
                                </div>
                                <FormMultiSelect label="Etiquetas" id="bl-tags" options={lookups.blogTags.map(t => ({ value: t.blog_tag_ID, label: t.name }))} value={form.tags} onChange={(selected) => setForm(f => ({ ...f, tags: selected }))} onCreateOption={handleCreateLookup('blog-tags')} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormImageUpload label="URL del Banner" id="bl-banner" value={form.banner} onChange={set('banner')} />
                                        <FormImageUpload label="URL del Thumbnail" id="bl-thumbnail" value={form.thumbnail} onChange={set('thumbnail')} />
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
                                    <FormGalleryUpload label="URLs de Galería" id="bl-images" value={form.images} onChange={handleGallery} />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <FormTextarea label="Resumen Corto (SEO)" id="bl-overview" rows={3} value={form.overview} onChange={set('overview')} required />
                                <FormTextarea label="Contenido Completo" id="bl-info" rows={8} value={form.information} onChange={set('information')} required />
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
                            <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#001f6c]/60 hover:border-[#001f6c]/30 hover:text-[#001f6c] disabled:opacity-30 transition-all"><ArrowLeftIcon className="w-4 h-4" /> Anterior</button>
                            <div className="flex items-center gap-2">{STEPS.map(s => <button key={s.id} type="button" onClick={() => setStep(s.id)} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-[#001f6c] w-4' : step > s.id ? 'bg-[#ed6f00]' : 'bg-gray-200'}`} />)}</div>
                            {step < STEPS.length ? (
                                <button type="button" onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#001f6c] text-white text-sm font-semibold hover:bg-[#001f6c]/90 transition-all"><ArrowRightIcon className="w-4 h-4" /> Siguiente</button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#ed6f00] text-white text-sm font-bold hover:bg-[#ed6f00]/90 disabled:opacity-60 transition-all">{saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Publicación'}</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const Blog = () => {
    useDocumentTitle('Administración de Blog');
    const [posts, setPosts] = useState([]);
    const [lookups, setLookups] = useState({ blogCategories: [], blogTags: [] });
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [blogRes, lookupsRes] = await Promise.all([api.get('/blog-posts'), api.get('/lookups')]);
            setPosts(blogRes.data.map(p => ({ ...p, 'post.name': p.post?.name, 'category.name': p.category?.name })));
            setLookups({ 
                blogCategories: lookupsRes.data.blog_categories || [], 
                blogTags: lookupsRes.data.blog_tags || [] 
            });
        } catch (err) { 
            console.error(err); 
            showError('Error al cargar datos del servidor.');
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleArchive = async (row) => {
        if (!await showConfirm(`¿Estás seguro de eliminar "${row['post.name']}"?`)) return;
        try { 
            await api.delete(`/blog-posts/${row.blog_post_ID}`); 
            fetchData(); 
            showSuccess('Eliminado correctamente.');
        } catch (err) { 
            showError('Error al eliminar la publicación.'); 
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-300">
            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin h-8 w-8 border-b-2 border-[#ed6f00] rounded-full" />
                </div>
            ) : (
                <AdminTable 
                    title="Gestión de Blog" 
                    newLabel="Nueva Entrada" 
                    columns={COLUMNS} 
                    data={posts} 
                    pageSize={10} 
                    onNew={() => { setEditRow(null); document.getElementById('form-blog')?.scrollIntoView({ behavior: 'smooth' }); }} 
                    onEdit={(r) => { setEditRow(r); document.getElementById('form-blog')?.scrollIntoView({ behavior: 'smooth' }); }} 
                    onArchive={handleArchive} 
                />
            )}
            <BlogForm 
                lookups={lookups} 
                editRow={editRow} 
                onSaved={() => { setEditRow(null); fetchData(); }} 
                onCancelEdit={() => setEditRow(null)} 
            />
        </div>
    );
};

export default Blog;