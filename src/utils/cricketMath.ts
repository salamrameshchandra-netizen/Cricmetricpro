/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BattingInnings, BowlingInnings, CareerBattingStats, CareerBowlingStats } from '../types';

// Convert overs written as a decimal (e.g., 20.4 is 20 overs and 4 balls) to total balls
export function oversToBalls(overs: number): number {
  const parsedOvers = Math.floor(overs);
  const fraction = overs - parsedOvers;
  // Get decimal portion, e.g., for 20.4, 0.4 * 10 is 4 balls
  const balls = Math.round(fraction * 10);
  // Ensure we don't exceed 5 balls in fraction (though 20.6 is technically 21, let's normalize)
  const normalizedBalls = balls >= 6 ? 0 : balls;
  const addedOvers = balls >= 6 ? 1 : 0;
  return (parsedOvers + addedOvers) * 6 + normalizedBalls;
}

// Convert total balls to overs string (e.g., 124 balls -> "20.4")
export function ballsToOvers(balls: number): string {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
}

// Convert overs to bowling format float (for database compatibility)
export function ballsToOversFloat(balls: number): number {
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return overs + (remainingBalls / 10);
}

// Calculate comprehensive batting stats for a player
export function calculateBattingStats(innings: BattingInnings[]): CareerBattingStats {
  const uniqueMatches = new Set(innings.map(ing => ing.matchNum)).size;
  const activeInnings = innings.filter(ing => !ing.dnb);

  if (activeInnings.length === 0) {
    return {
      matches: uniqueMatches,
      innings: 0,
      notOuts: 0,
      runs: 0,
      highScore: 0,
      highScoreNotOut: false,
      average: 0,
      strikeRate: 0,
      hundreds: 0,
      fifties: 0,
      fours: 0,
      sixes: 0,
      ducks: 0,
    };
  }

  let totalRuns = 0;
  let totalBalls = 0;
  let totalMinutes = 0;
  let notOuts = 0;
  let highScore = 0;
  let highScoreNotOut = false;
  let hundreds = 0;
  let fifties = 0;
  let fours = 0;
  let sixes = 0;
  let ducks = 0;

  // Sort chronological for stats calculation (just to verify)
  const sorted = [...activeInnings].sort((a, b) => a.matchNum - b.matchNum || a.inningsNum - b.inningsNum);

  sorted.forEach(ing => {
    totalRuns += ing.runs;
    totalBalls += ing.ballsFaced;
    if (ing.minutes) {
      totalMinutes += ing.minutes;
    }

    if (!ing.isDismissed) {
      notOuts++;
    }

    // High score check
    if (ing.runs > highScore) {
      highScore = ing.runs;
      highScoreNotOut = !ing.isDismissed;
    } else if (ing.runs === highScore && !ing.isDismissed) {
      // If same high score but not out, prefer not out
      highScoreNotOut = true;
    }

    // Milestones
    if (ing.runs >= 100) {
      hundreds++;
    } else if (ing.runs >= 50) {
      fifties++;
    }

    if (ing.runs === 0 && ing.isDismissed) {
      ducks++;
    }

    fours += ing.fours;
    sixes += ing.sixes;
  });

  const dismissals = sorted.length - notOuts;
  const average = dismissals > 0 ? parseFloat((totalRuns / dismissals).toFixed(2)) : totalRuns; // If never out, average is total runs
  const strikeRate = totalBalls > 0 ? parseFloat(((totalRuns / totalBalls) * 100).toFixed(2)) : 0;

  return {
    matches: uniqueMatches,
    innings: sorted.length,
    notOuts,
    runs: totalRuns,
    highScore,
    highScoreNotOut,
    average,
    strikeRate,
    hundreds,
    fifties,
    fours,
    sixes,
    ducks,
  };
}

// Calculate comprehensive bowling stats for a player
export function calculateBowlingStats(innings: BowlingInnings[]): CareerBowlingStats {
  if (innings.length === 0) {
    return {
      matches: 0,
      innings: 0,
      overs: "0.0",
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      average: 0,
      economyRate: 0,
      strikeRate: 0,
      fiveWickets: 0,
      tenWickets: 0,
      bestInningsWickets: 0,
      bestInningsRuns: 0,
    };
  }

  const uniqueMatches = new Set(innings.map(ing => ing.matchNum)).size;

  let totalBalls = 0;
  let totalMaidens = 0;
  let totalRunsConceded = 0;
  let totalWickets = 0;
  let fiveWickets = 0;
  let bestInningsWickets = 0;
  let bestInningsRuns = Infinity;

  // For 10-wickets in a match calculation, group by matchNum
  const wicketsPerMatch: Record<number, number> = {};

  innings.forEach(ing => {
    const balls = oversToBalls(ing.overs);
    totalBalls += balls;
    totalMaidens += ing.maidens;
    totalRunsConceded += ing.runsConceded;
    totalWickets += ing.wickets;

    if (ing.wickets >= 5) {
      fiveWickets++;
    }

    // Best Innings Figures (BBI)
    if (ing.wickets > bestInningsWickets) {
      bestInningsWickets = ing.wickets;
      bestInningsRuns = ing.runsConceded;
    } else if (ing.wickets === bestInningsWickets && ing.runsConceded < bestInningsRuns) {
      bestInningsRuns = ing.runsConceded;
    }

    // Grouping for match wickets
    wicketsPerMatch[ing.matchNum] = (wicketsPerMatch[ing.matchNum] || 0) + ing.wickets;
  });

  // Calculate ten-wicket hauls in a match
  const tenWickets = Object.values(wicketsPerMatch).filter(w => w >= 10).length;

  const average = totalWickets > 0 ? parseFloat((totalRunsConceded / totalWickets).toFixed(2)) : 0;
  const totalOversCount = totalBalls / 6;
  const economyRate = totalOversCount > 0 ? parseFloat((totalRunsConceded / totalOversCount).toFixed(2)) : 0;
  const strikeRate = totalWickets > 0 ? parseFloat((totalBalls / totalWickets).toFixed(2)) : 0;

  return {
    matches: uniqueMatches,
    innings: innings.length,
    overs: ballsToOvers(totalBalls),
    balls: totalBalls,
    maidens: totalMaidens,
    runs: totalRunsConceded,
    wickets: totalWickets,
    average,
    economyRate,
    strikeRate,
    fiveWickets,
    tenWickets,
    bestInningsWickets,
    bestInningsRuns: bestInningsRuns === Infinity ? 0 : bestInningsRuns,
  };
}

// High-fidelity structures for plotting graphs
export interface BattingProgressionPoint {
  id: string;
  inningsIndex: number; // 1-based index of innings played
  matchNum: number;
  opponent: string;
  venue: string;
  runs: number;
  isDismissed: boolean;
  cumulativeRuns: number;
  cumulativeAverage: number;
}

export interface BowlingProgressionPoint {
  id: string;
  inningsIndex: number;
  matchNum: number;
  opponent: string;
  venue: string;
  wickets: number;
  runsConceded: number;
  cumulativeWickets: number;
  cumulativeAverage: number;
}

// Generate the batting career progression series (rolling metrics for the graphs)
export function getBattingProgression(innings: BattingInnings[]): BattingProgressionPoint[] {
  // Sort chronologically
  const activeInnings = innings.filter(ing => !ing.dnb);
  const sorted = [...activeInnings].sort((a, b) => a.matchNum - b.matchNum || a.inningsNum - b.inningsNum);

  let cumulativeRuns = 0;
  let cumulativeDismissals = 0;

  return sorted.map((ing, idx) => {
    cumulativeRuns += ing.runs;
    if (ing.isDismissed) {
      cumulativeDismissals++;
    }

    const average = cumulativeDismissals > 0 
      ? parseFloat((cumulativeRuns / cumulativeDismissals).toFixed(2)) 
      : cumulativeRuns;

    return {
      id: ing.id,
      inningsIndex: idx + 1,
      matchNum: ing.matchNum,
      opponent: ing.opponent,
      venue: ing.venue,
      runs: ing.runs,
      isDismissed: ing.isDismissed,
      cumulativeRuns,
      cumulativeAverage: average,
    };
  });
}

// Generate the bowling career progression series
export function getBowlingProgression(innings: BowlingInnings[]): BowlingProgressionPoint[] {
  // Sort chronologically
  const sorted = [...innings].sort((a, b) => a.matchNum - b.matchNum || a.inningsNum - b.inningsNum);

  let cumulativeWickets = 0;
  let cumulativeRunsConceded = 0;

  return sorted.map((ing, idx) => {
    cumulativeWickets += ing.wickets;
    cumulativeRunsConceded += ing.runsConceded;

    const average = cumulativeWickets > 0 
      ? parseFloat((cumulativeRunsConceded / cumulativeWickets).toFixed(2)) 
      : 0;

    return {
      id: ing.id,
      inningsIndex: idx + 1,
      matchNum: ing.matchNum,
      opponent: ing.opponent,
      venue: ing.venue,
      wickets: ing.wickets,
      runsConceded: ing.runsConceded,
      cumulativeWickets,
      cumulativeAverage: average,
    };
  });
}
