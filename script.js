import Deck from "/deck.js"
import Hand from "/deck.js"

const deck = new Deck();

console.log(deck);

deck.shuffle()

console.log(deck)

const hand = new Hand();

console.log(hand);

console.log(deck.deal(5,2))

console.log(deck)
