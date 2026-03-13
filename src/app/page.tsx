'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Difficulty, PieceStyle, BoardThemeId } from '@/types/game';
import Board from '@/components/Board';
import ControlPanel from '@/components/ControlPanel';
import GameInfo from '@/components/GameInfo';
import GameStats from '@/components/GameStats';
import ThemeSelector from '@/components/ThemeSelector';
import GameOverModal from '@/components/GameOverModal';
import { getBoardTheme } from '@/lib/themes';
import styles from './page.module.css';

export default function GamePage() {
  const {
    mode,
    currentPlayer,
    isGameOver,
    isPaused,
    winner,
    moveHistory,
    blackTime,
    whiteTime,
    board,
    lastMove,
    winLine,
    stats,
    pieceStyle,
    boardTheme,
    setMode,
    setDifficulty,
    setPieceStyle,
    setBoardTheme,
    handleMove,
    undo,
    restart,
    pause,
    updateStats,
    resetStats,
  } = useGame();

  const [difficulty, setDifficultyState] = useState<Difficulty>('medium');
  const [showModal, setShowModal] = useState(false);
  const [cellSize, setCellSize] = useState(36);
  const [pureMode, setPureMode] = useState(false);
  const canUndo = moveHistory.length > 0;

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 80, 560);
      const newCellSize = Math.floor(maxWidth / 15);
      setCellSize(newCellSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isGameOver && !showModal) {
      if (winner !== 0) {
        updateStats(winner);
      }
      setShowModal(true);
    }
  }, [isGameOver, winner, updateStats, showModal]);

  const handleModeChange = useCallback(
    (newMode: 'single' | 'local') => {
      setMode(newMode);
    },
    [setMode]
  );

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty);
    setDifficulty(newDifficulty);
  }, [setDifficulty]);

  const handlePieceStyleChange = useCallback(
    (style: PieceStyle) => {
      setPieceStyle(style);
    },
    [setPieceStyle]
  );

  const handleThemeChange = useCallback(
    (theme: BoardThemeId) => {
      setBoardTheme(theme);
    },
    [setBoardTheme]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      handleMove(row, col);
    },
    [handleMove]
  );

  const handlePlayAgain = useCallback(() => {
    setShowModal(false);
    restart();
  }, [restart]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const togglePureMode = useCallback(() => {
    setPureMode(prev => !prev);
  }, []);

  const theme = getBoardTheme(boardTheme);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>五子棋</h1>
        <button className={styles.pureModeBtn} onClick={togglePureMode}>
          {pureMode ? '显示菜单' : '纯净模式'}
        </button>
      </header>

      <div className={`${styles.gameContainer} ${pureMode ? styles.pureMode : ''}`}>
        {!pureMode && (
          <div className={styles.leftSidebar}>
            <ControlPanel
              mode={mode}
              difficulty={difficulty}
              pieceStyle={pieceStyle}
              onModeChange={handleModeChange}
              onDifficultyChange={handleDifficultyChange}
              onPieceStyleChange={handlePieceStyleChange}
              onUndo={undo}
              onRestart={restart}
              onPause={pause}
              isPaused={isPaused}
              isGameOver={isGameOver}
              canUndo={moveHistory.length > 0}
            />
          </div>
        )}

        <div className={`${styles.boardArea} ${pureMode ? styles.pureMode : ''}`}>
          {pureMode && (
            <div className={styles.pureControls}>
              <button
                className={styles.pureControlBtn}
                onClick={undo}
                disabled={!canUndo || isGameOver}
              >
                悔棋
              </button>
              <button className={styles.pureControlBtn} onClick={restart}>
                重新开始
              </button>
              <button
                className={styles.pureControlBtn}
                onClick={pause}
                disabled={isGameOver}
              >
                {isPaused ? '继续' : '暂停'}
              </button>
            </div>
          )}

          <GameInfo
            currentPlayer={currentPlayer}
            blackTime={blackTime}
            whiteTime={whiteTime}
            isPaused={isPaused}
            isGameOver={isGameOver}
            winner={winner}
          />

          <div
            className={styles.boardWrapper}
            style={{
              background: `linear-gradient(135deg, ${theme.backgroundGradient[0]}, ${theme.backgroundGradient[1]})`,
            }}
          >
            <Board
              board={board}
              lastMove={lastMove}
              winLine={winLine}
              pieceStyle={pieceStyle}
              boardTheme={boardTheme}
              onCellClick={handleCellClick}
              cellSize={cellSize}
            />
          </div>
        </div>

        {!pureMode && (
          <div className={styles.rightSidebar}>
            <ThemeSelector currentTheme={boardTheme} onThemeChange={handleThemeChange} />
            <GameStats stats={stats} onReset={resetStats} />
          </div>
        )}
      </div>

      <GameOverModal
        isOpen={showModal}
        winner={winner}
        mode={mode}
        onPlayAgain={handlePlayAgain}
        onClose={handleCloseModal}
      />
    </div>
  );
}
