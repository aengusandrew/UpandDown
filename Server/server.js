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
        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if(!game) return;

        const player = game.players.find(p => p.socketID === socket.id);
        if(!player) return;

        player.connected = false;

        console.log(`Player disconnected`);

        for(const player of game.players) {
            console.log(player);
            io.to(player.socketID).emit(
                'game_state',
                game.getPublicGameState(player.id),
            );
        }

        if(game.players.length === 0) {
            rooms.delete(roomCode);
            console.log("Room ", game.roomCode, " pruned")
        }
    })

    socket.on('createRoom', ({roomCode, playerName, clientID}) => {
        if(rooms.has(roomCode)) {
            socket.emit('game_error', 'ROOM_EXISTS');
            return;
        }

        console.log(playerName);

        socket.clientID = clientID;

        const game = new GameManager(roomCode);
        rooms.set(roomCode, game);

        game.addPlayer({
            id: clientID,
            socketID: socket.id,
            connected: true,
            name: playerName,
            hand: [],
            tricksWon: 0,
            bid: -1,
            score: 0
        });

        // console.log(game.players);

        socket.join(roomCode);
        socket.roomCode = roomCode;

        socket.emit(
            'game_state',
            game.getPublicGameState(socket.clientID),
        );

        console.log(`Room ${roomCode} created by ${socket.clientID}`);

    });

    socket.on('joinRoom', ({roomCode, playerName, clientID}) => {
        console.log(playerName, "has requested to join ", roomCode);
        const game = rooms.get(roomCode);
        if(!game) {
            socket.emit('game_error', 'ROOM_DNE');
            return;
        }

        socket.clientID = clientID;

        const existingPlayer = game.players.find(p => p.id === clientID);

        if(existingPlayer) {
            existingPlayer.socketID = socket.id;
            existingPlayer.connected = true;

            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.clientID = clientID;

            for(const player of game.players) {
                io.to(player.socketID).emit(
                    'game_state',
                    game.getPublicGameState(player.id)
                )
            }

            console.log(`Client ${existingPlayer.id} rejoined room ${roomCode}`);
            return
        }

        game.addPlayer({
            id: clientID,
            socketID: socket.id,
            connected: true,
            name: playerName,
            hand: [],
            tricksWon: 0,
            bid: -1,
            score: 0
        });

        socket.join(roomCode);
        socket.roomCode = roomCode;

        for(const player of game.players) {
            io.to(player.socketID).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }
        
        console.log(`${socket.clientID} joined room ${roomCode}`);
    });

    socket.on('set_rounds', (rounds) => {
       const roomCode = socket.roomCode;
       if(!roomCode) return;

       const game = rooms.get(roomCode);
       if(!game) return;

       game.totalRounds = rounds;
       game.roundNumber = game.totalRounds;

       for(const player of game.players) {
           io.to(player.socketID).emit('game_state', game.getPublicGameState(player.id));
       }

    });

    socket.on('start_game', () => {
        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if (!game) return;

        if (socket.clientID !== game.hostID) {
            socket.emit('game_error', 'NOT_HOST');
            return;
        }

        if (game.phase !== 'waiting') {
            socket.emit('game_error', 'GAME_STARTED');
            return;
        }

        const result = game.startNewRound();

        if(result !== "ok") socket.emit('game_error', result);

        for (const player of game.players) {
            io.to(player.socketID).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }

        console.log(`Game started in room ${roomCode}`);
    })

    socket.on('place_bid', bidValue => {
        console.log("SERVER received bid: ", bidValue);

        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const game = rooms.get(roomCode);
        if (!game) return;

        const result = game.handleBid(socket.clientID, bidValue);
        if(result === 'error') {
            socket.emit('game_error', 'INVALID_BID');
            return;
        } // TODO: Update error logic

        for (const player of game.players) {
            io.to(player.socketID).emit(
               'game_state',
               game.getPublicGameState(player.id)
            );
        }
    })

    socket.on('play_card', card => {

        console.log("SOCKET received play_card: ", socket.clientID, card);

        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if(!game) return;

        const result = game.handlePlayCard(socket.clientID, card);
        console.log("hande_play_card result: ", result);

        if(result !== 'ok') {
            socket.emit('game_error', result);
            return;
        }

        for(const player of game.players) {
            io.to(player.socketID).emit(
                'game_state',
                game.getPublicGameState(player.id)
            );
        }
    })

    socket.on('end_game', () => {
        const roomCode = socket.roomCode;

        if(!roomCode) return;
        const game = rooms.get(roomCode);
        if(!game) return;

        console.log("Game ended in room: ", roomCode);
    })

    socket.on('play-again', () => {
        const roomCode = socket.roomCode;
        if(!roomCode) return;

        const game = rooms.get(roomCode);
        if(!game) return;

        console.log(socket.clientID, " has asked to play again");

        game.clearHistory();

        game.hostID = socket.clientID;

        io.to(socket.clientID).emit(
            'game_state',
            game.getPublicGameState(socket.id)
        );
    })
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
})