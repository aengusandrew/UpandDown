const socket = io();

function createRoom() {
    const roomCode = prompt("Enter a room code:");
    socket.emit('createRoom', roomCode);
}

function joinRoom() {
    const roomCode = prompt("Enter a room code to join:");
    socket.emit('joinRoom', roomCode);
}

socket.on('roomUpdate', (room) =>{
    console.log('Room updated:', room);
});

socket.on('gameUpdate', (data) => {
    console.log('Game update:', data)
});

socket.on('errorMessage', (message) => {
    alert(message);
});