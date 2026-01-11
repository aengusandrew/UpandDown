const Deck = require('./deck')

class GameManager {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = new Array();
        this.dealerIndex = 0;
        this.playerIndex = null;
        this.roundNumber = -1;
        this.phase = 'waiting'; // waiting, bidding, playing, scoring
        this.trickCards = new Array();
        this.trumpSuit = null;
        this.direction = false; // TODO: Check this is working? False when going down the street, true when going up
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

        this.playerIndex = (this.dealerIndex + 1) % this.players.length;

        this.phase = 'bidding';
    }

    handleBid(playerID, bidValue) {
        const player = this.players.find(p => p.id === playerID);
        if(!player || this.phase !== 'bidding' || this.players.indexOf(player) !== this.playerIndex) return;

        player.bid = bidValue;

        if(this.playerIndex === 0) this.phase = 'playing';

        this.playerIndex = (this.playerIndex + 1) % this.players.length;

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
        let leadingPlay = this.trickCards[0];
        let trumpThrown = this.trickCards[0].card.suit === this.trumpSuit;

        for(const { playerID, card } of this.trickCards) {
            switch(card.suit) {
                case leadSuit:
                    if(!trumpThrown && this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card };
                    break;
                
                case this.trumpSuit:
                    if(!trumpThrown) { leadingPlay = { playerID, card }; trumpThrown = true; }
                    else if (this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card }; //TODO: Implement cardBeats
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
            this.scoreRound();
        }
    }

    scoreRound() {
        for(let player of this.players) {
            player.score += player.tricksWon;
            if(player.tricksWon === player.bid) player.score += 5;
            player.hand = [];
            player.tricksWon = 0;
            player.bid = -1;
        }

        if(this.roundNumber === 1 && !this.direction) this.direction = true;
        else if(this.roundNumber === (52 % this.players.length) && this.direction) this.endGame(); // TODO: Implement endGame()
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