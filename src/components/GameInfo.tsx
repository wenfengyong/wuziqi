'use client';

import React, { memo } from 'react';
import { Player } from '@/types/game';
import { formatTime } from '@/lib/utils';
import styles from './GameInfo.module.css';

interface GameInfoProps {
  currentPlayer: Player;
  blackTime: number;
  whiteTime: number;
  isPaused: boolean;
  isGameOver: boolean;
  winner: Player;
}

function GameInfo({
  currentPlayer,
  blackTime,
  whiteTime,
  isPaused,
  isGameOver,
  winner,
}: GameInfoProps) {
  const getTurnText = () => {
    if (isGameOver) {
      if (winner === 0) return '平局';
      return winner === 1 ? '黑方获胜' : '白方获胜';
    }
    if (isPaused) return '游戏已暂停';
    return currentPlayer === 1 ? '黑方回合' : '白方回合';
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.playerInfo} ${currentPlayer === 1 && !isGameOver ? styles.active : ''}`}>
        <span className={`${styles.piece} ${styles.black}`} />
        <span className={styles.name}>黑方</span>
        <span className={styles.time}>{formatTime(blackTime)}</span>
      </div>

      <div className={styles.turnIndicator}>
        {getTurnText()}
      </div>

      <div className={`${styles.playerInfo} ${currentPlayer === 2 && !isGameOver ? styles.active : ''}`}>
        <span className={`${styles.piece} ${styles.white}`} />
        <span className={styles.name}>白方</span>
        <span className={styles.time}>{formatTime(whiteTime)}</span>
      </div>
    </div>
  );
}

export default memo(GameInfo);
