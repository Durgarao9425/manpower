import { useEffect, useState } from "react";
import { StatsCard } from "./DateFilter";
import { fetchSliderImages } from "../../../services/apiService";

interface SliderImage {
    id: number;
    url: string;
    title: string;
    image_path: string;
    description: string;
    status: string;
    display_order?: number;
}

export const Dashboard: React.FC = () => {
    const [sliders, setSliders] = useState<SliderImage[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const getImageUrl = (imagePath: string): string => {
        if (!imagePath) return 'https://placehold.co/350x150/4CAF50/FFFFFF?text=No+Image';

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // If it's a base64 data URL, return as is
        if (imagePath.startsWith('data:image/')) {
            return imagePath;
        }

        // Otherwise, construct full URL with your API base URL
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4003';

        // Remove leading slash if present to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

        // Use the direct image endpoint for better reliability
        const directUrl = `${API_BASE}/api/direct-image/${cleanPath}`;
        console.log(`Using direct image URL: ${directUrl} from path: ${imagePath}`);

        return directUrl;
    };

    useEffect(() => {
        const loadSliders = async () => {
            try {
                setIsLoading(true);
                const data = await fetchSliderImages();
                console.log('Fetched slider data:', data);

                // Filter only active sliders and map to expected format
                const activeSliders = data
                    .filter(slider => slider.status === 'active')
                    .map(slider => {
                        // Get the full image URL
                        const imageUrl = getImageUrl(slider.image_path);
                        console.log(`Processing slider ${slider.id}: ${slider.image_path} -> ${imageUrl}`);

                        return {
                            id: slider.id,
                            url: imageUrl,
                            title: slider.title,
                            image_path: slider.image_path,
                            description: slider.description,
                            status: slider.status,
                            display_order: slider.display_order
                        };
                    })
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

                console.log('Processed active sliders:', activeSliders);
                setSliders(activeSliders);

                // If no active sliders, use fallback
                if (activeSliders.length === 0) {
                    console.log('No active sliders found, using fallback');
                    setSliders([
                        {
                            id: 1,
                            url: 'https://placehold.co/350x150/4CAF50/FFFFFF?text=No+Active+Sliders',
                            title: 'No Active Sliders',
                            image_path: '',
                            description: 'No active slider images found',
                            status: 'active'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching slider images:', error);
                // Set fallback slider on error
                setSliders([
                    {
                        id: 1,
                        url: 'https://placehold.co/350x150/FF5722/FFFFFF?text=Error+Loading',
                        title: 'Error Loading Sliders',
                        image_path: '',
                        description: 'Failed to load slider images',
                        status: 'active'
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadSliders();
    }, []);

    useEffect(() => {
        if (sliders.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sliders.length);
            }, 3000);
            return () => clearInterval(timer);
        }
    }, [sliders.length]);

    // Handle image loading errors
    const handleImageError = (index: number) => {
        console.error(`Failed to load image for slider ${sliders[index]?.id}`, sliders[index]?.image_path);
        setSliders(prev => prev.map((slider, i) =>
            i === index
                ? {
                    ...slider,
                    url: 'https://placehold.co/350x150/9E9E9E/FFFFFF?text=Image+Not+Found'
                }
                : slider
        ));
    };

    if (isLoading) {
        return (
            <div style={{ padding: '16px' }}>
                <div style={{
                    position: 'relative',
                    marginBottom: '24px',
                    borderRadius: '16px', // Increased border radius for smoother corners
                    overflow: 'hidden',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)', // Enhanced shadow for better depth
                    height: '220px', // Adjusted height for better visibility
                    backgroundColor: '#e0e0e0', // Slightly lighter background color
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div>Loading sliders...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px' }}>
            {/* Image Slider */}
            <div style={{
                position: 'relative',
                marginBottom: '24px',
                borderRadius: '16px', // Increased border radius for smoother corners
                overflow: 'hidden',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)', // Enhanced shadow for better depth
                height: '220px' // Adjusted height for better visibility
            }}>
                <img
                    src={sliders[currentSlide]?.url}
                    alt={sliders[currentSlide]?.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    onError={(e) => {
                        console.error(`Failed to load image: ${sliders[currentSlide]?.url}`);
                        console.error(`Original image path: ${sliders[currentSlide]?.image_path}`);

                        // Try with a direct proxy approach
                        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4003';
                        const proxyUrl = `${API_BASE}/api/image-proxy?url=${encodeURIComponent(sliders[currentSlide]?.url)}`;

                        // Update the image source to use the proxy
                        (e.target as HTMLImageElement).src = proxyUrl;

                        // If proxy fails, use fallback
                        (e.target as HTMLImageElement).onerror = () => {
                            console.error(`Proxy also failed, using fallback`);
                            handleImageError(currentSlide);
                        };
                    }}
                    onLoad={() => console.log(`Successfully loaded image: ${sliders[currentSlide]?.url}`)}
                    crossOrigin="anonymous"
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
                        {sliders[currentSlide]?.title}
                    </h3>
                    {sliders[currentSlide]?.description && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                            {sliders[currentSlide].description.length > 100
                                ? `${sliders[currentSlide].description.substring(0, 100)}...`
                                : sliders[currentSlide].description
                            }
                        </p>
                    )}
                </div>

                {sliders.length > 1 && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '16px',
                        display: 'flex',
                        gap: '8px',
                    }}>
                        {sliders.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'backgroundColor 0.3s ease'
                                }}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                )}
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