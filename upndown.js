import Deck from "/deck.js"

export default class UpandDown {
    constructor(gameId = generateId(32)) {
        this.gameID = gameId;
        this.deck = new Deck();
    }

    getID() {
        return this.gameID;
    }
}

function generateId(length) {
    let ID = '';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(let i = 0; i < length; i++) ID += chars.charAt(Math.floor(Math.random() * chars.length));

    return ID;
}