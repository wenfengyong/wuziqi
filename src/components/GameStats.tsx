'use client';

import React, { memo } from 'react';
import { GameStats as GameStatsType } from '@/types/game';
import styles from './GameStats.module.css';

interface GameStatsProps {
  stats: GameStatsType;
  onReset?: () => void;
}

function GameStatsComponent({ stats, onReset }: GameStatsProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>游戏统计</h3>
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.label}>总局数</span>
          <span className={styles.value}>{stats.totalGames}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>黑方胜</span>
          <span className={styles.value}>{stats.blackWins}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.label}>白方胜</span>
          <span className={styles.value}>{stats.whiteWins}</span>
        </div>
      </div>
      {onReset && (
        <button className={styles.resetBtn} onClick={onReset}>
          重置统计
        </button>
      )}
    </div>
  );
}

export default memo(GameStatsComponent);
