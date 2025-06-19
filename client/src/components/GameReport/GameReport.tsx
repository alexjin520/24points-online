import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import type { GameReport as GameReportType } from '../../types/game.types';
import './GameReport.css';

interface GameReportProps {
  reportData?: GameReportType;
}

export const GameReport: React.FC<GameReportProps> = ({ reportData: providedData }) => {
  const { t } = useTranslation();
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<GameReportType | null>(providedData || null);
  const [loading, setLoading] = useState(!providedData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If reportData is provided as prop, use it
    if (providedData) {
      setReportData(providedData);
      setLoading(false);
      return;
    }

    // Otherwise fetch from URL parameter
    if (reportId && !providedData) {
      fetchReport(reportId);
    }
  }, [reportId, providedData]);

  const fetchReport = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from localStorage first (for recently generated reports)
      const localReport = localStorage.getItem(`gameReport_${id}`);
      if (localReport) {
        const parsedReport = JSON.parse(localReport);
        setReportData(parsedReport);
        setLoading(false);
        return;
      }

      // TODO: Implement server-side report fetching
      // For now, show error if not found locally
      setError('Report not found or has expired');
      setLoading(false);
    } catch (err) {
      setError('Failed to load game report');
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShareReport = async () => {
    if (!reportData) return;

    const shareUrl = `${window.location.origin}/report/${reportData.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('gameReport.shareTitle'),
          text: t('gameReport.shareText', { 
            player1: reportData.players[0]?.name || 'Player 1',
            player2: reportData.players[1]?.name || 'Player 2'
          }),
          url: shareUrl
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show toast notification (you might want to implement a toast system)
        alert(t('gameReport.linkCopied'));
      } catch (err) {
        // Final fallback - show the URL in a prompt
        prompt(t('gameReport.copyLink'), shareUrl);
      }
    }
  };

  const getWinnerData = () => {
    if (!reportData || !reportData.gameStats.winnerId) return null;
    return reportData.players.find(p => p.id === reportData.gameStats.winnerId);
  };

  if (loading) {
    return (
      <div className="game-report loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('gameReport.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-report error">
        <div className="error-content">
          <h2>{t('gameReport.errorTitle')}</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-home-btn">
            {t('gameReport.backHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="game-report error">
        <div className="error-content">
          <h2>{t('gameReport.notFound')}</h2>
          <button onClick={() => navigate('/')} className="back-home-btn">
            {t('gameReport.backHome')}
          </button>
        </div>
      </div>
    );
  }

  const winner = getWinnerData();
  const loser = reportData.players.find(p => p.id !== reportData.gameStats.winnerId);

  return (
    <div className="game-report">
      <div className="report-header">
        <div className="report-title">
          <h1>{t('gameReport.title')}</h1>
          <p className="report-date">{formatDate(reportData.createdAt)}</p>
        </div>
        
        <div className="report-actions">
          <button onClick={handleShareReport} className="share-btn">
            <span className="share-icon">🔗</span>
            {t('gameReport.shareButton')}
          </button>
          <button onClick={() => navigate('/')} className="back-home-btn">
            {t('gameReport.backHome')}
          </button>
        </div>
      </div>

      {/* Game Result */}
      <div className="game-result-section">
        <h2>{t('gameReport.gameResult')}</h2>
        
        {winner && (
          <div className="winner-announcement">
            <div className="winner-crown">👑</div>
            <h3>{t('gameReport.winner', { name: winner.name })}</h3>
          </div>
        )}

        <div className="final-score">
          <div className="score-display">
            {reportData.players.map((player, index) => (
              <div key={player.id} className={`player-score ${player.id === reportData.gameStats.winnerId ? 'winner' : 'loser'}`}>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="score-value">{player.finalScore}</span>
                </div>
                {index < reportData.players.length - 1 && <div className="score-separator">-</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="game-stats-section">
        <h2>{t('gameReport.gameStatistics')}</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">{t('gameReport.totalRounds')}</span>
            <span className="stat-value">{reportData.gameStats.totalRounds}</span>
          </div>
          {reportData.gameStats.roomType && (
            <div className="stat-item">
              <span className="stat-label">{t('gameReport.gameMode')}</span>
              <span className="stat-value">{reportData.gameStats.roomType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Player Performance */}
      <div className="player-performance-section">
        <h2>{t('gameReport.playerPerformance')}</h2>
        
        {reportData.players.map(player => {
          const stats = reportData.playerStats[player.id];
          if (!stats) return null;

          return (
            <div key={player.id} className="player-performance">
              <h3 className="player-name">
                {player.name}
                {player.id === reportData.gameStats.winnerId && <span className="winner-badge">🏆</span>}
              </h3>
              
              <div className="performance-grid">
                <div className="performance-category">
                  <h4>{t('gameReport.speedAnalysis')}</h4>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.averageTime')}</span>
                    <span className="stat-value">{formatTime(stats.avgSolveTime)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.fastestSolve')}</span>
                    <span className="stat-value">{formatTime(stats.fastestSolve)}</span>
                  </div>
                </div>

                <div className="performance-category">
                  <h4>{t('gameReport.accuracy')}</h4>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.firstSolveRate')}</span>
                    <span className="stat-value">{stats.firstSolveRate}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.accuracyRate')}</span>
                    <span className="stat-value">{stats.accuracyRate}%</span>
                  </div>
                </div>

                <div className="performance-category">
                  <h4>{t('gameReport.cards')}</h4>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.cardsWon')}</span>
                    <span className="stat-value success">+{stats.totalCardsWon}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">{t('gameReport.cardsLost')}</span>
                    <span className="stat-value danger">-{stats.totalCardsLost}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Play Again Section */}
      <div className="play-again-section">
        <h3>{t('gameReport.playAgain')}</h3>
        <p>{t('gameReport.playAgainText')}</p>
        <button onClick={() => navigate('/')} className="play-again-btn">
          {t('gameReport.startNewGame')}
        </button>
      </div>
    </div>
  );
}; 