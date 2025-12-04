import React, { useMemo } from 'react';

interface CompassArrowProps {
    currentPosition: { x: number; y: number };
    targetPosition: { x: number; y: number };
    className?: string;
}

const CompassArrow: React.FC<CompassArrowProps> = ({
    currentPosition,
    targetPosition,
    className = '',
}) => {
    // Calculate angle in degrees from current position to target position
    const angle = useMemo(() => {
        const dx = targetPosition.x - currentPosition.x;
        const dy = targetPosition.y - currentPosition.y;
        // atan2 returns angle in radians, convert to degrees
        const radians = Math.atan2(dy, dx);
        const degrees = (radians * 180) / Math.PI;
        return degrees;
    }, [currentPosition, targetPosition]);

    return (
        <div
            className={`relative ${className}`}
            style={{
                width: '20px',
                height: '20px',
            }}
        >
            {/* Compass circle background */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    backgroundColor: 'rgba(20, 184, 166, 0.2)', // teal-500 with 20% opacity
                    border: '1px solid rgba(20, 184, 166, 0.6)', // teal-500 border
                    boxShadow: '0 0 4px rgba(20, 184, 166, 0.4)',
                }}
            />

            {/* Compass arrow (blue and red triangles) */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center',
                }}
            >
                <svg
                    width="50"
                    height="50"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Red triangle pointing up (North) */}
                    <path
                        d="M12 2 L16 10 L12 8 L8 10 Z"
                        fill="#ef4444"
                        stroke="#dc2626"
                        strokeWidth="0.5"
                    />
                    {/* Blue triangle pointing down (South) */}
                    <path
                        d="M12 22 L16 14 L12 16 L8 14 Z"
                        fill="#3b82f6"
                        stroke="#2563eb"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>
        </div>
    );
};

export default CompassArrow;

