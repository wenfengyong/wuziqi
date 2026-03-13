'use client';

import React, { memo } from 'react';
import { Move } from '@/types/game';
import styles from './MoveHistory.module.css';

interface MoveHistoryProps {
  moves: Move[];
}

function MoveHistory({ moves }: MoveHistoryProps) {
  const getMoveLabel = (move: Move, index: number) => {
    const playerName = move.player === 1 ? '黑' : '白';
    const colLabel = String.fromCharCode(65 + move.col);
    const rowLabel = move.row + 1;
    return `${index + 1}. ${playerName} ${colLabel}${rowLabel}`;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>游戏记录</h3>
      <div className={styles.list}>
        {moves.length === 0 ? (
          <p className={styles.empty}>暂无落子记录</p>
        ) : (
          moves.map((move, index) => (
            <p
              key={`${move.row}-${move.col}-${index}`}
              className={styles.move}
              style={{ color: move.player === 1 ? '#333' : '#666' }}
            >
              {getMoveLabel(move, index)}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(MoveHistory);
