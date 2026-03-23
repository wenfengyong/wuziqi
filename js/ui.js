class UI {
    constructor(game) {
        this.game = game;
        this.board = game.board;
        this.gameOverModalShown = false;
        
        this.initElements();
        this.bindEvents();
        this.updateStats();
        this.startGame();
    }
    
    initElements() {
        this.elements = {
            canvas: document.getElementById('gameBoard'),
            turnIndicator: document.getElementById('turnIndicator'),
            blackTime: document.getElementById('blackTime'),
            whiteTime: document.getElementById('whiteTime'),
            blackPlayer: document.getElementById('blackPlayer'),
            whitePlayer: document.getElementById('whitePlayer'),
            moveHistory: document.getElementById('moveHistory'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            totalGames: document.getElementById('totalGames'),
            blackWins: document.getElementById('blackWins'),
            whiteWins: document.getElementById('whiteWins'),
            aiSettings: document.getElementById('aiSettings'),
            lanSettings: document.getElementById('lanSettings'),
            serverStatus: document.getElementById('serverStatus'),
            serverUrl: document.getElementById('serverUrl'),
            connectPanel: document.getElementById('connectPanel'),
            roomPanel: document.getElementById('roomPanel'),
            createRoomPanel: document.getElementById('createRoomPanel'),
            joinRoomPanel: document.getElementById('joinRoomPanel'),
            lanGamePanel: document.getElementById('lanGamePanel'),
            roomCode: document.getElementById('roomCode'),
            roomStatus: document.getElementById('roomStatus'),
            roomCodeInput: document.getElementById('roomCodeInput'),
            myRole: document.getElementById('myRole'),
            opponentRole: document.getElementById('opponentRole'),
            pauseBtn: document.getElementById('pauseBtn'),
            undoBtn: document.getElementById('undoBtn'),
            restartBtn: document.getElementById('restartBtn'),
            pureMode: document.getElementById('pureMode'),
            fixedBoard: document.getElementById('fixedBoard'),
            lineStyle: document.getElementById('lineStyle'),
            lineColor: document.getElementById('lineColor'),
            pureModeExit: document.getElementById('pureModeExit')
        };
    }
    
    bindEvents() {
        this.elements.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.elements.canvas.addEventListener('touchend', (e) => this.handleCanvasTouch(e));
        
        document.getElementById('singlePlayerBtn').addEventListener('click', () => this.setMode('single'));
        document.getElementById('localMultiBtn').addEventListener('click', () => this.setMode('local'));
        document.getElementById('lanMultiBtn').addEventListener('click', () => this.setMode('lan'));
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.target.dataset.difficulty));
        });
        
        document.querySelectorAll('.piece-style').forEach(el => {
            el.addEventListener('click', (e) => this.handlePieceStyleClick(e));
        });
        
        document.querySelectorAll('.board-style').forEach(el => {
            el.addEventListener('click', (e) => this.handleBoardStyleClick(e));
        });
        
        this.elements.lineStyle.addEventListener('change', (e) => {
            this.board.setLineStyle(e.target.value);
        });
        
        this.elements.lineColor.addEventListener('input', (e) => {
            this.board.setLineColor(e.target.value);
        });
        
        this.elements.pureMode.addEventListener('change', (e) => {
            this.togglePureMode(e.target.checked);
        });
        
        this.elements.fixedBoard.addEventListener('change', (e) => {
            this.board.setFixedSize(e.target.checked);
        });
        
        this.elements.pureModeExit.addEventListener('click', () => {
            this.exitPureMode();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            if (this.game.undo()) {
                this.gameOverModalShown = false;
                this.hideModal();
            }
        });
        document.getElementById('restartBtn').addEventListener('click', () => this.game.restart());
        document.getElementById('pauseBtn').addEventListener('click', () => this.handlePause());
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideModal();
            this.gameOverModalShown = false;
            this.game.restart();
        });
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideModal();
            this.gameOverModalShown = false;
        });
        
        document.getElementById('connectBtn').addEventListener('click', () => this.connectToServer());
        document.getElementById('createRoomBtn').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoomBtn').addEventListener('click', () => this.showJoinPanel());
        document.getElementById('confirmJoinBtn').addEventListener('click', () => this.joinRoom());
        document.getElementById('swapRoleBtn').addEventListener('click', () => this.requestSwap());
        
        this.elements.roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
        
        window.addEventListener('resize', Utils.debounce(() => this.handleResize(), 200));
    }
    
    handleCanvasClick(e) {
        const coords = Utils.getCanvasCoordinates(this.elements.canvas, e);
        const pos = this.board.getGridPosition(coords.x, coords.y);
        
        if (pos) {
            this.game.handleMove(pos.row, pos.col);
        }
    }
    
    handleCanvasTouch(e) {
        e.preventDefault();
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const rect = this.elements.canvas.getBoundingClientRect();
            const scaleX = this.elements.canvas.width / rect.width;
            const scaleY = this.elements.canvas.height / rect.height;
            
            const coords = {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            };
            
            const pos = this.board.getGridPosition(coords.x, coords.y);
            if (pos) {
                this.game.handleMove(pos.row, pos.col);
            }
        }
    }
    
    setMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`#${mode === 'single' ? 'singlePlayerBtn' : mode === 'local' ? 'localMultiBtn' : 'lanMultiBtn'}`).classList.add('active');
        
        this.elements.aiSettings.classList.toggle('hidden', mode !== 'single');
        this.elements.lanSettings.classList.toggle('hidden', mode !== 'lan');
        
        if (mode !== 'lan') {
            this.game.closeLanConnection();
        }
        
        this.game.setMode(mode);
        this.updateTurnIndicator();
        this.clearMoveHistory();
        this.gameOverModalShown = false;
    }
    
    setDifficulty(difficulty) {
        document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        this.game.setDifficulty(difficulty);
    }
    
    handlePieceStyleClick(e) {
        const styleEl = e.currentTarget;
        const style = styleEl.dataset.style;
        
        document.querySelectorAll('.piece-style').forEach(el => {
            el.classList.remove('active');
        });
        styleEl.classList.add('active');
        
        this.game.setPieceStyle(1, style);
        this.game.setPieceStyle(2, style);
    }
    
    handleBoardStyleClick(e) {
        const styleEl = e.currentTarget;
        const style = styleEl.dataset.board;
        
        document.querySelectorAll('.board-style').forEach(el => {
            el.classList.remove('active');
        });
        styleEl.classList.add('active');
        
        this.board.setBoardStyle(style);
    }
    
    togglePureMode(enabled) {
        const container = document.querySelector('.container');
        if (enabled) {
            container.classList.add('pure-mode');
            this.elements.pureModeExit.classList.remove('hidden');
            setTimeout(() => this.resizeBoard(), 50);
        } else {
            container.classList.remove('pure-mode');
            this.elements.pureModeExit.classList.add('hidden');
            setTimeout(() => this.resizeBoard(), 50);
        }
    }
    
    exitPureMode() {
        this.elements.pureMode.checked = false;
        this.togglePureMode(false);
    }
    
    resizeBoard() {
        if (this.board.isFixedSize()) {
            return;
        }
        
        const container = document.querySelector('.board-wrapper');
        if (!container) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const padding = this.board.padding * 2;
        const availableSize = Math.min(containerWidth, containerHeight) - padding;
        
        const cellSize = Math.max(20, Math.floor(availableSize / 14));
        
        if (cellSize > 0 && Math.abs(this.board.cellSize - cellSize) > 2) {
            this.board.resize(cellSize);
        }
    }
    
    handlePause() {
        this.game.pause();
        this.elements.pauseBtn.textContent = this.game.isPaused ? '继续' : '暂停';
        
        if (this.game.isPaused) {
            this.elements.turnIndicator.textContent = '游戏已暂停';
        } else {
            this.updateTurnIndicator();
        }
    }
    
    startGame() {
        this.game.startTimer();
        this.updateTurnIndicator();
        
        this.game.onMove((row, col, player) => {
            this.addMoveToHistory(row, col, player);
            this.updateTurnIndicator();
        });
        
        this.game.onGameOver((winner) => {
            this.showGameOverModal(winner);
            this.updateStats();
        });
        
        this.game.onTimeUpdate((blackTime, whiteTime, currentPlayer) => {
            this.elements.blackTime.textContent = Utils.formatTime(blackTime);
            this.elements.whiteTime.textContent = Utils.formatTime(whiteTime);
            
            this.elements.blackPlayer.classList.toggle('active', currentPlayer === 1);
            this.elements.whitePlayer.classList.toggle('active', currentPlayer === 2);
            
            const playerName = currentPlayer === 1 ? '黑方' : '白方';
            
            if (this.game.getMode() === 'lan') {
                const myColor = this.game.getMyColor();
                const isMyTurn = currentPlayer === myColor;
                this.elements.turnIndicator.textContent = isMyTurn ? '你的回合' : `${playerName}回合（等待对手）`;
            } else {
                this.elements.turnIndicator.textContent = `${playerName}回合`;
            }
        });
        
        this.game.onSwap((hostIsBlack) => {
            this.updateRoleDisplay();
        });
        
        this.game.onPlayerJoined(() => {
            this.showLanGamePanel();
            this.showGameNotification('对手已加入！游戏开始', 'success');
        });
        
        this.game.onUndoRequest(() => {
            this.showConfirmDialog('悔棋请求', '对手请求悔棋，是否同意？',
                () => {
                    this.game.sendUndoResponse(true);
                    this.showGameNotification('已同意悔棋', 'success');
                },
                () => {
                    this.game.sendUndoResponse(false);
                    this.showGameNotification('已拒绝悔棋', 'info');
                }
            );
        });
        
        this.game.onRestartRequest(() => {
            this.showConfirmDialog('重新开始', '对手请求重新开始游戏，是否同意？',
                () => {
                    this.game.sendRestartResponse(true);
                    this.showGameNotification('已同意重新开始', 'success');
                },
                () => {
                    this.game.sendRestartResponse(false);
                    this.showGameNotification('已拒绝重新开始', 'info');
                }
            );
        });
        
        this.game.onSwapRequest(() => {
            this.showConfirmDialog('交换身份', '对手请求交换黑白棋身份，是否同意？',
                () => {
                    this.game.sendSwapResponse(true);
                },
                () => {
                    this.game.sendSwapResponse(false);
                    this.showGameNotification('已拒绝交换身份', 'info');
                }
            );
        });
        
        this.game.onUndoResult((accepted) => {
            if (accepted) {
                this.showGameNotification('对方同意悔棋', 'success');
            } else {
                this.showGameNotification('对方拒绝悔棋', 'warning');
            }
        });
        
        this.game.onRestartResult((accepted) => {
            if (accepted) {
                this.showGameNotification('对方同意重新开始', 'success');
            } else {
                this.showGameNotification('对方拒绝重新开始', 'warning');
            }
        });
    }
    
    updateTurnIndicator() {
        if (this.game.isGameOverState()) return;
        
        const player = this.game.getCurrentPlayer();
        const playerName = player === 1 ? '黑方' : '白方';
        
        this.elements.blackPlayer.classList.toggle('active', player === 1);
        this.elements.whitePlayer.classList.toggle('active', player === 2);
        
        if (this.game.getMode() === 'lan') {
            const myColor = this.game.getMyColor();
            const isMyTurn = player === myColor;
            this.elements.turnIndicator.textContent = isMyTurn ? '你的回合' : `${playerName}回合（等待对手）`;
        } else {
            this.elements.turnIndicator.textContent = `${playerName}回合`;
        }
    }
    
    updateRoleDisplay() {
        if (this.game.getMode() !== 'lan') return;
        
        const isHost = this.game.isLanHost();
        const hostIsBlack = this.game.getHostIsBlack();
        
        const myRole = isHost ? 
            (hostIsBlack ? '黑方' : '白方') : 
            (hostIsBlack ? '白方' : '黑方');
        const opponentRole = isHost ? 
            (hostIsBlack ? '白方' : '黑方') : 
            (hostIsBlack ? '黑方' : '白方');
        
        this.elements.myRole.textContent = myRole;
        this.elements.opponentRole.textContent = opponentRole;
    }
    
    addMoveToHistory(row, col, player) {
        const noMovesEl = this.elements.moveHistory.querySelector('.no-moves');
        if (noMovesEl) noMovesEl.remove();
        
        const moveNum = this.game.getMoveHistory().length;
        const playerName = player === 1 ? '黑' : '白';
        const colLabel = String.fromCharCode(65 + col);
        const rowLabel = row + 1;
        
        const moveEl = document.createElement('p');
        moveEl.textContent = `${moveNum}. ${playerName} ${colLabel}${rowLabel}`;
        moveEl.style.color = player === 1 ? '#333' : '#666';
        
        this.elements.moveHistory.appendChild(moveEl);
        this.elements.moveHistory.scrollTop = this.elements.moveHistory.scrollHeight;
    }
    
    clearMoveHistory() {
        this.elements.moveHistory.innerHTML = '<p class="no-moves">暂无落子记录</p>';
    }
    
    showGameOverModal(winner) {
        if (this.gameOverModalShown) {
            return;
        }
        this.gameOverModalShown = true;
        
        let title, message;
        
        if (winner === 0) {
            title = '平局！';
            message = '棋盘已满，双方平局。';
        } else {
            const winnerName = winner === 1 ? '黑方' : '白方';
            title = `${winnerName}获胜！`;
            
            const mode = this.game.getMode();
            if (mode === 'single') {
                if (winner === 1) {
                    message = '恭喜你战胜了AI！';
                } else {
                    message = 'AI获胜，再接再厉！';
                }
            } else if (mode === 'lan') {
                const myColor = this.game.getMyColor();
                if (winner === myColor) {
                    message = '恭喜你获得胜利！';
                } else {
                    message = '很遗憾，对手获胜了。';
                }
            } else {
                message = `${winnerName}五子连珠，赢得胜利！`;
            }
        }
        
        this.elements.gameOverTitle.textContent = title;
        this.elements.gameOverMessage.textContent = message;
        this.elements.gameOverModal.classList.remove('hidden');
    }
    
    hideModal() {
        this.elements.gameOverModal.classList.add('hidden');
    }
    
    updateStats() {
        const stats = this.game.getStats();
        this.elements.totalGames.textContent = stats.totalGames;
        this.elements.blackWins.textContent = stats.blackWins;
        this.elements.whiteWins.textContent = stats.whiteWins;
    }
    
    async connectToServer() {
        let serverUrl = this.elements.serverUrl.value.trim();
        
        if (!serverUrl) {
            serverUrl = window.location.origin;
            this.elements.serverUrl.value = serverUrl;
        }
        
        try {
            this.updateServerStatus('connecting');
            await this.game.connectToServer(serverUrl);
            this.updateServerStatus('connected');
            
            this.elements.connectPanel.classList.add('hidden');
            this.elements.roomPanel.classList.remove('hidden');
            
            Utils.showNotification('已连接到服务器', 'success');
        } catch (error) {
            this.updateServerStatus('disconnected');
            Utils.showNotification('连接失败: ' + error.message, 'error');
        }
    }
    
    updateServerStatus(status) {
        const statusEl = this.elements.serverStatus;
        statusEl.classList.remove('status-connected', 'status-disconnected');
        
        switch (status) {
            case 'connected':
                statusEl.textContent = '已连接';
                statusEl.classList.add('status-connected');
                break;
            case 'connecting':
                statusEl.textContent = '连接中...';
                break;
            default:
                statusEl.textContent = '未连接';
                statusEl.classList.add('status-disconnected');
        }
    }
    
    async createRoom() {
        try {
            const roomCode = await this.game.createLanRoom();
            this.elements.roomCode.textContent = roomCode;
            this.elements.createRoomPanel.classList.remove('hidden');
            this.elements.joinRoomPanel.classList.add('hidden');
            this.elements.roomStatus.textContent = '等待对手加入...';
            
            Utils.showNotification('房间创建成功', 'success');
        } catch (error) {
            Utils.showNotification('创建房间失败: ' + error.message, 'error');
        }
    }
    
    showJoinPanel() {
        this.elements.joinRoomPanel.classList.remove('hidden');
        this.elements.createRoomPanel.classList.add('hidden');
    }
    
    async joinRoom() {
        const roomCode = this.elements.roomCodeInput.value.trim();
        
        if (!roomCode) {
            Utils.showNotification('请输入房间码', 'error');
            return;
        }
        
        if (!/^\d{4}$/.test(roomCode)) {
            Utils.showNotification('房间码必须是4位数字', 'error');
            return;
        }
        
        try {
            await this.game.joinLanRoom(roomCode);
            this.showLanGamePanel();
            Utils.showNotification('已加入房间', 'success');
        } catch (error) {
            Utils.showNotification('加入失败: ' + error.message, 'error');
        }
    }
    
    showLanGamePanel() {
        this.elements.createRoomPanel.classList.add('hidden');
        this.elements.joinRoomPanel.classList.add('hidden');
        this.elements.lanGamePanel.classList.remove('hidden');
        this.updateRoleDisplay();
    }
    
    requestSwap() {
        if (this.game.requestSwap()) {
            this.showGameNotification('已发送交换请求', 'info');
        }
    }
    
    showGameNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.game-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showConfirmDialog(title, message, onAccept, onReject) {
        const existingDialog = document.querySelector('.confirm-dialog-overlay');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'confirm-dialog-overlay';
        
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-dialog-header">${title}</div>
                <div class="confirm-dialog-body">${message}</div>
                <div class="confirm-dialog-buttons">
                    <button class="confirm-btn accept">同意</button>
                    <button class="confirm-btn reject">拒绝</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const dialog = overlay.querySelector('.confirm-dialog');
        setTimeout(() => dialog.classList.add('show'), 10);
        
        const acceptBtn = overlay.querySelector('.accept');
        const rejectBtn = overlay.querySelector('.reject');
        
        const closeDialog = (result) => {
            dialog.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
            if (result && onAccept) onAccept();
            if (!result && onReject) onReject();
        };
        
        acceptBtn.addEventListener('click', () => closeDialog(true));
        rejectBtn.addEventListener('click', () => closeDialog(false));
    }
    
    handleResize() {
        this.resizeBoard();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const board = new Board('gameBoard');
    const game = new Game(board);
    const ui = new UI(game);
    
    setTimeout(() => ui.resizeBoard(), 100);
});
