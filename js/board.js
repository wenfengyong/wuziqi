class Board {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.gridSize = options.gridSize || 15;
        this.cellSize = options.cellSize || 36;
        this.padding = options.padding || 20;
        this.pieceRadius = options.pieceRadius || 15;
        
        this.board = [];
        this.lastMove = null;
        this.winLine = null;
        
        this.pieceStyle = {
            black: 'classic',
            white: 'classic'
        };
        
        this.init();
    }
    
    init() {
        this.calculateSize();
        this.clearBoard();
        this.draw();
        this.setupEventListeners();
    }
    
    calculateSize() {
        const size = (this.gridSize - 1) * this.cellSize + this.padding * 2;
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    clearBoard() {
        this.board = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = 0;
            }
        }
        this.lastMove = null;
        this.winLine = null;
    }
    
    draw() {
        this.drawBackground();
        this.drawGrid();
        this.drawStarPoints();
        this.drawPieces();
        this.drawLastMoveHint();
        this.drawWinLine();
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#DEB887');
        gradient.addColorStop(1, '#D2B48C');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.gridSize; i++) {
            const pos = this.padding + i * this.cellSize;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, pos);
            this.ctx.lineTo(this.canvas.width - this.padding, pos);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.padding);
            this.ctx.lineTo(pos, this.canvas.height - this.padding);
            this.ctx.stroke();
        }
    }
    
    drawStarPoints() {
        const starPoints = this.getStarPoints();
        this.ctx.fillStyle = '#8B4513';
        
        starPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.padding + point.x * this.cellSize,
                this.padding + point.y * this.cellSize,
                4, 0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    getStarPoints() {
        const points = [];
        const center = Math.floor(this.gridSize / 2);
        
        points.push({ x: center, y: center });
        
        if (this.gridSize === 15) {
            const positions = [3, 11];
            positions.forEach(x => {
                positions.forEach(y => {
                    if (!(x === center && y === center)) {
                        points.push({ x, y });
                    }
                });
            });
        }
        
        return points;
    }
    
    drawPieces() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawPiece(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    drawPiece(row, col, player) {
        const x = this.padding + col * this.cellSize;
        const y = this.padding + row * this.cellSize;
        const radius = this.pieceRadius;
        
        this.ctx.save();
        
        if (player === 1) {
            this.drawBlackPiece(x, y, radius);
        } else {
            this.drawWhitePiece(x, y, radius);
        }
        
        this.ctx.restore();
    }
    
    drawBlackPiece(x, y, radius) {
        const style = this.pieceStyle.black;
        
        switch (style) {
            case 'modern':
                this.drawModernBlack(x, y, radius);
                break;
            case 'cute':
                this.drawCuteBlack(x, y, radius);
                break;
            case 'neon':
                this.drawNeonBlack(x, y, radius);
                break;
            default:
                this.drawClassicBlack(x, y, radius);
        }
    }
    
    drawWhitePiece(x, y, radius) {
        const style = this.pieceStyle.white;
        
        switch (style) {
            case 'modern':
                this.drawModernWhite(x, y, radius);
                break;
            case 'cute':
                this.drawCuteWhite(x, y, radius);
                break;
            case 'neon':
                this.drawNeonWhite(x, y, radius);
                break;
            default:
                this.drawClassicWhite(x, y, radius);
        }
    }
    
    drawClassicBlack(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#6a6a6a');
        gradient.addColorStop(0.3, '#4a4a4a');
        gradient.addColorStop(1, '#1a1a1a');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    drawClassicWhite(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#f5f5f5');
        gradient.addColorStop(1, '#e0e0e0');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#cccccc';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawModernBlack(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(0.5, '#2c3e50');
        gradient.addColorStop(1, '#1a1a1a');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
    }
    
    drawModernWhite(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        const gradient = this.ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#ecf0f1');
        gradient.addColorStop(1, '#bdc3c7');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
    }
    
    drawCuteBlack(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const gradient = this.ctx.createRadialGradient(x - radius/4, y - radius/4, 0, x, y, radius);
        gradient.addColorStop(0, '#5a5a5a');
        gradient.addColorStop(0.7, '#2a2a2a');
        gradient.addColorStop(1, '#1a1a1a');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + radius * 0.15, y - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.15, y + radius * 0.25, radius * 0.12, 0, Math.PI * 0.8);
        this.ctx.strokeStyle = 'rgba(255, 200, 200, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawCuteWhite(x, y, radius) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        const gradient = this.ctx.createRadialGradient(x - radius/4, y - radius/4, 0, x, y, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#f8f8f8');
        gradient.addColorStop(1, '#e8e8e8');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.22, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x + radius * 0.15, y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.1, y + radius * 0.25, radius * 0.15, 0, Math.PI * 0.8);
        this.ctx.strokeStyle = 'rgba(255, 180, 180, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawNeonBlack(x, y, radius) {
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 15;
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawNeonWhite(x, y, radius) {
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.shadowBlur = 15;
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawLastMoveHint() {
        if (!this.lastMove) return;
        
        const x = this.padding + this.lastMove.col * this.cellSize;
        const y = this.padding + this.lastMove.row * this.cellSize;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF4444';
        this.ctx.fill();
    }
    
    drawWinLine() {
        if (!this.winLine) return;
        
        const { start, end } = this.winLine;
        
        const startX = this.padding + start.col * this.cellSize;
        const startY = this.padding + start.row * this.cellSize;
        const endX = this.padding + end.col * this.cellSize;
        const endY = this.padding + end.row * this.cellSize;
        
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }
    
    setPieceStyle(player, style) {
        this.pieceStyle[player === 1 ? 'black' : 'white'] = style;
        this.draw();
    }
    
    getGridPosition(canvasX, canvasY) {
        const col = Math.round((canvasX - this.padding) / this.cellSize);
        const row = Math.round((canvasY - this.padding) / this.cellSize);
        
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            return { row, col };
        }
        return null;
    }
    
    isValidMove(row, col) {
        return row >= 0 && row < this.gridSize && 
               col >= 0 && col < this.gridSize && 
               this.board[row][col] === 0;
    }
    
    placePiece(row, col, player) {
        if (!this.isValidMove(row, col)) return false;
        
        this.board[row][col] = player;
        this.lastMove = { row, col, player };
        this.draw();
        return true;
    }
    
    removePiece(row, col) {
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            this.board[row][col] = 0;
            this.draw();
        }
    }
    
    getBoard() {
        return Utils.deepClone(this.board);
    }
    
    setBoard(board) {
        this.board = Utils.deepClone(board);
        this.draw();
    }
    
    setWinLine(start, end) {
        this.winLine = { start, end };
        this.draw();
    }
    
    setupEventListeners() {
        let isDragging = false;
        
        const handleMove = (e) => {
            if (isDragging) return;
            
            const coords = Utils.getCanvasCoordinates(this.canvas, e);
            const pos = this.getGridPosition(coords.x, coords.y);
            
            if (pos && this.isValidMove(pos.row, pos.col)) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        };
        
        this.canvas.addEventListener('mousemove', handleMove);
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e);
        }, { passive: false });
        
        this.canvas.addEventListener('mousedown', () => isDragging = false);
        this.canvas.addEventListener('touchstart', () => isDragging = false);
    }
    
    resize(cellSize) {
        this.cellSize = cellSize;
        this.pieceRadius = Math.floor(cellSize * 0.42);
        this.calculateSize();
        this.draw();
    }
    
    getEmptyPositions() {
        const positions = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] === 0) {
                    positions.push({ row: i, col: j });
                }
            }
        }
        return positions;
    }
    
    hasNearbyPieces(row, col, distance = 2) {
        for (let i = Math.max(0, row - distance); i <= Math.min(this.gridSize - 1, row + distance); i++) {
            for (let j = Math.max(0, col - distance); j <= Math.min(this.gridSize - 1, col + distance); j++) {
                if (this.board[i][j] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
