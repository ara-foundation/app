import React, { useEffect, useState, useMemo } from 'react';

interface GalacticMeasurementsProps {
  virtualScreenSize: { width: number; height: number };
  className?: string;
  interval?: number;
}

const GalacticMeasurements: React.FC<GalacticMeasurementsProps> = ({
  virtualScreenSize,
  className = '',
  interval: defaultInterval = 10,
}) => {
  const [initialViewportSize, setInitialViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only set initial viewport size on first render
    if (initialViewportSize.width === 0 && initialViewportSize.height === 0) {
      setInitialViewportSize(virtualScreenSize);
    }
  }, [virtualScreenSize, initialViewportSize]);

  // Generate 10 intervals for the intialViewport Size
  // Then, get the interval amount for the virtual screen size. 
  //   its by dividing
  const getMarks = (size: number, isVertical: boolean) => {
    const marks = [];
    const count = Math.floor(size / defaultInterval);

    for (let i = 1; i <= defaultInterval; i++) {
      const position = (i - 1) * count;
      marks.push(
        <div
          key={i}
          className={`absolute text-[10px] font-mono text-slate-400 dark:text-slate-500 ${isVertical ? 'top-10' : 'left-0'}`}
          style={
            isVertical
              ? {
                top: `${i * defaultInterval}%`,
                transform: 'translateY(-50%)',
              }
              : {
                left: `${i * defaultInterval}%`,
                transform: 'translateX(-50%)',
              }
          }
        >
          {position}
        </div>
      );
    }
    return marks;
  };

  // Memoize marks based on virtualScreenSize - only recalculate when size changes
  const marks = useMemo(() => {
    return {
      width: getMarks(virtualScreenSize.width, false),
      height: getMarks(virtualScreenSize.height, true),
    };
  }, [virtualScreenSize.width, virtualScreenSize.height, defaultInterval]);

  return (
    <>
      {/* Top measurements */}
      <div
        className={`fixed top-10 left-0 right-0 h-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {marks.width}
        <div className="absolute right-8 top-4 text-[10px] font-mono text-slate-400 dark:text-slate-500">
          W: {virtualScreenSize.width}px
        </div>
      </div>

      {/* Bottom measurements */}
      <div
        className={`fixed bottom-8 left-0 right-0 h-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {marks.width}
      </div>

      {/* Left measurements */}
      <div
        className={`fixed top-10 bottom-8 left-1 w-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {marks.height}
        <div
          className="absolute bottom-8 left-8 w-20 border-red-500 text-[10px] font-mono text-slate-400 dark:text-slate-500"
        >
          H: {virtualScreenSize.height}px
        </div>
      </div>

      {/* Right measurements */}
      <div
        className={`fixed top-10 bottom-8 right-0 w-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {marks.height}
      </div>
    </>
  );
};

export default GalacticMeasurements;

