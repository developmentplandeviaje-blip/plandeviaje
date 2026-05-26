import React, { useState, useEffect } from 'react';
import slider1 from '../../assets/slider1.webp';
import slider2 from '../../assets/slider2.webp';

/**
 * Slider del hero principal en la página de inicio.
 * Alterna automáticamente entre las imágenes de fondo con transición fade.
 */
const HeroSlider = () => {
    const images = [slider1, slider2];
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="relative w-full overflow-hidden">
            {/* Stack de imágenes — todas en la misma celda del grid, visibilidad controlada por opacidad */}
            <div className="relative grid w-full">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`col-start-1 row-start-1 w-full transition-opacity duration-1000 ease-in-out ${
                            index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <img
                            src={img}
                            alt={`Slide ${index + 1}`}
                            className="h-48 sm:h-64 md:h-80 lg:h-96 w-full object-cover rounded-xl"
                        />
                    </div>
                ))}
            </div>

            {/* Indicadores de posición */}
            <div className="relative z-20 flex flex-col items-center px-4 pt-3 text-center sm:px-6">
                <div className="my-2 sm:mt-3 flex justify-center gap-2 sm:gap-3">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 ${
                                index === currentIndex
                                    ? 'bg-[#ed6f00] scale-125'
                                    : 'bg-[#001f6c]/30 hover:bg-[#001f6c]/50'
                            }`}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;
