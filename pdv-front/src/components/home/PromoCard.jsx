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
            <div className="flex flex-col flex-1 px-4 py-3">
                <h3 className="text-sm font-semibold text-[#001f6c] leading-tight">
                    {title}
                </h3>
                <p className="mt-1 text-xs text-[#6c7eab] leading-snug">
                    {subtitle}
                </p>

                {/* Price + CTA pinned to bottom */}
                <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#001f6c]">
                        {priceLabel}{' '}
                        <span className="text-[#ed6f00] text-sm font-bold">{priceValue}</span>
                    </p>
                    <span
                        className="rounded-full bg-[#ed6f00] px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#d96200] hover:scale-105 active:scale-95"
                    >
                        {ctaLabel}
                    </span>
                </div>
            </div>
        </Wrapper>
    );
};

export default PromoCard;
