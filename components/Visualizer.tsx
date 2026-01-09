
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizerProps {
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<number[]>(Array.from({ length: 40 }, () => Math.random() * 50 + 10));

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 100;
    const barWidth = (width / 40) - 2;

    const svg = d3.select(containerRef.current)
      .html('')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const bars = svg.selectAll('rect')
      .data(dataRef.current)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * (barWidth + 2))
      .attr('y', d => height - d)
      .attr('width', barWidth)
      .attr('height', d => d)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 2);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#38bdf8');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#818cf8');

    let animationId: number;

    const animate = () => {
      if (isPlaying) {
        dataRef.current = dataRef.current.map(v => {
          const change = (Math.random() - 0.5) * 15;
          return Math.max(10, Math.min(80, v + change));
        });

        bars.data(dataRef.current)
          .transition()
          .duration(150)
          .attr('y', d => height - d)
          .attr('height', d => d);
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return <div ref={containerRef} className="w-full h-24 opacity-40 mt-auto" />;
};

export default Visualizer;
