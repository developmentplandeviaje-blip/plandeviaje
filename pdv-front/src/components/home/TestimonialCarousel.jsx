import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CaretLeftIcon, CaretRightIcon, Star } from '@phosphor-icons/react';

import logoComentarios from "../../assets/comentarios.png";

const GAP = 24;

const getVisibleCount = (width) => {
    if (width >= 850) return 4;
    if (width >= 450) return 2;
    return 1;
};

/**
 * TestimonialCard con efecto flip al hacer hover.
 */
const TestimonialCard = ({ image, name, quote, stars }) => {
    return (
        // Usamos group/card para que el hover sea exclusivo de esta tarjeta
        <div className="w-full h-[260px] cursor-pointer group/card [perspective:1000px] transition-transform hover:scale-[1.02]">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                
                {/* --- FRENTE --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-xl shadow-md border border-gray-100 flex flex-col p-6 items-center justify-center">
                    <div className="flex flex-col items-center gap-2 mb-3">
                        <img
                            src={logoComentarios} 
                            alt="Avatar"
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-50 shadow-sm"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                        />
                        <div className="text-center">
                            <h4 className="text-[16px] font-bold text-[#001f6c] leading-tight">
                                {name}
                            </h4>
                            {/* Renderizado de Estrellas */}
                            <div className="flex justify-center gap-[2px] mt-1">
                                {Array.from({ length: stars || 5 }).map((_, i) => (
                                    <Star key={i} weight="fill" size={14} className="text-[#ed6f00]" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500 italic leading-relaxed text-center line-clamp-4 px-2">
                        "{quote}"
                    </p>
                </div>

                {/* --- REVERSO --- */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-100 rounded-xl overflow-hidden shadow-md">
                    <img
                        src={image} 
                        alt={`${name} full`}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

const TestimonialCarousel = ({ title, subtitle, items = [], className = '' }) => {
    const safeItems = items.filter(Boolean);
    const total = safeItems.length;

    const containerRef = useRef(null);
    const [visible, setVisible] = useState(1);
    const [cardWidth, setCardWidth] = useState(0);
    const [index, setIndex] = useState(1);
    const [animate, setAnimate] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);

    const measure = useCallback(() => {
        if (!containerRef.current) return;
        const containerW = containerRef.current.offsetWidth;
        if (containerW <= 0) return;

        const v = getVisibleCount(containerW);
        const cw = (containerW - GAP * (v - 1)) / v;
        
        setVisible((prevV) => {
            if (prevV !== v) {
                setAnimate(false);
                setIndex(v);
                return v;
            }
            return prevV;
        });
        setCardWidth(cw);
    }, []);

    useEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [measure]);

    const extended = [
        ...safeItems.slice(-visible),
        ...safeItems,
        ...safeItems.slice(0, visible),
    ];

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setAnimate(true);
            setIsTransitioning(true);
            setIndex((prev) => prev + 1);
        }, 8000);
    }, []);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    const go = useCallback((dir) => {
        if (isTransitioning) return;
        
        // Reset timer on manual click to avoid double movement
        startTimer();
        
        setAnimate(true);
        setIsTransitioning(true);
        setIndex((prev) => prev + dir);
    }, [isTransitioning, startTimer]);

    const handleTransitionEnd = () => {
        setIsTransitioning(false);
        if (index >= total + visible) {
            setAnimate(false);
            setIndex(visible);
        } else if (index < visible) {
            setAnimate(false);
            setIndex(total + visible - 1);
        }
    };

    if (total === 0) return null;

    const trackOffset = -(index * (cardWidth + GAP));

    return (
        <section className={`w-full max-w-7xl mx-auto px-4 py-12 ${className}`}>
            {(title || subtitle) && (
                <div className="mb-12 text-center">
                    {title && (
                        <h2 className="text-2xl font-extrabold uppercase tracking-tighter text-[#001f6c] sm:text-4xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-3 text-base text-[#6c7eab] max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* px-8 a px-12 le da espacio a las tarjetas para que los botones se vean*/}
            <div className="relative px-8 md:px-12">
                
                {/* Botón Izquierdo*/}
                <button
                    onClick={() => go(-1)}
                    className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-md border border-gray-200 hover:scale-110 hover:bg-gray-50 transition-all text-[#001f6c]"
                >
                    <CaretLeftIcon size={24} weight="bold" />
                </button>

                {/* Contenedor principal */}
                <div ref={containerRef} className="overflow-hidden px-1 py-4">
                    <div
                        className={`flex ${animate ? 'transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)' : ''}`}
                        style={{ 
                            transform: `translateX(${trackOffset}px)`,
                            gap: `${GAP}px`
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extended.map((item, i) => (
                            <div
                                key={i}
                                className="shrink-0"
                                style={{ width: `${cardWidth}px` }}
                            >
                                <TestimonialCard {...item} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botón Derecho*/}
                <button
                    onClick={() => go(1)}
                    className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-md border border-gray-200 hover:scale-110 hover:bg-gray-50 transition-all text-[#001f6c]"
                >
                    <CaretRightIcon size={24} weight="bold" />
                </button>
            </div>
        </section>
    );
};

export default TestimonialCarousel;