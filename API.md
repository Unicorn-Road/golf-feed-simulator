# Golf Feed Simulator API Documentation

## Overview

The simulator now supports **server-side state management**, allowing external applications to start a simulation and poll the feed endpoint to receive automatically updated data.

## Endpoints

### 1. Start Simulation

Start a new server-side simulation.

```
POST /api/simulation/start?duration={seconds}&startDay={1-4}
```

**Parameters:**
- `duration` (optional): Duration in seconds (60-1800). Default: 300 (5 minutes)
- `startDay` (optional): Which day/round to start from (1-4). Default: 1
  - Day 1: Tournament start → Round 1 complete (0-25%)
  - Day 2: Round 1 complete → Round 2 complete (25-50%)
  - Day 3: Round 2 complete → Round 3 complete (50-75%)
  - Day 4: Round 3 complete → Tournament complete (75-100%)

**Examples:**
```bash
# Start a 5-minute simulation from Day 1
curl -X POST "https://your-domain.vercel.app/api/simulation/start?duration=300&startDay=1"

# Start a 2-minute simulation from Day 3
curl -X POST "https://your-domain.vercel.app/api/simulation/start?duration=120&startDay=3"

# Quick Day 4 finale test
curl -X POST "https://your-domain.vercel.app/api/simulation/start?duration=60&startDay=4"
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation started",
  "duration": 300,
  "durationMinutes": 5,
  "startDay": 1
}
```

### 2. Get Simulation Status

Check the current simulation status and progress.

```
GET /api/simulation/status
```

**Example:**
```bash
curl "https://your-domain.vercel.app/api/simulation/status"
```

**Response:**
```json
{
  "isActive": true,
  "progress": 45.5,
  "elapsed": 136.5,
  "duration": 300
}
```

**Fields:**
- `isActive`: Whether a simulation is currently running
- `progress`: Current progress (0-100%)
- `elapsed`: Seconds elapsed since simulation started
- `duration`: Total simulation duration in seconds

### 3. Stop Simulation

Stop the current simulation.

```
POST /api/simulation/stop
```

**Example:**
```bash
curl -X POST "https://your-domain.vercel.app/api/simulation/stop"
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation stopped"
}
```

### 4. Get XML Feed

Get the tournament XML feed. Automatically uses server-side simulation state if active.

```
GET /api/feed
GET /api/feed?progress={0-100}
```

**Parameters:**
- `progress` (optional): Manually specify progress (0-100). If omitted, uses server-side simulation state.

**Examples:**
```bash
# Get current state (uses server simulation if active)
curl "https://your-domain.vercel.app/api/feed"

# Get specific progress point
curl "https://your-domain.vercel.app/api/feed?progress=50"
```

**Response:** XML document (see XML-FORMAT.md for structure)

## Usage Workflow

### For External Applications

Your external app can integrate with the simulator like this:

```javascript
// 1. Start a simulation
await fetch('https://your-domain.vercel.app/api/simulation/start?duration=300', {
  method: 'POST'
});

// 2. Poll the feed every 30 seconds
const interval = setInterval(async () => {
  const response = await fetch('https://your-domain.vercel.app/api/feed');
  const xml = await response.text();
  
  // Process the XML...
  console.log('Received updated tournament data');
  
  // Check if simulation is still active
  const status = await fetch('https://your-domain.vercel.app/api/simulation/status');
  const { isActive } = await status.json();
  
  if (!isActive) {
    clearInterval(interval);
    console.log('Simulation complete');
  }
}, 30000); // Poll every 30 seconds
```

### Bash Example

```bash
#!/bin/bash

# Start 5-minute simulation
curl -X POST "https://your-domain.vercel.app/api/simulation/start?duration=300"

# Poll every 30 seconds
while true; do
  # Get the feed
  curl "https://your-domain.vercel.app/api/feed" > tournament.xml
  
  # Check status
  STATUS=$(curl -s "https://your-domain.vercel.app/api/simulation/status")
  ACTIVE=$(echo $STATUS | jq -r '.isActive')
  
  if [ "$ACTIVE" != "true" ]; then
    echo "Simulation complete"
    break
  fi
  
  sleep 30
done
```

## Important Notes

### Vercel Serverless Considerations

1. **State Persistence**: The simulation state is stored in-memory and will reset on:
   - Cold starts (first request after inactivity)
   - Function redeployments
   - Vercel timeout (10 minutes of inactivity)

2. **Single Instance**: Only one simulation can run at a time per serverless instance.

3. **Auto-Cleanup**: Simulations automatically stop after:
   - Reaching 100% completion
   - 10 minutes of inactivity (no API calls)

### Recommendations

- Poll the feed every **30 seconds** (matches real tournament feed behavior)
- Always check `/api/simulation/status` to verify simulation is still active
- Start a new simulation if the status shows `isActive: false` unexpectedly

## Backwards Compatibility

The API maintains backwards compatibility:
- `/api/feed?progress=50` still works (manual progress)
- The UI continues to work as before
- External apps can choose to use server-side or manual progress

## Testing

Test the full workflow:

```bash
# 1. Start simulation
curl -X POST "http://localhost:3000/api/simulation/start?duration=120"

# 2. Wait a few seconds, then check status
sleep 10
curl "http://localhost:3000/api/simulation/status"

# 3. Get the feed
curl "http://localhost:3000/api/feed" | head -30

# 4. Stop simulation
curl -X POST "http://localhost:3000/api/simulation/stop"
```
