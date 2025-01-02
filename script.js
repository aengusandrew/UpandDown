import Deck from "/deck.js"
import Hand from "/hand.js"

const deck = new Deck();

console.log(deck.cards);

deck.shuffle()

console.log(deck.cards)

const hand = new Hand();

console.log(hand);

console.log(deck.deal(5,2))
