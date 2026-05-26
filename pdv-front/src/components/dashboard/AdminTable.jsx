import React, { useState, useMemo } from 'react';
import { PlusIcon, CaretLeftIcon, CaretRightIcon, CaretUpIcon, CaretDownIcon, DotsThreeIcon } from '@phosphor-icons/react';

/**
 * AdminTable — Generic reusable data table for admin modules.
 *
 * @param {string}   title     - Page/module title
 * @param {string}   newLabel  - Label for the "new entry" button
 * @param {object[]} columns   - [{ key, label, render? }]
 * @param {object[]} data      - Array of row objects
 * @param {number}   pageSize  - Rows per page (default 5)
 * @param {function} onNew     - "Nuevo" button handler
 * @param {function} onView    - (row) => void
 * @param {function} onEdit    - (row) => void
 * @param {function} onArchive - (row) => void — Cambia el estado isActive
 * @param {function} onDelete  - (row) => void — Elimina definitivamente
 * @param {function} onExtra   - optional extra action { label, onClick, className }
 */
const AdminTable = ({
    title,
    newLabel = 'Nuevo',
    columns = [],
    data = [],
    pageSize = 5,
    onNew,
    onView,
    onEdit,
    onArchive,
    onDelete, // <--- Nueva prop añadida
    onExtra,
}) => {
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const getVal = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
                const aVal = getVal(a, sortConfig.key);
                const bVal = getVal(b, sortConfig.key);

                // Handle null/undefined
                if (aVal == null && bVal == null) return 0;
                if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const paginated = sortedData.slice((page - 1) * pageSize, page * pageSize);

    // Build a compact page list: [1, 2, 3, '...', N]
    const pageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i <= 3 || i === totalPages) pages.push(i);
            else if (i === 4 && totalPages > 5) pages.push('...');
        }
        return pages;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-[#001f6c]">{title}</h1>
                {onNew && (
                    <button
                        onClick={onNew}
                        className="flex items-center gap-2 bg-[#001f6c] hover:bg-[#001f6c]/80 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition-colors duration-200"
                    >
                        <PlusIcon className="w-4 h-4"  />
                        {newLabel}
                    </button>
                )}
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-[#ed6f00] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#f4f7fb] border-b border-[#ed6f00]/30">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                        className={`px-4 py-3 text-center text-xs font-bold text-[#001f6c] uppercase tracking-wider whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:bg-[#ed6f00]/10 transition-colors select-none' : ''}`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            {col.label}
                                            {col.sortable && (
                                                <span className="flex flex-col opacity-50">
                                                    <CaretUpIcon size={8} weight="bold" className={sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'text-[#ed6f00] opacity-100' : ''} />
                                                    <CaretDownIcon size={8} weight="bold" className={sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'text-[#ed6f00] opacity-100' : ''} />
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-bold text-[#001f6c] uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={columns.length + 1}
                                        className="py-10 text-center text-sm text-gray-400"
                                    >
                                        No hay entradas para mostrar.
                                    </td>
                                </tr>
                            )}
                            {paginated.map((row, idx) => (
                                <tr
                                    key={row.id ?? idx}
                                    className="border-b border-gray-100 hover:bg-[#f4f7fb]/60 transition-colors duration-150"
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={col.tdClass ?? 'px-4 py-3 text-center text-[#001f6c] align-middle'}
                                        >
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : row[col.key]}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 align-middle">
                                        <div className="flex flex-col items-center gap-1.5">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="w-24 py-1 rounded-lg border-2 border-[#001f6c] text-[#001f6c] text-xs font-semibold hover:bg-[#001f6c] hover:text-white transition-colors duration-200"
                                                >
                                                    Ver
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="w-24 py-1 rounded-lg bg-[#ed6f00] text-white text-xs font-semibold hover:bg-[#ed6f00]/80 transition-colors duration-200"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                            {/* Botón Archivar / Activar */}
                                            {onArchive && (
                                                <button
                                                    onClick={() => onArchive(row)}
                                                    className="w-24 py-1 rounded-lg bg-gray-500 text-white text-xs font-semibold hover:bg-gray-600 transition-colors duration-200"
                                                >
                                                    {row.isActive === 0 || row.isActive === false ? 'Activar' : 'Archivar'}
                                                </button>
                                            )}
                                            {/* Botón Eliminar Definitivo */}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="w-24 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-700 transition-colors duration-200"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                            {onExtra && (
                                                <button
                                                    onClick={() => onExtra.onClick(row)}
                                                    className={`w-24 py-1 rounded-lg text-xs font-semibold transition-colors duration-200 ${onExtra.className}`}
                                                >
                                                    {onExtra.label}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 py-4 border-t border-gray-100">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#001f6c] font-bold text-sm hover:bg-[#001f6c]/10 disabled:opacity-30 transition-colors"
                        >
                            <CaretLeftIcon weight="bold" />
                        </button>

                        {pageNumbers().map((n, i) =>
                            n === '...' ? (
                                <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400">
                                    <DotsThreeIcon />
                                </span>
                            ) : (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-7 h-7 rounded-lg text-sm font-semibold transition-colors duration-200 ${page === n
                                        ? 'bg-[#001f6c] text-white'
                                        : 'text-[#001f6c] hover:bg-[#001f6c]/10'
                                        }`}
                                >
                                    {n}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#001f6c] font-bold text-sm hover:bg-[#001f6c]/10 disabled:opacity-30 transition-colors"
                        >
                            <CaretRightIcon weight="bold" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTable;