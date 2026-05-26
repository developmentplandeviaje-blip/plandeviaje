import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';
import { ImagesIcon } from '@phosphor-icons/react';

/**
 * DetailHero — title, metadata badges, and a photo gallery grid.
 *
 * @param {string}   title    — package / flight / hotel name
 * @param {Array}    badges   — [{ icon?: ReactNode, text: string }]
 * @param {string[]} images   — array of image URLs (first = hero)
 */
const DetailHero = ({ title, badges = [], images = [] }) => {
    const [lightbox, setLightbox] = useState({ open: false, start: 0 });

    const openAt = (idx) => setLightbox({ open: true, start: idx });
    const closeLB = () => setLightbox({ open: false, start: 0 });

    const hero = images[0];
    const thumbs = images.slice(1, 4); // show up to 3 thumbnails
    const extraCount = Math.max(images.length - 4, 0); // +N overlay on last thumb

    return (
        <>
            <section className="mx-auto w-full max-w-7xl px-6 sm:px-10 pt-6 pb-4">
                {/* ── Title ────────────────────────────────────────────── */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#001f6c] leading-tight">
                    {title}
                </h1>

                {/* ── Badges row ───────────────────────────────────────── */}
                {badges.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6c7eab]">
                        {badges.map((badge, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-[#001f6c]/20">·</span>}
                                <span className="flex items-center gap-1 font-medium">
                                    {badge.icon && <span className="text-base">{badge.icon}</span>}
                                    {badge.text}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* ── Photo grid ───────────────────────────────────────── */}
                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-[3fr_1fr] md:grid-rows-3 md:max-h-[420px] gap-2 rounded-2xl overflow-hidden">
                        {/* Hero image */}
                        <button
                            type="button"
                            onClick={() => openAt(0)}
                            className="relative w-full overflow-hidden md:row-span-3 rounded-2xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed6f00]"
                        >
                            <img
                                src={hero}
                                alt={title}
                                className="w-full h-56 sm:h-72 md:h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                            {/* "Show all photos" button — mobile only when no side thumbs */}
                            {images.length > 1 && (
                                <span className="md:hidden absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold text-[#001f6c] shadow-md flex items-center gap-1.5">
                                    <ImagesIcon className="w-4 h-4"  />
                                    Ver todas las fotos
                                </span>
                            )}
                        </button>

                        {/* Side thumbnails (desktop only) */}
                        {thumbs.map((img, i) => {
                            const isLast = i === thumbs.length - 1;
                            const thumbIndex = i + 1; // offset because hero is index 0

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => openAt(thumbIndex)}
                                    className="relative hidden md:block w-full overflow-hidden rounded-2xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ed6f00]"
                                >
                                    <img
                                        src={img}
                                        alt={`${title} foto ${thumbIndex + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                                    />
                                    {/* +N overlay on last thumbnail */}
                                    {isLast && extraCount > 0 && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className="text-white text-xl font-bold">+{extraCount}</span>
                                        </div>
                                    )}
                                    {/* "Show all photos" on last thumbnail */}
                                    {isLast && (
                                        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-[#001f6c] shadow-md flex items-center gap-1.5">
                                            <ImagesIcon className="w-4 h-4"  />
                                            Ver todas las fotos
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Lightbox */}
            {lightbox.open && (
                <ImageLightbox
                    images={images}
                    startAt={lightbox.start}
                    onClose={closeLB}
                />
            )}
        </>
    );
};

export default DetailHero;
