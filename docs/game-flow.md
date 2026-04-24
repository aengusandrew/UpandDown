# Game Flow

UpandDown is heavily state driven, although almost all time is spent in the `playing` phase.

## Game Phases

### Titles (non-state)

- Not an actual state of GameManager but the landing screen to create a join a game

### `waiting`

- Players join room
- No play occurs
- Players select number of rounds to play ($\leq 52 / \text{number of players}$)
- Host starts game

### `bidding`

- Players select a bid ($\leq \text{number of rounds}$)

### `playing`

- Players play cards into a trick until every player has played a card
- GameManager calculates who won trick
- New trick starts until all tricks that round have been played

### `scoring`

- GameManager scores game (undetectably fast at the moment)
- Winner is displayed
- Players choose to quit the game or play again
