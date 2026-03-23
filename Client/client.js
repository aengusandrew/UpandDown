const socket = io();

const DEV_MODE = true;

const nameInput = document.getElementById('nameInput');
const roomInput = document.getElementById('roomInput')

const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const scoreboard = document.getElementById('scoreboard');
const playTable = document.getElementById('playTable');

document.getElementById('createBtn').onclick = () => {
    socket.emit('createRoom', roomInput.value, nameInput.value)
};

document.getElementById('joinBtn').onclick = () => {
    socket.emit('joinRoom', roomInput.value, nameInput.value);
};

let hasJoined = false;

if(DEV_MODE) {
    state = getMockState('waiting')

    switch(state.phase) {
        case 'waiting':
            titleScreen.style.display = 'none';
            lobbyScreen.style.display = 'block';
            break;
        case 'bidding':
            lobbyScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            break;
        default: break;
    }

    renderGame(state);
} else {
    socket.on('game_state', state => {
        switch(state.phase) {
            case 'waiting':
                titleScreen.style.display = 'none';
                lobbyScreen.style.display = 'block';
                break;
            case 'bidding':
                lobbyScreen.style.display = 'none';
                gameScreen.style.display = 'block';
                break;
            default: break;
        }

        renderGame(state);
    });
}


socket.on('game_error', err => {
    alert(err);
})

function startGame() {
    socket.emit('start_game');
}

function toggleScoreboard() {
    if(scoreboard.style.display === 'none') {
        scoreboard.style.display = 'flex';
    } else {
        scoreboard.style.display = 'none';
    }
}

function toCID(card) {
    const suitMap = {
        HEARTS: 'h',
        DIAMONDS: 'd',
        SPADES: 's',
        CLUBS: 'c'
    };

    return `${card.value}${suitMap[card.suit]}`;
}


function renderGame(state) {

    //TODO: Refactor renderGame into different functions for clarity

    lobbyScreen.innerHTML = '';

    const lobbyHeader = document.createElement('div');
    lobbyHeader.id = 'lobby-header';

    lobbyHeader.innerHTML = `
        <h1>Room Code: ${state.roomCode}</h1>
    `

    lobbyScreen.appendChild(lobbyHeader);

    const lobbyContent = document.createElement('div');
    lobbyContent.id = 'lobby-content';

    lobbyContent.innerHTML = `
        <div id="player-list">
            ${state.players.map(p => {
                return `<div class="player lobby">
                    <strong class="player-name lobby">${p.name}</strong>
                </div>`
            }).join('')
            }
        </div>
    `

    lobbyContent.innerHTML += `
        <div id="sub-player-list">
            <div id="player-count"">Players: ${state.players.length}</div>
            <div id="num-rounds">${Math.min(Math.floor(52 / state.players.length), 10)} Rounds</div>
        </div>
    `

    lobbyContent.innerHTML += `
        <div id="start">
            ${state.canStartGame ? `<button onclick="startGame()" id="start-button">Start Game</button>` : ''}
        </div>
    `
    lobbyScreen.appendChild(lobbyContent);

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

    const you = document.createElement('div');
    you.id = "your-player"

    // Render your hand
    const handSize = state.yourHand.length;
    const spread = 30;

    you.innerHTML = `<div id="hand">
            ${state.yourHand.map((card, i) => {
            const mustFollow = leadSuit && hasLeadSuit;
            const isPlayable =
                state.canPlayCard &&
                (!mustFollow || card.suit === leadSuit);
    
            const offset = i - (handSize - 1) / 2;
            const rotate = offset * 8;
            const translateX = offset * spread;
            const translateY = Math.abs(offset * -5);
    
            return `
                <div 
                class="card-wrapper"
                data-suit="${card.suit}"
                data-value="${card.value}"
                style="
                transform: translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg);
                z-index: ${i};
                "
                >
                    <playing-card 
                    class="hand-card"
                    cid="${toCID(card)}"
                    opacity="${isPlayable ? '1' : '0.25'}"
                    ></playing-card>
                </div>
                `;
    }).join('')}
        </div>`

    if(state.canBid) you.innerHTML +=`
        <div id="bidding">
            ${Array.from({length: state.roundNumber + 1}, (_, i) => `
                    <button class="bid-button" data-bid="${i}">${i}</button>
                `).join('')}
        </div>
            `;
    playTable.appendChild(you);

    const players = state.players;
    const numPlayers = players.length;

    const radius = 40;
    const centerX = 50
    const centerY = 50;

    const youIndex = players.findIndex(p=> p.id === state.youID);

    // Put players in order so you are always at the bottom
    const orderedPlayers = [
        ...players.slice(youIndex + 1),
        ...players.slice(0, youIndex)
    ];

    orderedPlayers.forEach((player,i) => {
        const phi = ((i+1)/numPlayers) * 2 * Math.PI + Math.PI/2;

        const x = centerX + radius * Math.cos(phi);
        const y = centerY + radius * Math.sin(phi);

        const div = document.createElement('div');
        div.className = 'player';
        div.style.position = 'absolute';
        div.style.left = `${x}%`;
        div.style.top = `${y}%`;
        div.style.transform = 'translate(-50%, -50%)';

        div.innerHTML += `
            <img class="player-icon" src="../assets/images/player-icon-male.png" alt="player-icon">
            <strong class="player-name table">${player.name}</strong>`;

        if(player.id === state.currentTurn) {
            div.style.filter = 'drop-shadow(0 0 30px white)';
        }

            playTable.appendChild(div);
        });

    playTable.innerHTML +=
        `<div id="scoreboard-button">
            <button onclick="toggleScoreboard()">Scoreboard</button>
        </div>`;

    playTable.innerHTML +=
    `<div id="trick-area">
        ${trickToRender.map(t => `
                <div>
                    <playing-card cid="${toCID(t.card)}"></playing-card>
                </div>
            `).join('')}
    </div>
        `;

    playTable.innerHTML += `
        <div id="trump-card">
            <playing-card cid="${toCID(state.trumpCard)}"></playing-card>
        </div>
    `

    scoreboard.innerHTML = `
        <div id="scoreboard-table">
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
    `;

    playTable.onclick = e => {
        const cardE1 = e.target.closest('[data-suit][data-value]');

        if (cardE1 && state.phase === "playing") {
            socket.emit('play_card', {
                suit: cardE1.dataset.suit,
                value: cardE1.dataset.value
            });
            return;
        }

        const cardB1 = e.target.closest('[data-bid]');

        if (cardB1 && state.phase === "bidding") {
            socket.emit('place_bid', Number(cardB1.dataset.bid));
        }
    }
}

function getMockState(type) {
    switch(type) {
        case 'playing':
            return {
                roomCode: "TEST",
                phase: "playing",
                trumpCard: { suit: "HEARTS", value: "10"},
                currentTurn: "p2",
                youID: "p1",

                players: [
                    { id: "p1", name: "You", tricksWon: 2, bid: 3, score: 10 },
                    { id: "p2", name: "Alice", tricksWon: 1, bid: 2, score: 5 },
                    { id: "p3", name: "Bob", tricksWon: 0, bid: 1, score: 2 },
                    { id: "p4", name: "Charlie", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p5", name: "John", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p6", name: "Pat", tricksWon: 3, bid: 2, score: 15 }
                ],

                yourHand: [
                    { suit: "HEARTS", value: "A" },
                    { suit: "HEARTS", value: "K" },
                    { suit: "SPADES", value: "10" },
                    { suit: "CLUBS", value: "2" },
                    { suit: "DIAMONDS", value: "J" }
                ],

                trickCards: [
                    { playerId: "p2", card: { suit: "HEARTS", value: "Q" } },
                    { playerId: "p3", card: { suit: "HEARTS", value: "9" } }
                ],

                canPlayCard: true,
                canBid: false,
                canStartGame: false,
                roundNumber: 5,

                scoreboard: [
                    {
                        roundNumber: 1,
                        results: [
                            { playerID: "p1", bid: 2, tricks: 2, score: 7 },
                            { playerID: "p2", bid: 1, tricks: 0, score: 0 },
                            { playerID: "p3", bid: 1, tricks: 2, score: 2 },
                            { playerID: "p4", bid: 3, tricks: 3, score: 8 }
                        ]
                    },
                    {
                        roundNumber: 2,
                        results: [
                            { playerID: "p1", bid: 3, tricks: 2, score: 9 },
                            { playerID: "p2", bid: 2, tricks: 2, score: 7 },
                            { playerID: "p3", bid: 0, tricks: 1, score: 3 },
                            { playerID: "p4", bid: 1, tricks: 1, score: 10 }
                        ]
                    },
                    {
                        roundNumber: 3,
                        results: [
                            { playerID: "p1", bid: 1, tricks: 1, score: 15 },
                            { playerID: "p2", bid: 2, tricks: 3, score: 10 },
                            { playerID: "p3", bid: 2, tricks: 1, score: 4 },
                            { playerID: "p4", bid: 2, tricks: 2, score: 15 }
                        ]
                    },
                    {
                        roundNumber: 4,
                        results: [
                            { playerID: "p1", bid: 2, tricks: 0, score: 15 },
                            { playerID: "p2", bid: 1, tricks: 1, score: 16 },
                            { playerID: "p3", bid: 1, tricks: 1, score: 10 },
                            { playerID: "p4", bid: 3, tricks: 2, score: 17 }
                        ]
                    }
                ]
            };
        case 'bidding':
            return {
                roomCode: "TEST",
                phase: "bidding",
                trumpCard: { suit: "HEARTS", value: "10"},
                currentTurn: "p1",
                youID: "p1",

                players: [
                    { id: "p1", name: "You", tricksWon: 2, bid: 3, score: 10 },
                    { id: "p2", name: "Alice", tricksWon: 1, bid: 2, score: 5 },
                    { id: "p3", name: "Bob", tricksWon: 0, bid: 1, score: 2 },
                    { id: "p4", name: "Charlie", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p5", name: "John", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p6", name: "Pat", tricksWon: 3, bid: 2, score: 15 }
                ],

                yourHand: [
                    { suit: "HEARTS", value: "A" },
                    { suit: "HEARTS", value: "K" },
                    { suit: "SPADES", value: "10" },
                    { suit: "CLUBS", value: "2" },
                    { suit: "DIAMONDS", value: "J" }
                ],

                trickCards: [],

                canPlayCard: false,
                canBid: true,
                canStartGame: false,
                roundNumber: -1,

                scoreboard: []
            };
        case 'waiting':
            return {
                roomCode: "TEST",
                phase: "waiting",
                trumpCard: null,
                currentTurn: "p1",
                youID: "p1",

                players: [
                    { id: "p1", name: "You", tricksWon: 2, bid: 3, score: 10 },
                    { id: "p2", name: "Alice", tricksWon: 1, bid: 2, score: 5 },
                    { id: "p3", name: "Bob", tricksWon: 0, bid: 1, score: 2 },
                    { id: "p4", name: "Charlie", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p5", name: "John", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p6", name: "Pat", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p11", name: "Amber", tricksWon: 2, bid: 3, score: 10 },
                    { id: "p12", name: "Meg", tricksWon: 1, bid: 2, score: 5 },
                    { id: "p13", name: "Hannah", tricksWon: 0, bid: 1, score: 2 },
                    { id: "p14", name: "Kelly", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p15", name: "Seamus", tricksWon: 3, bid: 2, score: 15 },
                    { id: "p16", name: "Aengus", tricksWon: 3, bid: 2, score: 15 }
                ],

                yourHand: [],

                trickCards: [],

                canPlayCard: false,
                canBid: false,
                canStartGame: true,
                roundNumber: -1,
            };
    }


}