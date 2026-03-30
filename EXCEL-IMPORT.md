# Excel Player List Integration

## What Was Done

Successfully integrated the **IS Japan - entry list as of 30 Mar.xlsx** file into the golf feed simulator.

### Results

- **281 real players** from the Excel file are now in the simulator
- Each player has complete tournament data:
  - 4 rounds of golf scores
  - 18 holes per round
  - Realistic scores (birdies, pars, bogeys)
  - Complete stats (fairways, bunkers, GIR, putts)
  - Proper tournament standings

### Players Included

The Excel file contains players such as:
- Kazuki Higa (JPN)
- Ding, Wenyi (CHN)
- Kota Kaneko (JPN)
- Travis Smyth (AUS)
- Richard T. Lee (CAN)
- And 276 more...

All players are properly sorted by their total scores in the leaderboard.

## How It Works

### Generation Script

The `scripts/generatePlayers.js` script:

1. Reads the Excel file from the parent directory
2. Extracts player data (No, Name, Country)
3. Generates realistic 4-round golf scores for each player
4. Creates proper tournament structure with:
   - Hole-by-hole scores
   - Round totals
   - Tournament standings
   - Tee times
5. Writes everything to `lib/sampleData.ts`

### Running the Script

```bash
npm run generate-players
```

This will regenerate the player data from the Excel file.

## Verification

To verify the players are loaded correctly:

```bash
# Start the server
npm run dev

# Check the feed (in another terminal)
curl 'http://localhost:3000/api/feed?progress=0' | grep firstname | head -10
```

You should see player names from your Excel file.

## Updating the Player List

If you get an updated Excel file:

1. Replace the Excel file in the parent directory
2. Run `npm run generate-players`
3. Restart the dev server
4. The new player list will be live!

The Excel file must have these columns:
- **No**: Player number
- **Name**: Full player name
- **Nat.**: Country code (3 letters)

## XML Output

The XML feed now shows all 281 players with attributes like:

```xml
<player idint="1" 
        firstname="Kazuki" 
        lastname="Higa" 
        country="JPN" 
        nametv="Kazuki Higa">
  <totals status="ok" 
          strokes="280" 
          totaltopar="-4" 
          position="15"/>
  <round no="1" status="completed" strokes="70" totaltopar="-1" holesplayed="18">
    <score hole="1" strokes="4" fairway="1" bunkers="0" gir="1" putts="2"/>
    <!-- 17 more holes -->
  </round>
  <!-- 3 more rounds -->
</player>
```

## Notes

- Scores are randomly generated but realistic (bell curve around par)
- Players are sorted by total score in the leaderboard
- Each simulation run shows the same scores (not randomized per simulation)
- To change the scoring distribution, edit the probabilities in `generatePlayers.js`
