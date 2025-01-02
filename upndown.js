import Deck from "/deck.js"

export default class UpandDown {
    constructor(gameId = generateId(32)) {
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

function generateId(length) {
    let ID = '';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i = 0; i < length; i++) ID += chars.charAt(Math.floor(Math.random() * chars.length));

    return ID;
}