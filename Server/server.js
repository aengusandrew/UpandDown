const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameManager = require('./GameManager');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

app.use(express.static(path.join(__dirname, '..', 'Client')));

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
        game.hostID = socket.id;
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

        if(game.phase !== 'waiting') {
            socket.emit('room_error', 'game_started');
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

    socket.on('set_rounds', (rounds) => {
       const roomCode = socket.roomCode;
       if(!roomCode) return;

       const game = rooms.get(roomCode);
       if(!game) return;

       game.totalRounds = rounds;
       game.roundNumber = game.totalRounds;

       console.log("Received change rounds: ", game.totalRounds);

       for(const player of game.players) {
           io.to(player.id).emit('game_state', game.getPublicGameState(player.id));
       }

    });

    socket.on('start_game', () => {
        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if (!game) return;

        if (socket.id !== game.hostID) {
            socket.emit('game_error', 'not_host');
            return;
        }

        if (game.phase !== 'waiting') {
            socket.emit('game_error', 'game_already_started');
            return;
        }

        const result = game.startNewRound();

        console.log("Start Game: ", result);

        if(result !== "ok") socket.emit('game_error', result);

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})