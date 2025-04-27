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
        console.log('A user dosconnected:', socket.id);
    })
});

server.listen(3000, () => {
    console.log('Server is litening on http://localhost:3000');
});