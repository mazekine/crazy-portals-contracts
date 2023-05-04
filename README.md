# Crazy Portals

![Crazy Portals logo](img/cp_logo.svg)

Introducing Crazy Portals: a thrilling and strategic blockchain-based game inspired by the classic Snakes and Ladders. With its unique gameplay mechanics and countless configurations, players are immersed in a world of portals, rewards, and strategy as they compete to reach the final cell first.

## Gameplay Mechanics

### Map variability

Choose from a range of map sizes, from 6x6 to 16x16, to suit your preferred level of difficulty and complexity.

### Number of players

Crazy Portals can accommodate anywhere from 2 players to a massive 65,000 players in a single round, making it suitable for small groups or grand-scale events.

### Round and move time

Customize round durations and move times to create fast-paced games or more leisurely experiences.

### Portal customization

Configure the number of red and blue portals separately (up to size minus two) to create diverse maps and strategic opportunities.

### Simultaneous rounds

Multiple rounds can run in parallel on a single map, allowing for non-stop action and excitement.

### Rake rates and jackpot funds

Set the rake rate for each map, with a portion going to the jackpot fund. The jackpot accumulates per map and can be won by lucky players during any round.

### Prize funds and entrance fees

Determine the prize fund and entrance fee for each map, with rounds continuing as long as the map contract has a balance.

### Private maps

Create private maps with entrance bets made by players, forming the prize fund for an exclusive gaming experience.

## Example map configurations

### Beginner's Arena

6x6 map with 4 red and 4 blue portals, 10-minute rounds, 30-second move time, and a low rake rate. Perfect for newcomers to the game.

### Speed Rush

8x8 map with 10 red and 10 blue portals, 5-minute rounds, and 15-second move times for adrenaline-pumping, fast-paced action.

### Strategic Showdown

12x12 map with 15 red and 5 blue portals, 30-minute rounds, and 1-minute move times, designed for seasoned players seeking a strategic challenge.

### Jackpot Bonanza

10x10 map with equal red and blue portals, 15-minute rounds, 45-second move times, and a high rake rate, focusing on accumulating and winning massive jackpots.

### Elite Challenge

16x16 map with 20 red and 10 blue portals, 45-minute rounds, and 2-minute move times, offering a complex and demanding experience for advanced players.

With its myriad customization options, Crazy Portals delivers a dynamic and engaging gaming experience for players of all skill levels. Dive into portal mania, strategize your moves, and compete to reach the treasure first!

## User flow

1. User browses a list of available maps, displaying remaining balance or entrance fees.
2. User selects a map, views a list of available rounds, then joins an existing round or creates a new one.
3. User waits in a lobby for the required number of players to join (minimum of two).
4. Once all players have joined, the round starts automatically.
5. Players roll dice simultaneously during each move, with moves ending when all players have rolled or when the move time expires.
6. If a player lands on a blue portal tail, they are immediately teleported to the connected head higher on the map; if they land on a red portal head, they are teleported to the tail lower on the map.
7. Portal ends are prevented from appearing on the last cell by design.
8. The first player to reach the last cell wins the round, and the game concludes.
9. During the round, a map-defined rake may be charged as a small gas fee, with a portion contributed to the jackpot fund, which accumulates for the entire map, not just the current round.
10. A randomizer draws the jackpot for each player's move, with lucky players receiving the jackpot amount added to their balance.
11. Players may win multiple jackpots during a single round, depending on the round duration and randomizer results.
12. After the round ends, the winner claims their reward, with four possible outcomes: simple winner (reached the last cell first), winner with jackpot, jackpot only, or lose.

## Future mechanics

In the future, the game will offer various in-game boosters, such as:

1. **Set Mine**: Places a mine that sends any player who lands on it one row down.
2. **Power Shield**: Prevents other players from occupying the same cell as the activating player, pushing them back by one cell.
3. **Portal Immunity**: Grants the player immunity from portals for one turn.
4. **Small Step**: Allows the player to move one cell forward.

These boosters will introduce new strategic options and enhance gameplay.