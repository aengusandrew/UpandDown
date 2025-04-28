const Deck = require('deck.js')

class GameManager {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = new Array();
        this.dealerIndex = 0;
        this.playerIndex = 1;
        this.roundNumber = -1;
        this.phase = 'waiting'; // waiting, bidding, playing, scoring
        this.trickCards = new Array();
        this.trumpSuit = null;
        this.direction = false; // False when going down the street, true when going up
    }

    addPlayer(Player) {
        this.players.push(Player);
    }

    startGame() {
        this.roundNumber = 52 % this.players.length;
        this.startNewRound();
    }
    
    startNewRound() {
        deck = new Deck();
        console.log(deck);

        deck.shuffle();
        
        // Deal
        for(let player of this.players) {
            player.hand = deck.cards.splice(0, this.roundNumber);
            console.log(player.name, player.hand);
        }

        // Assign trump suit as suit of card on top of deck
        this.trumpSuit = deck.cards[0].suit;
        console.log(this.trumpSuit);

        this.phase = 'bidding';
    }

    handleBid(playerID, bidValue) {
        const player = this.players.find(p => p.id === playerID);
        if(!player || this.phase !== 'bidding' || this.players.indexOf(player) !== this.playerIndex) return;

        player.bid = bidValue;

        this.playerIndex = (this.playerIndex + 1) % this.players.length;

        if(this.players.every(p => p.bid !== -1)) {
            this.phase = 'playing';
            this.playerIndex = 1;
        }
    }

    handePlayCard(playerID, card) {
        const player = this.players.find(p => p.id === playerID);
        if(!player || this.phase !== 'playing' || this.players.indexOf(player) !== this.playerIndex) return;

        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) return; // Player does not have the card they attempted to play
        player.hand.splice(cardIndex, 1);

        this.trickCards.push(card);

        if(this.trickCards.length === this.roundNumber.length) {
            this.phase = 'scoring';
            this.scoreTrick(); //Needs implementing
        }
    }
}

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.hand = new Array();
        this.tricksWon = 0;
        this.bid = -1;
    }
}