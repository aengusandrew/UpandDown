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

    socket.on('createRoom', (roomCode, playerName) => {
        if(rooms.has(roomCode)) {
            socket.emit('room_error', 'room_exists');
            return;
        }

        const game = new GameManager(roomCode);
        game.hostId = socket.id;
        rooms.set(roomCode, game);

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
            game.getPublicGameState(socket.id),
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

    socket.on('start_game', () => {
        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if (!game) return;

        if (socket.id !== game.hostId) {
            socket.emit('game_error', 'not_host');
            return;
        }

        if (game.phase !== 'waiting') {
            socket.emit('game_error', 'game_already_started');
            return;
        }

        game.startGame();

        for (const player of game.players) {
            io.to(player.id).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }

        console.log(`Game started in room ${roomCode}`);
    })

    socket.on('place_bid', bidValue => {
        console.log("SERVER received bid: ", bidValue);

        const roomCode = socket.roomCode;
        console.log(roomCode);
        if (!roomCode) return;

        const game = rooms.get(roomCode);
        if (!game) return;

        const result = game.handleBid(socket.id, bidValue);
        console.log(result);
        if(result === 'error') {
            socket.emit('game_error', 'invalid_bid');
            return;
        } // TODO: Update error logic

        for (const player of game.players) {
            io.to(player.id).emit(
               'game_state',
               game.getPublicGameState(player.id)
            );
        }
    })

    socket.on('play_card', card => {

        console.log("SOCKET received play_card: ", socket.id, card);

        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if(!game) return;

        const result = game.handlePlayCard(socket.id, card);
        console.log("hande_play_card result: ", result);

        if(result !== 'ok') {
            socket.emit('game_error', result);
            return;
        }

        for(const player of game.players) {
            io.to(player.id).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }
    })
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});