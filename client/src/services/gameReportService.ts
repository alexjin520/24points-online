import type { GameRoom, GameReport, ShareableGameData } from '../types/game.types';

export class GameReportService {
  /**
   * Generates a game report from game room data
   */
  static generateGameReport(
    gameRoom: GameRoom, 
    gameOverWinnerId?: string,
    gameOverReason?: string
  ): GameReport {
    const reportId = this.generateReportId();
    
    // Calculate player statistics
    const playerStats: GameReport['playerStats'] = {};
    
    gameRoom.players.forEach(player => {
      const playerId = player.id;
      const playerTimes = gameRoom.roundTimes?.[playerId] || [];
      const firstSolves = gameRoom.firstSolves?.[playerId] || 0;
      const correctSolutions = gameRoom.correctSolutions?.[playerId] || 0;
      const incorrectAttempts = gameRoom.incorrectAttempts?.[playerId] || 0;
      const playerScore = gameRoom.scores[playerId] || 0;
      const opponentScore = Object.keys(gameRoom.scores)
        .filter(id => id !== playerId)
        .reduce((sum, id) => sum + (gameRoom.scores[id] || 0), 0);

      const avgSolveTime = playerTimes.length > 0 
        ? playerTimes.reduce((a, b) => a + b, 0) / playerTimes.length 
        : 0;

      const fastestSolve = playerTimes.length > 0 
        ? Math.min(...playerTimes) 
        : 0;

      const firstSolveRate = gameRoom.currentRound > 0 
        ? Math.round((firstSolves / gameRoom.currentRound) * 100) 
        : 0;

      const totalAttempts = correctSolutions + incorrectAttempts;
      const accuracyRate = totalAttempts > 0 
        ? Math.round((correctSolutions / totalAttempts) * 100) 
        : 0;

      const totalCardsWon = playerScore * 4; // Each round win = 4 cards
      const totalCardsLost = opponentScore * 4;

      playerStats[playerId] = {
        avgSolveTime: Math.round(avgSolveTime * 10) / 10,
        fastestSolve: Math.round(fastestSolve * 10) / 10,
        firstSolveRate,
        accuracyRate,
        totalCardsWon,
        totalCardsLost,
        roundTimes: playerTimes,
        firstSolves,
        correctSolutions,
        incorrectAttempts
      };
    });

    const report: GameReport = {
      id: reportId,
      gameId: gameRoom.id,
      createdAt: new Date().toISOString(),
      players: gameRoom.players.map(player => ({
        id: player.id,
        name: player.name,
        finalScore: gameRoom.scores[player.id] || 0,
        finalCardCount: player.deck.length
      })),
      gameStats: {
        totalRounds: gameRoom.currentRound,
        roomType: gameRoom.roomType,
        gameOverReason,
        winnerId: gameOverWinnerId
      },
      playerStats
    };

    return report;
  }

  /**
   * Saves a game report locally and returns shareable data
   */
  static saveAndShareReport(report: GameReport): ShareableGameData {
    // Save to localStorage (temporary storage)
    localStorage.setItem(`gameReport_${report.id}`, JSON.stringify(report));
    
    // Set expiration (7 days)
    const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem(`gameReport_${report.id}_expires`, expirationTime.toString());

    // Generate share URL
    const shareUrl = `${window.location.origin}/report/${report.id}`;

    return {
      report,
      shareUrl
    };
  }

  /**
   * Retrieves a game report by ID
   */
  static getReport(reportId: string): GameReport | null {
    try {
      // Check if report exists and hasn't expired
      const expirationTime = localStorage.getItem(`gameReport_${reportId}_expires`);
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        // Report has expired, clean it up
        this.cleanupExpiredReport(reportId);
        return null;
      }

      const reportData = localStorage.getItem(`gameReport_${reportId}`);
      if (!reportData) return null;

      return JSON.parse(reportData);
    } catch (error) {
      console.error('Error retrieving game report:', error);
      return null;
    }
  }

  /**
   * Generates a unique report ID
   */
  private static generateReportId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomStr}`;
  }

  /**
   * Cleans up expired report data
   */
  private static cleanupExpiredReport(reportId: string): void {
    localStorage.removeItem(`gameReport_${reportId}`);
    localStorage.removeItem(`gameReport_${reportId}_expires`);
  }

  /**
   * Cleans up all expired reports (can be called periodically)
   */
  static cleanupExpiredReports(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.endsWith('_expires') && key.startsWith('gameReport_')) {
        const expirationTime = localStorage.getItem(key);
        if (expirationTime && now > parseInt(expirationTime)) {
          const reportId = key.replace('gameReport_', '').replace('_expires', '');
          this.cleanupExpiredReport(reportId);
        }
      }
    });
  }

  /**
   * Creates a compact URL-safe representation of game data
   * (Alternative to localStorage for smaller datasets)
   */
  static createCompactShare(report: GameReport): string {
    try {
      // Create a minimal version of the report for URL encoding
      const compactReport = {
        id: report.id,
        players: report.players.map(p => ({
          n: p.name,
          s: p.finalScore,
          c: p.finalCardCount
        })),
        stats: {
          r: report.gameStats.totalRounds,
          w: report.gameStats.winnerId
        },
        // Include key player stats
        ps: Object.keys(report.playerStats).reduce((acc, playerId) => {
          const stats = report.playerStats[playerId];
          acc[playerId] = {
            a: Math.round(stats.avgSolveTime * 10) / 10, // avg time
            f: Math.round(stats.fastestSolve * 10) / 10,  // fastest
            w: stats.totalCardsWon,                       // cards won
            l: stats.totalCardsLost                       // cards lost
          };
          return acc;
        }, {} as any)
      };

      // Encode to base64
      const jsonString = JSON.stringify(compactReport);
      return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (error) {
      console.error('Error creating compact share:', error);
      return '';
    }
  }

  /**
   * Decodes a compact share string back to a partial report
   */
  static decodeCompactShare(encoded: string): Partial<GameReport> | null {
    try {
      const jsonString = decodeURIComponent(escape(atob(encoded)));
      const compact = JSON.parse(jsonString);
      
      // Reconstruct the report
      return {
        id: compact.id,
        gameId: 'shared',
        createdAt: new Date().toISOString(),
        players: compact.players.map((p: any, index: number) => ({
          id: `player_${index}`,
          name: p.n,
          finalScore: p.s,
          finalCardCount: p.c
        })),
        gameStats: {
          totalRounds: compact.stats.r,
          winnerId: compact.stats.w
        },
        playerStats: Object.keys(compact.ps).reduce((acc, playerId) => {
          const stats = compact.ps[playerId];
          acc[playerId] = {
            avgSolveTime: stats.a,
            fastestSolve: stats.f,
            firstSolveRate: 0,
            accuracyRate: 0,
            totalCardsWon: stats.w,
            totalCardsLost: stats.l,
            roundTimes: [],
            firstSolves: 0,
            correctSolutions: 0,
            incorrectAttempts: 0
          };
          return acc;
        }, {} as any)
      } as GameReport;
    } catch (error) {
      console.error('Error decoding compact share:', error);
      return null;
    }
  }
}

// Initialize cleanup on service load
GameReportService.cleanupExpiredReports(); 