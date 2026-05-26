import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * ConsultasChart — Weekly consultations bar chart using Chart.js.
 * @param {number[]} data    - Array of 7 values (Mon–Sun)
 * @param {boolean}  loading - Whether data is still loading
 * @param {string}   to      - Link for the arrow CTA
 */
const ConsultasChart = ({ data = [0, 0, 0, 0, 0, 0, 0], loading = false, to = '#' }) => {
    const chartData = {
        labels: DAYS,
        datasets: [
            {
                label: 'Consultas',
                data: data,
                backgroundColor: '#001f6c',
                borderRadius: 8,
                borderSkipped: false,
                maxBarThickness: 40,
                hoverBackgroundColor: '#ed6f00',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#001f6c',
                titleFont: { family: 'Poppins, sans-serif', size: 13 },
                bodyFont: { family: 'Poppins, sans-serif', size: 12 },
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                    label: (ctx) => ` ${ctx.parsed.y} consultas`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#8898aa',
                    font: { family: 'Poppins, sans-serif', size: 12, weight: 500 },
                },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f0f2f8',
                    drawBorder: false,
                },
                ticks: {
                    color: '#8898aa',
                    font: { family: 'Poppins, sans-serif', size: 11 },
                    stepSize: 1,
                    precision: 0,
                },
                border: { display: false },
            },
        },
    };

    return (
        <div className="flex items-center gap-6 rounded-2xl px-6 py-5 bg-white border border-[#ed6f00] shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[250px]">
            <p className="text-sm font-semibold text-[#001f6c] shrink-0 w-28 leading-snug">
                Consultas<br />Realizadas
            </p>

            <div className="flex-1 h-[200px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#001f6c] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>

            <Link to={to} className="text-[#001f6c]/40 hover:text-[#ed6f00] transition-colors shrink-0">
                <ArrowUpRightIcon className="w-6 h-6" />
            </Link>
        </div>
    );
};

export default ConsultasChart;
