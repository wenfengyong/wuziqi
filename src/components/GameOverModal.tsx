'use client';

import React, { memo, useEffect } from 'react';
import { Player, GameMode } from '@/types/game';
import styles from './GameOverModal.module.css';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player;
  mode: GameMode;
  onPlayAgain: () => void;
  onClose: () => void;
}

function GameOverModal({ isOpen, winner, mode, onPlayAgain, onClose }: GameOverModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (winner === 0) return '平局！';
    return winner === 1 ? '黑方获胜！' : '白方获胜！';
  };

  const getMessage = () => {
    if (winner === 0) return '棋盘已满，双方平局。';
    
    if (mode === 'single') {
      return winner === 1 ? '恭喜你战胜了AI！' : 'AI获胜，再接再厉！';
    }
    
    return `${winner === 1 ? '黑方' : '白方'}五子连珠，赢得胜利！`;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{getTitle()}</h2>
        <p className={styles.message}>{getMessage()}</p>
        <div className={styles.buttons}>
          <button className={styles.primaryBtn} onClick={onPlayAgain}>
            再来一局
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(GameOverModal);
