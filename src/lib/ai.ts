import { Player, Position } from '@/types/game';
import { checkWin, isBoardFull } from './gameRules';

interface Scores {
  five: number;
  openFour: number;
  four: number;
  openThree: number;
  three: number;
  openTwo: number;
  two: number;
  one: number;
}

export class AI {
  private difficulty: 'easy' | 'medium' | 'hard';
  private depths: Record<string, number>;
  private scores: Scores;

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = difficulty;
    this.depths = {
      easy: 1,
      medium: 2,
      hard: 3,
    };

    this.scores = {
      five: 100000,
      openFour: 10000,
      four: 1000,
      openThree: 1000,
      three: 100,
      openTwo: 100,
      two: 10,
      one: 1,
    };
  }

  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.difficulty = difficulty;
  }

  getBestMove(board: Player[][], player: Player): Position | null {
    const depth = this.depths[this.difficulty];

    if (this.difficulty === 'easy') {
      return this.getRandomMove(board, player);
    }

    const moves = this.getCandidateMoves(board);
    if (moves.length === 0) {
      return { row: 7, col: 7 };
    }

    let bestMove: Position | null = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      board[move.row][move.col] = player;

      const score = this.minimax(
        board,
        depth - 1,
        -Infinity,
        Infinity,
        false,
        player,
        (3 - player) as Player
      );

      board[move.row][move.col] = 0;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private getRandomMove(board: Player[][], player: Player): Position | null {
    const moves = this.getCandidateMoves(board);
    if (moves.length === 0) {
      return { row: 7, col: 7 };
    }

    const weightedMoves = moves.map((move) => {
      board[move.row][move.col] = player;
      const score = this.evaluatePosition(board, move.row, move.col, player);
      board[move.row][move.col] = 0;
      return { ...move, score };
    });

    weightedMoves.sort((a, b) => b.score - a.score);

    const topMoves = weightedMoves.slice(0, Math.min(5, weightedMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)];
  }

  private getCandidateMoves(board: Player[][]): Position[] {
    const candidates: Position[] = [];
    const gridSize = board.length;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (board[i][j] === 0 && this.hasNearbyPieces(board, i, j, 2)) {
          candidates.push({ row: i, col: j });
        }
      }
    }

    if (candidates.length === 0) {
      const center = Math.floor(gridSize / 2);
      if (board[center][center] === 0) {
        return [{ row: center, col: center }];
      }
    }

    return candidates;
  }

  private hasNearbyPieces(
    board: Player[][],
    row: number,
    col: number,
    distance: number
  ): boolean {
    const gridSize = board.length;
    for (
      let i = Math.max(0, row - distance);
      i <= Math.min(gridSize - 1, row + distance);
      i++
    ) {
      for (
        let j = Math.max(0, col - distance);
        j <= Math.min(gridSize - 1, col + distance);
        j++
      ) {
        if (board[i][j] !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  private minimax(
    board: Player[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiPlayer: Player,
    humanPlayer: Player
  ): number {
    const winner = checkWin(board);
    if (winner) {
      return winner === aiPlayer ? this.scores.five : -this.scores.five;
    }

    if (depth === 0) {
      return this.evaluateBoard(board, aiPlayer);
    }

    const moves = this.getCandidateMoves(board);
    if (moves.length === 0) {
      return 0;
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of moves) {
        board[move.row][move.col] = aiPlayer;
        const score = this.minimax(
          board,
          depth - 1,
          alpha,
          beta,
          false,
          aiPlayer,
          humanPlayer
        );
        board[move.row][move.col] = 0;
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        board[move.row][move.col] = humanPlayer;
        const score = this.minimax(
          board,
          depth - 1,
          alpha,
          beta,
          true,
          aiPlayer,
          humanPlayer
        );
        board[move.row][move.col] = 0;
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  }

  private evaluateBoard(board: Player[][], player: Player): number {
    let score = 0;
    const opponent = (3 - player) as Player;

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === player) {
          score += this.evaluatePosition(board, i, j, player);
        } else if (board[i][j] === opponent) {
          score -= this.evaluatePosition(board, i, j, opponent);
        }
      }
    }

    return score;
  }

  private evaluatePosition(
    board: Player[][],
    row: number,
    col: number,
    player: Player
  ): number {
    let score = 0;
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dx, dy] of directions) {
      const lineScore = this.evaluateLine(board, row, col, dx, dy, player);
      score += lineScore;
    }

    return score;
  }

  private evaluateLine(
    board: Player[][],
    row: number,
    col: number,
    dx: number,
    dy: number,
    player: Player
  ): number {
    let count = 1;
    let openEnds = 0;
    let blocked = 0;

    let r = row + dx;
    let c = col + dy;
    while (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
      if (board[r][c] === player) {
        count++;
        r += dx;
        c += dy;
      } else if (board[r][c] === 0) {
        openEnds++;
        break;
      } else {
        blocked++;
        break;
      }
    }

    r = row - dx;
    c = col - dy;
    while (r >= 0 && r < board.length && c >= 0 && c < board[0].length) {
      if (board[r][c] === player) {
        count++;
        r -= dx;
        c -= dy;
      } else if (board[r][c] === 0) {
        openEnds++;
        break;
      } else {
        blocked++;
        break;
      }
    }

    return this.getPatternScore(count, openEnds, blocked);
  }

  private getPatternScore(
    count: number,
    openEnds: number,
    blocked: number
  ): number {
    if (count >= 5) return this.scores.five;

    if (blocked === 2) return 0;

    if (count === 4) {
      if (openEnds === 2) return this.scores.openFour;
      if (openEnds === 1) return this.scores.four;
    }

    if (count === 3) {
      if (openEnds === 2) return this.scores.openThree;
      if (openEnds === 1) return this.scores.three;
    }

    if (count === 2) {
      if (openEnds === 2) return this.scores.openTwo;
      if (openEnds === 1) return this.scores.two;
    }

    if (count === 1) {
      return this.scores.one;
    }

    return 0;
  }
}
