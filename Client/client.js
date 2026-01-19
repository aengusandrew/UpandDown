const socket = io('http://localhost:3000');

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

    const gameDiv = document.getElementById('game');

    const leadSuit = 
        state.trickCards.length > 0
        ? state.trickCards[0].card.suit :
        null;
    
    const hasLeadSuit =
        leadSuit &&
        state.yourHand.some(c => c.suit === leadSuit);

    const trickComplete =
        state.trickCards.length === state.players.length;

    let lastCompletedTrick = null;

    const trickJustCompleted =
        state.phase === 'playing' &&
        state.trickCards.length === 0 &&
        lastCompletedTrick;

    if(state.trickCards.length === state.players.length) {
        lastCompletedTrick = [...state.trickCards];
    }

    const trickToRender =
        state.trickCards.length > 0
            ? state.trickCards
            : lastCompletedTrick || [];

    console.log(state.trickCards.length);
    console.log(trickToRender);

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
                <li style="${state.currentTurn === p.id ? 'font-weight:bold;' : ''}">
                    ${p.name} —
                    Tricks: ${p.tricksWon},
                    Bid: ${p.bid ?? '-'},
                    Score: ${p.score}
                    ${state.currentTurn === p.id ? ' ← turn' : ''}
                </li>
            `).join('')}
        </ul>

        <h3>Your Hand</h3>
        <div id="hand">
            ${state.yourHand.map(card => {
                const mustFollow = leadSuit && hasLeadSuit;
                const isPlayable =
                    state.canPlayCard &&
                    (!mustFollow || card.suit === leadSuit);
                
                return `
                <button
                    data-suit="${card.suit}"
                    data-value="${card.value}"
                    ${isPlayable ? '' : 'disabled'}
                    style="
                        opacity: ${isPlayable ? '1' : '0.5'}
                        cursor: ${isPlayable ? 'pointer' : 'not-allowed'}
                    "
                >
                    ${card.value} of ${card.suit}
                </button>
                `;
            }).join('')}
        </div>

        <h3>Trick</h3>
        <div id="trick-area">
            ${trickToRender.map(t => `
                <div class="trick-card">
                    ${t.card.value} of ${t.card.suit}
                </div>
            `).join('')}
        </div>
    `;



    if (state.canBid) {
        gameDiv.innerHTML += `
        <h3>Your Bid</h3>
        <div id="bid-buttons">
            ${Array.from({length: state.roundNumber + 1}, (_, i) => `
                <button data-bid="${i}">${i}</button>
            `).join('')}
        </div>
    `;
    }

    gameDiv.onclick = e => {
        if(e.target.dataset.suit && e.target.dataset.value) {
            socket.emit('play_card', {
                suit: e.target.dataset.suit,
                value: e.target.dataset.value
            });
            return;
        }

        if(e.target.dataset.bid) {
            socket.emit('place_bid', Number(e.target.dataset.bid));
            return;
        }
    };

    if(trickComplete) {
        setTimeout(() => {
            document
                .querySelectorAll('.trick-card')
                .forEach(card => card.classList.add('fade-out'));

            lastCompletedTrick = null;
        }, 300);
    }
}