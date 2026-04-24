# Socket API

UpandDown relies on packets of information sent back and forth from the client and server for processing and rendering.

## Client -> Server

### `createRoom`

Payload:

```js
{
  roomCode: string,
  playerName: string,
  clientID: string
}
```

### `joinRoom`

Payload:

```js
{
  roomCode: string,
  playerName: string,
  clientID: string
}
```

### `start_game`

Payload:
none

### `set_rounds`

Payload:

```js
{
  rounds: int
}
```

### `play_card`

Payload:

```js
{
  suit: string,
  value: string
}
```

### `place_bid`

Payload:

```js
{
  bid: int
}
```

### `quit-game`

Payload:
none

### `play-again`

Payload:
none

## Server -> Client

### `game_state`

Description: Game state to be rendered by client

Payload:
*See GameManager documentation for details of game state contents.*

### `game_error`

Payload:

```js
{
  error: string
}
```

*See errors documentation for details on errors.*
