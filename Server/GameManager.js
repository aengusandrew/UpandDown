const Deck = require('./deck')

class GameManager {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.dealerIndex = 0;
        this.playerIndex = null;
        this.roundNumber = null;
        this.phase = 'waiting'; // startup, waiting, bidding, playing, scoring
        this.trickCards = [];
        this.trumpCard = null;
        this.direction = false;
        this.hostID = null;
        this.scoreHistory = [];
        this.trickEnded = true;
    }

    addPlayer(Player) {
        this.players.push(Player);
    }
    
    startNewRound() {
        if(this.roundNumber > Math.min(Math.floor(52/this.players.length), 10)) return "pick_rounds";

        const deck = new Deck();

        deck.shuffle();

        // Deal
        for(let player of this.players) {
            player.hand = deck.cards.splice(0, this.roundNumber);
        }

        // Assign trump suit as suit of card on top of deck
        this.trumpCard = deck.cards[0];

        this.playerIndex = (this.dealerIndex + 1) % this.players.length;

        this.phase = 'bidding';

        return "ok";
    }

    handleBid(playerID, bidValue) {
        this.trickCards = [];

        const player = this.players.find(p => p.id === playerID);

        if(!player) return 'no_player';
        if(this.phase !== 'bidding') return 'wrong_phase';
        if(this.players[this.playerIndex].id !== playerID) return 'not_turn';
        if(bidValue < 0 || bidValue > this.roundNumber) return 'invalid_bid';

        player.bid = bidValue;

        this.playerIndex = (this.playerIndex + 1) % this.players.length;

        const allBid = this.players.every(p => p.bid !== -1);
        if(allBid) {
            this.phase = 'playing';

            this.playerIndex = (this.dealerIndex + 1) % this.players.length;
        }

        return 'ok';
    }

    handlePlayCard(playerID, card) {
        if(this.trickEnded) {
            this.trickCards = [];
            this.trickEnded = false;
        }

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
            if(player.hand.some(c => c.suit === leadSuit) && card.suit !== leadSuit) return 'follow_lead';
        }

        player.hand.splice(cardIndex, 1);

        this.trickCards.push( {playerID, card} );

        if(this.trickCards.length === this.players.length) {
            this.scoreTrick();
        } else {
            this.playerIndex = (this.playerIndex + 1) % this.players.length;
        }

        return 'ok';
    }

    scoreTrick() {
        const leadSuit = this.trickCards[0].card.suit;
        let leadingPlay = this.trickCards[0];
        let trumpThrown = this.trickCards[0].card.suit === this.trumpCard.suit;

        for(const { playerID, card } of this.trickCards) {
            switch(card.suit) {
                case leadSuit:
                    if(!trumpThrown && this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card };
                    if(trumpThrown && leadSuit === this.trumpCard.suit && this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card };
                    break;
                
                case this.trumpCard.suit:
                    if(!trumpThrown) { leadingPlay = { playerID, card }; trumpThrown = true; }
                    else if (this.cardBeats(card, leadingPlay.card)) leadingPlay = { playerID, card };
                    break;
                default: break;
            }
        }
        
        const trickWinner = this.players.find(p => p.id === leadingPlay.playerID);
        
        trickWinner.tricksWon += 1;

        this.trickEnded = true;

        if(this.players[0].hand.length > 0) {
            this.playerIndex = this.players.indexOf(trickWinner);
            this.phase = 'playing';
        } else {
            this.phase = 'scoring';
            this.scoreRound();
        }
    }

    scoreRound() {

        const roundResult = {
            roundNumber: this.roundNumber,
            results: []
        };

        for(let player of this.players) {
            player.score += player.tricksWon;
            if(player.tricksWon === player.bid) player.score += 5;

            roundResult.results.push({
                playerID: player.id,
                bid: player.bid,
                tricks: player.tricksWon,
                score: player.score
            });

            player.hand = [];
            player.tricksWon = 0;
            player.bid = -1;
        }

        this.scoreHistory.push(roundResult);

        if(this.roundNumber === 1 && !this.direction) this.direction = true;
        else if(this.roundNumber === (52 % this.players.length) && this.direction) this.endGame(); // TODO: Implement endGame(), right now bids just increase
        else if(this.direction) this.roundNumber += 1;
        else if (!this.direction) this.roundNumber -= 1;
        this.dealerIndex += 1;
        this.phase = 'waiting';
        this.startNewRound();
    }

    getPhase() {
        return this.phase;
    }


    getPublicGameState(forPlayerID) {
        const you = this.players.find(q => q.id === forPlayerID);

        return {
            roomCode: this.roomCode,
            phase: this.phase,
            roundNumber: this.roundNumber,
            direction: this.direction,
            trumpCard: this.trumpCard,
            currentTurn: this.players[this.playerIndex]?.id,
            trickEnded: this.trickEnded,
            youID: you.id,

            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                handSize: p.hand.length,
                tricksWon: p.tricksWon,
                bid: p.bid === -1 ? null : p.bid,
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
            this.players[this.playerIndex]?.id === forPlayerID,

            canPlayCard:
                this.phase === 'playing' &&
                this.players[this.playerIndex]?.id === forPlayerID,

            scoreboard: this.scoreHistory
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

module.exports = GameManager;