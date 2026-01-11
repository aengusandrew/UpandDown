const Deck = require('./deck')

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
        const deck = new Deck();
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

    handlePlayCard(playerID, card) {
        const player = this.players.find(p => p.id === playerID);
        if(!player || this.phase !== 'playing' || this.players.indexOf(player) !== this.playerIndex) return;

        const cardIndex = player.hand.indexOf(card);
        if (cardIndex === -1) return; // Player does not have the card they attempted to play
        player.hand.splice(cardIndex, 1);

        this.trickCards.push( {playerID, card} );

        if(this.trickCards.length === this.players.length) {
            this.scoreTrick();
        }
    }

    scoreTrick() {
        const leadSuit = this.trickCards[0].card.suit;
        let trumpThrown = false;
        let leadingPlay = null;

        for(const { playerID, card } of this.trickCards) {
            switch(card.suit) {
                case leadSuit:
                    if(!trumpThrown && card.value > leadingPlay.card.value) leadingPlay = { playerID, card };
                    break;
                
                case this.trumpSuit:
                    if(!trumpThrown) { leadingPlay.card = { playerID, card }; trumpThrown = true; }
                    else if (card.value > leadingPlay.card.value) leadingPlay = { playerID, card };
                    break;
                default: break;
            }
        }
        
        const trickWinner = this.players.find(p => p.id === leadingPlay.playerID);
        
        trickWinner.tricksWon += 1;

        this.trickCards = [];

        if(this.players[0].hand.length > 0) {
            this.playerIndex = this.players.indexOf(trickWinner);
            this.phase = 'playing';
        } else {
            this.phase = 'scoring';
            scoreRound();
        }
    }

    scoreRound() {
        for(let player in this.players) {
            player.score += player.tricksWon;
            if(player.tricksWon === player.bid) player.score += 5;
            player.hand = [];
            player.tricksWon = 0;
            player.bid = -1;
        }

        if(this.roundNumber === 1 && !this.direction) this.direction = true;
        else if(this.roundNumber === (52 % this.players.length) && this.direction) endGame(); // TODO
        else if(this.direction) this.roundNumber += 1;
        else if (!this.direction) this.roundNumber -= 1;
        this.phase = 'waiting';
        this.startNewRound();
    }
}

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.hand = new Array();
        this.tricksWon = 0;
        this.bid = -1;
        this.score = 0;
    }
}