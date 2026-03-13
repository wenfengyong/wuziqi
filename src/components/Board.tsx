'use client';

import React, { useRef, useEffect, useCallback, memo } from 'react';
import { Player, PieceStyle, BoardThemeId, WinLine, Position } from '@/types/game';
import { getBoardTheme } from '@/lib/themes';

interface BoardProps {
  board: Player[][];
  lastMove: Position | null;
  winLine: WinLine | null;
  pieceStyle: PieceStyle;
  boardTheme: BoardThemeId;
  onCellClick: (row: number, col: number) => void;
  cellSize?: number;
}

const GRID_SIZE = 15;
const PADDING = 20;

function BoardCanvas({
  board,
  lastMove,
  winLine,
  pieceStyle,
  boardTheme,
  onCellClick,
  cellSize = 36,
}: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = getBoardTheme(boardTheme);
  const pieceRadius = Math.floor(cellSize * 0.42);

  const calculateSize = useCallback(() => {
    return (GRID_SIZE - 1) * cellSize + PADDING * 2;
  }, [cellSize]);

  const drawBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, theme.backgroundGradient[0]);
      gradient.addColorStop(1, theme.backgroundGradient[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (boardTheme === 'classic' || boardTheme === 'bamboo') {
        ctx.strokeStyle = `rgba(${hexToRgb(theme.lineColor)}, 0.1)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 4) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
      }

      if (boardTheme === 'stone') {
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = Math.random() * 3 + 1;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
          ctx.fill();
        }
      }

      if (boardTheme === 'neon') {
        ctx.strokeStyle = theme.lineColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = theme.lineColor;
        ctx.shadowBlur = 10;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        ctx.shadowBlur = 0;
      }
    },
    [theme, boardTheme]
  );

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, size: number) => {
      ctx.strokeStyle = theme.lineColor;
      ctx.lineWidth = boardTheme === 'neon' ? 1.5 : 1;

      if (boardTheme === 'neon') {
        ctx.shadowColor = theme.lineColor;
        ctx.shadowBlur = 5;
      }

      for (let i = 0; i < GRID_SIZE; i++) {
        const pos = PADDING + i * cellSize;

        ctx.beginPath();
        ctx.moveTo(PADDING, pos);
        ctx.lineTo(size - PADDING, pos);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pos, PADDING);
        ctx.lineTo(pos, size - PADDING);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    },
    [theme, boardTheme, cellSize]
  );

  const drawStarPoints = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const starPoints: Position[] = [];
      const center = Math.floor(GRID_SIZE / 2);
      starPoints.push({ row: center, col: center });

      if (GRID_SIZE === 15) {
        const positions = [3, 11];
        positions.forEach((x) => {
          positions.forEach((y) => {
            if (!(x === center && y === center)) {
              starPoints.push({ row: x, col: y });
            }
          });
        });
      }

      ctx.fillStyle = theme.starPointColor;

      if (boardTheme === 'neon') {
        ctx.shadowColor = theme.starPointColor;
        ctx.shadowBlur = 8;
      }

      starPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(
          PADDING + point.col * cellSize,
          PADDING + point.row * cellSize,
          boardTheme === 'neon' ? 5 : 4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    },
    [theme, boardTheme, cellSize]
  );

  const drawPiece = useCallback(
    (ctx: CanvasRenderingContext2D, row: number, col: number, player: Player) => {
      const x = PADDING + col * cellSize;
      const y = PADDING + row * cellSize;
      const radius = pieceRadius;

      ctx.save();

      if (player === 1) {
        drawBlackPiece(ctx, x, y, radius, pieceStyle, boardTheme);
      } else {
        drawWhitePiece(ctx, x, y, radius, pieceStyle, boardTheme);
      }

      ctx.restore();
    },
    [cellSize, pieceRadius, pieceStyle, boardTheme]
  );

  const drawPieces = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (board[i][j] !== 0) {
            drawPiece(ctx, i, j, board[i][j]);
          }
        }
      }
    },
    [board, drawPiece]
  );

  const drawLastMoveHint = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!lastMove) return;

      const x = PADDING + lastMove.col * cellSize;
      const y = PADDING + lastMove.row * cellSize;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = boardTheme === 'neon' ? '#FF00FF' : '#FF4444';
      ctx.fill();

      if (boardTheme === 'neon') {
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    },
    [lastMove, cellSize, boardTheme]
  );

  const drawWinLineCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!winLine) return;

      const { start, end } = winLine;
      const startX = PADDING + start.col * cellSize;
      const startY = PADDING + start.row * cellSize;
      const endX = PADDING + end.col * cellSize;
      const endY = PADDING + end.row * cellSize;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = boardTheme === 'neon' ? '#00FFFF' : '#FF0000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      if (boardTheme === 'neon') {
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 15;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    },
    [winLine, cellSize, boardTheme]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = calculateSize();
    canvas.width = size;
    canvas.height = size;

    drawBackground(ctx, size, size);
    drawGrid(ctx, size);
    drawStarPoints(ctx);
    drawPieces(ctx);
    drawLastMoveHint(ctx);
    drawWinLineCanvas(ctx);
  }, [
    calculateSize,
    drawBackground,
    drawGrid,
    drawStarPoints,
    drawPieces,
    drawLastMoveHint,
    drawWinLineCanvas,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const col = Math.round((x - PADDING) / cellSize);
      const row = Math.round((y - PADDING) / cellSize);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        onCellClick(row, col);
      }
    },
    [cellSize, onCellClick]
  );

  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || e.changedTouches.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const touch = e.changedTouches[0];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      const col = Math.round((x - PADDING) / cellSize);
      const row = Math.round((y - PADDING) / cellSize);

      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        onCellClick(row, col);
      }
    },
    [cellSize, onCellClick]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onTouchEnd={handleTouch}
      style={{
        cursor: 'pointer',
        maxWidth: '100%',
        height: 'auto',
        transition: 'all 0.5s ease',
      }}
    />
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
}

function drawBlackPiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: PieceStyle,
  boardTheme: BoardThemeId
) {
  if (boardTheme === 'neon') {
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }

  switch (style) {
    case 'modern':
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      const modernGradient = ctx.createRadialGradient(
        x - radius / 3,
        y - radius / 3,
        0,
        x,
        y,
        radius
      );
      modernGradient.addColorStop(0, '#4a4a4a');
      modernGradient.addColorStop(0.5, '#2c3e50');
      modernGradient.addColorStop(1, '#1a1a1a');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = modernGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      break;

    case 'cute':
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const cuteGradient = ctx.createRadialGradient(
        x - radius / 4,
        y - radius / 4,
        0,
        x,
        y,
        radius
      );
      cuteGradient.addColorStop(0, '#5a5a5a');
      cuteGradient.addColorStop(0.7, '#2a2a2a');
      cuteGradient.addColorStop(1, '#1a1a1a');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = cuteGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + radius * 0.15, y - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      break;

    case 'neon':
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15;

      const neonGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      neonGradient.addColorStop(0, '#1a1a2e');
      neonGradient.addColorStop(0.5, '#16213e');
      neonGradient.addColorStop(1, '#0f0f23');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = neonGradient;
      ctx.fill();

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    default:
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const classicGradient = ctx.createRadialGradient(
        x - radius / 3,
        y - radius / 3,
        0,
        x,
        y,
        radius
      );
      classicGradient.addColorStop(0, '#6a6a6a');
      classicGradient.addColorStop(0.3, '#4a4a4a');
      classicGradient.addColorStop(1, '#1a1a1a');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = classicGradient;
      ctx.fill();
  }
}

function drawWhitePiece(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  style: PieceStyle,
  boardTheme: BoardThemeId
) {
  if (boardTheme === 'neon') {
    ctx.shadowColor = '#FF00FF';
    ctx.shadowBlur = 15;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }

  switch (style) {
    case 'modern':
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      const modernGradient = ctx.createRadialGradient(
        x - radius / 3,
        y - radius / 3,
        0,
        x,
        y,
        radius
      );
      modernGradient.addColorStop(0, '#ffffff');
      modernGradient.addColorStop(0.5, '#ecf0f1');
      modernGradient.addColorStop(1, '#bdc3c7');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = modernGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      break;

    case 'cute':
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const cuteGradient = ctx.createRadialGradient(
        x - radius / 4,
        y - radius / 4,
        0,
        x,
        y,
        radius
      );
      cuteGradient.addColorStop(0, '#ffffff');
      cuteGradient.addColorStop(0.7, '#f8f8f8');
      cuteGradient.addColorStop(1, '#e8e8e8');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = cuteGradient;
      ctx.fill();

      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x + radius * 0.15, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
      break;

    case 'neon':
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 15;

      const neonGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      neonGradient.addColorStop(0, '#ffffff');
      neonGradient.addColorStop(0.5, '#f0f0f0');
      neonGradient.addColorStop(1, '#e0e0e0');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = neonGradient;
      ctx.fill();

      ctx.strokeStyle = '#FF00FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    default:
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const classicGradient = ctx.createRadialGradient(
        x - radius / 3,
        y - radius / 3,
        0,
        x,
        y,
        radius
      );
      classicGradient.addColorStop(0, '#ffffff');
      classicGradient.addColorStop(0.5, '#f5f5f5');
      classicGradient.addColorStop(1, '#e0e0e0');

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = classicGradient;
      ctx.fill();

      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.stroke();
  }
}

export default memo(BoardCanvas);
