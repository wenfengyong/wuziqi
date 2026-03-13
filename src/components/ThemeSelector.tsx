'use client';

import React, { memo } from 'react';
import { BoardThemeId } from '@/types/game';
import { boardThemeList } from '@/lib/themes';
import styles from './ThemeSelector.module.css';

interface ThemeSelectorProps {
  currentTheme: BoardThemeId;
  onThemeChange: (theme: BoardThemeId) => void;
}

function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>棋盘主题</h3>
      <div className={styles.themeGrid}>
        {boardThemeList.map((theme) => (
          <div
            key={theme.id}
            className={`${styles.themeCard} ${currentTheme === theme.id ? styles.active : ''}`}
            onClick={() => onThemeChange(theme.id)}
          >
            <div
              className={styles.preview}
              style={{ background: theme.preview }}
            >
              <div className={styles.previewGrid}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={styles.previewCell} />
                ))}
              </div>
              <div className={styles.previewPiece} style={{ background: '#1a1a1a' }} />
              <div
                className={styles.previewPieceWhite}
                style={{ background: '#fff', border: '1px solid #ccc' }}
              />
            </div>
            <div className={styles.info}>
              <span className={styles.name}>{theme.name}</span>
              <span className={styles.description}>{theme.description}</span>
            </div>
            {currentTheme === theme.id && (
              <div className={styles.checkmark}>✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ThemeSelector);
