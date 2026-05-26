import React, { useState } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import {
    QuestionIcon,
    BookOpenTextIcon,
    PackageIcon,
    AirplaneIcon,
    BuildingsIcon,
    ArticleIcon,
    ChatTeardropTextIcon,
    UsersIcon,
    WhatsappLogoIcon,
    UserCircleIcon,
    MonitorIcon,
    HouseIcon,
    ImageSquareIcon
} from '@phosphor-icons/react';

const ScreenshotPlaceholder = ({ title }) => (
    <div className="w-full h-auto aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 my-6 shadow-sm overflow-hidden group">
        <ImageSquareIcon className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-medium">Captura de pantalla: {title}</span>
    </div>
);

const MANUAL_SECTIONS = [
    {
        id: 'intro',
        title: 'Introducción',
        icon: <HouseIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <p>Bienvenido al Manual de Usuario de <strong>Plan de Viaje</strong>. Este documento está diseñado para guiarte a través de todas las funcionalidades del Panel de Administración.</p>
                <p>El panel está dividido en varias secciones principales navegables a través de la barra lateral izquierda:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-2">
                    <li><strong>Menú Principal:</strong> Visión general y estadísticas (Dashboard).</li>
                    <li><strong>Catálogo:</strong> Gestión de inventario de viajes (Paquetes, Vuelos, Hoteles).</li>
                    <li><strong>Atención:</strong> Herramientas para ventas y seguimiento de clientes (Consultas, Asesores, WhatsApp).</li>
                    <li><strong>Administración:</strong> Solo para roles con acceso total (Usuarios, Edición de la Web).</li>
                </ul>
                <ScreenshotPlaceholder title="Vista General del Dashboard" />
            </div>
        )
    },
    {
        id: 'catalogo',
        title: 'Gestión de Catálogo',
        icon: <PackageIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#001f6c]">Paquetes, Vuelos y Hoteles</h3>
                <p>Estas secciones te permiten gestionar la oferta pública que ven los clientes en el sitio web.</p>

                <h4 className="font-bold text-gray-800 mt-6">Cómo crear un nuevo elemento:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>Navega a la sección correspondiente (ej. <strong>Paquetes</strong>).</li>
                    <li>Desplázate hacia el final de la página o haz clic en el botón superior derecho <strong>"Nuevo"</strong>.</li>
                    <li>Llena el formulario con los detalles (Nombre, Precio, Días, Descripción).</li>
                    <li>Sube el <strong>Banner</strong> (imagen horizontal grande) y el <strong>Thumbnail</strong> (imagen cuadrada pequeña).</li>
                    <li>Sube imágenes adicionales para la galería usando el botón con el ícono <strong className="text-[#ed6f00]">+</strong>.</li>
                    <li>Asegúrate de marcar la casilla <strong>Activo / Publicado</strong> si deseas que sea visible inmediatamente.</li>
                    <li>Haz clic en <strong>Crear</strong>.</li>
                </ol>
                <ScreenshotPlaceholder title="Formulario de Creación de Paquete" />

                <div className="p-4 bg-orange-50 border-l-4 border-[#ed6f00] rounded-r-lg mt-4 text-sm text-gray-700">
                    <strong>Tip:</strong> Puedes editar o archivar items existentes usando los botones de acción en la tabla principal de cada sección. (Ver, Editar, Archivar).
                </div>
            </div>
        )
    },
    {
        id: 'consultas',
        title: 'Buzón de Consultas',
        icon: <ChatTeardropTextIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <p>El Buzón de Consultas es donde llegan todas las solicitudes realizadas por los clientes a través de los formularios en la página web.</p>

                <h4 className="font-bold text-gray-800 mt-6">Asignación de "Leads" (Prospectos):</h4>
                <p className="text-gray-600">Como Administrador, tu tarea es distribuir estas consultas a tu equipo de ventas.</p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>Abre la pestaña <strong>Consultas</strong>. Verás una tabla con las consultas recientes.</li>
                    <li>Haz clic en el botón <strong>Ver</strong> de una consulta que esté en estado <span className="text-yellow-600 font-bold bg-yellow-100 px-1 rounded">Pendiente</span>.</li>
                    <li>Se abrirá un panel de detalles mostrando la información del viaje solicitado por el cliente.</li>
                    <li>En la parte inferior, selecciona un asesor en la lista desplegable.</li>
                    <li>Haz clic en <strong>Asignar y Notificar</strong>.</li>
                </ol>
                <ScreenshotPlaceholder title="Panel de Asignación de Consultas" />
                <p className="text-gray-600 mt-4">El sistema enviará automáticamente un mensaje por WhatsApp al asesor seleccionado con los datos del cliente.</p>
            </div>
        )
    },
    {
        id: 'whatsapp',
        title: 'Conexión WhatsApp',
        icon: <WhatsappLogoIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <p>Para que el sistema automatizado de asignación de clientes funcione, debes vincular un número de WhatsApp de la empresa.</p>

                <h4 className="font-bold text-gray-800 mt-6">Pasos para vincular:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                    <li>Navega a <strong>Atención &gt; WhatsApp</strong>.</li>
                    <li>Ingresa el número de teléfono que actuará como asistente virtual (con código de país, ej: <code className="bg-gray-100 text-[#001f6c] px-1 rounded">584141234567</code>).</li>
                    <li>Haz clic en <strong>Solicitar Código de Emparejamiento</strong>.</li>
                    <li>El sistema generará un código de 8 letras/números (Pairing Code).</li>
                    <li>Abre WhatsApp en tu teléfono celular, ve a <strong>Menú &gt; Dispositivos Vinculados &gt; Vincular con el número de teléfono en su lugar</strong>.</li>
                    <li>Ingresa el código mostrado en la pantalla de la computadora.</li>
                </ol>
                <ScreenshotPlaceholder title="Pantalla de Emparejamiento (Pairing Code)" />
                <p className="text-green-600 font-medium">Una vez vinculado, el estado cambiará a "Conectado" indicando que el bot está listo.</p>
            </div>
        )
    },
    {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        icon: <UserCircleIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <p>Controla quién tiene acceso al panel de administración y qué acciones pueden realizar.</p>
                <ScreenshotPlaceholder title="Lista de Usuarios y Roles" />
                <h4 className="font-bold text-gray-800 mt-6">Roles del Sistema:</h4>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex gap-2">
                        <span className="w-3 h-3 mt-1.5 rounded-full bg-purple-500 shrink-0"></span>
                        <div><strong>Administrador (Rol 1):</strong> Control total. Acceso a todas las páginas, reportes, creación de usuarios y edición estética del sitio.</div>
                    </li>
                    <li className="flex gap-2">
                        <span className="w-3 h-3 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <div><strong>Editor (Rol 2):</strong> Operaciones de contenido. Tienen permiso para gestionar el Catálogo (Paquetes, Hoteles, Vuelos), el Blog y cambiar fotos e información en la página pública.</div>
                    </li>
                    <li className="flex gap-2">
                        <span className="w-3 h-3 mt-1.5 rounded-full bg-green-500 shrink-0"></span>
                        <div><strong>Asesor (Rol 3):</strong> Equipo de ventas. Acceso limitado únicamente a ver el volumen de Consultas, actualizar su perfil de Asesor y verificar el estado de WhatsApp.</div>
                    </li>
                </ul>
            </div>
        )
    },
    {
        id: 'edicion',
        title: 'Edición de la Página',
        icon: <MonitorIcon weight="duotone" className="w-5 h-5" />,
        content: () => (
            <div className="space-y-4">
                <p>Las opciones agrupadas bajo <strong>Editar Página</strong> te permiten modificar lo que los clientes ven en el sitio público sin necesidad de saber programar.</p>
                <ScreenshotPlaceholder title="Módulo de Edición de Página" />
                <h4 className="font-bold text-gray-800 mt-6">Opciones disponibles:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-2">
                    <li><strong>Información:</strong> Cambia teléfonos de contacto, correos electrónicos, horarios, dirección física de las oficinas y enlaces a redes sociales. (Aparecerán en el Header y Footer).</li>
                    <li><strong>Imágenes:</strong> Reemplaza el logotipo principal, los banners del carrusel de inicio y otras imágenes estáticas.</li>
                    <li><strong>Contenido:</strong> Edita la sección "Quiénes Somos", eslóganes, Políticas de Privacidad y Términos de Servicio.</li>
                </ul>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mt-4 text-sm text-gray-700">
                    <p>Cualquier cambio guardado en estas secciones se reflejará inmediatamente en la vista pública de la web.</p>
                </div>
            </div>
        )
    }
];

const Ayuda = () => {
    useDocumentTitle('Ayuda');
    useDocumentTitle('Ayuda');
    const [activeTab, setActiveTab] = useState(MANUAL_SECTIONS[0].id);

    const activeSection = MANUAL_SECTIONS.find(s => s.id === activeTab);

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-2xl font-bold text-[#001f6c] flex items-center gap-2">
                    <BookOpenTextIcon className="w-8 h-8 text-[#ed6f00]" />
                    Manual de Usuario
                </h1>
                <p className="text-sm text-gray-500 mt-1">Documentación detallada del funcionamiento de la plataforma Plan de Viaje.</p>
            </div>

            <div className="flex-1 flex overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm">

                {/* Sidebar Navigation */}
                <div className="w-72 bg-gray-50 border-r border-gray-100 overflow-y-auto custom-scrollbar shrink-0 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#001f6c]/50 px-2 py-1 mb-2">
                        Índice del Manual
                    </p>
                    {MANUAL_SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveTab(section.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                                activeTab === section.id 
                                ? 'bg-[#001f6c] text-white shadow-md' 
                                : 'text-gray-600 hover:bg-white hover:text-[#001f6c] hover:shadow-sm'
                            }`}
                        >
                            <span className={`${activeTab === section.id ? 'text-white' : 'text-[#ed6f00]'}`}>
                                {section.icon}
                            </span>
                            {section.title}
                        </button>
                    ))}

                    <div className="mt-8 pt-6 border-t border-gray-200 px-2">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 className="font-bold text-[#001f6c] text-sm mb-2 flex items-center gap-2">
                                <QuestionIcon className="w-4 h-4 text-blue-600" />
                                ¿Aún tienes dudas?
                            </h4>
                            <p className="text-xs text-gray-600">
                                Recuerda que puedes usar la opción "Repetir Tour" en el menú inferior izquierdo para un recorrido interactivo por las pantallas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                            <div className="w-12 h-12 bg-[#ed6f00]/10 text-[#ed6f00] rounded-xl flex items-center justify-center">
                                {activeSection.icon}
                            </div>
                            <h2 className="text-3xl font-bold text-[#001f6c]">{activeSection.title}</h2>
                        </div>
                        
                        <div className="prose prose-blue max-w-none text-base">
                            {activeSection.content()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Ayuda;
