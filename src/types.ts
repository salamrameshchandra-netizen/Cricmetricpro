/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BattingInnings {
  id: string;
  matchNum: number;
  inningsNum: number; // team innings (1, 2, 3, or 4)
  opponent: string;
  venue: string;
  date: string;
  runs: number;
  ballsFaced: number;
  isDismissed: boolean;
  fours: number;
  sixes: number;
  minutes?: number;
}

export interface BowlingInnings {
  id: string;
  matchNum: number;
  inningsNum: number; // team innings (1, 2, 3, or 4)
  opponent: string;
  venue: string;
  date: string;
  overs: number; // E.g., 20.4 is 20 overs and 4 balls
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides?: number;
  noBalls?: number;
}

export interface Player {
  id: string;
  name: string;
  state: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder';
  battingStyle: string;
  bowlingStyle: string;
  profileImage?: string; // Standard SVG or empty
  battingInnings: BattingInnings[];
  bowlingInnings: BowlingInnings[];
}

export interface CareerBattingStats {
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  highScore: number;
  highScoreNotOut: boolean;
  average: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  fours: number;
  sixes: number;
  ducks: number;
}

export interface CareerBowlingStats {
  matches: number;
  innings: number;
  overs: string; // total overs formatted
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  average: number;
  economyRate: number;
  strikeRate: number;
  fiveWickets: number; // 5W in an innings
  tenWickets: number;  // 10W in a match (aggregated from match entries)
  bestInningsWickets: number;
  bestInningsRuns: number;
}
