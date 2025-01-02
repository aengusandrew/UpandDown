import Deck from "/deck.js"

const deck = new Deck();

console.log(deck.cards);

deck.shuffle()

console.log(deck.cards)

console.log(deck.deal(5,2))
console.log(deck.cards)