import React, { useState } from 'react';
import { XIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

/**
 * ImageLightbox — full-screen modal gallery.
 *
 * @param {string[]} images  — array of image URLs
 * @param {number}   startAt — index to begin on
 * @param {function} onClose — callback to dismiss
 */
const ImageLightbox = ({ images = [], startAt = 0, onClose }) => {
    const [current, setCurrent] = useState(startAt);

    if (images.length === 0) return null;

    const go = (dir) =>
        setCurrent((prev) => (prev + dir + images.length) % images.length);

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors"
            >
                <XIcon className="h-6 w-6"  />
            </button>

            {/* Prev arrow */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Anterior"
                className="absolute left-4 z-10 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/40 transition-colors"
            >
                <CaretLeftIcon className="h-6 w-6"  />
            </button>

            {/* Image */}
            <div
                className="max-h-[85vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={images[current]}
                    alt={`Foto ${current + 1} de ${images.length}`}
                    className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
                />
            </div>

            {/* Next arrow */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Siguiente"
                className="absolute right-4 z-10 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/40 transition-colors"
            >
                <CaretRightIcon className="h-6 w-6"  />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/40 rounded-full px-4 py-1.5">
                {current + 1} / {images.length}
            </div>
        </div>
    );
};

export default ImageLightbox;
