import { Player, Position, Move, WinLine, GameStats } from '@/types/game';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const generateRoomCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const getCanvasCoordinates = (
  canvas: HTMLCanvasElement,
  event: React.MouseEvent | React.TouchEvent
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX: number, clientY: number;
  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else if ('clientX' in event) {
    clientX = event.clientX;
    clientY = event.clientY;
  } else {
    return { x: 0, y: 0 };
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
};

export const createEmptyBoard = (size: number = 15): Player[][] => {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
};

export const loadStats = (): GameStats => {
  return getLocalStorage<GameStats>('gomoku_stats', {
    totalGames: 0,
    blackWins: 0,
    whiteWins: 0,
  });
};

export const saveStats = (stats: GameStats): void => {
  setLocalStorage('gomoku_stats', stats);
};

export const loadBoardTheme = (): string => {
  return getLocalStorage<string>('gomoku_board_theme', 'classic');
};

export const saveBoardTheme = (theme: string): void => {
  setLocalStorage('gomoku_board_theme', theme);
};

export const loadPieceStyle = (): string => {
  return getLocalStorage<string>('gomoku_piece_style', 'classic');
};

export const savePieceStyle = (style: string): void => {
  setLocalStorage('gomoku_piece_style', style);
};
