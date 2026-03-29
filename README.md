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

<br>
<hr>

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

<br>
<hr>

## Progress
### 3/21
This project has been slow moving as I have been very busy however the first web deployment is officially live! Play online now [here](https://upanddown.onrender.com/). It still has some debug marks on the main repo, I need to update so it is the pretty version and all the gross debugging stays on the local version.

### 3/21
It's kind of a differnet day than yesterday because I wrote that note at 4am. I did a big UI push and it looks much cleaner. Still a long way to go with fonts and everything, and as of right now you can't actually end a game because there's no endgame function but I need to implement a lobby I think to do that because you'll have the option to return to the home screen or to reenter a lobby with the same people. URL is the same it is still deployed free with Render.

### 3/23 (**0.1.0**)
Some more UI updates to pretty things up. Biggest pushes now for UI are buttons that just need some CSS sprucing but I hate CSS. I also fixed one quick bug in the trump logic. All updates are deployed to the online version now. I think I'll call this **0.1.0** because I wanna be like the cool software people. Probably should work on the lobby next but the UI updates are so satisfying.

### **0.2.0**
Lobby added. Now after creating a room you're sent to a lobby where you wait for other players to join, once there are at least 2 the person that originally opened the room can start the game. Toying with the idea of anyone being able to start the game. Definitely need to add reconnect support at this point because if you create a room and then refresh you're screwed. UI for titles and lobby are basically done. Main game screen still needs some UI work. All pages need some scaling done, almost everything right now is sized in pure px and when on a bigger monitor everything looks tiny. 

### **0.2.1**
Added small feature, now can select how many rounds you want to play no matter what your group size is up to the maximum possible for your group size. If you try and select too many rounds it will kick an error. Main issue now is that where to click to select the number of rounds you want to play is not abundantly clear, will need to find a way to clarify that further.

### **0.3.0**
Added an endgame screen that shows the winner of the game and allows you to play again or quit the game. When you play again it puts you into a room with the same roomCode as the previous game. When you quit the game it just forces a refresh which brings you back to the homescreen, eventually this will need to be fixed when reconnect handling is fixed because refreshing will remmeber who you were in the previous game but for now it works quite well. 
