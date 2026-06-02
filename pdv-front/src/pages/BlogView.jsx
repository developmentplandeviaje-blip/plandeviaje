import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageHandler';
// Imagen para el banner del blog
import bannerCanaima from '../assets/bannercanaima.jpg';
import { 
    MagnifyingGlassIcon, 
    CalendarBlankIcon, 
    CaretLeftIcon, 
    CaretRightIcon,
    MapPinIcon,
    Tree,
    CompassIcon,
    TagIcon
} from '@phosphor-icons/react';

const BlogView = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [lookups, setLookups] = useState({ categories: [], tags: [] });
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6; 

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [showMobileTags, setShowMobileTags] = useState(false);
    
    // Tag Pagination logic
    const [tagPage, setTagPage] = useState(0);
    const [tagsPerPage, setTagsPerPage] = useState(5);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 768) setTagsPerPage(5);        // Mobile: 5 total
            else if (w < 1024) setTagsPerPage(3);  // Tablet: 3 total
            else if (w < 1280) setTagsPerPage(4);  // Laptop: 4 total
            else setTagsPerPage(5);                // Desktop: 5 total
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const PRIMARY_TAG_NAMES = [
        'ALQUILER DE VEHICULOS', 
        'AVENTURA EXTREMA', 
        'CIUDAD', 
        'DESTINOS DE PLAYA'
    ];

    // Helper to sort and get paginated tags
    const getPaginatedTags = () => {
        const sortedTags = [...lookups.tags].sort((a, b) => {
            const indexA = PRIMARY_TAG_NAMES.indexOf(a.name.toUpperCase());
            const indexB = PRIMARY_TAG_NAMES.indexOf(b.name.toUpperCase());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

        // Add TODOS as the first tag
        const allTags = [{ blog_tag_ID: null, name: 'TODOS' }, ...sortedTags];

        const start = tagPage * tagsPerPage;
        return allTags.slice(start, start + tagsPerPage);
    };

    const paginatedTags = getPaginatedTags();
    const totalTagPages = Math.ceil((lookups.tags.length + 1) / tagsPerPage);

    useEffect(() => {
        const loadBlogData = async () => {
            try {
                setLoading(true);
                const [blogRes, lookupsRes] = await Promise.all([
                    api.get('/blog-posts'),
                    api.get('/lookups')
                ]);
                setPosts(blogRes.data);
                setFilteredPosts(blogRes.data);
                setLookups({
                    categories: lookupsRes.data.blog_categories || [],
                    tags: lookupsRes.data.blog_tags || []
                });
            } catch (err) {
                console.error("Error cargando el blog:", err);
            } finally {
                setLoading(false);
            }
        };
        loadBlogData();
    }, []);

    useEffect(() => {
        let result = posts;
        if (searchTerm) {
            result = result.filter(p => 
                p.post?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.post?.overview.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedTag) {
            result = result.filter(p => p.tags?.some(t => t.blog_tag_ID === selectedTag));
        }
        setFilteredPosts(result);
        setCurrentPage(1); 
    }, [searchTerm, selectedTag, posts]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 400, behavior: 'smooth' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Publicación reciente";
        // Reemplazamos el espacio por 'T' si es un formato SQL para que Safari/iOS lo entiendan bien
        const normalizedDate = typeof dateString === 'string' ? dateString.replace(' ', 'T') : dateString;
        const date = new Date(normalizedDate);
        if (isNaN(date.getTime())) return "Publicación reciente";
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Función para determinar el título de la sección de abajo según el tipo de post
    const getInspirationTitle = (name = "") => {
        const n = name.toLowerCase();
        if (n.includes('hotel') || n.includes('posada')) return "Tu hospedaje ideal";
        if (n.includes('top') || n.includes('mejores')) return "Tu próxima aventura";
        if (n.includes('tips') || n.includes('recomendaciones')) return "Tips de experto";
        return "Recomendado para ti";
    };

    if (selectedPost) {
        return (
            <div className="min-h-screen bg-white animate-in fade-in duration-700 pb-20">
                <div className="max-w-7xl mx-auto px-6 pt-10">
                    <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-[#001f6c] font-bold hover:text-[#ed6f00] transition-all group">
                        <CaretLeftIcon weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Volver al listado
                    </button>
                </div>

                <main className="max-w-7xl mx-auto px-6 mt-12">
                    <div className="relative flex flex-col lg:flex-row gap-16 items-start">
                        <div className="w-full lg:w-1/2 relative">
                            <div className="rounded-[1rem] overflow-hidden shadow-2xl rotate-[-1deg]">
                                <img 
                                    src={getImageUrl(selectedPost.post?.thumbnail)} 
                                    className="w-full h-[600px] object-cover" 
                                    alt={selectedPost.post?.name} 
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ed6f00]/5 rounded-full blur-3xl -z-10"></div>
                        </div>

                        <div className="w-full lg:w-1/2 lg:pt-12">
                            <div className="bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl border border-gray-50 relative z-20 lg:-ml-24">
                                <span className="text-[#ed6f00] font-serif italic text-lg mb-2 block">Conoce...</span>
                                <h1 className="text-5xl font-bold text-[#001f6c] mb-8 leading-tight uppercase">{selectedPost.post?.name}</h1>
                                
                                <div className="flex items-center gap-2 text-[#ed6f00] font-bold text-sm mb-6 bg-orange-50 w-fit px-3 py-1.5 rounded-lg">
                                    <CalendarBlankIcon weight="bold" />
                                    <span>{selectedPost.post?.formatted_date}</span>
                                </div>

                                <p className="text-gray-500 leading-relaxed mb-10 text-lg">
                                    {selectedPost.post?.overview}
                                </p>

                                <div className="grid grid-cols-2 gap-8">
                                    {selectedPost.tags?.slice(0, 4).map((tag, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-[#001f6c]">
                                                <CompassIcon size={24} weight="duotone" />
                                            </div>
                                            <span className="text-xs font-black text-gray-700 uppercase tracking-wider">{tag.name}</span>
                                        </div>
                                    ))}
                                    {(!selectedPost.tags || selectedPost.tags.length === 0) && (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-[#001f6c]"><MapPinIcon size={24} /></div>
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Venezuela</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-[#001f6c]"><Tree size={24} /></div>
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-wider">Naturaleza</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 relative">
                        <div className="flex gap-8 flex-col lg:flex-row">
                            <div className="w-1.5 h-24 bg-[#ed6f00] shrink-0 rounded-full hidden lg:block"></div>
                            <div className="text-gray-600 leading-[1.8] text-lg font-light whitespace-pre-line">
                                {selectedPost.post?.information}
                            </div>
                        </div>
                        <div className="absolute right-0 -bottom-20 opacity-10 pointer-events-none">
                             <img src="/assets/sketch-house.png" className="w-64" alt="" onError={(e) => e.target.style.display='none'} />
                        </div>
                    </div>

                    <div className="mt-20 flex justify-end">
                        <div className="max-w-md text-right border-t border-gray-100 pt-8">
                            <h4 className="text-[#ed6f00] font-bold mb-2 uppercase tracking-widest text-xs">
                                {getInspirationTitle(selectedPost.post?.name)}
                            </h4>
                            <p className="text-[#001f6c] font-medium italic text-xl">
                                "Explora cada rincón de {selectedPost.post?.name} y déjate atrapar por su esencia inigualable."
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="w-full">
                <img src={bannerCanaima} className="w-full h-auto block" alt="Banner Blog" />
            </header>

            <section className="max-w-6xl mx-auto w-full px-4 -mt-12 sm:-mt-10 z-30">
                <div className="bg-white rounded-2xl shadow-md p-4 md:p-2 border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    {/* ELEMENTO SUPERIOR: BUSCADOR */}
                    <div className="relative flex-1 flex items-center bg-gray-50 md:bg-transparent rounded-xl md:rounded-none px-4 md:px-0 py-1 md:py-0 md:ml-6">
                        <MagnifyingGlassIcon className="text-gray-400 w-5 h-5 shrink-0" />
                        <input 
                            type="text"
                            placeholder="Buscar en el blog..."
                            className="w-full pl-3 pr-4 py-2.5 md:py-2 focus:outline-none text-gray-600 font-medium bg-transparent text-sm md:text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* ELEMENTO INFERIOR: BOTÓN / ETIQUETAS */}
                    <div className="flex md:items-center md:pr-1">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full">
                            {/* Botón Principal (Mobile: ETIQUETAS) */}
                            <button 
                                onClick={() => setShowMobileTags(!showMobileTags)}
                                className="md:hidden bg-[#ed6f00] text-white px-8 py-4 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg shadow-orange-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <TagIcon weight="bold" size={18} />
                                ETIQUETAS
                            </button>
                            
                            {/* Filtros de Escritorio */}
                            <div className="hidden md:flex items-center gap-2">
                                {/* Pager Anterior */}
                                {tagPage > 0 && (
                                    <button 
                                        onClick={() => setTagPage(p => p - 1)}
                                        className="p-2 rounded-full bg-gray-50 text-[#001f6c] hover:bg-gray-100 transition-colors"
                                        title="Anterior"
                                    >
                                        <CaretLeftIcon weight="bold" />
                                    </button>
                                )}

                                {paginatedTags.map(tag => (
                                    <button 
                                        key={tag.blog_tag_ID} 
                                        onClick={() => {
                                            setSelectedTag(tag.blog_tag_ID);
                                            if (tag.blog_tag_ID === null) setTagPage(0);
                                        }} 
                                        className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${selectedTag === tag.blog_tag_ID ? 'bg-[#ed6f00] text-white shadow-lg shadow-orange-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        {tag.name.toUpperCase()}
                                    </button>
                                ))}

                                {/* Pager Siguiente */}
                                {tagPage < totalTagPages - 1 && (
                                    <button 
                                        onClick={() => setTagPage(p => p + 1)}
                                        className="p-2 rounded-full bg-gray-50 text-[#001f6c] hover:bg-gray-100 transition-colors"
                                        title="Siguiente"
                                    >
                                        <CaretRightIcon weight="bold" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MENÚ DE ETIQUETAS MÓVIL (DESPLEGABLE) */}
                {showMobileTags && (
                    <div className="md:hidden mt-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {paginatedTags.map(tag => (
                                    <button 
                                        key={tag.blog_tag_ID} 
                                        onClick={() => { 
                                            setSelectedTag(tag.blog_tag_ID); 
                                            setShowMobileTags(false); 
                                            if (tag.blog_tag_ID === null) setTagPage(0);
                                        }} 
                                        className={`px-5 py-3 rounded-xl text-[11px] font-black tracking-widest transition-all flex-1 min-w-[120px] ${selectedTag === tag.blog_tag_ID ? 'bg-[#ed6f00] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {tag.name.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Paginador Móvil */}
                            {totalTagPages > 1 && (
                                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                    <button 
                                        disabled={tagPage === 0}
                                        onClick={() => setTagPage(p => Math.max(0, p - 1))}
                                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter ${tagPage === 0 ? 'opacity-20' : 'text-[#ed6f00]'}`}
                                    >
                                        <CaretLeftIcon weight="bold" /> Anterior
                                    </button>
                                    <span className="text-[10px] font-black text-gray-300">
                                        PÁGINA {tagPage + 1} / {totalTagPages}
                                    </span>
                                    <button 
                                        disabled={tagPage >= totalTagPages - 1}
                                        onClick={() => setTagPage(p => Math.min(totalTagPages - 1, p + 1))}
                                        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter ${tagPage >= totalTagPages - 1 ? 'opacity-20' : 'text-[#ed6f00]'}`}
                                    >
                                        Siguiente <CaretRightIcon weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>

            <div className="max-w-7xl mx-auto w-full px-6 pt-16 pb-4 text-center">
                <h2 className="text-xs font-black tracking-[0.3em] text-[#001f6c] uppercase opacity-50 mb-2">Descubre tu próximo destino</h2>
                <h3 className="text-3xl font-black text-[#001f6c] uppercase italic">Explora el Blog</h3>
                <div className="h-1 w-12 bg-[#ed6f00] mx-auto mt-4"></div>
            </div>

            <main className="max-w-7xl mx-auto w-full px-6 py-12">
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ed6f00]"></div></div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
                            {filteredPosts.slice((currentPage-1)*6, currentPage*6).map((item) => (
                                <article key={item.blog_post_ID} className="bg-white group cursor-pointer" onClick={() => { setSelectedPost(item); window.scrollTo(0, 0); }}>
                                    <div className="relative aspect-[16/11] overflow-hidden rounded-[0.5rem] mb-6 shadow-lg">
                                        <img src={getImageUrl(item.post?.thumbnail || item.post?.banner)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.post?.name} />
                                    </div>
                                    <div className="px-2">
                                        <div className="flex justify-between items-start mb-3">
                                            <h2 className="text-xl font-extrabold text-[#001f6c] leading-tight line-clamp-2 flex-1 group-hover:text-[#ed6f00] transition-colors uppercase italic">
                                                {item.post?.name}
                                            </h2>
                                            <div className="flex items-center gap-1 text-[#ed6f00] font-black text-[10px] bg-orange-50 px-2 py-1 rounded-md ml-4 whitespace-nowrap">
                                                <CalendarBlankIcon weight="bold" /> 
                                                <span>{item.post?.formatted_date}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 font-medium">
                                            {item.post?.overview}
                                        </p>
                                        <span className="text-[#ed6f00] font-black text-xs uppercase tracking-tighter flex items-center gap-1 group-hover:gap-3 transition-all">
                                            Ver detalles <CaretRightIcon weight="bold" />
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-24 flex justify-center items-center gap-4">
                             {[...Array(Math.ceil(filteredPosts.length / 6))].map((_, i) => (
                                <button key={i} onClick={() => paginate(i+1)} className={`w-12 h-12 rounded-full font-black text-sm transition-all ${currentPage === i+1 ? 'bg-[#ed6f00] text-white scale-110 shadow-xl' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                    {i+1}
                                </button>
                             ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default BlogView;