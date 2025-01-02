# Programming Docs

## Global Values
`const SUITS`: Array of suits of standard playing card deck

`const VALUES`: Array of values a `Card` object can take

## Non-Member Functions
`newDeck()` returns an array of cards sorted as Spades, Clubs, Hearts, Diamonds, with each suit sorted in ascending order from Ace to King.

## Classes

### Card

#### Member Variables
`this.suit`: Card suit, generally of the 4 suits of a standard deck

`this.value`: Card value, generally of the 13 values of a standard deck, Ace - King

#### Constructor
```
constructor(suit, value) {
    this.suit = suit;
    this.value = value;
}
```

### Deck

Class which stores an array of cards in a deck. For the purposes of this class the "top" of the deck is the last index in the `cards` array.

#### Member Variables
`this.cards`: Array of `Card` objects in a deck

#### Constructor
```
constructor(cards = newDeck()) {
    this.cards = cards;
}
```

#### Member Functions

`get numCards()` returns length of the `cards` array.

`shuffle()` randomizes the cards within the deck by stepping from the top of the deck down exchanging cards randomly throughout the deck.

`getCard(index)` returns the `Card` at the given index in the `cards` array.

`deal(num_players, num_cards)` returns an array of size `num_players` which contains `Hand` classes with a `num_cards` player of cards, handing out cards to each player from the end of the deck. The cards are dealt one to each player, then the second, no player receives 2 cards consecutively from the deck.

### Hand

Class which stores an array of cards, similar to class `Deck`. This class exists to ensure no accidental misuse of members in the `Deck` class. `Hand` is much more limited.

#### Member Variables
`this.hand_cards`: Array of `Card` objects in the hand

#### Constructor
```
constructor(new_cards = new Array()) {
    this.hand_cards = new_cards;
}
```

#### Member Functions
`addCard(card)` takes a `Card` object and appends it to the end of the `this.cards` array.

`getCards()` returns `this.hand_cards`