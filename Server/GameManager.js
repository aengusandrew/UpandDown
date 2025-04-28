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