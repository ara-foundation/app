import React, { useState, useEffect } from 'react';
import Galaxy from '@/components/Galaxy';

interface GalaxyWrapperProps {
    minZoom?: number;
    mouseInteraction?: boolean;
    speed?: number;
    rotationSpeed?: number;
    twinkleIntensity?: number;
    repulsionStrength?: number;
}

interface ZoomChangeEventDetail {
    zoom: number;
    virtualScreenSize: { width: number; height: number };
    initialViewportSize: { width: number; height: number };
}

const GalaxyWrapper: React.FC<GalaxyWrapperProps> = ({
    minZoom = 25,
    mouseInteraction = true,
    speed = 0.25,
    rotationSpeed = 0.015,
    twinkleIntensity = 0.2,
    repulsionStrength = 1,
}) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [galaxySize, setGalaxySize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleZoomChange = (event: Event) => {
            const customEvent = event as CustomEvent<ZoomChangeEventDetail>;
            const { virtualScreenSize, initialViewportSize } = customEvent.detail;

            // Container expands to virtual screen size
            setContainerSize({
                width: virtualScreenSize.width,
                height: virtualScreenSize.height,
            });

            // Galaxy component stays at initial viewport size (stars don't scale)
            setGalaxySize({
                width: initialViewportSize.width,
                height: initialViewportSize.height,
            });
        };

        window.addEventListener('galaxy-zoom-change', handleZoomChange);

        // Initialize with current viewport size if no event has fired yet
        const initialWidth = window.innerWidth;
        const initialHeight = window.innerHeight;
        setContainerSize({ width: initialWidth, height: initialHeight });
        setGalaxySize({ width: initialWidth, height: initialHeight });

        return () => {
            window.removeEventListener('galaxy-zoom-change', handleZoomChange);
        };
    }, []);

    // Don't render until we have sizes
    if (containerSize.width === 0 || containerSize.height === 0 || galaxySize.width === 0 || galaxySize.height === 0) {
        return null;
    }

    return (
        <div
            style={{
                width: `${containerSize.width}px`,
                height: `${containerSize.height}px`,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                transition: 'width 0.3s ease-out, height 0.3s ease-out',
            }}
        >
            <div
                style={{
                    width: `${galaxySize.width}px`,
                    height: `${galaxySize.height}px`,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <Galaxy
                    mouseInteraction={mouseInteraction}
                    speed={speed}
                    rotationSpeed={rotationSpeed}
                    twinkleIntensity={twinkleIntensity}
                    repulsionStrength={repulsionStrength}
                />
            </div>
        </div>
    );
};

export default GalaxyWrapper;

