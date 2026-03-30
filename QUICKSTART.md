# Quick Start Guide

## Overview

The simulator contains **281 real players** from the IS Japan entry list, each with 4 complete rounds of golf scores.

## Running the Simulator

1. **Start the development server:**
   ```bash
   cd golf-feed-simulator
   npm run dev
   ```

2. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Run a simulation:**
   - Click "1 Minute Simulation" for a quick test
   - Click "2 Minute Simulation" for a medium test  
   - Click "5 Minute Simulation" for a full test
   - Click "Stop" to halt any running simulation

## What Happens During Simulation

The simulator updates **every 30 seconds** with new data:

### 1 Minute Simulation (2 updates)
- 0:00 - Start: Tee times only
- 0:30 - Update 1: Round 1 starts, first holes appearing
- 1:00 - Complete: Round 1 ~50% complete

### 2 Minute Simulation (4 updates)
- 0:00 - Start: Tee times only
- 0:30 - Update 1: Round 1 in progress
- 1:00 - Update 2: Round 1 nearly complete
- 1:30 - Update 3: Round 2 starting
- 2:00 - Complete: Round 2 in progress

### 5 Minute Simulation (10 updates)
- 0:00 - Start: Tee times only
- 0:30 - 1:30 - Round 1 progressing
- 2:00 - 3:00 - Round 2 progressing
- 3:30 - 4:00 - Round 3 progressing
- 4:30 - Round 4 starting
- 5:00 - Complete: Round 4 complete, tournament finished

## Using the API Directly

You can access the XML feed at any point without using the UI:

```bash
# Initial state
curl http://localhost:3000/api/feed?progress=0

# Mid-tournament
curl http://localhost:3000/api/feed?progress=50

# Complete tournament
curl http://localhost:3000/api/feed?progress=100
```

## Watching the XML Change

The XML display on the page updates in real-time. Watch for:

1. **Player tee times** appearing first
2. **Hole scores** being added progressively
3. **Round totals** updating as holes complete
4. **Tournament status** changing from "scheduled" → "inprogress" → "completed"
5. **Position/leaderboard** data updating

## Tips

- Use "Open in new tab" to see the raw XML in a separate window
- The progress bar shows exactly where you are in the simulation
- All times are displayed in MM:SS format
- Stop and restart at any time to see different progression patterns
