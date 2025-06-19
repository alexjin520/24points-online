import React from 'react';
import { GameReport } from './GameReport';
import type { GameReport as GameReportType } from '../../types/game.types';

// Sample game report data for testing
const sampleGameReport: GameReportType = {
  id: 'demo_report_123',
  gameId: 'demo_game_456',
  createdAt: new Date().toISOString(),
  players: [
    {
      id: 'player1',
      name: 'Alice',
      finalScore: 8,
      finalCardCount: 12
    },
    {
      id: 'player2', 
      name: 'Bob',
      finalScore: 5,
      finalCardCount: 20
    }
  ],
  gameStats: {
    totalRounds: 13,
    roomType: 'classic',
    gameOverReason: 'deck_empty',
    winnerId: 'player1'
  },
  playerStats: {
    player1: {
      avgSolveTime: 8.5,
      fastestSolve: 3.2,
      firstSolveRate: 61,
      accuracyRate: 85,
      totalCardsWon: 32,
      totalCardsLost: 20,
      roundTimes: [5.2, 3.2, 12.1, 6.8, 9.3, 4.5, 7.8, 10.2],
      firstSolves: 8,
      correctSolutions: 11,
      incorrectAttempts: 2
    },
    player2: {
      avgSolveTime: 12.3,
      fastestSolve: 6.1,
      firstSolveRate: 38,
      accuracyRate: 71,
      totalCardsWon: 20,
      totalCardsLost: 32,
      roundTimes: [8.9, 15.4, 6.1, 11.2, 14.7, 9.8, 13.5],
      firstSolves: 5,
      correctSolutions: 10,
      incorrectAttempts: 4
    }
  }
};

export const GameReportDemo: React.FC = () => {
  return (
    <div>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f0f0f0', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2>Game Report Demo</h2>
        <p>This is a demonstration of the game report sharing functionality.</p>
      </div>
      <GameReport reportData={sampleGameReport} />
    </div>
  );
}; 