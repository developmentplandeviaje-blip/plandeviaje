import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import api from '../../api/axios';
import { CaretLeftIcon, CaretRightIcon, CaretUpIcon, CaretDownIcon, MagnifyingGlassIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';

const StatusBadge = ({ status }) => {
    const isAccepted = status === 'aceptada';
    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm transition-all duration-300 ${
                isAccepted
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
            }`}
        >
            {isAccepted ? 'Aceptada' : 'Rechazada'}
        </span>
    );
};

const Registro = () => {
    useDocumentTitle('Registro de Asignaciones');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchLogs = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await api.get('/assignment-logs', {
                params: {
                    page,
                    search,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                },
            });

            const { data, last_page, total } = response.data;
            setLogs(data || []);
            setTotalPages(last_page || 1);
            setTotalRecords(total || 0);
        } catch (error) {
            console.error('Error fetching assignment logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Debounce search and reload data on state changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [search, page, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search change
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setPage(1);
    };

    const renderSortHeader = (label, field) => {
        const isSorted = sortBy === field;
        return (
            <th
                onClick={() => handleSort(field)}
                className="px-6 py-3.5 text-center text-xs font-bold text-[#001f6c] uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-[#ed6f00]/10 transition-colors duration-200 select-none border-b border-gray-100"
            >
                <div className="flex items-center justify-center gap-1.5">
                    {label}
                    <span className="flex flex-col opacity-60">
                        <CaretUpIcon
                            size={9}
                            weight="bold"
                            className={isSorted && sortOrder === 'asc' ? 'text-[#ed6f00] opacity-100 scale-110' : 'text-gray-400'}
                        />
                        <CaretDownIcon
                            size={9}
                            weight="bold"
                            className={isSorted && sortOrder === 'desc' ? 'text-[#ed6f00] opacity-100 scale-110' : 'text-gray-400'}
                        />
                    </span>
                </div>
            </th>
        );
    };

    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i <= 3 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
                if (pages[pages.length - 1] < i - 1) {
                    pages.push('...');
                }
                pages.push(i);
            }
        }
        return pages;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#001f6c]">Historial de Asignaciones</h1>
                    <p className="text-sm text-gray-500 mt-1.5">
                        Audita y consulta los registros de asignaciones aceptadas y rechazadas por los asesores.
                    </p>
                </div>
                <button
                    onClick={() => fetchLogs(true)}
                    className="flex items-center justify-center gap-2 self-start bg-white border border-gray-200 hover:border-[#ed6f00] text-gray-700 hover:text-[#ed6f00] text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-95"
                    disabled={loading || refreshing}
                >
                    <ArrowsClockwiseIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Main table container */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm space-y-4 p-5">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <MagnifyingGlassIcon size={18} weight="bold" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por asesor o pasajero..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-[#ed6f00] focus:bg-white rounded-xl text-sm text-[#001f6c] placeholder-gray-400 outline-none transition-all duration-200"
                        />
                    </div>
                    <div className="text-xs font-semibold text-gray-500">
                        Total: <span className="text-[#001f6c] bg-gray-100 px-2 py-0.5 rounded-md">{totalRecords}</span> registros
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white border border-[#ed6f00]/30 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#f4f7fb]">
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-[#001f6c] uppercase tracking-wider border-b border-gray-100">
                                        #
                                    </th>
                                    {renderSortHeader('Asesor', 'consultant_name')}
                                    {renderSortHeader('Estatus', 'status')}
                                    {renderSortHeader('Pasajero', 'client_name')}
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-[#001f6c] uppercase tracking-wider border-b border-gray-100">
                                        Fecha Registro
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-9 h-9 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-400 font-medium text-xs">Cargando registros...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 font-medium">
                                            No se encontraron registros de asignación.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((row, idx) => (
                                        <tr
                                            key={row.id}
                                            className="border-b border-gray-50 hover:bg-[#f4f7fb]/40 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 text-center font-bold text-[#001f6c]/70 align-middle">
                                                {(page - 1) * 10 + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-[#001f6c] align-middle">
                                                {row.consultant_name}
                                            </td>
                                            <td className="px-6 py-4 text-center align-middle">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-700 align-middle">
                                                {row.client_name}
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs text-gray-500 align-middle">
                                                {row.created_at
                                                    ? new Date(row.created_at).toLocaleString('es-ES', {
                                                          day: '2-digit',
                                                          month: '2-digit',
                                                          year: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                          second: '2-digit',
                                                      })
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 py-4 border-t border-gray-100 bg-[#f4f7fb]/20">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#001f6c] font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                <CaretLeftIcon weight="bold" />
                            </button>

                            {renderPageNumbers().map((n, i) =>
                                n === '...' ? (
                                    <span
                                        key={`ellipsis-${i}`}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold select-none"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={n}
                                        onClick={() => setPage(n)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                                            page === n
                                                ? 'bg-[#001f6c] text-white'
                                                : 'bg-white border border-gray-200 text-[#001f6c] hover:bg-gray-50'
                                        }`}
                                    >
                                        {n}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#001f6c] font-bold text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
                            >
                                <CaretRightIcon weight="bold" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Registro;
