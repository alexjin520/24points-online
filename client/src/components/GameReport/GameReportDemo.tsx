import React from 'react';
import { GameReport } from './GameReport';
import type { GameReport as GameReportType } from '../../types/game.types';

// 示例游戏报告数据
const sampleReport: GameReportType = {
  id: 'demo-report-123',
  gameId: 'demo-game-456',
  createdAt: new Date().toISOString(),
  players: [
    {
      id: 'player1',
      name: '玩家1',
      finalScore: 8,
      finalCardCount: 12
    },
    {
      id: 'player2', 
      name: '玩家2',
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>游戏报告分享功能测试</h1>
      <p>这是一个示例游戏报告，用于测试分享功能的显示效果。</p>
      <GameReport reportData={sampleReport} />
    </div>
  );
}; 