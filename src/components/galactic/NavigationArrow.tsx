import React, { useState, useMemo, useEffect } from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import Tooltip from '@/components/custom-ui/Tooltip';
import Button from '../custom-ui/Button';
import CompassArrow from './CompassArrow';

interface NavigationArrowProps {
    galaxyPosition?: { x: number; y: number };
    mekgaPosition?: { x: number; y: number };
    onNavigate?: () => void;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({
    galaxyPosition,
    mekgaPosition,
    onNavigate,
}) => {
    // Calculate distance between galaxy and mekga positions
    const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Get default positions (galaxy at center, mekga at origin or offset)
    const getDefaultPositions = () => {
        if (typeof window === 'undefined') {
            return {
                galaxy: { x: 100, y: 100 },
                mekga: { x: 0, y: 0 },
            };
        }
        const viewportCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        // If positions are provided, use them; otherwise use defaults
        // Galaxy is at viewport center when viewing it, mekga (universe center) is at origin
        return {
            galaxy: galaxyPosition || viewportCenter,
            mekga: mekgaPosition || { x: 0, y: 0 }, // Mekga at origin (center of universe)
        };
    };

    const [positions, setPositions] = useState(() => {
        if (typeof window !== 'undefined') {
            return getDefaultPositions();
        }
        return { galaxy: { x: 100, y: 100 }, mekga: { x: 0, y: 0 } };
    });

    // Update positions when window is available or props change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const viewportCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            setPositions({
                galaxy: galaxyPosition || viewportCenter,
                mekga: mekgaPosition || { x: 0, y: 0 },
            });
        }
    }, [galaxyPosition, mekgaPosition]);
    const initialDistance = useMemo(() => {
        return calculateDistance(positions.galaxy, positions.mekga);
    }, [positions.galaxy, positions.mekga]);

    const [distance, setDistance] = useState(initialDistance);
    const [isNavigating, setIsNavigating] = useState(false);

    // Update distance when positions change (but not during navigation)
    useEffect(() => {
        if (!isNavigating) {
            const newDistance = calculateDistance(positions.galaxy, positions.mekga);
            setDistance(newDistance);
        }
    }, [positions.galaxy, positions.mekga, isNavigating]);

    const handleClick = () => {
        if (isNavigating) return;

        setIsNavigating(true);

        // Animate distance decrease
        const duration = 1500;
        const startTime = Date.now();
        const startDistance = distance;
        const targetDistance = 0;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentDistance = startDistance - (startDistance - targetDistance) * easeOut;

            setDistance(currentDistance);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Navigate to Ara
                if (onNavigate) {
                    onNavigate();
                } else {
                    window.location.href = '/all-stars';
                }
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50">
            <Tooltip content="Go to the Center of the Universe, Ara">
                <Button
                    variant="secondary"
                    onClick={handleClick}
                    className="flex items-center gap-3 px-4 py-2 bg-transparent border-none dark:bg-transparent dark:border-none backdrop-blur-sm hover:bg-blue/20 dark:hover:bg-blue-400/20 transition-all duration-300 "
                    disabled={isNavigating}
                >
                    {/* Blue futuristic Mekga icon */}
                    {getIcon({ iconType: 'mekga', className: 'w-6 h-6 text-blue-500' })}

                    <div className="flex items-center gap-1">
                        {/* Compass arrow pointing from galaxy to mekga */}
                        <CompassArrow
                            currentPosition={positions.galaxy}
                            targetPosition={positions.mekga}
                        />

                        {/* NumberFlow showing distance */}
                        <NumberFlow
                            value={Math.round(distance)}
                            locales="en-US"
                            format={{ style: 'decimal', maximumFractionDigits: 0 }}
                            className="text-sm font-mono text-slate-700 dark:text-slate-300"
                        />
                    </div>
                </Button>
            </Tooltip>
        </div>
    );
};

export default NavigationArrow;

