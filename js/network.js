class NetworkManager {
    constructor() {
        this.socket = null;
        this.roomCode = null;
        this.isHost = false;
        this.onMessageCallback = null;
        this.onConnectionChange = null;
        this.isConnected = false;
        this.hostIsBlack = true;
    }

    connect(serverUrl) {
        return new Promise((resolve, reject) => {
            if (typeof io === 'undefined') {
                reject(new Error('Socket.io 未加载'));
                return;
            }

            this.socket = io(serverUrl);

            this.socket.on('connect', () => {
                console.log('已连接到服务器');
                this.isConnected = true;
                if (this.onConnectionChange) {
                    this.onConnectionChange('connected');
                }
                resolve();
            });

            this.socket.on('disconnect', () => {
                console.log('已断开服务器');
                this.isConnected = false;
                this.roomCode = null;
                this.isHost = false;
                if (this.onConnectionChange) {
                    this.onConnectionChange('disconnected');
                }
            });

            this.socket.on('playerJoined', (data) => {
                console.log('玩家加入:', data);
                this.hostIsBlack = data.hostIsBlack !== undefined ? data.hostIsBlack : true;
                if (this.onConnectionChange) {
                    this.onConnectionChange('player_joined');
                }
            });

            this.socket.on('playerLeft', (data) => {
                console.log('玩家离开:', data);
                Utils.showNotification('对手已断开连接', 'error');
                if (this.onConnectionChange) {
                    this.onConnectionChange('player_left');
                }
            });

            this.socket.on('move', (data) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'move', ...data });
                }
            });

            this.socket.on('undoRequest', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'undo_request' });
                }
            });

            this.socket.on('undoAccepted', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'undo_accepted' });
                }
            });

            this.socket.on('undoApplied', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'undo_applied' });
                }
            });

            this.socket.on('undoRejected', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'undo_rejected' });
                }
            });

            this.socket.on('undoBoth', (data) => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'undo_both', ...data });
                }
            });

            this.socket.on('restartRequest', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'restart_request' });
                }
            });

            this.socket.on('restartAccepted', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'restart_accepted' });
                }
            });

            this.socket.on('restartApplied', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'restart_applied' });
                }
            });

            this.socket.on('restartRejected', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'restart_rejected' });
                }
            });

            this.socket.on('swapRequest', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'swap_request' });
                }
            });

            this.socket.on('swapAccepted', (data) => {
                this.hostIsBlack = data.hostIsBlack;
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'swap_accepted', hostIsBlack: data.hostIsBlack });
                }
            });

            this.socket.on('swapRejected', () => {
                if (this.onMessageCallback) {
                    this.onMessageCallback({ type: 'swap_rejected' });
                }
            });

            this.socket.on('connect_error', (error) => {
                console.error('连接错误:', error);
                reject(error);
            });
        });
    }

    async createRoom() {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.isConnected) {
                reject(new Error('未连接到服务器'));
                return;
            }

            this.socket.emit('createRoom', (response) => {
                if (response.success) {
                    this.roomCode = response.roomCode;
                    this.isHost = true;
                    this.hostIsBlack = true;
                    resolve(response.roomCode);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }

    async joinRoom(roomCode) {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.isConnected) {
                reject(new Error('未连接到服务器'));
                return;
            }

            if (!/^\d{4}$/.test(roomCode.trim())) {
                reject(new Error('房间码必须是4位数字'));
                return;
            }

            this.socket.emit('joinRoom', roomCode, (response) => {
                if (response.success) {
                    this.roomCode = response.roomCode;
                    this.isHost = false;
                    resolve(response.roomCode);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }

    send(data) {
        if (!this.socket || !this.isConnected) return false;

        switch (data.type) {
            case 'move':
                this.socket.emit('move', { row: data.row, col: data.col });
                break;
            case 'undo_request':
                this.socket.emit('undoRequest');
                break;
            case 'undo_response':
                this.socket.emit('undoResponse', data.accepted);
                break;
            case 'undo_both':
                this.socket.emit('undoBoth', { moves: data.moves });
                break;
            case 'restart_request':
                this.socket.emit('restartRequest');
                break;
            case 'restart_response':
                this.socket.emit('restartResponse', data.accepted);
                break;
            case 'swap_request':
                this.socket.emit('swapRequest');
                break;
            case 'swap_response':
                this.socket.emit('swapResponse', data.accepted);
                break;
        }
        return true;
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    onConnectionStateChange(callback) {
        this.onConnectionChange = callback;
    }

    close() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.roomCode = null;
        this.isHost = false;
        this.isConnected = false;
    }

    getRoomCode() {
        return this.roomCode;
    }

    isHostPlayer() {
        return this.isHost;
    }

    connected() {
        return this.isConnected;
    }

    getHostIsBlack() {
        return this.hostIsBlack;
    }

    setHostIsBlack(value) {
        this.hostIsBlack = value;
    }
}
