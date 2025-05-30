import { useEffect, useState } from "react";
import { StatsCard } from "./DateFilter";

interface SliderImage {
    id: number;
    url: string;
    title: string;
}
export const Dashboard: React.FC = () => {
    const sliderImages: SliderImage[] = [
        {
            id: 1,
            url: 'https://placehold.co/350x150/4CAF50/FFFFFF?text=Important+Notice',
            title: 'Important Notice 1',
        },
        {
            id: 2,
            url: 'https://placehold.co/350x150/2196F3/FFFFFF?text=Safety+Guidelines',
            title: 'Safety Guidelines',
        },
        {
            id: 3,
            url: 'https://placehold.co/350x150/FF9800/FFFFFF?text=New+Updates',
            title: 'New Updates',
        },
    ];


    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ padding: '16px' }}>
            {/* Image Slider */}
            <div style={{
                position: 'relative',
                marginBottom: '24px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                height: '180px'
            }}>
                <img
                    src={sliderImages[currentSlide].url}
                    alt={sliderImages[currentSlide].title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    padding: '16px',
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                        {sliderImages[currentSlide].title}
                    </h3>
                </div>
                {/* Slide indicators */}
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '16px',
                    display: 'flex',
                    gap: '8px',
                }}>
                    {sliderImages.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                            }}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <h3 style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
                Today's Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <StatsCard title="Orders" value="12" color="#4caf50" />
                <StatsCard title="Earnings" value="₹1,250" color="#ff9800" />
            </div>
        </div>
    );
};