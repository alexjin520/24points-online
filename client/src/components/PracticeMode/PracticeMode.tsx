import React, { useState, useEffect } from 'react';
import { Calculator } from '../../../../shared/game/calculator';
import type { Expression } from '../../../../shared/game/calculator';
import { InteractiveCenterTable } from '../InteractiveCenterTable/InteractiveCenterTable';
import type { Card as CardType, Operation } from '../../types/game.types';
import './PracticeMode.css';

interface PracticeModeProps {
  onBackToLobby: () => void;
}

interface GameStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

// 游戏模式配置 (注释，仅作为参考)
// GAME_MODES = {
//   classic: { isMultiplayer: true, playerCount: 2, ... },
//   super: { cardCount: 8, scoringSystem: 'complexity', ... },
//   extended: { cardRange: {min: 1, max: 20}, ... }
// }

export const PracticeMode: React.FC<PracticeModeProps> = ({ onBackToLobby }) => {
  const [currentCards, setCurrentCards] = useState<CardType[]>([]);
  const [result, setResult] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0
  });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // 生成新题目
  const generateNewProblem = () => {
    // 为Extended模式使用1-20范围，其他模式使用1-10范围
    const cardValues = Calculator.generateSolvableCards(1, 20);
    const cards: CardType[] = cardValues.map((value, index) => ({
      value,
      owner: 'player1',
      id: `practice-card-${Date.now()}-${index}`
    }));
    setCurrentCards(cards);
    setResult('');
    setIsCorrect(null);
    setShowHint(false);
    setIsPlaying(true);
  };

  // 初始化
  useEffect(() => {
    generateNewProblem();
  }, []);

  // 处理解决方案找到
  const handleSolutionFound = (expression: string, result: number, usedCards: CardType[], operations: Operation[]) => {
    console.log('Solution found!', { expression, result, usedCards, operations });
    
    // 检查是否正确
    if (Math.abs(result - 24) < 0.0001) {
      setResult(`🎉 正确！表达式: ${expression}`);
      setIsCorrect(true);
      setIsPlaying(false);
      
      setStats(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1)
      }));
    } else {
      setResult(`❌ 错误！结果是 ${result}，不是 24`);
      setIsCorrect(false);
      setIsPlaying(false);
      
      setStats(prev => ({
        correct: prev.correct,
        total: prev.total + 1,
        streak: 0,
        bestStreak: prev.bestStreak
      }));
    }
  };

  // 获取提示
  const showSolutionHint = () => {
    setShowHint(true);
    const cardValues = currentCards.map(card => card.value);
    const hint = Calculator.getSolutionHint(cardValues);
    
    if (hint) {
      setResult(`\n${hint}`);
    } else {
      setResult('This problem has no solution');
    }
  };

  return (
    <div className="practice-mode">
      <div className="practice-header">
        <h1>Single Player Mode</h1>
        <button className="back-btn" onClick={onBackToLobby}>
          ← Back to Lobby
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-label">正确率:</span>
          <span className="stat-value">
            {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">已答题:</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">连胜:</span>
          <span className="stat-value">{stats.streak}</span>
        </div>
        <div className="stat">
          <span className="stat-label">最佳连胜:</span>
          <span className="stat-value">{stats.bestStreak}</span>
        </div>
      </div>

      <div className="game-area">
        <div className="cards-section">
          <h2>Click on the cards to perform operations and calculate 24.</h2>
          <div className="interactive-table">
            <InteractiveCenterTable
              cards={currentCards}
              onSolutionFound={handleSolutionFound}
              disabled={!isPlaying}
              allowInteraction={isPlaying}
            />
          </div>
        </div>

        <div className="action-section">
          <div className="action-buttons">
            <button className="hint-btn" onClick={showSolutionHint} disabled={showHint}>
              {showHint ? 'Hint' : 'Hint'}
            </button>
          </div>

          {result && (
            <div className={`result ${isCorrect ? 'success' : 'error'}`}>
              {result.includes('hint：') ? (
                <div className="hint-result">
                  <div className="hint-title">hint：</div>
                  <div className="hint-steps">{result.replace('hint\n', '')}</div>
                </div>
              ) : (
                result
              )}
            </div>
          )}
        </div>

        <div className="controls">
          <button className="next-btn" onClick={generateNewProblem}>
            Next
          </button>
        </div>
      </div>

      <div className="instructions">
        <h3>游戏说明:</h3>
        <ul>
          <li>点击两张卡片，然后选择运算符(+、-、×、÷)进行组合</li>
          <li>继续组合直到只剩一张卡片，且数值为24</li>
          <li>每个数字必须且只能使用一次</li>
          <li>可以随时点击"获取提示"或"下一题"</li>
        </ul>
      </div>
    </div>
  );
}; 