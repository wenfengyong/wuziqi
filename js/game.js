class Game {
    constructor(board) {
        this.board = board;
        this.ai = new AI('medium');
        this.networkManager = new NetworkManager();
        
        this.mode = 'single';
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.winner = null;
        
        this.moveHistory = [];
        this.blackTime = 0;
        this.whiteTime = 0;
        this.timerInterval = null;
        
        this.stats = this.loadStats();
        
        this.onMoveCallback = null;
        this.onGameOverCallback = null;
        this.onTimeUpdateCallback = null;
        this.onSwapCallback = null;
        this.onPlayerJoinedCallback = null;
        this.onUndoRequestCallback = null;
        this.onRestartRequestCallback = null;
        this.onSwapRequestCallback = null;
        this.onUndoResultCallback = null;
        this.onRestartResultCallback = null;
        
        this.hostIsBlack = true;
        
        this.setupNetworkHandlers();
    }
    
    setupNetworkHandlers() {
        this.networkManager.onMessage((data) => {
            this.handleNetworkMessage(data);
        });
        
        this.networkManager.onConnectionStateChange((state) => {
            if (state === 'player_joined') {
                this.hostIsBlack = this.networkManager.getHostIsBlack();
                this.reset();
                this.updateTurnIndicator();
                if (this.onPlayerJoinedCallback) {
                    this.onPlayerJoinedCallback();
                }
            } else if (state === 'player_left') {
                Utils.showNotification('对手已断开连接', 'error');
            }
        });
    }
    
    handleNetworkMessage(data) {
        switch (data.type) {
            case 'move':
                this.handleRemoteMove(data.row, data.col);
                break;
            case 'undo_request':
                this.handleUndoRequest();
                break;
            case 'undo_accepted':
                if (this.onUndoResultCallback) {
                    this.onUndoResultCallback(true);
                }
                break;
            case 'undo_applied':
                this.performUndoForNetwork();
                break;
            case 'undo_rejected':
                if (this.onUndoResultCallback) {
                    this.onUndoResultCallback(false);
                }
                break;
            case 'undo_both':
                if (data.moves) {
                    this.performMultipleUndo(data.moves);
                }
                break;
            case 'restart_request':
                this.handleRestartRequest();
                break;
            case 'restart_accepted':
                if (this.onRestartResultCallback) {
                    this.onRestartResultCallback(true);
                }
                break;
            case 'restart_applied':
                this.performRestart();
                break;
            case 'restart_rejected':
                if (this.onRestartResultCallback) {
                    this.onRestartResultCallback(false);
                }
                break;
            case 'swap_request':
                this.handleSwapRequest();
                break;
            case 'swap_accepted':
                this.hostIsBlack = data.hostIsBlack;
                this.performSwap();
                break;
            case 'swap_rejected':
                Utils.showNotification('对方拒绝了交换请求', 'info');
                break;
        }
    }
    
    setMode(mode) {
        this.mode = mode;
        this.reset();
        
        if (mode !== 'lan') {
            this.closeLanConnection();
        }
    }
    
    getMyColor() {
        if (this.mode !== 'lan') return this.currentPlayer;
        return this.networkManager.isHostPlayer() ? 
            (this.hostIsBlack ? 1 : 2) : 
            (this.hostIsBlack ? 2 : 1);
    }
    
    isMyTurn() {
        if (this.mode !== 'lan') return true;
        const myColor = this.getMyColor();
        return this.currentPlayer === myColor;
    }
    
    handleMove(row, col) {
        if (this.isGameOver || this.isPaused) return false;
        
        if (this.mode === 'single' && this.currentPlayer === 2) return false;
        
        if (this.mode === 'lan' && !this.isMyTurn()) return false;
        
        if (!this.board.placePiece(row, col, this.currentPlayer)) return false;
        
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        
        if (this.onMoveCallback) {
            this.onMoveCallback(row, col, this.currentPlayer);
        }
        
        if (this.mode === 'lan') {
            this.networkManager.send({ type: 'move', row, col });
        }
        
        const winner = GameRules.checkWin(this.board.board);
        if (winner) {
            this.endGame(winner);
            return true;
        }
        
        if (GameRules.isBoardFull(this.board.board)) {
            this.endGame(0);
            return true;
        }
        
        this.switchPlayer();
        
        if (this.mode === 'single' && this.currentPlayer === 2) {
            setTimeout(() => this.makeAIMove(), 300);
        }
        
        return true;
    }
    
    handleRemoteMove(row, col) {
        if (this.board.placePiece(row, col, this.currentPlayer)) {
            this.moveHistory.push({ row, col, player: this.currentPlayer });
            
            if (this.onMoveCallback) {
                this.onMoveCallback(row, col, this.currentPlayer);
            }
            
            const winner = GameRules.checkWin(this.board.board);
            if (winner) {
                this.endGame(winner);
                return;
            }
            
            if (GameRules.isBoardFull(this.board.board)) {
                this.endGame(0);
                return;
            }
            
            this.switchPlayer();
            this.updateTurnIndicator();
        }
    }
    
    makeAIMove() {
        if (this.isGameOver || this.isPaused) return;
        
        const move = this.ai.getBestMove(this.board, 2);
        if (move) {
            this.handleMove(move.row, move.col);
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateTurnIndicator();
    }
    
    updateTurnIndicator() {
        if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.blackTime, this.whiteTime, this.currentPlayer);
        }
    }
    
    endGame(winner) {
        this.isGameOver = true;
        this.winner = winner;
        this.stopTimer();
        
        if (winner !== 0) {
            const winLine = GameRules.getWinLine(this.board.board, this.board.lastMove.row, this.board.lastMove.col);
            if (winLine) {
                this.board.setWinLine(winLine.start, winLine.end);
            }
        }
        
        this.updateStats(winner);
        
        if (this.onGameOverCallback) {
            this.onGameOverCallback(winner);
        }
    }
    
    undo() {
        if (this.isGameOver || this.moveHistory.length === 0) return false;
        
        if (this.mode === 'lan') {
            this.networkManager.send({ type: 'undo_request' });
            return true;
        }
        
        return this.performUndo();
    }
    
    handleUndoRequest() {
        if (this.onUndoRequestCallback) {
            this.onUndoRequestCallback();
        }
    }
    
    sendUndoResponse(accepted) {
        this.networkManager.send({ type: 'undo_response', accepted });
    }
    
    performUndoForNetwork() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        this.board.removePiece(lastMove.row, lastMove.col);
        
        this.currentPlayer = lastMove.player;
        this.isGameOver = false;
        this.winner = null;
        this.board.winLine = null;
        this.board.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
        this.board.draw();
        
        this.startTimer();
        this.updateTurnIndicator();
        
        return true;
    }
    
    performMultipleUndo(moves) {
        for (let i = 0; i < moves; i++) {
            if (this.moveHistory.length === 0) break;
            const move = this.moveHistory.pop();
            this.board.removePiece(move.row, move.col);
        }
        
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory[this.moveHistory.length - 1];
            this.currentPlayer = lastMove.player === 1 ? 2 : 1;
            this.board.lastMove = lastMove;
        } else {
            this.currentPlayer = 1;
            this.board.lastMove = null;
        }
        
        this.isGameOver = false;
        this.winner = null;
        this.board.winLine = null;
        this.board.draw();
        
        this.startTimer();
        this.updateTurnIndicator();
    }
    
    performUndo() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        this.board.removePiece(lastMove.row, lastMove.col);
        
        if (this.mode === 'single' && lastMove.player === 2 && this.moveHistory.length > 0) {
            const playerMove = this.moveHistory.pop();
            this.board.removePiece(playerMove.row, playerMove.col);
        }
        
        this.currentPlayer = this.moveHistory.length % 2 === 0 ? 1 : 2;
        this.isGameOver = false;
        this.winner = null;
        this.board.winLine = null;
        this.board.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
        this.board.draw();
        
        this.startTimer();
        this.updateTurnIndicator();
        
        return true;
    }
    
    restart() {
        if (this.mode === 'lan') {
            this.networkManager.send({ type: 'restart_request' });
            return;
        }
        
        this.performRestart();
    }
    
    handleRestartRequest() {
        if (this.onRestartRequestCallback) {
            this.onRestartRequestCallback();
        }
    }
    
    sendRestartResponse(accepted) {
        this.networkManager.send({ type: 'restart_response', accepted });
    }
    
    performRestart() {
        this.reset();
    }
    
    reset() {
        this.board.clearBoard();
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.winner = null;
        this.moveHistory = [];
        this.blackTime = 0;
        this.whiteTime = 0;
        this.stopTimer();
        this.startTimer();
        this.board.draw();
        this.updateTurnIndicator();
    }
    
    pause() {
        if (this.isGameOver) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }
    
    requestSwap() {
        if (this.mode !== 'lan') return false;
        this.networkManager.send({ type: 'swap_request' });
        return true;
    }
    
    handleSwapRequest() {
        if (this.onSwapRequestCallback) {
            this.onSwapRequestCallback();
        }
    }
    
    sendSwapResponse(accepted) {
        this.networkManager.send({ type: 'swap_response', accepted });
    }
    
    performSwap() {
        this.hostIsBlack = !this.hostIsBlack;
        this.reset();
        
        if (this.onSwapCallback) {
            this.onSwapCallback(this.hostIsBlack);
        }
        
        Utils.showNotification('已交换黑白棋身份', 'success');
    }
    
    startTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            if (this.currentPlayer === 1) {
                this.blackTime++;
            } else {
                this.whiteTime++;
            }
            
            if (this.onTimeUpdateCallback) {
                this.onTimeUpdateCallback(this.blackTime, this.whiteTime, this.currentPlayer);
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    setDifficulty(difficulty) {
        this.ai.setDifficulty(difficulty);
    }
    
    setPieceStyle(player, style) {
        this.board.setPieceStyle(player, style);
    }
    
    loadStats() {
        return Utils.getLocalStorage('gomoku_stats', {
            totalGames: 0,
            blackWins: 0,
            whiteWins: 0
        });
    }
    
    saveStats() {
        Utils.setLocalStorage('gomoku_stats', this.stats);
    }
    
    updateStats(winner) {
        this.stats.totalGames++;
        if (winner === 1) {
            this.stats.blackWins++;
        } else if (winner === 2) {
            this.stats.whiteWins++;
        }
        this.saveStats();
    }
    
    getStats() {
        return this.stats;
    }
    
    getMoveHistory() {
        return this.moveHistory;
    }
    
    getCurrentPlayer() {
        return this.currentPlayer;
    }
    
    isGameOverState() {
        return this.isGameOver;
    }
    
    getWinner() {
        return this.winner;
    }
    
    getMode() {
        return this.mode;
    }
    
    onMove(callback) {
        this.onMoveCallback = callback;
    }
    
    onGameOver(callback) {
        this.onGameOverCallback = callback;
    }
    
    onTimeUpdate(callback) {
        this.onTimeUpdateCallback = callback;
    }
    
    onSwap(callback) {
        this.onSwapCallback = callback;
    }
    
    onPlayerJoined(callback) {
        this.onPlayerJoinedCallback = callback;
    }
    
    onUndoRequest(callback) {
        this.onUndoRequestCallback = callback;
    }
    
    onRestartRequest(callback) {
        this.onRestartRequestCallback = callback;
    }
    
    onSwapRequest(callback) {
        this.onSwapRequestCallback = callback;
    }
    
    onUndoResult(callback) {
        this.onUndoResultCallback = callback;
    }
    
    onRestartResult(callback) {
        this.onRestartResultCallback = callback;
    }
    
    async connectToServer(serverUrl) {
        return await this.networkManager.connect(serverUrl);
    }
    
    async createLanRoom() {
        const roomCode = await this.networkManager.createRoom();
        this.hostIsBlack = true;
        return roomCode;
    }
    
    async joinLanRoom(roomCode) {
        return await this.networkManager.joinRoom(roomCode);
    }
    
    closeLanConnection() {
        this.networkManager.close();
    }
    
    isLanConnected() {
        return this.networkManager.connected();
    }
    
    isLanHost() {
        return this.networkManager.isHostPlayer();
    }
    
    getHostIsBlack() {
        return this.hostIsBlack;
    }
}
