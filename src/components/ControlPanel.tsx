'use client';

import React, { memo } from 'react';
import { GameMode, Difficulty, PieceStyle } from '@/types/game';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  mode: GameMode;
  difficulty: Difficulty;
  pieceStyle: PieceStyle;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onPieceStyleChange: (style: PieceStyle) => void;
  onUndo: () => void;
  onRestart: () => void;
  onPause: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  canUndo: boolean;
}

const modeLabels: Record<GameMode, string> = {
  single: '单人模式',
  local: '本地双人',
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const pieceStyleLabels: Record<PieceStyle, string> = {
  classic: '经典',
  modern: '现代',
  cute: '可爱',
  neon: '霓虹',
};

function ControlPanel({
  mode,
  difficulty,
  pieceStyle,
  onModeChange,
  onDifficultyChange,
  onPieceStyleChange,
  onUndo,
  onRestart,
  onPause,
  isPaused,
  isGameOver,
  canUndo,
}: ControlPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h3 className={styles.title}>游戏模式</h3>
        <div className={styles.modeGrid}>
          {(Object.keys(modeLabels) as GameMode[]).map((key) => (
            <button
              key={key}
              className={`${styles.modeBtn} ${mode === key ? styles.active : ''}`}
              onClick={() => onModeChange(key)}
            >
              {modeLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {mode === 'single' && (
        <div className={styles.panel}>
          <h3 className={styles.title}>AI难度</h3>
          <div className={styles.difficultyGrid}>
            {(Object.keys(difficultyLabels) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                className={`${styles.diffBtn} ${difficulty === diff ? styles.active : ''}`}
                onClick={() => onDifficultyChange(diff)}
              >
                {difficultyLabels[diff]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.panel}>
        <h3 className={styles.title}>棋子样式</h3>
        <div className={styles.pieceGrid}>
          {(Object.keys(pieceStyleLabels) as PieceStyle[]).map((style) => (
            <div
              key={style}
              className={`${styles.pieceStyle} ${pieceStyle === style ? styles.active : ''}`}
              onClick={() => onPieceStyleChange(style)}
            >
              <span className={`${styles.piecePreview} ${styles[style]} ${styles.black}`} />
              <span className={styles.styleName}>{pieceStyleLabels[style]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.title}>游戏控制</h3>
        <div className={styles.controlGrid}>
          <button
            className={`${styles.controlBtn} ${!canUndo ? styles.disabled : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
          >
            悔棋
          </button>
          <button className={styles.controlBtn} onClick={onRestart}>
            重新开始
          </button>
          <button
            className={`${styles.controlBtn} ${isGameOver ? styles.disabled : ''}`}
            onClick={onPause}
            disabled={isGameOver}
          >
            {isPaused ? '继续' : '暂停'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ControlPanel);
