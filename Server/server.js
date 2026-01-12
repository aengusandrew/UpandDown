const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameManager = require('./GameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

app.use(express.static('../Client'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    })

    socket.on('createRoom', (roomCode) => {
        if(rooms.has(roomCode)) {
            socket.emit('room_error', 'room_exists');
            return;
        }

        const game = new GameManager(roomCode);

        game.addPlayer({
            id: socket.id,
            name: playerName,
            hand: [],
            tricksWon: 0,
            bid: -1,
            score: 0
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit(
            'game_state',
            game.getPublicGameState(socket.id)
        );

        console.log(`Room ${roomCode} created by ${socket.id}`);

    });

    socket.on('joinRoom', (roomCode, playerName) => {
        const game = rooms.get(roomCode);
        if(!game) {
            socket.emit('room_error', 'room_not_found');
            return;
        }

        game.addPlayer({
            id: socket.id,
            name: playerName,
            hand: [],
            tricksWon: 0,
            bid: -1,
            score: 0
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit(
            'game_state',
            game.getPublicGameState(socket.id)
        );

        for(const player of game.players) {
            io.to(player.id).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }
        
        console.log(`${socket.id} joined room ${roomCode}`);
    });

});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});