# Architecture Overview

UpandDown is an online multiplayer version of the semi-niche card game commonly known as Up and Down the River. For more details about the background of the game and usage/play instructions see the README.

The program uses Socket.IO to communicate between server and client where game handling is done by the server and the client handles DOM and direct player interaction.

## Components

- Client [`.js`]
  - Renders UI with vanilla JavaScript and HTML/CSS
  - Handles user actions (bidding, playing cards, joining & leaving games)
  - Receives `game_state`s from server

- Server [`Node.js` and `Socket.IO`]
  - Holds a `map` of `GameManager` games
  - Receives user actions via Socket.IO
  - Processes user inputs through `GameManager`
  - Emits `game_state`s to clients for DOM processing

- GameManager [`.js` class]
  - Handles game logic (scoring tricks, scoring rounds, storing game history)
  - Stateless containing no socket logic

## Data Flow

1. Client emits action (start game, bid, play card)
2. Server receives action and validates through GameManager
3. Server broadcasts new game state to all players
4. Client receives state and renders updated DOM

### Flow Diagram

```text
     Client connects to server ---> Client joins/creates room ---> Host starts game
                                                                           |
                                                                           |
                                                                           |
                                                                           v
                          ---------------------------------------->Player emits bid
                          |                                                |
                          |                                                |
                          |                                                |
                          |                                                v
            ----GameManager scores round                         Server receives bid
            |             ^                                                |
            |             |                                                |
            |             |                                                |
            |             |                                                v
            |        (Round ends)            ----------------->Server emits updated state
            |             |                  |                             |
            |             |                  |                             |
       (Game ends)        |                  |                             |
            |             |                  |                             v
            |             ------GameManager processes card          Player emits card
            |                                ^                             |
            |                                |                             |
 GameManager scores game                     |                             |
            |                                |                             v
            |                                ----------------------Server receives card
            |
            -----------------------> Winner Declared!
  ```
