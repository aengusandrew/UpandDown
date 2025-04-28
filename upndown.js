import Deck from "/deck.js"

export default class UpandDown {
    constructor(gameId = new ID(32)) {
        this.gameID = gameId;
        this.deck = new Deck();
        this.players = new Array();
    }

    getID() {
        return this.gameID;
    }

    numPlayers() {
        return this.players.length;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    start() {
        let numRounds = Math.floor(this.deck.numCards / this.numPlayers());

        let currentRound = numRounds;
    }
}