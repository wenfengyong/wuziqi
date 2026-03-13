import { Player, Position, WinLine } from '@/types/game';

export const checkWin = (board: Player[][]): Player | null => {
  const gridSize = board.length;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (board[i][j] !== 0) {
        const winner = checkFiveInRow(board, i, j);
        if (winner) return winner;
      }
    }
  }
  return null;
};

export const checkFiveInRow = (
  board: Player[][],
  row: number,
  col: number
): Player | null => {
  const player = board[row][col];
  if (player === 0) return null;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;

    let r = row + dx;
    let c = col + dy;
    while (
      r >= 0 &&
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c] === player
    ) {
      count++;
      r += dx;
      c += dy;
    }

    r = row - dx;
    c = col - dy;
    while (
      r >= 0 &&
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c] === player
    ) {
      count++;
      r -= dx;
      c -= dy;
    }

    if (count >= 5) {
      return player;
    }
  }

  return null;
};

export const checkWinAtPosition = (
  board: Player[][],
  row: number,
  col: number
): Player | null => {
  if (board[row][col] === 0) return null;
  return checkFiveInRow(board, row, col);
};

export const getWinLine = (
  board: Player[][],
  row: number,
  col: number
): WinLine | null => {
  const player = board[row][col];
  if (player === 0) return null;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    let startRow = row;
    let startCol = col;
    let endRow = row;
    let endCol = col;

    let r = row + dx;
    let c = col + dy;
    while (
      r >= 0 &&
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c] === player
    ) {
      count++;
      endRow = r;
      endCol = c;
      r += dx;
      c += dy;
    }

    r = row - dx;
    c = col - dy;
    while (
      r >= 0 &&
      r < board.length &&
      c >= 0 &&
      c < board[0].length &&
      board[r][c] === player
    ) {
      count++;
      startRow = r;
      startCol = c;
      r -= dx;
      c -= dy;
    }

    if (count >= 5) {
      return {
        start: { row: startRow, col: startCol },
        end: { row: endRow, col: endCol },
      };
    }
  }

  return null;
};

export const isBoardFull = (board: Player[][]): boolean => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  return true;
};

export const checkThreat = (
  board: Player[][],
  player: Player
): Position | null => {
  const gridSize = board.length;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (board[i][j] === 0) {
        board[i][j] = player;
        if (checkWin(board)) {
          board[i][j] = 0;
          return { row: i, col: j };
        }
        board[i][j] = 0;
      }
    }
  }
  return null;
};
