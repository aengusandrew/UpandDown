# Up and Down

## Online Multiplayer Up and Down the Street

Author: [Aengus Andrew](https://github.com/aengusandrew)

This repo is meant to contain a .js based game of Up and Down the Street (more commonly called Up and Down the River, for the purposes of this README I will always refer to it as Up and Down the Street). The game rules can be seen in a subsection below, this is a first entry into game dev for me, this game is very important to my family and we only get to play when we are together which happens less often now.


## Game Rules

Up and Down the street is fundamentally a game of bidding. Gameplay involves players making a bid on how many "tricks" they think they can capture, and then if they succeed in that they receive a bonus on their point total. The game flows as follows:

1. The game starts with each player being dealt *up to* 10 cards, as you increase the number of players the number of initial cards must decrease to ensure there is always at least 1 card remaining in the deck after dealing. 

2. The top card of the remaining cards is flipped over, the suit of that card is the **Trump** suit.

3. Beginning with the player to the left of the dealer, each player places a bid on how many **tricks** they think they can take (see below).

4. Once all bids are made the player to the left of the dealer initiates the first **trick**:

a. The player to the left of the dealer throws the first card from their hand, this card determines the leading suit for that trick, all other players must play a card of that suit if they have one, if they do not they may play any card out of their hand.

b. If a player throws a card of the **Trump** suit, they automatically win the **hand**, if multiple **Trump** are thrown, the highest wins the **trick**.

5. The player who won the most recent trick leads the next trick as described in step 4.

6. This play continues until all tricks have been played, at which point it is counted how many tricks each player won.

7. A player *always* receives as many points as tricks they collected, and in addition receive a bonus if they made their bid from step 3 (see bonus structures below).

8. After all points have been tallied, you return to step 1 playing each subsequent round with 1 less card (10, 9, 8, 7...), until you get to 1 card. Play the 1 card round twice, then begin climbing back up to your original number (3, 2, 1, 1, 2, 3, ... 8, 9, 10). At the end tally total final scores for who wins the game.

The 3 different game types alter how a player is rewarded for making their bid.

### +10
The **+10** game type simply gives each player a 10 point bonus for making their bid. i.e. a player who bid 1 and got one (1/1) will receive 11 points. 1 for their trick, and 10 bonus.

*Playing +10 is an inarguable classic. The fault of this gamemode is a single lost bid can result in effectively removing oneself from competition, as the amount of tricks one may obtain in future rounds will only very slowly make up what they lost in losing the 10 bonus points for having made their bid.*

### +5
The **+5** game type is the same concept as **+10**, each player gets a 5 point bonys for making their bid. i.e. a player who bids 1 and gets 1 (1/1) receives 6 points. 1 for their trick, 5 bonus.

*Playing +5 seeks only to solve the issues in +10, in a +5 game, a player who loses their bid generally only needs to play a few rounds aggressively bidding, and can make up the 5 bonus points they lost in their missed bids.*

### JDVII
**JDVII** (Said "Jay-Dee Seven") is a more complex scoring method in which a player is disincentivized to bid 0 throughout the game. In this game mode a player receives a 10 point bonus for making their bid, unless that bid was zero, in which case they receive a 7 point bonus.

*This gamemode has a namesake who will not be mentioned here. However, any experienced player will quickly learn that with a little skill and forethought, it is easy to consistently bid 0 unless a player has truly unloseable cards (aces or face cards of the trump suit). Although this is smart strategizing, and those who start with the more traditional scoring methods will quickly see its benefit, it can lead to a less exciting game in a room full of experienced players. Playing JDVII strongly incentivizes bidding more aggressively.*