/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Player } from '../types';
import { getBattingProgression, getBowlingProgression } from '../utils/cricketMath';
import { Award, BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

interface PerformanceChartsProps {
  player: Player;
}

export default function PerformanceCharts({ player }: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const battingData = getBattingProgression(player.battingInnings);
  const bowlingData = getBowlingProgression(player.bowlingInnings);

  // Constants for pure SVG coordinates
  const svgWidth = 720;
  const svgHeight = 320;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Render Batting Chart
  const renderBattingChart = () => {
    if (battingData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-white/5">
          <HelpCircle className="w-8 h-8 mb-2 text-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.2)]" />
          <p className="text-sm font-medium text-slate-400">No batting innings logged yet.</p>
        </div>
      );
    }

    // Min/Max Calculations
    const maxRuns = Math.max(...battingData.map(d => d.runs), 50); // Min scope representation
    const maxAverage = Math.max(...battingData.map(d => d.cumulativeAverage), 50);
    const maxYLeft = Math.ceil((maxRuns + 10) / 50) * 50; // runs grid interval
    const maxYRight = Math.ceil((maxAverage + 10) / 10) * 10; // average grid interval

    const pointsCount = battingData.length;

    // Map point to coordinates
    const getX = (index: number) => {
      if (pointsCount <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + (index / (pointsCount - 1)) * chartWidth;
    };

    const getYLeft = (value: number) => {
      return svgHeight - paddingBottom - (value / maxYLeft) * chartHeight;
    };

    const getYRight = (value: number) => {
      return svgHeight - paddingBottom - (value / maxYRight) * chartHeight;
    };

    // Build Average Path Line
    let pathD = '';
    battingData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getYRight(d.cumulativeAverage);
      if (idx === 0) pathD = `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grids on Left Axis (Runs) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const runsVal = Math.round(maxYLeft * ratio);
            const y = getYLeft(runsVal);
            return (
              <g key={`grid-l-${i}`} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">
                  {runsVal}
                </text>
              </g>
            );
          })}

          {/* Grids on Right Axis (Career Average) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const avgVal = Math.round(maxYRight * ratio);
            const y = getYRight(avgVal);
            return (
              <g key={`grid-r-${i}`} className="opacity-60">
                <text x={svgWidth - paddingRight + 8} y={y + 4} textAnchor="start" className="text-[10px] font-mono fill-emerald-400 font-black">
                  {avgVal}
                </text>
              </g>
            );
          })}

          {/* X Axis division lines */}
          {battingData.map((d, idx) => {
            const x = getX(idx);
            return (
              <g key={`axis-x-${idx}`}>
                <line
                  x1={x}
                  y1={svgHeight - paddingBottom}
                  x2={x}
                  y2={svgHeight - paddingBottom + 4}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={1.5}
                />
                <text x={x} y={svgHeight - paddingBottom + 16} textAnchor="middle" className="text-[9px] font-mono fill-slate-450 tracking-wider">
                  I{d.inningsIndex}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={paddingLeft} y={paddingTop - 12} className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">
            Runs Scored (Bars)
          </text>
          <text x={svgWidth - paddingRight} y={paddingTop - 12} textAnchor="end" className="text-[10px] font-black fill-emerald-400 uppercase tracking-widest glow-text">
            Career Average (Line)
          </text>

          {/* Bars for Innings Runs */}
          {battingData.map((d, idx) => {
            const x = getX(idx);
            const yBase = svgHeight - paddingBottom;
            const yRuns = getYLeft(d.runs);
            const barWidth = Math.max(4, Math.min(24, chartWidth / pointsCount * 0.4));
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`bar-${idx}`}>
                <rect
                  x={x - barWidth / 2}
                  y={yRuns}
                  width={barWidth}
                  height={Math.max(2, yBase - yRuns)}
                  rx={2}
                  stroke={isHovered ? '#fbbf24' : 'rgba(217, 119, 6, 0.15)'}
                  strokeWidth={1}
                  className={`transition-colors duration-150 ${
                    isHovered ? 'fill-amber-400 shadow-[0_0_12px_#fbbf24]' : 'fill-amber-600/10 hover:fill-amber-500/20'
                  }`}
                />
              </g>
            );
          })}

          {/* Line for Cumulative Average */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
          />

          {/* Nodes on Line */}
          {battingData.map((d, idx) => {
            const x = getX(idx);
            const y = getYRight(d.cumulativeAverage);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`node-${idx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#0b0f19"
                  stroke="#10b981"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Interactive Trigger Zones */}
          {battingData.map((d, idx) => {
            const x = getX(idx);
            const barWidth = chartWidth / pointsCount;
            const triggerWidth = pointsCount <= 1 ? chartWidth : barWidth;

            return (
              <rect
                key={`trigger-${idx}`}
                x={x - triggerWidth / 2}
                y={paddingTop}
                width={triggerWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}

          {/* Vertical Guide Line on Hover */}
          {hoveredIndex !== null && battingData[hoveredIndex] && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={svgHeight - paddingBottom}
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Floating HTML Tooltip overlay */}
        {hoveredIndex !== null && battingData[hoveredIndex] && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 border border-slate-750 text-xs flex gap-4 min-w-56 backdrop-blur-xs bg-opacity-95 pointer-events-none transition-all duration-100 ease-out z-20">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Inning details</span>
              <div className="font-bold flex items-center gap-1.5 text-sm text-slate-100">
                Innings {battingData[hoveredIndex].inningsIndex}
              </div>
              <div className="text-slate-300 font-medium">
                {battingData[hoveredIndex].opponent} ({battingData[hoveredIndex].venue})
              </div>
            </div>
            <div className="w-px bg-slate-700/50 self-stretch" />
            <div className="space-y-1.5 font-mono text-right flex-1 select-none">
              <div className="flex justify-between gap-4 text-amber-450 font-bold">
                <span>Runs:</span>
                <span>{battingData[hoveredIndex].runs}{!battingData[hoveredIndex].isDismissed ? '*' : ''}</span>
              </div>
              <div className="flex justify-between gap-4 text-emerald-450 font-semibold">
                <span>Avg:</span>
                <span>{battingData[hoveredIndex].cumulativeAverage}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Bowling Chart
  const renderBowlingChart = () => {
    if (bowlingData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-955/40 rounded-xl border border-dashed border-white/5">
          <HelpCircle className="w-8 h-8 mb-2 text-sky-400/60 shadow-[0_0_10px_rgba(58,189,248,0.2)]" />
          <p className="text-sm font-medium text-slate-400">No bowling innings logged yet.</p>
        </div>
      );
    }

    // Min/Max Calculations
    const maxWickets = Math.max(...bowlingData.map(d => d.wickets), 4);
    const maxAverage = Math.max(...bowlingData.map(d => d.cumulativeAverage), 30);
    const maxYLeft = Math.ceil((maxWickets + 1) / 3) * 3; // wickets scale
    const maxYRight = Math.ceil((maxAverage + 5) / 10) * 10; // average scale

    const pointsCount = bowlingData.length;

    const getX = (index: number) => {
      if (pointsCount <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + (index / (pointsCount - 1)) * chartWidth;
    };

    const getYLeft = (value: number) => {
      return svgHeight - paddingBottom - (value / maxYLeft) * chartHeight;
    };

    const getYRight = (value: number) => {
      return svgHeight - paddingBottom - (value / maxYRight) * chartHeight;
    };

    let pathD = '';
    bowlingData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getYRight(d.cumulativeAverage);
      if (idx === 0) pathD = `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grids on Left Axis (Wickets) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const wicketsVal = Math.round(maxYLeft * ratio);
            const y = getYLeft(wicketsVal);
            return (
              <g key={`grid-l-${i}`} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">
                  {wicketsVal}w
                </text>
              </g>
            );
          })}

          {/* Grids on Right Axis (Career Bowling Average) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const avgVal = Math.round(maxYRight * ratio);
            const y = getYRight(avgVal);
            return (
              <g key={`grid-r-${i}`} className="opacity-60">
                <text x={svgWidth - paddingRight + 8} y={y + 4} textAnchor="start" className="text-[10px] font-mono fill-sky-450 font-black">
                  {avgVal}
                </text>
              </g>
            );
          })}

          {/* X Axis division lines */}
          {bowlingData.map((d, idx) => {
            const x = getX(idx);
            return (
              <g key={`axis-x-${idx}`}>
                <line
                  x1={x}
                  y1={svgHeight - paddingBottom}
                  x2={x}
                  y2={svgHeight - paddingBottom + 4}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={1.5}
                />
                <text x={x} y={svgHeight - paddingBottom + 16} textAnchor="middle" className="text-[9px] font-mono fill-slate-450 tracking-wider">
                  I{d.inningsIndex}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={paddingLeft} y={paddingTop - 12} className="text-[10px] font-black fill-slate-400 uppercase tracking-widest">
            Innings Wickets (Bars)
          </text>
          <text x={svgWidth - paddingRight} y={paddingTop - 12} textAnchor="end" className="text-[10px] font-black fill-sky-400 uppercase tracking-widest glow-text">
            Bowling Avg (Line, lower is better)
          </text>

          {/* Bars for Innings Wickets */}
          {bowlingData.map((d, idx) => {
            const x = getX(idx);
            const yBase = svgHeight - paddingBottom;
            const yWickets = getYLeft(d.wickets);
            const barWidth = Math.max(4, Math.min(24, chartWidth / pointsCount * 0.4));
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`bar-${idx}`}>
                <rect
                  x={x - barWidth / 2}
                  y={yWickets}
                  width={barWidth}
                  height={Math.max(2, yBase - yWickets)}
                  rx={2}
                  stroke={isHovered ? '#38bdf8' : 'rgba(2, 132, 199, 0.15)'}
                  strokeWidth={1}
                  className={`transition-colors duration-150 ${
                    isHovered ? 'fill-sky-400 shadow-[0_0_12px_#38bdf8]' : 'fill-sky-500/10 hover:fill-sky-550/20'
                  }`}
                />
              </g>
            );
          })}

          {/* Line for Cumulative Bowling Average */}
          <path
            d={pathD}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
          />

          {/* Nodes on Line */}
          {bowlingData.map((d, idx) => {
            const x = getX(idx);
            const y = getYRight(d.cumulativeAverage);
            const isHovered = hoveredIndex === idx;

            return (
              <g key={`node-${idx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#0b0f19"
                  stroke="#0ea5e9"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Interactive Trigger Zones */}
          {bowlingData.map((d, idx) => {
            const x = getX(idx);
            const barWidth = chartWidth / pointsCount;
            const triggerWidth = pointsCount <= 1 ? chartWidth : barWidth;

            return (
              <rect
                key={`trigger-${idx}`}
                x={x - triggerWidth / 2}
                y={paddingTop}
                width={triggerWidth}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}

          {/* Vertical Guide Line on Hover */}
          {hoveredIndex !== null && bowlingData[hoveredIndex] && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={svgHeight - paddingBottom}
              stroke="#cbd5e1"
              strokeWidth={1}
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Floating HTML Tooltip overlay */}
        {hoveredIndex !== null && bowlingData[hoveredIndex] && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-xl px-4 py-3 border border-slate-750 text-xs flex gap-4 min-w-56 backdrop-blur-xs bg-opacity-95 pointer-events-none transition-all duration-100 ease-out z-20">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Inning details</span>
              <div className="font-bold flex items-center gap-1.5 text-sm text-slate-100">
                Innings {bowlingData[hoveredIndex].inningsIndex}
              </div>
              <div className="text-slate-300 font-medium">
                {bowlingData[hoveredIndex].opponent} ({bowlingData[hoveredIndex].venue})
              </div>
            </div>
            <div className="w-px bg-slate-700/50 self-stretch" />
            <div className="space-y-1.5 font-mono text-right flex-1 select-none">
              <div className="flex justify-between gap-4 text-sky-450 font-bold">
                <span>Wkts/Runs:</span>
                <span>{bowlingData[hoveredIndex].wickets}/{bowlingData[hoveredIndex].runsConceded}</span>
              </div>
              <div className="flex justify-between gap-4 text-sky-350 font-semibold">
                <span>Avg:</span>
                <span>{bowlingData[hoveredIndex].cumulativeAverage}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 border border-white/5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest mb-0.5">Performance Analysis</h4>
          <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">Career Progression & Form Trends</h3>
        </div>

        <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('batting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'batting'
                ? 'bg-slate-800 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Batting Curve</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bowling')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'bowling'
                ? 'bg-slate-800 text-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>Bowling Curve</span>
          </button>
        </div>
      </div>

      <div className="pt-2">
        {activeTab === 'batting' ? renderBattingChart() : renderBowlingChart()}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-slate-450 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 rounded-xs bg-slate-800 border border-white/10 block" />
          <span>Innings Score / Wickets</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-3.5 h-0.5 block ${activeTab === 'batting' ? 'bg-emerald-400' : 'bg-sky-400'}`} />
          <span>Career Progression Average</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-sky-400">
          <span>PRO-TIP:</span>
          <span className="text-slate-450 font-bold uppercase tracking-wider">Hover a point to inspect precise metrics.</span>
        </div>
      </div>
    </div>
  );
}
