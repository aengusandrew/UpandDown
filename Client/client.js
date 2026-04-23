const socket = io();

const DEV_MODE = false;

let clientID = localStorage.getItem("clientID");
if(!clientID) {
    clientID = crypto.randomUUID();
    localStorage.setItem("clientID", clientID);
}

socket.on('connect', () => {
    const roomCode = localStorage.getItem('roomCode');

    if (roomCode && clientID) {
        socket.emit('joinRoom', {
            roomCode,
            playerName: nameInput.value,
            clientID
        });
    }
});

const nameInput = document.getElementById('nameInput');
const roomInput = document.getElementById('roomInput')

const titleScreen = document.getElementById('title-screen');
const gameScreen = document.getElementById('game-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const scoreboard = document.getElementById('scoreboard');
const playTable = document.getElementById('playTable');
const endScreen = document.getElementById('end-screen');

document.getElementById('createBtn').onclick = () => {
    socket.emit('createRoom', {
        roomCode: roomInput.value,
        playerName: nameInput.value,
        clientID
    });

    localStorage.setItem("roomCode", roomInput.value);
};

document.getElementById('joinBtn').onclick = () => {
    socket.emit('joinRoom', {
        roomCode: roomInput.value,
        playerName: nameInput.value,
        clientID
    });

    localStorage.setItem("roomCode", roomInput.value);
};

// Error message map for prettier printout to users
const errors = new Map([
    ["ROOM_EXISTS", "Room code already in use"],
    ["ROOM_DNE", "Room does not exist"],
    ["GAME_STARTED", "Game already started"],
    ["NOT_HOST", "You are not the host"],
    ["INVALID_BID", "Invalid bid"],
    ["NO_PLAYER", "Player doesn't exist"],
    ["WRONG_PHASE", "Wrong phase"],
    ["NOT_TURN", "Not your turn"],
    ["NOT_IN_HAND", "Card not in hand"],
    ["FOLLOW_LEAD", "Must follow lead"]
]);

let previousTrickEnded = true;

if(DEV_MODE) {

    state = getMockState('playing')
    renderState(state);

} else {
    socket.on('game_state', state => {
        if(previousTrickEnded === false && state.trickEnded === true) {
            renderState(state);

            requestAnimationFrame(() => {
                const existingCards = Array.from(
                    document.querySelectorAll("#trick-cards playing-card")
                );

                animateTrickToWinner(state, existingCards);

                setTimeout(() => {
                    // Clear trickCards for rendering purposes
                    const cleanState = {
                        ...state,
                        trickCards: []
                    };
                    renderState(cleanState);
                }, 1000);
            })

        } else {
            renderState(state);
        }

        previousTrickEnded = state.trickEnded;
    });
}

function renderState(state) {
    switch(state.phase) {
        case 'waiting':
            lobbyScreen.style.display = 'block';
            titleScreen.style.display = 'none';
            endScreen.style.display = 'none';
            renderLobby(state);
            break;
        case 'playing':
        case 'bidding':
            lobbyScreen.style.display = 'none';
            gameScreen.style.display = 'block';
            endScreen.style.display = 'none';
            renderPlay(state);
            break;
        case 'scoring':
            lobbyScreen.style.display = 'none';
            gameScreen.style.display = 'none';
            endScreen.style.display = 'block';
            renderEnd(state);
            break;
        default: break;
    }
}

socket.on('game_error', errorCode => {
    const error = document.getElementById('game-error');
    error.style.display = 'flex';

    const errorMessage = document.createElement('strong');
    errorMessage.id = 'error-message';
    errorMessage.textContent = errors.get(errorCode);

    error.appendChild(errorMessage);

    setTimeout(() =>{
        error.style.display = 'none';
        error.removeChild(error.lastElementChild);
    }, 2000);
})

function startGame() {
    socket.emit('start_game');
}

function toggleScoreboard(state) {
    if(scoreboard.style.display === 'none') {
        renderScoreboard(state);
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

function renderLobby(state) {
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
    `;

    lobbyContent.innerHTML += `
        <div id="sub-player-list">
            <div id="player-count">Players: ${state.players.length}</div>
            <div id="num-rounds">
                Rounds:<select name="round-selector" id="round-selector">
                    <option value="" disabled selected>Select</option>
                    ${Array.from(
        { length: Math.min(Math.floor(52/state.players.length), 10)},
        (_,i) => `
                            <option value="${i+1}" class="num-rounds">${i+1}</option>
                `
    ).join('')}
                </select>
            </div>
        </div>
    `;

    lobbyContent.innerHTML += `
        <div id="start">
            ${state.canStartGame ? `<button onclick="startGame()" id="start-button">Start Game</button>` : ''}
        </div>
    `;

    lobbyScreen.appendChild(lobbyContent);

    const roundSelector = document.getElementById('round-selector');
    if(state.roundNumber !== null) roundSelector.value = state.roundNumber;

    roundSelector.onchange = (e) => {
        const rounds = Number(e.target.value);
        socket.emit('set_rounds', rounds);
    };

}

function renderPlayers(state) {
  const playersDiv = document.getElementById("players-wrapper");

  const youIndex = state.players.findIndex(p=> p.id === state.youID);

  // Put players in order so you are always at the bottom
  const orderedPlayers = [
      ...state.players.slice(youIndex + 1),
      ...state.players.slice(0, youIndex)
  ];

  const radius = 40;
  const centerX = 50
  const centerY = 50;

  orderedPlayers.forEach((player,i) => {

      const phi = ((i+1)/state.players.length) * 2 * Math.PI + Math.PI/2;

      const x = centerX + radius * Math.cos(phi);
      const y = centerY + radius * Math.sin(phi);

      let playerDiv = playersDiv.querySelector(`[data-player-id="${player.id}"]`);

      if(!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        playerDiv.dataset.playerId = player.id;

        playerDiv.style.position = 'absolute';
        playerDiv.style.left = `${x}%`;
        playerDiv.style.top = `${y}%`;
        playerDiv.style.transform = 'translate(-50%, -50%)';

        playerDiv.innerHTML += `
            <img class="player-icon" src="../assets/images/player-icon-male.png" alt="player-icon">
            <strong class="player-name table">${player.name}</strong>
        `;

        if(player.bid)
            playerDiv.innerHTML += `
            <div class="player-bid-wrapper">
                <strong class="player-bid table">${player.bid}</strong>
            </div>
            `;

      }

      const wonTricks = document.createElement('div');
      wonTricks.classList.add('won-tricks', 'table');

      console.log(player.tricksWon);
      for(let i = 0; i < player.tricksWon; i++) {
          const wonTrick = document.createElement('div');
          wonTrick.classList.add('won-trick-card-wrapper', 'table');
          wonTrick.style.position = 'absolute';
          wonTrick.style.top = `${5 * i}px`;
          wonTrick.style.transform = 'rotate(90deg)';
          wonTrick.innerHTML = `<playing-card rank='0' backcolor='red' class='won-trick-card table' style="width: 30px"></playing-card>`;
          wonTricks.appendChild(wonTrick);
      }

      playerDiv.appendChild(wonTricks);

      if(player.id === state.currentTurn) {
          playerDiv.style.filter = 'drop-shadow(0 0 30px white)';
      }

      playersDiv.appendChild(playerDiv);
  });


}

function renderTrick(state) {
    const trickToRender = state.trickCards;
    const trick = document.getElementById("trick-cards");
    if(state.trickCards.length !== 0) {
        trick.innerHTML = `
            ${trickToRender.map(t => `
                <div>
                    <playing-card id="trick-card" cid="${toCID(t.card)}"></playing-card>
                </div>
            `).join('')}`;
    }
}

function renderYou(state) {
    const leadSuit =
        state.trickEnded === false
            ? state.trickCards[0].card.suit :
            null;

    const hasLeadSuit =
        leadSuit &&
        state.yourHand.some(c => c.suit === leadSuit);

    const players = state.players;
    const numPlayers = players.length;

    const you = document.getElementById("your-player");

    you.dataset.playerId = state.youID;

    // Render your hand
    const handSize = state.yourHand.length;
    const spread = 30;

    const hand = document.getElementById("your-hand");

    hand.innerHTML = 
      `${state.yourHand.map((card, i) => {
        const mustFollow = leadSuit && hasLeadSuit;
        const isPlayable =
            state.phase === 'bidding' ||
            (state.canPlayCard &&
            (!mustFollow || card.suit === leadSuit));

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
    }).join('')}`

  const bidButtons = document.getElementById("bid-buttons");

  if(state.canBid) {
    bidButtons.innerHTML = 
    `${Array.from({length: state.roundNumber + 1}, (_, i) => 
    `<button class="bid-button" data-bid="${i}">${i}</button>`).join('')}`;
  } else {
  bidButtons.innerHTML = '';
  }
  
  const yourWonTricks = document.getElementById("your-won-tricks");

  const youIndex = state.players.findIndex(p => p.id === state.youID);

  // TODO: Implement that a won trick card does not appear until after the below animation plays
  for(let i = 0; i < state.players[youIndex].tricksWon; i++) {
      const cardOffset = -(state.players[youIndex].tricksWon*5+45)/2 + 10 + 5*i;

      const wonTrick = document.createElement('div');
      wonTrick.style.position = 'absolute';
      wonTrick.style.right = `${cardOffset}px`;
      wonTrick.classList.add('won-trick-card-wrapper', 'table');
      wonTrick.innerHTML = `<playing-card rank='0' backcolor='red' class='your-won-trick-card table' style='width: 30px;'></playing-card>`;
      yourWonTricks.appendChild(wonTrick);
  }

}

function renderPlay(state) {

  renderPlayers(state);
  renderTrick(state);
  renderYou(state);

  playTable.innerHTML +=
      `<div id="scoreboard-button-wrapper">
          <div class="parallelogram" id="scoreboard-button">Scoreboard</div>
      </div>`;

  playTable.innerHTML +=
      `<div id="quit-button-wrapper">
          <div class="parallelogram" id="quit-button">Quit</div>
      </div>`

  playTable.innerHTML += `
      <div id="trump-card">
          <playing-card cid="${toCID(state.trumpCard)}"></playing-card>
      </div>
  `

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

      const scoreboardToggle = e.target.id === 'scoreboard-button';
      if(scoreboardToggle) {
          renderScoreboard(state);
          scoreboard.style.display = 'flex';
      }

      const quitGame = e.target.id === 'quit-button';
      if(quitGame) {
          socket.emit('quit-game');
          localStorage.removeItem('roomCode');
          location.reload();
      }
  }
}

function renderEnd(state) {

    const winningPlayer = state.players.find(p => p.id === state.currentTurn);

    const winner = document.getElementById('winner');
    winner.id = 'winner';

    winner.innerHTML = `
        <h1>Winner!</h1>
        <div id="winner-wrapper">
            <img id="winner-icon" src="../assets/images/player-icon-male.png" alt="player icon">
            <strong id="winner-name">${winningPlayer.name}</strong>
            <div id="scoreboard-button-wrapper">
                <div class="parallelogram" id="scoreboard-button">Scoreboard</div>
            </div>
        </div>
    `;

    socket.emit('end_game');

    const nextGame = document.createElement('div');
    nextGame.id = 'next-game';

    endScreen.onclick = e => {
        const playAgain = e.target.id === 'play-again';
        const quitGame = e.target.id === 'quit-game';
        const toggleScoreboard = e.target.id === 'scoreboard-button';

        if(quitGame) {
            socket.emit('quit-game');
            localStorage.removeItem('roomCode');
            location.reload();
        }
        else if(playAgain)
            socket.emit('play-again');
        else if(toggleScoreboard) {
            renderScoreboard(state);
            scoreboard.style.display = 'flex';
        }

    }
}

function renderScoreboard(state) {

    scoreboard.innerHTML = '';

    const scoreboardTable = document.createElement('div');
    scoreboardTable.id = 'scoreboard-table';

    scoreboardTable.innerHTML = `
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
                                            ${playerResult ? `${playerResult.tricks}&frasl;${playerResult.bid}` : '-'}
                                        </td>
                                        <td>
                                            ${playerResult ? `${playerResult.score}` : '-'}
                                        </td>
                                        `;
                            }).join('')}
                        </tr>     
                `).join('')}
            </table>
    `;

    scoreboard.appendChild(scoreboardTable);

    const closeBoardMessage = document.createElement('div');
    closeBoardMessage.id = 'close-board-message-wrapper';

    closeBoardMessage.innerHTML = `
        <strong id="close-board-message">click anywhere to close</strong>
    `;

    scoreboard.appendChild(closeBoardMessage);

    scoreboard.onclick = () => {
        scoreboard.style.display = 'none';
    }
}

function animateTrickToWinner(state, trickCards) {

  if(!trickCards.length) return;

  const winnerID = state.currentTurn;
  const winnerEl = document.querySelector(`[data-player-id="${winnerID}"]`);
  if(!winnerEl) return;

  let stackEl;

  if(winnerID === state.youID) {
      stackEl = winnerEl.querySelector('#your-won-tricks');
  } else {
      stackEl = winnerEl.querySelector('.won-tricks');
  }

  if(!stackEl) return;

  let lastCardEl = stackEl.lastElementChild;

  if(!lastCardEl) lastCardEl = stackEl;

  const lastCardRect = lastCardEl.getBoundingClientRect();

  trickCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();

      document.body.appendChild(card);

      card.style.position = 'absolute';
      card.style.left = cardRect.left + 'px';
      card.style.top = cardRect.top + 'px';
      card.style.transition = 'all 0.5s ease-in-out';
      card.style.zIndex = 9999;

      requestAnimationFrame(() => {
          card.style.left = (lastCardRect.left + lastCardRect.width / 2 - cardRect.width / 2 + 1.5) + 'px';
          card.style.top = (lastCardRect.top + lastCardRect.height / 2 - cardRect.height / 2) + 'px';
          if(winnerID !== state.youID) {
              card.style.transform = 'scale(0.375) rotate(90deg)';
          } else {
              card.style.transform = 'scale(0.375)';
          }
      });

      // Flip cards
      setTimeout(() => {
          card.style.transition = 'transform 0.2s';
          card.style.transform = 'scaleX(0)';
      }, 650 + index * 60);

      setTimeout(() => {
          card.setAttribute('backcolor', 'red');
          card.setAttribute('rank', '0');
          card.removeAttribute('cid');

          if(winnerID !== state.youID) {
              card.style.transform = 'scaleX(1) scale(0.375) rotate(90deg)';
          } else {
              card.style.transform = 'scaleX(1) scale(0.375)';
          }
      }, 800 + index * 60);

      setTimeout(() => {
          card.remove();
      }, 1200 + index * 60);
  })
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
                    { id: "p1", name: "You", tricksWon: 8, bid: 3, score: 10 },
                    { id: "p2", name: "Alice", tricksWon: 1, bid: 2, score: 5 },
                    { id: "p3", name: "Bob", tricksWon: 10, bid: 1, score: 2 },
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
                roundNumber: null,

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
                roundNumber: null,
            };
    }


}
