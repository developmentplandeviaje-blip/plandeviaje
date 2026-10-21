import React, { useState } from 'react';
import { XIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

/**
 * ImageLightbox — full-screen modal gallery.
 *
 * @param {string[]} images        — array of image URLs
 * @param {number}   startAt       — index to begin on
 * @param {function} onClose       — callback to dismiss
 * @param {boolean}  protectedMode — enables anti-capture watermarks and disables context menu / dragging
 * @param {string}   token         — verification token for the security watermark
 */
const ImageLightbox = ({ images = [], startAt = 0, onClose, protectedMode = false, token = '' }) => {
    const [current, setCurrent] = useState(startAt);

    if (images.length === 0) return null;

    const go = (dir) =>
        setCurrent((prev) => (prev + dir + images.length) % images.length);

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
            onClick={onClose}
            onContextMenu={(e) => {
                if (protectedMode) e.preventDefault();
            }}
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-20 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors cursor-pointer"
            >
                <XIcon className="h-6 w-6" />
            </button>

            {/* Prev arrow */}
            {images.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(-1); }}
                    aria-label="Anterior"
                    className="absolute left-4 z-20 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/40 transition-colors cursor-pointer"
                >
                    <CaretLeftIcon className="h-6 w-6" />
                </button>
            )}

            {/* Image container */}
            <div
                className="relative max-h-[85vh] max-w-[90vw] select-none rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[current]}
                    alt={`Foto ${current + 1} de ${images.length}`}
                    className={`max-h-[85vh] max-w-[90vw] object-contain rounded-xl select-none ${
                        protectedMode ? 'pointer-events-none' : ''
                    }`}
                    onDragStart={(e) => {
                        if (protectedMode) e.preventDefault();
                    }}
                    onContextMenu={(e) => {
                        if (protectedMode) e.preventDefault();
                    }}
                />

                {/* Marca de agua de seguridad y protección anti-captura sobre la imagen ampliada */}
                {protectedMode && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 overflow-hidden select-none">
                        <div className="flex justify-between items-center text-xs sm:text-sm font-black tracking-widest text-white/50 uppercase drop-shadow-md">
                            <span>PLAN DE VIAJE • DOCUMENTO OFICIAL</span>
                            {token && <span>TOKEN: {token}</span>}
                        </div>
                        <div className="rotate-[-25deg] scale-110 text-center text-base sm:text-2xl md:text-3xl font-black tracking-widest text-[#ed6f00]/50 uppercase select-none whitespace-nowrap drop-shadow-md">
                            COPIA NO AUTORIZADA • DOCUMENTO CONFIDENCIAL
                        </div>
                        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-white/50 uppercase drop-shadow-md">
                            <span>USO EXCLUSIVO DE VERIFICACIÓN</span>
                            <span>PROHIBIDA SU CAPTURA Y REPRODUCCIÓN</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Next arrow */}
            {images.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); go(1); }}
                    aria-label="Siguiente"
                    className="absolute right-4 z-20 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/40 transition-colors cursor-pointer"
                >
                    <CaretRightIcon className="h-6 w-6" />
                </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
                {current + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageLightbox;
