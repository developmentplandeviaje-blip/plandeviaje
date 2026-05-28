import { Link } from 'react-router-dom';

const PromoCard = ({
    image,
    title,
    subtitle,
    priceLabel,
    priceValue,
    ctaLabel,
    link,
    onCtaClick,
}) => {
    const Wrapper = link ? Link : 'div';
    const wrapperProps = link ? { to: link } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-white/70 group transition-shadow duration-200 hover:shadow-xl cursor-pointer no-underline"
        >
            {/* Image — 1:1 aspect ratio, zooms on hover */}
            <div className="relative w-full overflow-hidden shrink-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-[1.07]"
                    loading="lazy"
                />
            </div>

            {/* Content — stretches to fill remaining height */}
            <div className="flex flex-col flex-1 px-4 py-3 w-full">
                <h3 className="text-sm font-semibold text-[#001f6c] leading-tight w-full">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-[#6c7eab] leading-snug w-full">
                    {subtitle}
                </p>

                {/* Price + CTA pinned to bottom */}
                <div className="mt-auto pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                    <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start">
                        <span className="text-[10px] text-[#6c7eab] uppercase font-bold leading-none mb-0 sm:mb-1">
                            {priceLabel}
                        </span>
                        <span className="text-[#ed6f00] text-sm sm:text-base font-extrabold leading-none">
                            {priceValue}
                        </span>
                    </div>
                    <span
                        className="rounded-full bg-[#ed6f00] px-3 sm:px-6 py-2.5 sm:py-2 text-[11px] sm:text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-[#d96200] hover:scale-105 active:scale-95 text-center whitespace-nowrap"
                    >
                        {ctaLabel}
                    </span>
                </div>
            </div>
        </Wrapper>
    );
};

export default PromoCard;
