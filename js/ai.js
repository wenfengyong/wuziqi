class AI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = {
            easy: 1,
            medium: 2,
            hard: 3
        };
        
        this.scores = {
            five: 100000,
            openFour: 10000,
            four: 1000,
            openThree: 1000,
            three: 100,
            openTwo: 100,
            two: 10,
            one: 1
        };
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }
    
    getBestMove(board, player) {
        const depth = this.depths[this.difficulty];
        
        if (this.difficulty === 'easy') {
            return this.getRandomMove(board);
        }
        
        const moves = this.getCandidateMoves(board);
        if (moves.length === 0) {
            return { row: 7, col: 7 };
        }
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            board.board[move.row][move.col] = player;
            
            const score = this.minimax(board, depth - 1, -Infinity, Infinity, false, player, 3 - player);
            
            board.board[move.row][move.col] = 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getRandomMove(board) {
        const moves = this.getCandidateMoves(board);
        if (moves.length === 0) {
            return { row: 7, col: 7 };
        }
        
        const weightedMoves = moves.map(move => {
            board.board[move.row][move.col] = 2;
            const score = this.evaluatePosition(board.board, move.row, move.col, 2);
            board.board[move.row][move.col] = 0;
            return { ...move, score };
        });
        
        weightedMoves.sort((a, b) => b.score - a.score);
        
        const topMoves = weightedMoves.slice(0, Math.min(5, weightedMoves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }
    
    getCandidateMoves(board) {
        const candidates = [];
        const boardData = board.board;
        
        for (let i = 0; i < board.gridSize; i++) {
            for (let j = 0; j < board.gridSize; j++) {
                if (boardData[i][j] === 0 && board.hasNearbyPieces(i, j, 2)) {
                    candidates.push({ row: i, col: j });
                }
            }
        }
        
        if (candidates.length === 0) {
            const center = Math.floor(board.gridSize / 2);
            if (boardData[center][center] === 0) {
                return [{ row: center, col: center }];
            }
        }
        
        return candidates;
    }
    
    minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) {
        const winner = GameRules.checkWin(board.board);
        if (winner) {
            return winner === aiPlayer ? this.scores.five : -this.scores.five;
        }
        
        if (depth === 0) {
            return this.evaluateBoard(board.board, aiPlayer);
        }
        
        const moves = this.getCandidateMoves(board);
        if (moves.length === 0) {
            return 0;
        }
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                board.board[move.row][move.col] = aiPlayer;
                const score = this.minimax(board, depth - 1, alpha, beta, false, aiPlayer, humanPlayer);
                board.board[move.row][move.col] = 0;
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                board.board[move.row][move.col] = humanPlayer;
                const score = this.minimax(board, depth - 1, alpha, beta, true, aiPlayer, humanPlayer);
                board.board[move.row][move.col] = 0;
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }
    
    evaluateBoard(boardData, player) {
        let score = 0;
        const opponent = 3 - player;
        
        for (let i = 0; i < boardData.length; i++) {
            for (let j = 0; j < boardData[i].length; j++) {
                if (boardData[i][j] === player) {
                    score += this.evaluatePosition(boardData, i, j, player);
                } else if (boardData[i][j] === opponent) {
                    score -= this.evaluatePosition(boardData, i, j, opponent);
                }
            }
        }
        
        return score;
    }
    
    evaluatePosition(boardData, row, col, player) {
        let score = 0;
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            const lineScore = this.evaluateLine(boardData, row, col, dx, dy, player);
            score += lineScore;
        }
        
        return score;
    }
    
    evaluateLine(boardData, row, col, dx, dy, player) {
        const opponent = 3 - player;
        let count = 1;
        let openEnds = 0;
        let blocked = 0;
        
        let r = row + dx;
        let c = col + dy;
        while (r >= 0 && r < boardData.length && c >= 0 && c < boardData[0].length) {
            if (boardData[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            } else if (boardData[r][c] === 0) {
                openEnds++;
                break;
            } else {
                blocked++;
                break;
            }
        }
        
        r = row - dx;
        c = col - dy;
        while (r >= 0 && r < boardData.length && c >= 0 && c < boardData[0].length) {
            if (boardData[r][c] === player) {
                count++;
                r -= dx;
                c -= dy;
            } else if (boardData[r][c] === 0) {
                openEnds++;
                break;
            } else {
                blocked++;
                break;
            }
        }
        
        return this.getPatternScore(count, openEnds, blocked);
    }
    
    getPatternScore(count, openEnds, blocked) {
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

const GameRules = {
    checkWin(boardData) {
        const gridSize = boardData.length;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (boardData[i][j] !== 0) {
                    const winner = this.checkFiveInRow(boardData, i, j);
                    if (winner) return winner;
                }
            }
        }
        return null;
    },
    
    checkFiveInRow(boardData, row, col) {
        const player = boardData[row][col];
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            let r = row + dx;
            let c = col + dy;
            
            while (r >= 0 && r < boardData.length && c >= 0 && c < boardData[0].length && boardData[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }
            
            if (count >= 5) {
                return player;
            }
        }
        
        return null;
    },
    
    getWinLine(boardData, row, col) {
        const player = boardData[row][col];
        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1]
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            let startRow = row;
            let startCol = col;
            let endRow = row;
            let endCol = col;
            
            let r = row + dx;
            let c = col + dy;
            while (r >= 0 && r < boardData.length && c >= 0 && c < boardData[0].length && boardData[r][c] === player) {
                count++;
                endRow = r;
                endCol = c;
                r += dx;
                c += dy;
            }
            
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < boardData.length && c >= 0 && c < boardData[0].length && boardData[r][c] === player) {
                count++;
                startRow = r;
                startCol = c;
                r -= dx;
                c -= dy;
            }
            
            if (count >= 5) {
                return {
                    start: { row: startRow, col: startCol },
                    end: { row: endRow, col: endCol }
                };
            }
        }
        
        return null;
    },
    
    isBoardFull(boardData) {
        for (let i = 0; i < boardData.length; i++) {
            for (let j = 0; j < boardData[i].length; j++) {
                if (boardData[i][j] === 0) return false;
            }
        }
        return true;
    },
    
    checkThreat(boardData, player) {
        const gridSize = boardData.length;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (boardData[i][j] === 0) {
                    boardData[i][j] = player;
                    if (this.checkWin(boardData)) {
                        boardData[i][j] = 0;
                        return { row: i, col: j };
                    }
                    boardData[i][j] = 0;
                }
            }
        }
        return null;
    }
};
