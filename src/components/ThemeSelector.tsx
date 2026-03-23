'use client';

import React, { memo } from 'react';
import { BoardThemeId, PieceStyle, LineStyle } from '@/types/game';
import { boardThemeList } from '@/lib/themes';
import styles from './ThemeSelector.module.css';

interface ThemeSelectorProps {
  currentTheme: BoardThemeId;
  currentPieceStyle: PieceStyle;
  lineStyle: LineStyle;
  lineColor: string;
  fixedBoard: boolean;
  onThemeChange: (theme: BoardThemeId) => void;
  onPieceStyleChange: (style: PieceStyle) => void;
  onLineStyleChange: (style: LineStyle) => void;
  onLineColorChange: (color: string) => void;
  onFixedBoardChange: (fixed: boolean) => void;
}

const pieceStyles: { id: PieceStyle; name: string }[] = [
  { id: 'classic', name: '经典' },
  { id: 'modern', name: '现代' },
  { id: 'cute', name: '可爱' },
  { id: 'neon', name: '霓虹' },
  { id: 'wood', name: '木纹' },
  { id: 'metal', name: '金属' },
  { id: 'glass', name: '玻璃' },
  { id: 'gradient', name: '渐变' },
];

const lineStyles: { id: LineStyle; name: string }[] = [
  { id: 'solid', name: '实线' },
  { id: 'dashed', name: '虚线' },
  { id: 'dotted', name: '点线' },
];

function ThemeSelector({
  currentTheme,
  currentPieceStyle,
  lineStyle,
  lineColor,
  fixedBoard,
  onThemeChange,
  onPieceStyleChange,
  onLineStyleChange,
  onLineColorChange,
  onFixedBoardChange,
}: ThemeSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
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
              </div>
              <div className={styles.info}>
                <span className={styles.name}>{theme.name}</span>
              </div>
              {currentTheme === theme.id && (
                <div className={styles.checkmark}>✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>棋子样式</h3>
        <div className={styles.pieceGrid}>
          {pieceStyles.map((style) => (
            <div
              key={style.id}
              className={`${styles.pieceCard} ${currentPieceStyle === style.id ? styles.active : ''}`}
              onClick={() => onPieceStyleChange(style.id)}
            >
              <div className={`${styles.piecePreview} ${styles[style.id]}`}>
                <div className={styles.blackPiece}></div>
                <div className={styles.whitePiece}></div>
              </div>
              <span className={styles.pieceName}>{style.name}</span>
              {currentPieceStyle === style.id && (
                <div className={styles.checkmark}>✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>线条设置</h3>
        <div className={styles.lineOptions}>
          <div className={styles.optionRow}>
            <label className={styles.optionLabel}>线条样式</label>
            <select
              className={styles.select}
              value={lineStyle}
              onChange={(e) => onLineStyleChange(e.target.value as LineStyle)}
            >
              {lineStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.optionRow}>
            <label className={styles.optionLabel}>线条颜色</label>
            <input
              type="color"
              className={styles.colorInput}
              value={lineColor}
              onChange={(e) => onLineColorChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>显示设置</h3>
        <div className={styles.displayOptions}>
          <label className={styles.toggleOption}>
            <input
              type="checkbox"
              checked={fixedBoard}
              onChange={(e) => onFixedBoardChange(e.target.checked)}
            />
            <span className={styles.toggleLabel}>固定棋盘大小</span>
            <span className={styles.toggleHint}>棋盘大小不随窗口变化</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default memo(ThemeSelector);
