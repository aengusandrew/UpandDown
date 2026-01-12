const socket = io('http://localhost:3000');

const gameDiv = document.getElementById('game');
const nameInput = document.getElementById('nameInput');
const roomInput = document.getElementById('roomInput')

document.getElementById('createBtn').onclick = () => {
    socket.emit('createRoom', roomInput.value, nameInput.value)
};

document.getElementById('joinBtn').onclick = () => {
    socket.emit('joinRoom', roomInput.value, nameInput.value);
};

socket.on('game_state', state => {
    renderGame(state);
});

socket.on('game_error', err => {
    alert(err);
})

function startGame() {
    socket.emit('start_game');
}

function renderGame(state) {
    gameDiv.innerHTML = `
        <h2>Room: ${state.roomCode}</h2>
        <p>Phase: ${state.phase}</p>
        ${state.canStartGame ? `
            <button onclick="startGame()">Start Game</button>
            ` : ''}
        <p>Trump Suit: ${state.trumpSuit ?? 'N/A'}</p>
        <p>Current Turn: ${state.currentTurn ?? 'N/A'}</p>

        <h3>Players</h3>
        <ul>
            ${state.players.map(p => `
                <li>
                    ${p.name} —
                    Hand: ${p.handSize},
                    Tricks: ${p.tricksWon},
                    Bid: ${p.bid},
                    Score: ${p.score}
                </li>
            `).join('')}
        </ul>

        <h3>Your Hand</h3>
        <div>
            ${state.yourHand.map(card => `
                <button onclick="playCard('${card.suit}', '${card.value}')">
                    ${card.value} of ${card.suit}
                </button>
            `).join('')}
        </div>

        <h3>Trick</h3>
        <ul>
            ${state.trickCards.map(t => `
                <li>
                    ${t.playerId}: ${t.card.value} of ${t.card.suit}
                </li>
            `).join('')}
        </ul>
    `;
}

function playCard(suit, value) {
    socket.emit('play_card', { suit, value });
}