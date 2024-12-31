const SUITS = ["SPADES", "CLUBS", "HEARTS", "DIAMONDS"]
const VALUES = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K"
]

export default class Deck {
    constructor(cards) {
        this.cards = cards;
    }

    get numCards() {
        return this.cards.length;
    }

    shuffle() {
        
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}

function newDeck() {
    return SUITS.flatMap(suits => {
        return VALUES.map(value => {
            return new Card(suit, value);
        })
    })
}