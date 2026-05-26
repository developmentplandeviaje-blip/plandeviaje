import bannerImg from '../../assets/bannerdetail.webp';

const DetailBanner = ({ image = bannerImg }) => {
    return (
        <div className="w-full">
            <img
                src={image}
                alt="Banner"
                className="w-full h-auto object-cover max-h-[400px]"
            />
        </div>
    );
};

export default DetailBanner;
