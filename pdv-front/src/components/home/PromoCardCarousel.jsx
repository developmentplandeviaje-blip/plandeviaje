import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PromoCard from './PromoCard';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

const GAP = 24; // gap-6 = 1.5rem = 24px

/** How many cards to show based on the container's pixel width */
const getVisible = (width) => {
    if (width >= 960) return 4;
    if (width >= 680) return 3;
    if (width >= 440) return 2;
    return 1;
};

const PromoCardCarousel = ({ title, subtitle, items = [], className = '', verMasHref }) => {
    const safeItems = items.filter(Boolean);
    const total = safeItems.length;

    const containerRef = useRef(null);
    const [visible, setVisible] = useState(4);
    const [cardWidth, setCardWidth] = useState(0);

    // Derive both visible count and card width from the same ResizeObserver entry
    useEffect(() => {
        const measure = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.offsetWidth;
            const v = getVisible(w);
            const cw = Math.floor((w - GAP * (v - 1)) / v);
            setVisible(v);
            setCardWidth(cw);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // --- Infinite-loop clone state ---
    // We need to reset index whenever `visible` changes (different clone offsets)
    const [index, setIndex] = useState(visible);
    const [animate, setAnimate] = useState(true);

    // When visible changes, silently snap back to real item #0
    useEffect(() => {
        setAnimate(false);
        setIndex(visible);           // new clone-adjusted start position
    }, [visible]);

    // Re-enable animate after silent jump
    useEffect(() => {
        if (!animate) {
            const id = requestAnimationFrame(() =>
                requestAnimationFrame(() => setAnimate(true))
            );
            return () => cancelAnimationFrame(id);
        }
    }, [animate]);

    // Extended array: `visible` clones at start + real items + `visible` clones at end
    const extended = [
        ...safeItems.slice(-visible),
        ...safeItems,
        ...safeItems.slice(0, visible),
    ];

    const go = useCallback((dir) => {
        setAnimate(true);
        setIndex((prev) => prev + dir);
    }, []);

    const handleTransitionEnd = useCallback(() => {
        if (index >= total + visible) {
            setAnimate(false);
            setIndex(visible);
        } else if (index < visible) {
            setAnimate(false);
            setIndex(total + visible - 1);
        }
    }, [index, total, visible]);

    if (total === 0) return null;

    const trackOffset = cardWidth > 0 ? -(index * (cardWidth + GAP)) : 0;

    return (
        <div className={`relative w-full px-10 sm:px-12 lg:px-16 ${className}`}>
            {(title || subtitle) && (
                <div className="mb-5 text-center">
                    {title && (
                        <h2 className="text-lg font-bold uppercase tracking-wide text-[#001f6c] sm:text-3xl">
                            {title}
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-1 text-sm text-[#6c7eab] sm:text-lg">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {/* Prev arrow — lives in the outer padding zone */}
            <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous cards"
                className="absolute left-1 sm:left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white hover:scale-110 active:scale-95 p-2 shadow-md transition-all duration-200"
            >
                <CaretLeftIcon className="h-5 w-5 text-[#001f6c]" />
            </button>

            {/* Viewport window */}
            <div ref={containerRef} className="overflow-hidden">
                <div
                    className={`flex items-stretch ${animate ? 'transition-transform duration-500 ease-in-out' : ''}`}
                    style={{ gap: `${GAP}px`, transform: `translateX(${trackOffset}px)` }}
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
            <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next cards"
                className="absolute right-1 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white hover:scale-110 active:scale-95 p-2 shadow-md transition-all duration-200"
            >
                <CaretRightIcon className="h-5 w-5 text-[#001f6c]" />
            </button>

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
