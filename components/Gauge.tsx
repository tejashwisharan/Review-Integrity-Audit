
import React from 'react';

interface GaugeProps {
  value: number;
  label: string;
  color: string;
}

export const Gauge: React.FC<GaugeProps> = ({ value, label, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            className="text-slate-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <circle
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
            strokeWidth="8"
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>
        <span className="absolute text-xl font-bold text-slate-800">{Math.round(value)}%</span>
      </div>
      <span className="mt-2 text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
};
