'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode, useRef } from 'react';
import { Player, GameMode, Difficulty, PieceStyle, BoardThemeId, Position, Move, WinLine, GameState, GameStats } from '@/types/game';
import { createEmptyBoard, loadStats, saveStats, loadBoardTheme, saveBoardTheme, loadPieceStyle, savePieceStyle } from '@/lib/utils';
import { checkWinAtPosition, getWinLine, isBoardFull } from '@/lib/gameRules';
import { AI } from '@/lib/ai';

interface GameContextType extends GameState {
  setMode: (mode: GameMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setPieceStyle: (style: PieceStyle) => void;
  setBoardTheme: (theme: BoardThemeId) => void;
  handleMove: (row: number, col: number) => boolean;
  undo: () => void;
  restart: () => void;
  pause: () => void;
  updateStats: (winner: Player) => void;
  resetStats: () => void;
}

const initialState: GameState = {
  mode: 'single',
  currentPlayer: 1,
  isGameOver: false,
  isPaused: false,
  winner: 0,
  moveHistory: [],
  blackTime: 0,
  whiteTime: 0,
  board: createEmptyBoard(),
  lastMove: null,
  winLine: null,
  stats: { totalGames: 0, blackWins: 0, whiteWins: 0 },
  pieceStyle: 'classic',
  boardTheme: 'classic',
  hostIsBlack: true,
};

type GameAction =
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | { type: 'SET_PIECE_STYLE'; payload: PieceStyle }
  | { type: 'SET_BOARD_THEME'; payload: BoardThemeId }
  | { type: 'MAKE_MOVE'; payload: { row: number; col: number; player: Player } }
  | { type: 'SWITCH_PLAYER' }
  | { type: 'END_GAME'; payload: { winner: Player; winLine: WinLine | null } }
  | { type: 'UNDO'; payload: { board: Player[][]; lastMove: Position | null; currentPlayer: Player } }
  | { type: 'RESTART' }
  | { type: 'PAUSE' }
  | { type: 'UPDATE_TIME'; payload: { blackTime: number; whiteTime: number } }
  | { type: 'UPDATE_STATS'; payload: GameStats }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<GameState> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...initialState,
        mode: action.payload,
        stats: state.stats,
        pieceStyle: state.pieceStyle,
        boardTheme: state.boardTheme,
        board: createEmptyBoard(),
      };
    case 'SET_DIFFICULTY':
      return { ...state };
    case 'SET_PIECE_STYLE':
      return { ...state, pieceStyle: action.payload };
    case 'SET_BOARD_THEME':
      return { ...state, boardTheme: action.payload };
    case 'MAKE_MOVE': {
      const newBoard = state.board.map(row => [...row]);
      newBoard[action.payload.row][action.payload.col] = action.payload.player;
      return {
        ...state,
        board: newBoard,
        lastMove: { row: action.payload.row, col: action.payload.col },
        moveHistory: [...state.moveHistory, action.payload],
      };
    }
    case 'SWITCH_PLAYER':
      return { ...state, currentPlayer: state.currentPlayer === 1 ? 2 : 1 };
    case 'END_GAME':
      return {
        ...state,
        isGameOver: true,
        winner: action.payload.winner,
        winLine: action.payload.winLine,
      };
    case 'UNDO':
      return {
        ...state,
        board: action.payload.board,
        lastMove: action.payload.lastMove,
        currentPlayer: action.payload.currentPlayer,
        isGameOver: false,
        winner: 0,
        winLine: null,
        moveHistory: state.moveHistory.slice(0, -1),
      };
    case 'RESTART':
      return {
        ...state,
        currentPlayer: 1,
        isGameOver: false,
        isPaused: false,
        winner: 0,
        moveHistory: [],
        blackTime: 0,
        whiteTime: 0,
        board: createEmptyBoard(),
        lastMove: null,
        winLine: null,
      };
    case 'PAUSE':
      return { ...state, isPaused: !state.isPaused };
    case 'UPDATE_TIME':
      return {
        ...state,
        blackTime: action.payload.blackTime,
        whiteTime: action.payload.whiteTime,
      };
    case 'UPDATE_STATS':
      return { ...state, stats: action.payload };
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const aiRef = useRef<AI>(new AI('medium'));
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingMove = useRef(false);

  useEffect(() => {
    const savedStats = loadStats();
    const savedTheme = loadBoardTheme() as BoardThemeId;
    const savedPieceStyle = loadPieceStyle() as PieceStyle;
    dispatch({
      type: 'LOAD_SAVED_STATE',
      payload: {
        stats: savedStats,
        boardTheme: savedTheme || 'classic',
        pieceStyle: savedPieceStyle || 'classic',
      },
    });
  }, []);

  useEffect(() => {
    if (!state.isGameOver && !state.isPaused) {
      timerRef.current = setInterval(() => {
        const newBlackTime = state.currentPlayer === 1 ? state.blackTime + 1 : state.blackTime;
        const newWhiteTime = state.currentPlayer === 2 ? state.whiteTime + 1 : state.whiteTime;
        dispatch({
          type: 'UPDATE_TIME',
          payload: { blackTime: newBlackTime, whiteTime: newWhiteTime },
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isGameOver, state.isPaused, state.currentPlayer, state.blackTime, state.whiteTime]);

  const setMode = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    aiRef.current.setDifficulty(difficulty);
  }, []);

  const setPieceStyle = useCallback((style: PieceStyle) => {
    savePieceStyle(style);
    dispatch({ type: 'SET_PIECE_STYLE', payload: style });
  }, []);

  const setBoardTheme = useCallback((theme: BoardThemeId) => {
    saveBoardTheme(theme);
    dispatch({ type: 'SET_BOARD_THEME', payload: theme });
  }, []);

  const handleMove = useCallback((row: number, col: number): boolean => {
    if (state.isGameOver || state.isPaused) return false;
    if (state.board[row][col] !== 0) return false;
    if (state.mode === 'single' && state.currentPlayer === 2) return false;
    if (isProcessingMove.current) return false;

    isProcessingMove.current = true;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayer;

    dispatch({ type: 'MAKE_MOVE', payload: { row, col, player: state.currentPlayer } });

    const winner = checkWinAtPosition(newBoard, row, col);
    if (winner) {
      const winLine = getWinLine(newBoard, row, col);
      dispatch({ type: 'END_GAME', payload: { winner, winLine } });
      isProcessingMove.current = false;
      return true;
    }

    if (isBoardFull(newBoard)) {
      dispatch({ type: 'END_GAME', payload: { winner: 0, winLine: null } });
      isProcessingMove.current = false;
      return true;
    }

    dispatch({ type: 'SWITCH_PLAYER' });

    if (state.mode === 'single' && state.currentPlayer === 1) {
      setTimeout(() => {
        const aiMove = aiRef.current.getBestMove(newBoard, 2);
        if (aiMove) {
          const aiBoard = newBoard.map(r => [...r]);
          aiBoard[aiMove.row][aiMove.col] = 2;
          
          dispatch({ type: 'MAKE_MOVE', payload: { row: aiMove.row, col: aiMove.col, player: 2 } });
          
          const aiWinner = checkWinAtPosition(aiBoard, aiMove.row, aiMove.col);
          if (aiWinner) {
            const winLine = getWinLine(aiBoard, aiMove.row, aiMove.col);
            dispatch({ type: 'END_GAME', payload: { winner: aiWinner, winLine } });
          } else {
            dispatch({ type: 'SWITCH_PLAYER' });
          }
        }
        isProcessingMove.current = false;
      }, 300);
    } else {
      isProcessingMove.current = false;
    }

    return true;
  }, [state]);

  const undo = useCallback(() => {
    if (state.isGameOver || state.moveHistory.length === 0) return;

    const newBoard = state.board.map(row => [...row]);
    const lastMove = state.moveHistory[state.moveHistory.length - 1];
    newBoard[lastMove.row][lastMove.col] = 0;

    let newMoveHistory = state.moveHistory.slice(0, -1);
    let newLastMove = newMoveHistory.length > 0 ? newMoveHistory[newMoveHistory.length - 1] : null;

    if (state.mode === 'single' && lastMove.player === 2 && newMoveHistory.length > 0) {
      const playerMove = newMoveHistory[newMoveHistory.length - 1];
      newBoard[playerMove.row][playerMove.col] = 0;
      newMoveHistory = newMoveHistory.slice(0, -1);
      newLastMove = newMoveHistory.length > 0 ? newMoveHistory[newMoveHistory.length - 1] : null;
    }

    dispatch({
      type: 'UNDO',
      payload: {
        board: newBoard,
        lastMove: newLastMove,
        currentPlayer: lastMove.player,
      },
    });
  }, [state]);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const updateStats = useCallback((winner: Player) => {
    const newStats = { ...state.stats };
    newStats.totalGames++;
    if (winner === 1) newStats.blackWins++;
    else if (winner === 2) newStats.whiteWins++;
    saveStats(newStats);
    dispatch({ type: 'UPDATE_STATS', payload: newStats });
  }, [state.stats]);

  const resetStats = useCallback(() => {
    const emptyStats: GameStats = { totalGames: 0, blackWins: 0, whiteWins: 0 };
    saveStats(emptyStats);
    dispatch({ type: 'UPDATE_STATS', payload: emptyStats });
  }, []);

  const value: GameContextType = {
    ...state,
    setMode,
    setDifficulty,
    setPieceStyle,
    setBoardTheme,
    handleMove,
    undo,
    restart,
    pause,
    updateStats,
    resetStats,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
