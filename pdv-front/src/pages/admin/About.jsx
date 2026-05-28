import React from 'react';

// IMPORTACIÓN DE IMÁGENES
import nosotrosImg from '../../Assets/nosotros.jpg';
import nosotros1 from '../../Assets/nosotros1.jpg';
import nosotros2 from '../../Assets/nosotros2.jpg';
import nosotros3 from '../../Assets/nosotros3.jpg';
import nosotros4 from '../../Assets/nosotros4.jpg';

const About = () => {
  // Función para bloquear acciones
  const blockAction = (e) => e.preventDefault();

  // Efecto de ruido para las fotos
  const noiseStyle = {
    filter: 'contrast(150%) brightness(100%)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  };

  return (
    <div className="min-h-screen bg-[#e1e6f0] select-none">
      {/* SECCIÓN HERO*/}
      <div className="w-full">
        <img 
          src={nosotrosImg} 
          alt="Nosotros" 
          className="w-full h-auto block"
          onContextMenu={blockAction}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        
        {/* TÍTULO PRINCIPAL */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-black uppercase tracking-tight">
            <span className="text-[#001f6c]">¡SOMOS PLAN DE VIAJE, </span>
            <span className="text-[#ed6f00]">MÁS QUE VIAJAR!</span>
          </h2>
        </div>

        {/* PÁRRAFOS SUPERIORES */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-[#001f6c] font-medium text-[15px] leading-relaxed px-2 md:px-8">
          <p>
            Nuestra agencia de Viaje se ha encargado por más de 9 años en planificar y crear experiencias para el disfrute de nuestros viajeros a través de servicios de traslados, paquetería turística, boletería aérea y de ferry.
          </p>
          <p>
            Plan de Viaje Nació en la isla de Margarita, con el firme propósito de impulsar sus lugares más asombrosos, hoteles confortables y playas increíbles que lo convierte en el destino turístico principal de los venezolanos, sin dejar a un lado otros increíbles destinos del país.
          </p>
        </div>

        {/* SECCIÓN DE COLORES CORPORATIVOS */}
        <div className="pt-8">
          <h3 className="text-center text-[#001f6c] text-2xl md:text-[28px] font-black mb-12">
            Colores Corporativos
          </h3>
          
          <div className="relative flex flex-col md:flex-row items-start justify-center max-w-4xl mx-auto">
            <div className="hidden md:block absolute left-1/2 top-0 w-[2px] h-[160px] bg-[#001f6c]/80 -translate-x-1/2"></div>
            
            <div className="flex-1 flex flex-col items-center px-4 mb-12 md:mb-0">
              <div className="w-[140px] h-[140px] rounded-full bg-[#001f6c] mb-6 shadow-md"></div>
              <p className="text-center text-[#001f6c] font-semibold text-sm leading-snug max-w-[260px]">
                Representa la confianza, la seguridad y la lealtad que le brindamos a nuestros viajeros.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="w-[140px] h-[140px] rounded-full bg-[#ed6f00] mb-6 shadow-md"></div>
              <p className="text-center text-[#001f6c] font-semibold text-sm leading-snug max-w-[260px]">
                Muestra nuestro lado creativo, divertido y turístico que nos conecta con la felicidad de nuestros viajeros.
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN #TEAMVIAJERO Y FOTOS - BLOQUEADAS */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center pt-12 pb-20 px-2 md:px-8">
          <div className="pr-0 md:pr-10">
            <h3 className="text-[#001f6c] text-2xl md:text-[32px] font-black leading-tight">
              Nuestro equipo se encarga de crear momentos inolvidables y de seguir sumando a nuestro <span className="text-[#ed6f00]">#TEAMVIAJERO</span> más viajeros felices.
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            
            {/* Foto 1 */}
            <div className="relative rounded-[0.5rem] h-[140px] md:h-[160px] shadow-sm overflow-hidden group md:translate-x-35">
              <img 
                src={nosotros1} 
                alt="Nosotros 1" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                onContextMenu={blockAction}
                onDragStart={blockAction}
              />
              <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-gradient-to-r from-[#e1e6f0] to-transparent opacity-50"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1/4 opacity-10 pointer-events-none" style={noiseStyle}></div>
            </div>

            {/* Foto 2 */}
            <div className="relative rounded-[0.5rem] h-[140px] md:h-[160px] shadow-sm overflow-hidden group md:translate-x-35">
              <img 
                src={nosotros2} 
                alt="Nosotros 2" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                onContextMenu={blockAction}
                onDragStart={blockAction}
              />
              <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-[#e1e6f0] to-transparent opacity-50"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1/4 opacity-10 pointer-events-none" style={noiseStyle}></div>
            </div>

            {/* Foto 3 */}
            <div className="relative rounded-[0.5rem] h-[140px] md:h-[160px] shadow-sm overflow-hidden group">
              <img 
                src={nosotros3} 
                alt="Nosotros 3" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                onContextMenu={blockAction}
                onDragStart={blockAction}
              />
              <div className="absolute top-0 left-0 bottom-0 w-1/4 bg-gradient-to-r from-[#e1e6f0] to-transparent opacity-50"></div>
              <div className="absolute top-0 left-0 bottom-0 w-1/4 opacity-15 pointer-events-none" style={noiseStyle}></div>
            </div>

            {/* Foto 4 */}
            <div className="relative rounded-[0.5rem] h-[140px] md:h-[160px] shadow-sm overflow-hidden group">
              <img 
                src={nosotros4} 
                alt="Nosotros 4" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none" 
                onContextMenu={blockAction}
                onDragStart={blockAction}
              />
              <div className="absolute top-0 right-0 bottom-0 w-1/4 bg-gradient-to-l from-[#e1e6f0] to-transparent opacity-50"></div>
              <div className="absolute top-0 right-0 bottom-0 w-1/4 opacity-10 pointer-events-none" style={noiseStyle}></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;