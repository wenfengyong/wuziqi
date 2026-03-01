const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname)));

const rooms = new Map();

function generateRoomCode() {
    let code;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms.has(code));
    return code;
}

function isValidRoomCode(code) {
    return /^\d{4}$/.test(code);
}

io.on('connection', (socket) => {
    console.log('用户连接:', socket.id);

    socket.on('createRoom', (callback) => {
        const roomCode = generateRoomCode();

        rooms.set(roomCode, {
            host: socket.id,
            guest: null,
            gameState: null,
            hostIsBlack: true
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.isHost = true;

        console.log(`房间创建: ${roomCode} by ${socket.id}`);
        callback({ success: true, roomCode });
    });

    socket.on('joinRoom', (roomCode, callback) => {
        const code = roomCode.toUpperCase().trim();
        
        if (!isValidRoomCode(code)) {
            callback({ success: false, error: '房间码格式错误，请输入4位数字' });
            return;
        }

        const room = rooms.get(code);

        if (!room) {
            callback({ success: false, error: '房间不存在' });
            return;
        }

        if (room.guest) {
            callback({ success: false, error: '房间已满' });
            return;
        }

        room.guest = socket.id;
        socket.join(code);
        socket.roomCode = code;
        socket.isHost = false;

        console.log(`用户加入房间: ${code} - ${socket.id}`);
        
        io.to(code).emit('playerJoined', {
            hostId: room.host,
            guestId: room.guest,
            hostIsBlack: room.hostIsBlack
        });

        callback({ success: true, roomCode: code });
    });

    socket.on('move', (data) => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('move', data);
        }
    });

    socket.on('undoRequest', () => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('undoRequest');
        }
    });

    socket.on('undoResponse', (accepted) => {
        if (socket.roomCode) {
            if (accepted) {
                io.to(socket.roomCode).emit('undoApplied');
                socket.to(socket.roomCode).emit('undoAccepted');
            } else {
                socket.to(socket.roomCode).emit('undoRejected');
            }
        }
    });

    socket.on('undoBoth', (data) => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('undoBoth', data);
        }
    });

    socket.on('restartRequest', () => {
        if (socket.roomCode) {
            socket.to(socket.roomCode).emit('restartRequest');
        }
    });

    socket.on('restartResponse', (accepted) => {
        if (socket.roomCode) {
            if (accepted) {
                io.to(socket.roomCode).emit('restartApplied');
                socket.to(socket.roomCode).emit('restartAccepted');
            } else {
                socket.to(socket.roomCode).emit('restartRejected');
            }
        }
    });

    socket.on('swapRequest', () => {
        if (socket.roomCode) {
            const room = rooms.get(socket.roomCode);
            if (room) {
                socket.to(socket.roomCode).emit('swapRequest');
            }
        }
    });

    socket.on('swapResponse', (accepted) => {
        if (socket.roomCode) {
            const room = rooms.get(socket.roomCode);
            if (room && accepted) {
                room.hostIsBlack = !room.hostIsBlack;
                io.to(socket.roomCode).emit('swapAccepted', {
                    hostIsBlack: room.hostIsBlack
                });
            } else if (!accepted) {
                socket.to(socket.roomCode).emit('swapRejected');
            }
        }
    });

    socket.on('chat', (message) => {
        if (socket.roomCode) {
            io.to(socket.roomCode).emit('chat', {
                sender: socket.isHost ? 'host' : 'guest',
                message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('用户断开:', socket.id);

        if (socket.roomCode) {
            const room = rooms.get(socket.roomCode);
            if (room) {
                io.to(socket.roomCode).emit('playerLeft', {
                    playerId: socket.id,
                    isHost: socket.isHost
                });

                if (socket.isHost) {
                    rooms.delete(socket.roomCode);
                    console.log(`房间删除: ${socket.roomCode}`);
                } else {
                    room.guest = null;
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
