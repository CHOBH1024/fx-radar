import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChart3DProps {
  data: any[];
  name: string;
  strokeColor: string;
}

export const RadarChart3D = ({ data, name, strokeColor }: RadarChart3DProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation based on mouse position
    setRotation({
      x: -(y / rect.height) * 30, // max 15 deg
      y: (x / rect.width) * 30
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div 
      className="w-full h-full relative"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ rotateX: rotation.x, rotateY: rotation.y }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Shadow layer for 3D effect */}
        <div className="absolute inset-0 translate-z-[-20px] opacity-20 blur-xl bg-black rounded-full scale-90"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#94a3b8" className="dark:opacity-30 opacity-60" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 13, fontWeight: 'bold' }} className="text-slate-600 dark:text-slate-300" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: strokeColor }}
            />
            <Radar 
              name={name} 
              dataKey="A" 
              stroke={strokeColor} 
              fill={strokeColor} 
              fillOpacity={0.4} 
              strokeWidth={3} 
              isAnimationActive={true}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
