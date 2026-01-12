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
        this.hostID = null;
    }

    addPlayer(Player) {
        this.players.push(Player);
    }

    startGame() {
        this.roundNumber = Math.min(52 / this.players.length, 10);
        this.startNewRound();
    }
    
    startNewRound() {
        const deck = new Deck();

        deck.shuffle();
        
        // Deal
        for(let player of this.players) {
            player.hand = deck.cards.splice(0, this.roundNumber);
        }

        // Assign trump suit as suit of card on top of deck
        this.trumpSuit = deck.cards[0].suit;

        this.playerIndex = (this.dealerIndex + 1) % this.players.length;

        this.phase = 'bidding';
    }

    handleBid(playerID, bidValue) {
        const player = this.players.find(p => p.id === playerID);
        if(!player || this.phase !== 'bidding' || this.players.indexOf(player) !== this.playerIndex) return 'error';

        player.bid = bidValue;

        this.playerIndex = (this.playerIndex + 1) % this.players.length;

        if(this.playerIndex === this.dealerIndex) this.phase = 'playing';

        return 'ok';
    }

    handlePlayCard(playerID, card) {
        const player = this.players.find(p => p.id === playerID);

        if(!player) return 'player_not_found';
        if(this.phase !== 'playing') return 'wrong_phase';
        if(this.players.indexOf(player) !== this.playerIndex) return 'not_your_turn';

        const cardIndex = player.hand.findIndex(
            c => c.suit === card.suit && c.value === card.value
        );
        if (cardIndex === -1) return 'not_in_hand'; // Player does not have the card they attempted to play

        if(this.trickCards.length > 0) {
            const leadSuit = this.trickCards[0].card.suit;
            if(player.hand.some(c => c.suit === leadSuit) && card.suit != leadSuit) return 'follow_lead';
        }

        player.hand.splice(cardIndex, 1);

        this.trickCards.push( {playerID, card} );

        if(this.trickCards.length === this.players.length) {
            this.scoreTrick();
        } else {
            this.playerIndex = (this.playerIndex + 1) % this.players.length;
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
                    else if (this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card };
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

    getPublicGameState(forPlayerID) {
        const you = this.players.find(p => p.id === forPlayerID);

        return {
            roomCode: this.roomCode,
            phase: this.phase,
            roundNumber: this.roundNumber,
            direction: this.direction,
            trumpSuit: this.trumpSuit,
            currentTurn: this.players[this.playerIndex]?.id || null,

            players: this.players.map(p => ({
                ID: p.ID,
                name: p.name,
                handSize: p.hand.length,
                tricksWon: p.tricksWon,
                bid: p.bid,
                score: p.score
            })),

            yourHand: you ? you.hand : [],
            trickCards: this.trickCards.map(t => ({
                playerID: t.playerID,
                card: t.card
            })),

            canStartGame:
                this.phase === 'waiting' &&
                forPlayerID === this.hostId &&
                this.players.length >=2,

            canBid:
            this.phase === 'bidding' &&
            this.players[this.playerIndex]?.id === forPlayerID
        }
    }

    cardBeats(card1, card2) {

        const RANKS = {
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            "10": 10,
            "J": 11,
            "Q": 12,
            "K": 13,
            "A": 14
        };

        return RANKS[card1.value] > RANKS [card2.value];
    }
}
    

class Player {
    constructor(ID, name) {
        this.ID = ID;
        this.name = name;
        this.hand = new Array();
        this.tricksWon = 0;
        this.bid = -1;
        this.score = 0;
    }
}

module.exports = GameManager;