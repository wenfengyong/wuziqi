export type Player = 0 | 1 | 2;

export type GameMode = 'single' | 'local';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type PieceStyle = 'classic' | 'modern' | 'cute' | 'neon' | 'wood' | 'metal' | 'glass' | 'gradient';

export type BoardThemeId = 'classic' | 'modern' | 'stone' | 'bamboo' | 'neon';

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface Position {
  row: number;
  col: number;
}

export interface Move extends Position {
  player: Player;
}

export interface WinLine {
  start: Position;
  end: Position;
}

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  description: string;
  background: string;
  backgroundGradient: string[];
  lineColor: string;
  starPointColor: string;
  textColor: string;
  preview: string;
}

export interface GameState {
  mode: GameMode;
  currentPlayer: Player;
  isGameOver: boolean;
  isPaused: boolean;
  winner: Player;
  moveHistory: Move[];
  blackTime: number;
  whiteTime: number;
  board: Player[][];
  lastMove: Position | null;
  winLine: WinLine | null;
  stats: GameStats;
  pieceStyle: PieceStyle;
  boardTheme: BoardThemeId;
  lineStyle: LineStyle;
  lineColor: string;
  fixedBoard: boolean;
  hostIsBlack: boolean;
}

export interface GameStats {
  totalGames: number;
  blackWins: number;
  whiteWins: number;
}
