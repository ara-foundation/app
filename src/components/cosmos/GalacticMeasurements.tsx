import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import NumberFlow from '@number-flow/react';

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

  // Generate mark positions and values - keep track of positions for smooth animation
  const getMarkData = (size: number) => {
    const marks = [];
    const count = Math.floor(size / defaultInterval);

    for (let i = 1; i <= defaultInterval; i++) {
      const position = (i - 1) * count;
      marks.push({
        key: i,
        position,
        percentage: i * defaultInterval,
      });
    }
    return marks;
  };

  // Memoize mark data based on virtualScreenSize - only recalculate when size changes
  const markData = useMemo(() => {
    return {
      width: getMarkData(virtualScreenSize.width),
      height: getMarkData(virtualScreenSize.height),
    };
  }, [virtualScreenSize.width, virtualScreenSize.height, defaultInterval]);

  // Generate marks with motion.div and NumberFlow
  const getMarks = (markDataArray: Array<{ key: number; position: number; percentage: number }>, isVertical: boolean) => {
    return markDataArray.map(({ key, position, percentage }) => (
      <motion.div
        key={key}
        className={`absolute text-[10px] font-mono text-slate-400 dark:text-slate-500 ${isVertical ? 'top-10' : 'left-0'}`}
        initial={false}
        animate={
          isVertical
            ? {
              top: `${percentage}%`,
            }
            : {
              left: `${percentage}%`,
            }
        }
        transition={{
          duration: 0.3,
          ease: 'easeOut',
        }}
        style={
          isVertical
            ? {
              transform: 'translateY(-50%)',
            }
            : {
              transform: 'translateX(-50%)',
            }
        }
      >
        <NumberFlow
          value={position}
          locales="en-US"
          format={{ style: 'decimal', maximumFractionDigits: 0, useGrouping: false }}
        />
      </motion.div>
    ));
  };

  return (
    <>
      {/* Top measurements */}
      <div
        className={`fixed top-10 left-0 right-0 h-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {getMarks(markData.width, false)}
        <motion.div
          className="absolute right-8 top-4 text-[10px] font-mono text-slate-400 dark:text-slate-500"
          initial={false}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
        >
          W:{' '}
          <NumberFlow
            value={virtualScreenSize.width}
            locales="en-US"
            format={{ style: 'decimal', maximumFractionDigits: 0, useGrouping: false }}
          />
          px
        </motion.div>
      </div>

      {/* Bottom measurements */}
      <div
        className={`fixed bottom-8 left-0 right-0 h-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {getMarks(markData.width, false)}
      </div>

      {/* Left measurements */}
      <div
        className={`fixed top-10 bottom-8 left-1 w-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {getMarks(markData.height, true)}
        <motion.div
          className="absolute bottom-8 left-8 w-20 border-red-500 text-[10px] font-mono text-slate-400 dark:text-slate-500"
          initial={false}
          transition={{
            duration: 0.3,
            ease: 'easeOut',
          }}
        >
          H:{' '}
          <NumberFlow
            value={virtualScreenSize.height}
            locales="en-US"
            format={{ style: 'decimal', maximumFractionDigits: 0, useGrouping: false }}
          />
          px
        </motion.div>
      </div>

      {/* Right measurements */}
      <div
        className={`fixed top-10 bottom-8 right-0 w-6 backdrop-blur-lg pointer-events-none z-40 ${className}`}
      >
        {getMarks(markData.height, true)}
      </div>
    </>
  );
};

export default GalacticMeasurements;

