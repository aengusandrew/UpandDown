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
    console.log(state);
    renderGame(state);
});

socket.on('game_error', err => {
    alert(err);
})

function startGame() {
    socket.emit('start_game');
}

function toggleScoreboard() {
    let x = document.getElementById('scoreboard');
    if(x.style.display === 'none') {
        x.style.display = 'flex';
    } else {
        x.style.display = 'none';
    }
}


function renderGame(state) {

    const gameDiv = document.getElementById('game');
    const playTable = document.getElementById('playTable');

    const leadSuit = 
        state.trickEnded === false
        ? state.trickCards[0].card.suit :
        null;
    
    const hasLeadSuit =
        leadSuit &&
        state.yourHand.some(c => c.suit === leadSuit);

    const trickToRender =
        state.trickCards;

    playTable.innerHTML = '';

    const players = state.players;
    const total = players.length;

    const radius = 220;
    const centerX = 300
    const centerY = 300;

    const youIndex = players.findIndex(p=> p.id === state.youID);

    const orderedPlayers = [
        ...players.slice(youIndex),
        ...players.slice(0, youIndex)
    ];

    orderedPlayers.forEach((player,i) => {
        const phi = (i/total) * 2 * Math.PI + Math.PI/2;

        const x = centerX + radius * Math.cos(phi);
        const y = centerY + radius * Math.sin(phi);

        const div = document.createElement('div');
        div.className = 'player';
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.transform = 'translate(-50%, -50%)';

        div.innerHTML = `<strong>${player.name}</strong>`;

        playTable.appendChild(div);
    });

    gameDiv.innerHTML = `
        ${state.canStartGame ? `
            <button onclick="startGame()">Start Game</button>
            ` : ''}
        
        <button onclick="toggleScoreboard()">Scoreboard</button>
        <div id="scoreboard" style="display: none">
            <table>
                <tr>
                    <th>Round</th>
                    ${state.players.map(p => `<th colspan="2">${p.name}</th>`).join('')}
                </tr>
                ${state.scoreboard.map(r => `
                        <tr>
                            <td>${r.roundNumber}</td>
                            ${state.players.map(p => {
                                const playerResult = r.results.find(q => q.playerID === p.id);
                                return `
                                    <td>
                                        ${playerResult ? `(${playerResult.tricks}/${playerResult.bid})` : '-'}
                                    </td>
                                    <td>
                                        ${playerResult ? `${playerResult.score}` : '-'}
                                    </td>
                                    `;
                            }).join('')}
                        </tr>     
                `).join('')}
            </table>
        </div>

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
        if (e.target.dataset.suit && e.target.dataset.value) {
            socket.emit('play_card', {
                suit: e.target.dataset.suit,
                value: e.target.dataset.value
            });
            return;
        }

        if (e.target.dataset.bid) {
            socket.emit('place_bid', Number(e.target.dataset.bid));
        }
    }
}