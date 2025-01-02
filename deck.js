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
    constructor(cards = newDeck()) {
        this.cards = cards;
    }

    get numCards() {
        return this.cards.length;
    }

    shuffle() {
        for(let i = this.numCards - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1))
            const oldVal = this.cards[newIndex];
            this.cards[newIndex] = this.cards[i];
            this.cards[i] = oldVal;
        }
    }

    getCard(index) {
        return this.cards[index];
    }

    deal(num_players, num_cards) {
        let dealout = new Array(num_players);

        dealout.fill(new Array(num_cards));

        for(let i = 0; i < num_players; i++) {
            for(let j = 0; j < num_cards; j++) {
                dealout[j][i] = this.cards.pop();
            }
        }
        return dealout;
    }
}

class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }
}

function newDeck() {
    return SUITS.flatMap(suit => {
        return VALUES.map(value => {
            return new Card(suit, value);
        })
    })
}