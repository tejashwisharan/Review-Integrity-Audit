
import React from 'react';

interface GaugeProps {
  value: number;
  label: string;
  color: string;
}

export const Gauge: React.FC<GaugeProps> = ({ value, label, color }) => {
  // Use a slightly smaller radius to prevent edge clipping with the 8px stroke
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        {/* Set overflow-visible and explicit viewBox to prevent clipping */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-24 h-24 transform -rotate-90 overflow-visible"
        >
          <circle
            className="text-slate-100"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset: offset,
              transition: 'stroke-dashoffset 0.8s ease-in-out'
            }}
            strokeWidth="8"
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
        <span className="absolute text-xl font-black text-slate-800 tracking-tighter">
          {Math.round(value)}%
        </span>
      </div>
      <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
};