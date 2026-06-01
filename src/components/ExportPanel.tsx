/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';
import { calculateBattingStats, calculateBowlingStats, getBattingProgression, getBowlingProgression } from '../utils/cricketMath';
import { jsPDF } from 'jspdf';
import { Download, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface ExportPanelProps {
  player: Player;
}

export default function ExportPanel({ player }: ExportPanelProps) {
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const batting = calculateBattingStats(player.battingInnings);
  const bowling = calculateBowlingStats(player.bowlingInnings);

  const triggerFeedback = (message: string) => {
    setExportSuccess(message);
    setTimeout(() => {
      setExportSuccess(null);
    }, 4000);
  };

  // 1. Export Batting Records to CSV
  const exportBattingCSV = () => {
    if (player.battingInnings.length === 0) {
      triggerFeedback('No batting data available to export.');
      return;
    }

    const headers = ['Innings Index', 'Match Number', 'Innings Number', 'Opponent', 'Venue', 'Date', 'Runs', 'Balls Faced', 'Dismissed', 'Fours (4s)', 'Sixes (6s)', 'Strike Rate'];
    const rows = [...player.battingInnings]
      .sort((a, b) => a.matchNum - b.matchNum || a.inningsNum - b.inningsNum)
      .map((ing, idx) => {
        const sr = ing.ballsFaced > 0 ? ((ing.runs / ing.ballsFaced) * 100).toFixed(2) : '0.00';
        return [
          idx + 1,
          ing.matchNum,
          ing.inningsNum,
          `"${ing.opponent.replace(/"/g, '""')}"`,
          `"${ing.venue.replace(/"/g, '""')}"`,
          ing.date,
          ing.runs,
          ing.ballsFaced,
          ing.isDismissed ? 'YES' : 'NO',
          ing.fours,
          ing.sixes,
          sr,
        ];
      });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${player.name.toLowerCase().replace(/\s+/g, '_')}_batting_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('Batting CSV exported successfully!');
  };

  // 2. Export Bowling Records to CSV
  const exportBowlingCSV = () => {
    if (player.bowlingInnings.length === 0) {
      triggerFeedback('No bowling data available to export.');
      return;
    }

    const headers = ['Innings Index', 'Match Number', 'Innings Number', 'Opponent', 'Venue', 'Date', 'Overs', 'Maidens', 'Runs Conceded', 'Wickets', 'Economy Rate'];
    const rows = [...player.bowlingInnings]
      .sort((a, b) => a.matchNum - b.matchNum || a.inningsNum - b.inningsNum)
      .map((ing, idx) => {
        const parsedOvers = Math.floor(ing.overs);
        const balls = parsedOvers * 6 + Math.round((ing.overs - parsedOvers) * 10);
        const oversCount = balls / 6;
        const econ = oversCount > 0 ? (ing.runsConceded / oversCount).toFixed(2) : '0.00';
        return [
          idx + 1,
          ing.matchNum,
          ing.inningsNum,
          `"${ing.opponent.replace(/"/g, '""')}"`,
          `"${ing.venue.replace(/"/g, '""')}"`,
          ing.date,
          ing.dnbd ? 'DNBD' : ing.overs.toFixed(1),
          ing.dnbd ? 'DNBD' : ing.maidens,
          ing.dnbd ? 'DNBD' : ing.runsConceded,
          ing.dnbd ? 'DNBD' : ing.wickets,
          ing.dnbd ? 'DNBD' : econ,
        ];
      });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${player.name.toLowerCase().replace(/\s+/g, '_')}_bowling_stats.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerFeedback('Bowling CSV exported successfully!');
  };

  // 3. Export PDF Report Card using standard jsPDF drawing API
  const generatePDFReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page styling parameters
    const startX = 20;
    let currentY = 22;

    // Helper to print horizontal divider
    const drawDivider = (y: number, color = 'slate') => {
      if (color === 'slate') doc.setDrawColor(226, 232, 240); // tailwind slate-200
      else if (color === 'emerald') doc.setDrawColor(5, 150, 105); // emerald-600
      else doc.setDrawColor(148, 163, 184); // slate-400
      doc.setLineWidth(0.4);
      doc.line(startX, y, 190, y);
    };

    // --- Header ---
    doc.setFillColor(6, 95, 70); // deep emerald-800
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TEST CRICKET PERFORMANCE REPORT', startX, 15);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 245, 240);
    doc.text(`Generated on: ${new Date().toISOString().split('T')[0]} | Powered by Cricket Analyst Workspace`, startX, 21);

    currentY = 48;

    // --- Player Profile ---
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PLAYER PROFILE', startX, currentY);
    currentY += 4;
    drawDivider(currentY, 'emerald');
    currentY += 8;

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600

    doc.setFont('Helvetica', 'bold');
    doc.text('Name:', startX, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(player.name, startX + 35, currentY);

    doc.setFont('Helvetica', 'bold');
    doc.text('State:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(player.state, startX + 125, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Player Designation:', startX, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(player.role, startX + 35, currentY);

    doc.setFont('Helvetica', 'bold');
    doc.text('Batting Style:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(player.battingStyle, startX + 125, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Bowling Style:', startX, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(player.bowlingStyle, startX + 35, currentY);

    currentY += 12;

    // --- Cumulative Batting Stats Section ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('TEST BATTING AGGREGATE SUMMARY', startX, currentY);
    currentY += 4;
    drawDivider(currentY);
    currentY += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700

    // Print Grid layout for Stats
    doc.setFont('Helvetica', 'bold');
    doc.text('Matches Played:', startX, currentY);
    doc.text('Innings Batted:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(batting.matches), startX + 40, currentY);
    doc.text(String(batting.innings), startX + 130, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Total Runs:', startX, currentY);
    doc.text('Career Average:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(batting.runs), startX + 40, currentY);
    doc.text(batting.innings > 0 ? String(batting.average) : '-', startX + 130, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Strike Rate:', startX, currentY);
    doc.text('Highest Score:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(batting.innings > 0 ? `${batting.strikeRate}` : '-', startX + 40, currentY);
    doc.text(`${batting.highScore}${batting.highScoreNotOut ? '*' : ''}`, startX + 130, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Hundreds (100s):', startX, currentY);
    doc.text('Fifties (50s):', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(batting.hundreds), startX + 40, currentY);
    doc.text(String(batting.fifties), startX + 130, currentY);

    currentY += 12;

    // --- Cumulative Bowling Stats Section ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199); // sky-700
    doc.text('TEST BOWLING AGGREGATE SUMMARY', startX, currentY);
    currentY += 4;
    drawDivider(currentY);
    currentY += 7;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700

    doc.setFont('Helvetica', 'bold');
    doc.text('Matches Logged:', startX, currentY);
    doc.text('Innings Bowled:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(bowling.matches), startX + 40, currentY);
    doc.text(String(bowling.innings), startX + 132, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Total Wickets:', startX, currentY);
    doc.text('Bowling Average:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(bowling.wickets), startX + 40, currentY);
    doc.text(bowling.wickets > 0 ? String(bowling.average) : '-', startX + 132, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Economy Rate:', startX, currentY);
    doc.text('Bowling Strike Rate:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(bowling.innings > 0 ? String(bowling.economyRate) : '-', startX + 40, currentY);
    doc.text(bowling.wickets > 0 ? String(bowling.strikeRate) : '-', startX + 132, currentY);

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Total Overs:', startX, currentY);
    doc.text('Best Figures (BBI):', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(bowling.overs, startX + 40, currentY);
    doc.text(
      bowling.bestInningsWickets > 0 
        ? `${bowling.bestInningsWickets}/${bowling.bestInningsRuns}` 
        : '-', 
      startX + 132, 
      currentY
    );

    currentY += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('5w Hauls:', startX, currentY);
    doc.text('10w in Match:', startX + 90, currentY);
    doc.setFont('Helvetica', 'normal');
    doc.text(String(bowling.fiveWickets), startX + 40, currentY);
    doc.text(String(bowling.tenWickets), startX + 132, currentY);

    // --- Page 2: Performance Progression Charts ---
    doc.addPage();
    currentY = 20;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('CAREER PROGRESSION & PERFORMANCE TRENDS', startX, currentY);
    currentY += 4;
    drawDivider(currentY, 'emerald');
    currentY += 12;

    // Render Batting progression chart
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('Batting Curve - Innings Runs vs Cumulative Career Average', startX, currentY);
    currentY += 6;

    const chartW = 150;
    const chartH = 42;
    const battingProg = getBattingProgression(player.battingInnings);
    drawBattingChartPDF(doc, startX + 10, currentY, chartW, chartH, battingProg);
    
    currentY += chartH + 20; // safe spacing

    // Render Bowling progression chart
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 132, 199); // sky-700
    doc.text('Bowling Curve - Wickets vs Cumulative Career Bowling Average', startX, currentY);
    currentY += 6;

    const bowlingProg = getBowlingProgression(player.bowlingInnings);
    drawBowlingChartPDF(doc, startX + 10, currentY, chartW, chartH, bowlingProg);

    // Add a new page for detailed match lists
    doc.addPage();
    currentY = 20;

    // --- Batting Log Table ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('DETAILED BATTING LOGS (Recent)', startX, currentY);
    currentY += 4;
    drawDivider(currentY, 'slate');
    currentY += 6;

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('Helvetica', 'bold');
    doc.text('Match', startX, currentY);
    doc.text('Inns', startX + 15, currentY);
    doc.text('Opponent / Venue', startX + 28, currentY);
    doc.text('Runs', startX + 95, currentY);
    doc.text('Balls', startX + 115, currentY);
    doc.text('Strike Rate', startX + 135, currentY);
    doc.text('Date', startX + 160, currentY);
    currentY += 3;
    drawDivider(currentY);
    currentY += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    const sortedBat = [...player.battingInnings].sort((a,b) => b.matchNum - a.matchNum || b.inningsNum - a.inningsNum);
    const recentBat = sortedBat.slice(0, 12); // maximum 12 records in table to fit well

    if (recentBat.length === 0) {
      doc.text('No batting records logged.', startX, currentY);
      currentY += 8;
    } else {
      recentBat.forEach(ing => {
        const sr = ing.ballsFaced > 0 ? ((ing.runs / ing.ballsFaced) * 100).toFixed(1) : '0';
        doc.setFont('Helvetica', 'bold');
        doc.text(`Match ${ing.matchNum}`, startX, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(ing.inningsNum), startX + 15, currentY);
        doc.text(`${ing.opponent} (${ing.venue})`, startX + 28, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${ing.runs}${ing.isDismissed ? '' : '*'}`, startX + 95, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(ing.ballsFaced), startX + 115, currentY);
        doc.text(sr, startX + 135, currentY);
        doc.text(ing.date, startX + 160, currentY);
        currentY += 5.5;
      });
      currentY += 4;
    }

    currentY += 4;

    // --- Bowling Log Table ---
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('DETAILED BOWLING LOGS (Recent)', startX, currentY);
    currentY += 4;
    drawDivider(currentY, 'slate');
    currentY += 6;

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('Helvetica', 'bold');
    doc.text('Match', startX, currentY);
    doc.text('Inns', startX + 15, currentY);
    doc.text('Opponent / Venue', startX + 28, currentY);
    doc.text('Overs', startX + 95, currentY);
    doc.text('Mdns', startX + 115, currentY);
    doc.text('Runs Con', startX + 135, currentY);
    doc.text('Wickets', startX + 155, currentY);
    doc.text('Date', startX + 172, currentY);
    currentY += 3;
    drawDivider(currentY);
    currentY += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    const sortedBowl = [...player.bowlingInnings].sort((a,b) => b.matchNum - a.matchNum || b.inningsNum - a.inningsNum);
    const recentBowl = sortedBowl.slice(0, 12);

    if (recentBowl.length === 0) {
      doc.text('No bowling records logged.', startX, currentY);
    } else {
      recentBowl.forEach(ing => {
        doc.setFont('Helvetica', 'bold');
        doc.text(`Match ${ing.matchNum}`, startX, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(String(ing.inningsNum), startX + 15, currentY);
        doc.text(`${ing.opponent} (${ing.venue})`, startX + 28, currentY);
        doc.text(ing.dnbd ? 'DNBD' : ing.overs.toFixed(1), startX + 95, currentY);
        doc.text(ing.dnbd ? 'DNBD' : String(ing.maidens), startX + 115, currentY);
        doc.text(ing.dnbd ? 'DNBD' : String(ing.runsConceded), startX + 135, currentY);
        doc.setFont('Helvetica', 'bold');
        doc.text(ing.dnbd ? 'DNBD' : `${ing.wickets} Wkts`, startX + 155, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(ing.date, startX + 172, currentY);
        currentY += 5.5;
      });
    }

    doc.save(`${player.name.toLowerCase().replace(/\s+/g, '_')}_performance_report.pdf`);
    triggerFeedback('PDF Report generated and downloaded successfully!');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5 mb-1">
            <Download className="w-4 h-4 text-sky-400" />
            <span>Analytical Data & Report Exporters</span>
          </h3>
          <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest leading-normal">
            Export raw dataset queries or build dynamic high-quality PDF files for presentations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportBattingCSV}
            className="flex items-center gap-1.5 px-4 py-2 btn-outline rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Batting CSV</span>
          </button>

          <button
            type="button"
            onClick={exportBowlingCSV}
            className="flex items-center gap-1.5 px-4 py-2 btn-outline rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bowling CSV</span>
          </button>

          <button
            type="button"
            onClick={generatePDFReport}
            className="flex items-center gap-1.5 px-4 py-2 btn-primary rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(58,189,248,0.2)]"
          >
            <FileText className="w-4 h-4" />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="mt-4 p-3 bg-slate-900/80 border border-emerald-555/20 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-2 animate-fade-in shadow-inner">
          <CheckCircle className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_#22c55e]" />
          <span>{exportSuccess}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================
//   PDF Vector Chart Rendering Helpers
// ==========================================

function drawBattingChartPDF(doc: jsPDF, startX: number, startY: number, width: number, height: number, data: any[]) {
  if (data.length === 0) {
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(startX, startY, width, height, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('No batting statistics logged for trend analysis.', startX + width / 2, startY + height / 2, { align: 'center' });
    return;
  }

  // Draw background frame/grid
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(startX, startY, width, height, 'F');

  // Min/Max calculations
  const maxRuns = Math.max(...data.map(d => d.runs), 50);
  const maxAverage = Math.max(...data.map(d => d.cumulativeAverage), 50);
  const maxYLeft = Math.ceil((maxRuns + 10) / 50) * 50;
  const maxYRight = Math.ceil((maxAverage + 10) / 10) * 10;

  const pointsCount = data.length;

  // Grid lines
  const gridRatios = [0, 0.25, 0.5, 0.75, 1];
  doc.setFontSize(6.5);
  doc.setFont('Helvetica', 'normal');
  gridRatios.forEach(ratio => {
    const yVal = startY + height - ratio * height;
    
    // Draw horizontal dashed gridline
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.12);
    doc.line(startX, yVal, startX + width, yVal);

    // Left axis label (Runs)
    const runsVal = Math.round(maxYLeft * ratio);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(String(runsVal), startX - 3, yVal + 1.5, { align: 'right' });

    // Right axis label (Average)
    const avgVal = Math.round(maxYRight * ratio);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(String(avgVal), startX + width + 3, yVal + 1.5, { align: 'left' });
  });

  // Scale functions
  const getX = (index: number) => {
    if (pointsCount <= 1) return startX + width / 2;
    return startX + (index / (pointsCount - 1)) * width;
  };

  const getYLeft = (value: number) => {
    return startY + height - (value / maxYLeft) * height;
  };

  const getYRight = (value: number) => {
    return startY + height - (value / maxYRight) * height;
  };

  // 1. Draw bars for Runs
  const barWidth = Math.max(1.5, Math.min(8, (width / pointsCount) * 0.45));
  data.forEach((d, idx) => {
    const x = getX(idx);
    const yVal = getYLeft(d.runs);
    const yBase = startY + height;

    doc.setFillColor(245, 158, 11); // amber-500
    doc.setDrawColor(217, 119, 6); // amber-600
    doc.setLineWidth(0.1);
    doc.rect(x - barWidth / 2, yVal, barWidth, Math.max(0.4, yBase - yVal), 'FD');
  });

  // 2. Draw line for Cumulative Average
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(1.0);
  for (let i = 0; i < pointsCount - 1; i++) {
    const x1 = getX(i);
    const y1 = getYRight(data[i].cumulativeAverage);
    const x2 = getX(i + 1);
    const y2 = getYRight(data[i + 1].cumulativeAverage);
    doc.line(x1, y1, x2, y2);
  }

  // 3. Draw circles/nodes on cumulative average line
  data.forEach((d, idx) => {
    const x = getX(idx);
    const y = getYRight(d.cumulativeAverage);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.6);
    doc.circle(x, y, 1.0, 'FD');
  });

  // 4. Draw X-axis tick labels
  doc.setTextColor(115, 115, 115);
  doc.setFontSize(6);
  const labelStep = Math.max(1, Math.ceil(pointsCount / 14));
  data.forEach((d, idx) => {
    if (idx % labelStep === 0) {
      const x = getX(idx);
      doc.text(`I${d.inningsIndex}`, x, startY + height + 3.5, { align: 'center' });
    }
  });

  // Draw Axis Title / Legend
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text('runs scored (bars)', startX, startY - 2.5);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text('career average progression (line)', startX + width, startY - 2.5, { align: 'right' });
}

function drawBowlingChartPDF(doc: jsPDF, startX: number, startY: number, width: number, height: number, data: any[]) {
  if (data.length === 0) {
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(startX, startY, width, height, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('No bowling statistics logged for trend analysis.', startX + width / 2, startY + height / 2, { align: 'center' });
    return;
  }

  // Draw background frame/grid
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(startX, startY, width, height, 'F');

  // Min/Max calculations
  const maxWickets = Math.max(...data.map(d => d.wickets), 4);
  const maxAverage = Math.max(...data.map(d => d.cumulativeAverage), 30);
  const maxYLeft = Math.ceil((maxWickets + 1) / 3) * 3;
  const maxYRight = Math.ceil((maxAverage + 5) / 10) * 10;

  const pointsCount = data.length;

  // Grid lines
  const gridRatios = [0, 0.25, 0.5, 0.75, 1];
  doc.setFontSize(6.5);
  doc.setFont('Helvetica', 'normal');
  gridRatios.forEach(ratio => {
    const yVal = startY + height - ratio * height;
    
    // Draw horizontal dashed gridline
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.12);
    doc.line(startX, yVal, startX + width, yVal);

    // Left axis label (Wickets)
    const wicketsVal = Math.round(maxYLeft * ratio);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${wicketsVal}w`, startX - 3, yVal + 1.5, { align: 'right' });

    // Right axis label (Average)
    const avgVal = Math.round(maxYRight * ratio);
    doc.setTextColor(14, 165, 233); // sky-500
    doc.text(String(avgVal), startX + width + 3, yVal + 1.5, { align: 'left' });
  });

  // Scale functions
  const getX = (index: number) => {
    if (pointsCount <= 1) return startX + width / 2;
    return startX + (index / (pointsCount - 1)) * width;
  };

  const getYLeft = (value: number) => {
    return startY + height - (value / maxYLeft) * height;
  };

  const getYRight = (value: number) => {
    return startY + height - (value / maxYRight) * height;
  };

  // 1. Draw bars for Wickets
  const barWidth = Math.max(1.5, Math.min(8, (width / pointsCount) * 0.45));
  data.forEach((d, idx) => {
    const x = getX(idx);
    const yVal = getYLeft(d.wickets);
    const yBase = startY + height;

    doc.setFillColor(56, 189, 248); // sky-400
    doc.setDrawColor(2, 132, 199); // sky-600
    doc.setLineWidth(0.1);
    doc.rect(x - barWidth / 2, yVal, barWidth, Math.max(0.4, yBase - yVal), 'FD');
  });

  // 2. Draw line for Cumulative Bowling Average
  doc.setDrawColor(14, 165, 233); // sky-500
  doc.setLineWidth(1.0);
  for (let i = 0; i < pointsCount - 1; i++) {
    const x1 = getX(i);
    const y1 = getYRight(data[i].cumulativeAverage);
    const x2 = getX(i + 1);
    const y2 = getYRight(data[i + 1].cumulativeAverage);
    doc.line(x1, y1, x2, y2);
  }

  // 3. Draw circles/nodes on the cumulative average line
  data.forEach((d, idx) => {
    const x = getX(idx);
    const y = getYRight(d.cumulativeAverage);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(0.6);
    doc.circle(x, y, 1.0, 'FD');
  });

  // 4. Draw X-axis tick labels
  doc.setTextColor(115, 115, 115);
  doc.setFontSize(6);
  const labelStep = Math.max(1, Math.ceil(pointsCount / 14));
  data.forEach((d, idx) => {
    if (idx % labelStep === 0) {
      const x = getX(idx);
      doc.text(`I${d.inningsIndex}`, x, startY + height + 3.5, { align: 'center' });
    }
  });

  // Draw Axis Title / Legend
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(2, 132, 199); // Sky
  doc.text('wickets taken (bars)', startX, startY - 2.5);
  doc.setTextColor(14, 165, 233); // Light Sky
  doc.text('bowling average progression (line)', startX + width, startY - 2.5, { align: 'right' });
}
