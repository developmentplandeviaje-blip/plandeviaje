import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PromoCard from './PromoCard';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

const GAP = 24; // gap-6 = 1.5rem = 24px

/** How many cards to show based on the container's pixel width */
const getVisible = (width) => {
    if (width >= 1150) return 4;
    if (width >= 850) return 3;
    if (width >= 550) return 2;
    return 1;
};

const PromoCardCarousel = ({ title, subtitle, items = [], className = '', verMasHref }) => {
    const safeItems = items.filter(Boolean);
    const total = safeItems.length;

    const containerRef = useRef(null);
    const [visible, setVisible] = useState(1);
    const [cardWidth, setCardWidth] = useState(0);
    const [index, setIndex] = useState(0);
    const [animate, setAnimate] = useState(true);

    // We want the infinite loop behavior whenever we have more than one item
    const isLoopable = total > 1;

    useEffect(() => {
        const measure = () => {
            if (!containerRef.current) return;
            const containerW = containerRef.current.offsetWidth;
            if (containerW <= 0) return;

            const v = getVisible(containerW);
            const cw = Math.floor((containerW - GAP * (v - 1)) / v);

            setVisible(v);
            setCardWidth(cw);
            
            // Start at the first real item (index = visible clones)
            setIndex(isLoopable ? v : 0);
            setAnimate(false);
        };

        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [total, isLoopable]);

    // Re-enable animate after silent jump
    useEffect(() => {
        if (!animate) {
            const id = requestAnimationFrame(() =>
                requestAnimationFrame(() => setAnimate(true))
            );
            return () => cancelAnimationFrame(id);
        }
    }, [animate]);

    // Extended array: `visible` clones at start + real items + `visible` clones at end (only if loopable)
    // We use a safe cloning count (at least `visible` items)
    const extended = isLoopable 
        ? [
            ...safeItems.slice(-visible),
            ...safeItems,
            ...safeItems.slice(0, visible),
        ]
        : safeItems;

    const go = useCallback((dir) => {
        if (!isLoopable) return;
        setAnimate(true);
        setIndex((prev) => prev + dir);
    }, [isLoopable]);

    const handleTransitionEnd = useCallback(() => {
        if (!isLoopable) return;
        
        // Jump back to the clones if we reach the ends
        if (index >= total + visible) {
            setAnimate(false);
            setIndex(visible);
        } else if (index < visible) {
            setAnimate(false);
            setIndex(total + visible - 1);
        }
    }, [index, total, visible, isLoopable]);

    if (total === 0) return null;

    const trackOffset = cardWidth > 0 ? -(index * (cardWidth + GAP)) : 0;

    // Calculate active dot index
    let activeDot = 0;
    if (isLoopable) {
        if (index >= total + visible) activeDot = 0;
        else if (index < visible) activeDot = total - 1;
        else activeDot = index - visible;
    } else {
        activeDot = index;
    }

    const goToDot = (dotIdx) => {
        setAnimate(true);
        setIndex(isLoopable ? dotIdx + visible : dotIdx);
    };

    return (
        <div className={`relative w-full max-w-7xl mx-auto px-10 sm:px-12 lg:px-16 ${className}`}>
            {(title || subtitle) && (
                <div className="mb-8 text-center">
                    {title && (
                        <h2 className="text-xl font-bold uppercase tracking-tight text-[#001f6c] sm:text-3xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-2 text-sm text-[#6c7eab] sm:text-base">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Prev arrow */}
            {total > 1 && (
                <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous"
                    className="absolute left-1 sm:left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg border border-gray-100 hover:scale-110 active:scale-95 transition-all text-[#001f6c]"
                >
                    <CaretLeftIcon size={20} weight="bold" />
                </button>
            )}

            {/* Viewport window */}
            <div ref={containerRef} className="overflow-hidden py-4">
                <div
                    className={`flex items-stretch ${animate ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{ 
                        gap: `${GAP}px`, 
                        transform: `translateX(${trackOffset}px)`,
                        justifyContent: isLoopable ? 'flex-start' : 'center' 
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {extended.map((item, i) => (
                        <div
                            key={i}
                            className="shrink-0"
                            style={{ width: cardWidth > 0 ? `${cardWidth}px` : `calc(${100 / visible}% - ${GAP * (visible - 1) / visible}px)` }}
                        >
                            <PromoCard {...item} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Next arrow */}
            {total > 1 && (
                <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next"
                    className="absolute right-1 sm:right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg border border-gray-100 hover:scale-110 active:scale-95 transition-all text-[#001f6c]"
                >
                    <CaretRightIcon size={20} weight="bold" />
                </button>
            )}

            {/* Paginador (Dots) */}
            <div className="flex justify-center gap-2 mt-6">
                {safeItems.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goToDot(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            activeDot === i ? 'w-8 bg-[#ed6f00]' : 'w-2 bg-gray-200 hover:bg-gray-300'
                        }`}
                        aria-label={`Ir a la diapositiva ${i + 1}`}
                    />
                ))}
            </div>

            {/* Ver Más */}
            <div className="flex justify-center mt-5">
                {verMasHref ? (
                    <Link
                        to={verMasHref}
                        className="rounded-full bg-[#ed6f00] px-6 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.04] hover:bg-[#d96200] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed6f00] focus-visible:ring-offset-2"
                    >
                        Ver Más
                    </Link>
                ) : null}
            </div>
        </div>
    );
};

export default PromoCardCarousel;
