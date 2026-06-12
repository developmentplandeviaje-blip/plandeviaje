import React from 'react';
import { showError } from '../../utils/swal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import featureIcons from '../../utils/featureIcons';
import { PlusIcon, ImagesIcon, CheckIcon, MapPinIcon, XIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import api, { getRawBaseURL } from '../../api/axios';

// Fix Marker URL default issue in react-leaflet
if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

// ─── Predefined services catalogue ───────────────────────────────────────────
const PREDEFINED_SERVICES = [
    { icon: 'wifi', label: 'WiFi Libre' },
    { icon: 'pool', label: 'Piscina' },
    { icon: 'spa', label: 'Spa' },
    { icon: 'gym', label: 'Gimnasio' },
    { icon: 'restaurant', label: 'Restaurante' },
    { icon: 'bar', label: 'Bar' },
    { icon: 'clock', label: 'Recepción 24h' },
    { icon: 'ac', label: 'Aire Acondicionado' },
    { icon: 'parking', label: 'Estacionamiento' },
    { icon: 'beach', label: 'Acceso a Playa' },
    { icon: 'kids', label: 'Área Infantil' },
    { icon: 'shuttle', label: 'Transporte' },
    { icon: 'laundry', label: 'Lavandería' },
    { icon: 'safe', label: 'Caja Fuerte' },
    { icon: 'tv', label: 'Smart TV' },
    { icon: 'phone', label: 'Teléfono' },
    { icon: 'elevator', label: 'Ascensor' },
    { icon: 'tennis', label: 'Cancha Deportiva' },
];

const ICON_OPTIONS = Object.keys(featureIcons);

/**
 * FormFeatureList — toggleable predefined services grid + custom service row.
 * Produces a [{icon, label}] array.
 */
export const FormFeatureList = ({ label, id, value = [], onChange, predefinedServices = PREDEFINED_SERVICES }) => {
    const [showCustom, setShowCustom] = React.useState(false);
    const [customIcon, setCustomIcon] = React.useState(ICON_OPTIONS[0] || 'wifi');
    const [customLabel, setCustomLabel] = React.useState('');
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const pickerRef = React.useRef(null);

    const isPredefined = (svc) =>
        predefinedServices.some(p => p.icon === svc.icon && p.label === svc.label);
        
    const isActive = (svc) => value.some(v => v.icon === svc.icon && v.label === svc.label);
    
    const toggleService = (svc) => {
        if (isActive(svc)) {
            onChange(value.filter(v => !(v.icon === svc.icon && v.label === svc.label)));
        } else {
            onChange([...value, { icon: svc.icon, label: svc.label }]);
        }
    };

    const handleAddCustom = () => {
        if (!customLabel.trim()) return;
        onChange([...value, { icon: customIcon, label: customLabel.trim() }]);
        setCustomLabel('');
        setShowCustom(false);
    };
    
    const handleRemove = (item) =>
        onChange(value.filter(v => !(v.icon === item.icon && v.label === item.label)));
        
    React.useEffect(() => {
        const handleOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);
    
    const customServices = value.filter(v => !isPredefined(v));
    const SelectedCustomIcon = featureIcons[customIcon];
    
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="w-full rounded-lg border border-[#ed6f00]/50 bg-white p-3 flex flex-col gap-3">

                {/* ── Predefined services grid ── */}
                <div className="flex flex-wrap gap-2">
                    {predefinedServices.map((svc) => {
                        const Icon = featureIcons[svc.icon];
                        const active = isActive(svc);
                        return (
                             <button key={svc.icon + svc.label} type="button"
                                onClick={() => toggleService(svc)}
                                title={active ? `Quitar ${svc.label}` : `Agregar ${svc.label}`}
                                 className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all select-none
                                    ${active
                                        ? 'bg-[#ed6f00] border-[#ed6f00] text-white shadow-sm'
                                        : 'bg-[#f4f7fb] border-[#ed6f00]/20 text-[#001f6c]/70 hover:border-[#ed6f00]/50 hover:text-[#001f6c]'}`}
                            >
                                 {Icon && <span className="flex items-center">{React.cloneElement(Icon, { className: 'w-3.5 h-3.5' })}</span>}
                                {svc.label}
                                {active && <CheckIcon weight="bold" className="ml-0.5 opacity-80 w-3 h-3" />}
                              </button>
                        );
                    })}
                </div>

                {/* ── Custom (non-predefined) services ── */}
                {customServices.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                         <span className="text-[10px] w-full text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Personalizados</span>
                        {customServices.map((item, i) => {
                            const ChipIcon = featureIcons[item.icon];
                            return (
                                <span key={i} className="flex items-center gap-1.5 bg-[#f4f7fb] text-[#001f6c] pl-2 pr-1.5 py-1 rounded-full text-xs font-semibold border border-[#ed6f00]/20">
                                    {ChipIcon && <span className="text-[#ed6f00] flex items-center">{React.cloneElement(ChipIcon, { className: 'w-3.5 h-3.5' })}</span>}
                                     {item.label}
                                    <button type="button" onClick={() => handleRemove(item)}
                                         className="text-gray-400 hover:text-red-500 transition-colors">
                                        <XIcon weight="bold" className="w-3.5 h-3.5" />
                                    </button>
                                 </span>
                            );
                        })}
                    </div>
                )}

                {/* ── Add custom service ── */}
                <div className="border-t border-gray-100 pt-2">
                    {!showCustom ? (
                        <button type="button" onClick={() => setShowCustom(true)}
                            className="flex items-center gap-1.5 text-xs text-[#001f6c]/50 hover:text-[#ed6f00] font-semibold transition-colors">
                            <PlusIcon className="w-3.5 h-3.5"  />
                             Añadir servicio personalizado
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center">
                             <div className="relative" ref={pickerRef}>
                                <button type="button" onClick={() => setPickerOpen(v => !v)}
                                     className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#ed6f00]/40 bg-[#f4f7fb] text-[#ed6f00] hover:border-[#ed6f00] transition-colors"
                                    title={customIcon}>
                                    {SelectedCustomIcon
                                        ? React.cloneElement(SelectedCustomIcon, { className: 'w-4 h-4' })
                                        : <span className="text-[10px]">{customIcon}</span>}
                                </button>
                                 {pickerOpen && (
                                    <div className="absolute top-full left-0 z-50 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-2 overflow-y-auto max-h-48">
                                         <div className="grid grid-cols-6 gap-1">
                                            {ICON_OPTIONS.map((key) => {
                                                const Icon = featureIcons[key];
                                                return (
                                                     <button key={key} type="button" title={key}
                                                        onClick={() => { setCustomIcon(key); setPickerOpen(false); }}
                                                         className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all
                                                            ${customIcon === key ? 'bg-[#ed6f00] text-white' : 'text-[#001f6c]/60 hover:bg-[#f4f7fb] hover:text-[#ed6f00]'}`}>
                                                        {Icon ? React.cloneElement(Icon, { className: 'w-4 h-4' }) : null}
                                                    </button>
                                                 );
                                            })}
                                        </div>
                                    </div>
                                 )}
                            </div>
                            <input id={id} type="text" value={customLabel}
                                 onChange={(e) => setCustomLabel(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
                                placeholder="Nombre del servicio…"
                                autoFocus
                                 className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-[#ed6f00]"
                            />
                            <button type="button" onClick={handleAddCustom}
                                className="text-[#ed6f00] font-bold hover:scale-110 transition-transform">
                                <PlusIcon weight="bold" className="w-5 h-5" />
                            </button>
                            <button type="button" onClick={() => { setShowCustom(false); setCustomLabel(''); }}
                                className="text-gray-400 hover:text-red-500 transition-colors">
                                <XIcon weight="bold" className="w-4 h-4" />
                            </button>
                         </div>
                    )}
                </div>

            </div>
        </div>
    );
};



/**
 * FormSelectCreatable — single-select dropdown with inline option creation.
 * Matches the pattern of FormMultiSelect but for single-value fields.
 *
 * @param {string}   label
 * @param {string}   id
 * @param {Array}    options          — [{ value, label }]
 * @param {*}        value            — currently selected value
 * @param {Function} onChange         — (e) => void  (same API as FormSelect)
 * @param {Function} onCreateOption   — async (newLabel: string) => void
 */
export const FormSelectCreatable = ({ label, id, options = [], value, onChange, onCreateOption, createPlaceholder = "Añadir nuevo…", ...rest }) => {
    const [newOption, setNewOption] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreate = async () => {
        if (!newOption.trim() || !onCreateOption) return;
        try {
            setIsCreating(true);
            await onCreateOption(newOption.trim());
            setNewOption('');
        } catch (e) {
            console.error('Error creating option', e);
        } finally {
            setIsCreating(false);
        }
    };
    
    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <select
                id={id}
                value={value}
                onChange={onChange}
                 className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition appearance-none cursor-pointer"
                {...rest}
            >
                <option value="">Seleccionar…</option>
                {options.map((o, index) => (
                    // SOLUCIÓN: Agregamos el index a la key para evitar duplicados si los datos de la base vienen con IDs iguales
                     <option key={`${o.value ?? o}-${index}`} value={o.value ?? o}>{o.label ?? o}</option>
                ))}
            </select>
            {onCreateOption && (
                <div className="flex gap-2 items-center mt-1">
                    <input
                         type="text"
                        placeholder={createPlaceholder}
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
                        className="flex-1 rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-1.5 text-xs text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition"
                    />
                    <button
                         type="button"
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="bg-[#ed6f00] hover:bg-[#ed6f00]/80 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow disabled:opacity-50 transition-colors"
                     >
                        {isCreating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusIcon weight="bold" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export const FormMultiSelect = ({ label, id, options = [], value = [], onChange, onCreateOption, ...rest }) => {
    const [newOptionUrl, setNewOptionUrl] = React.useState('');
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreate = async () => {
        if (!newOptionUrl.trim() || !onCreateOption) return;
        try {
            setIsCreating(true);
            await onCreateOption(newOptionUrl.trim());
            setNewOptionUrl('');
        } catch (e) {
            console.error('Error creating option', e);
        } finally {
            setIsCreating(false);
        }
    };
    
    // A simple multi-select using checkboxes styled like a select box area
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="w-full rounded-lg border border-[#ed6f00]/50 bg-white p-3 text-sm flex flex-wrap gap-x-5 gap-y-2">
                {options.map((o, index) => {
                     const optValue = o.value ?? o;
                    const optLabel = o.label ?? o;
                    return (
                        // SOLUCIÓN: Usamos index en la key aquí también por si acaso
                        <label key={`${optValue}-${index}`} className="flex items-center gap-2 cursor-pointer select-none">
                             <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#ed6f00] cursor-pointer"
                                 checked={value.includes(optValue)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                         onChange([...value, optValue]);
                                    } else {
                                        onChange(value.filter(v => v !== optValue));
                                    }
                                }}
                            />
                            <span className="text-[#001f6c]">{optLabel}</span>
                         </label>
                    );
                })}
            </div>
            {onCreateOption && (
                <div className="flex gap-2 items-center mt-1">
                    <input
                        type="text"
                         placeholder="Añadir nueva opción..."
                        value={newOptionUrl}
                        onChange={(e) => setNewOptionUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
                        className="flex-1 rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-1.5 text-xs text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition"
                    />
                    <button
                         type="button"
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="bg-[#ed6f00] hover:bg-[#ed6f00]/80 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow disabled:opacity-50 transition-colors"
                     >
                        {isCreating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusIcon weight="bold" />}
                    </button>
                </div>
            )}
        </div>
    );
};

export const FormDynamicList = ({ label, id, value = [], onChange, placeholder = 'Añadir ítem...', ...rest }) => {
    const list = Array.isArray(value) ? value : [];
    const [newItem, setNewItem] = React.useState('');

    const handleAdd = () => {
        if (!newItem.trim()) return;
        const newList = [...list, newItem.trim()];
        onChange(newList);
        setNewItem('');
    };

    const handleRemove = (index) => {
        const newList = list.filter((_, i) => i !== index);
        onChange(newList);
    };

    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="w-full rounded-lg border border-[#ed6f00]/50 bg-white p-3 text-sm flex flex-col gap-3 min-h-[100px]">
                <div className="flex gap-2">
                    <input
                         id={id}
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                        placeholder={placeholder}
                        className="flex-1 border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-[#ed6f00]"
                         {...rest}
                    />
                    <button type="button" onClick={handleAdd} className="text-[#ed6f00] hover:scale-110 transition-transform">
                        <PlusIcon weight="bold" className="w-5 h-5" />
                    </button>
                 </div>
                {list.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                        {list.map((item, index) => (
                             <li key={index} className="flex items-center gap-1.5 bg-[#f4f7fb] text-[#001f6c] px-3 py-1 rounded-full text-xs font-semibold border border-[#ed6f00]/20 shadow-sm">
                                <span>{item}</span>
                                <button type="button" onClick={() => handleRemove(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                     <XIcon weight="bold" className="w-3.5 h-3.5" />
                                </button>
                            </li>
                         ))}
                    </ul>
                )}
            </div>
        </div>
    );
};


export const FormInput = ({ label, id, type = 'text', placeholder = '', ...rest }) => (
    <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition"
            {...rest}
        />
    </div>
);

export const FormImageUpload = ({ label, id, value = '', onChange }) => {
    const [uploading, setUploading] = React.useState(false);
    
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('image', file);
        try {
            setUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const localUrl = getRawBaseURL() + res.data.url;
            onChange({ target: { value: localUrl } });
        } catch (error) {
            console.error("Upload error", error);
            showError("Error uploading image");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="flex gap-2 items-center">
                <input
                    id={id}
                     type="text"
                    value={value || ''}
                    onChange={onChange}
                    placeholder="URL o sube un archivo..."
                    className="flex-1 rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition"
                />
                <label className={`shrink-0 flex items-center justify-center h-[38px] px-4 rounded-lg bg-[#f4f7fb] text-[#ed6f00] font-bold text-sm cursor-pointer border border-[#ed6f00]/30 hover:bg-[#ed6f00] hover:text-white transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? 'Subiendo...' : 'Subir'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
        </div>
    );
};

export const FormGalleryUpload = ({ label, id, value = [], onChange }) => {
    const [uploading, setUploading] = React.useState(false);
    
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        const newUrls = [];
        
        for (const file of files) {
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const localUrl = getRawBaseURL() + res.data.url;
                newUrls.push(localUrl);
            } catch (err) {
                console.error("Img upload failed");
            }
        }
        
        onChange([...(Array.isArray(value) ? value : []), ...newUrls]);
        setUploading(false);
        e.target.value = null; // reset input
    };

    const textValue = Array.isArray(value) ? value.join('\n') : '';
    const handleTextChange = (e) => {
        const urls = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
        onChange(urls);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end mb-1">
                {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label} <span className="font-normal text-gray-400">(una por línea)</span></label>}
                <label className={`text-[11px] font-bold px-3 py-1 rounded bg-[#ed6f00] text-white cursor-pointer hover:bg-[#ed6f00]/80 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                     {uploading ? 'Subiendo...' : '+ Subir Archivos'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
            </div>
            <textarea id={id} rows={6} value={textValue} onChange={handleTextChange} placeholder="https://..." wrap="off" className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition font-mono whitespace-pre" />
            <p className="text-[11px] text-gray-400">{Array.isArray(value) ? value.length : 0} imágenes</p>
        </div>
    );
};

export const FormSelect = ({ label, id, options = [], ...rest }) => (
    <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
        <select
            id={id}
            className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition appearance-none cursor-pointer"
            {...rest}
        >
            <option value="">Seleccionar…</option>
            {options.map((o, index) => (
                // SOLUCIÓN: Agregamos el index a la key para evitar duplicados en selects normales
                <option key={`${o.value ?? o}-${index}`} value={o.value ?? o}>{o.label ?? o}</option>
            ))}
        </select>
    </div>
);

export const FormTextarea = ({ label, id, rows = 4, placeholder = '', ...rest }) => (
    <div className="flex flex-col gap-1">
        {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
        <textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition resize-y"
            {...rest}
        />
    </div>
);

export const FormCheckbox = ({ label, id, ...rest }) => (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
        <input
            id={id}
            type="checkbox"
            className="w-4 h-4 accent-[#ed6f00] cursor-pointer"
            {...rest}
        />
        <span className="text-sm text-[#001f6c]">{label}</span>
     </label>
);

/** Single image upload placeholder slot */
export const ImageSlot = ({ label, large = false }) => (
    <label className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#f4f7fb] cursor-pointer hover:border-[#ed6f00] transition-colors group ${large ? 'h-32 w-full' : 'h-20 w-20'}`}>
        <ImagesIcon className="w-7 h-7 text-[#ed6f00] group-hover:scale-110 transition-transform" />
        {label && <span className="text-[10px] text-gray-400 mt-1">{label}</span>}
        <input type="file" accept="image/*" className="hidden" />
    </label>
);

/** Styled form card wrapper */
const FormCard = ({ title, onSubmit, submitLabel = 'Guardar', children }) => (
    <div className="bg-white rounded-2xl border border-[#ed6f00] shadow-sm overflow-hidden">
        <div className="bg-[#f4f7fb] border-b border-[#ed6f00]/30 px-6 py-4">
            <h2 className="text-lg font-extrabold text-[#001f6c]">{title}</h2>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
            {children}
            <div className="flex justify-center pt-2">
                <button
                    type="submit"
                    className="bg-[#ed6f00] hover:bg-[#ed6f00]/80 text-white font-bold text-sm px-10 py-2.5 rounded-full shadow transition-colors duration-200"
                >
                     {submitLabel}
                </button>
            </div>
        </form>
    </div>
);

export const FormPlaceSearch = ({ label, id, value = '', onChange, onSelect, placeholder = 'Ej: Hesperia Isla Margarita', category = '' }) => {
    const [query, setQuery] = React.useState(value || '');
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selected, setSelected] = React.useState(value || '');
    const [showDropdown, setShowDropdown] = React.useState(false);
    const debounceRef = React.useRef(null);
    const wrapperRef = React.useRef(null);
    
    // Sync internal query with incoming value
    React.useEffect(() => {
        if (value !== query) {
            setQuery(value || '');
            if (value) setSelected(value);
        }
    }, [value]);
    
    // Close dropdown on outside click
    React.useEffect(() => {
        const handleOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);
    
    const search = (q) => {
        if (q.length < 3) { setResults([]); setShowDropdown(false); return; }
        setLoading(true);
        setShowDropdown(false);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const base = `https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1&q=${encodeURIComponent(q.trim())}`;
            try {
                // Run Nueva-Esparta-hinted VE + plain VE + global in parallel
                const [neData, veData, globalData] = await Promise.all([
                     fetch(`${base}&countrycodes=ve&viewbox=-64.5,11.2,-63.7,10.7`).then(r => r.json()).catch(() => []),
                    fetch(`${base}&countrycodes=ve`).then(r => r.json()).catch(() => []),
                    fetch(base).then(r => r.json()).catch(() => []),
                ]);
                // Merge: Venezuela results first, then global, deduped by place_id
                 const seen = new Set();
                const merged = [];
                for (const item of [...neData, ...veData, ...globalData]) {
                    if (!seen.has(item.place_id)) {
                         seen.add(item.place_id);
                        merged.push(item);
                        if (merged.length >= 10) break;
                    }
                }
                setResults(merged);
            } catch (err) {
                console.error('[PlaceSearch] error:', err);
                setResults([]);
            }
            setShowDropdown(true);
            setLoading(false);
        }, 500);
    };
    
    const handleSelect = (place) => {
        setQuery(place.display_name);
        setSelected(place.display_name);
        setShowDropdown(false);
        setResults([]);
        onChange({ target: { value: place.display_name } });
        if (onSelect) onSelect(place);
    };
    
    const handleChange = (e) => {
        const q = e.target.value;
        setQuery(q);
        setSelected('');
        onChange({ target: { value: q } });
        search(q);
    };

    return (
        <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
            {label && <label htmlFor={id} className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="relative">
                <input
                    id={id}
                     type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder={placeholder}
                     autoComplete="off"
                    className="w-full rounded-lg border border-[#ed6f00]/50 bg-white px-3 py-2 text-sm text-[#001f6c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed6f00]/40 transition pr-8"
                />
                {loading && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#ed6f00] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {selected && !loading && (
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckIcon className="w-4 h-4"  />
                    </div>
                )}
            </div>

             {showDropdown && results.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((place) => (
                        <li key={place.place_id} onClick={() => handleSelect(place)}
                             className="flex items-start gap-2 px-3 py-2.5 cursor-pointer hover:bg-[#f4f7fb] text-sm border-b border-gray-50 last:border-0 transition-colors">
                            <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#ed6f00]"  />
                            <span className="text-[#001f6c] leading-tight">{place.display_name}</span>
                         </li>
                    ))}
                </ul>
            )}

            {showDropdown && results.length === 0 && query.length >= 3 && !loading && (
                 <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
                    Sin resultados para &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    );
};

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) { if (onClick) onClick(e.latlng); }
    });
    return null;
}

function MapRecenter({ center }) {
    const map = useMapEvents({});
    React.useEffect(() => {
        if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
}

export const FormInteractiveMap = ({ label, id, value = '', onChange, centerCoords }) => {
    const [coords, setCoords] = React.useState(null);
    
    React.useEffect(() => {
        if (value && value.includes(',')) {
            const [lat, lon] = value.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lon)) setCoords([lat, lon]);
        } else if (centerCoords) {
            setCoords([centerCoords.lat, centerCoords.lon]);
        }
    }, [value, centerCoords]);
    
    const handleClick = (latlng) => {
        const str = `${latlng.lat},${latlng.lng}`;
        setCoords([latlng.lat, latlng.lng]);
        onChange({ target: { value: str } });
    };

    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs font-semibold text-[#001f6c]">{label}</label>}
            <div className="h-64 w-full rounded-xl border border-[#ed6f00]/30 overflow-hidden shadow-sm z-0">
                <MapContainer center={coords || [10.95, -63.85]} zoom={coords ? 13 : 8} style={{ height: '100%', width: '100%' }}>
                     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                    {coords && <Marker position={coords} />}
                    <MapClickHandler onClick={handleClick} />
                    {centerCoords && <MapRecenter center={[centerCoords.lat, centerCoords.lon]} />}
                </MapContainer>
            </div>
            {coords && coords.length >= 2 && (
                <p className="text-[10px] text-gray-400 mt-1">
                    Coordenadas seleccionadas: {Number(coords[0]).toFixed(5)}, {Number(coords[1]).toFixed(5)}
                </p>
            )}
        </div>
    );
};

export default FormCard;