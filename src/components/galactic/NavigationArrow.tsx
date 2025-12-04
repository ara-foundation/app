import React, { useState } from 'react';
import { getIcon } from '@/components/icon';
import NumberFlow from '@number-flow/react';
import Tooltip from '@/components/custom-ui/Tooltip';

interface NavigationArrowProps {
    distance?: number;
    onNavigate?: () => void;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({
    distance: initialDistance = 1000,
    onNavigate,
}) => {
    const [distance, setDistance] = useState(initialDistance);
    const [isNavigating, setIsNavigating] = useState(false);

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
                // Navigate to CascadeFund
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
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <Tooltip content="Go to the Center of the Universe, the CascadeFund">
                <button
                    onClick={handleClick}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-white/10 dark:hover:bg-slate-900/10 transition-all duration-300 opacity-10 hover:opacity-100"
                    disabled={isNavigating}
                >
                    {/* Blue futuristic Mekga icon */}
                    {getIcon({ iconType: 'mekga', className: 'w-6 h-6 text-blue-500' })}
                    
                    {/* Pointing arrow (40% rotated to left, pointing top-left) */}
                    <div 
                        style={{ transform: 'rotate(-40deg)' }}
                    >
                        {getIcon({ iconType: 'arrow-right', className: 'w-5 h-5 text-slate-600 dark:text-slate-400' })}
                    </div>
                    
                    {/* NumberFlow showing distance */}
                    <NumberFlow
                        value={Math.round(distance)}
                        locales="en-US"
                        format={{ style: 'decimal', maximumFractionDigits: 0 }}
                        className="text-sm font-mono text-slate-700 dark:text-slate-300"
                    />
                </button>
            </Tooltip>
        </div>
    );
};

export default NavigationArrow;

