const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

app.use(express.static('../Client'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    })

    socket.on('createRoom', (roomCode) => {
        console.log(socket.id, "has requested to open a room with code", roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        console.log(socket.id, "has requested to join room", roomCode);
    });
});

server.listen(3000, () => {
    console.log('Server is listening on http://localhost:3000');
});