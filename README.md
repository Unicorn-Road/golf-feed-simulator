# Golf Tournament Feed Simulator

A Next.js application that simulates the progressive evolution of a golf tournament XML scoring feed over time. Perfect for testing systems that consume real-time golf tournament data.

## Features

- **Real-time Simulation**: Mimics how tournament feeds evolve from initial tee times to complete results
- **Progressive Updates**: Updates every 30 seconds to show hole-by-hole score progression
- **Multiple Durations**: Run 1-minute, 2-minute, or 5-minute simulations
- **XML Feed API**: RESTful endpoint that serves XML data at any simulation state
- **Visual Interface**: Clean UI showing simulation progress and live XML output

## How It Works

The simulator progressively reveals tournament data based on a progress percentage (0-100):

- **0%**: Tournament scheduled - only player info and tee times
- **0-25%**: Round 1 in progress - hole-by-hole scores appearing
- **25-50%**: Round 1 complete, Round 2 in progress
- **50-75%**: Round 2 complete, Round 3 in progress  
- **75-100%**: Round 3 complete, Round 4 in progress or complete

Each simulation updates every 30 seconds, showing how scores would appear over the course of a real tournament.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## API Usage

### Server-Side Simulation (NEW!)

The simulator now supports **server-side state management**. External applications can start a simulation on the server and poll the feed to get automatically updated data.

```bash
# Start a 5-minute simulation
curl -X POST "http://localhost:3000/api/simulation/start?duration=300"

# Poll the feed (automatically uses server-side progress)
curl "http://localhost:3000/api/feed"

# Check simulation status
curl "http://localhost:3000/api/simulation/status"
```

**See [API.md](API.md) for complete documentation.**

### Feed Endpoint

```
GET /api/feed
GET /api/feed?progress=[0-100]
```

**Parameters:**
- `progress` (optional): Number between 0-100 representing tournament completion percentage. If omitted, uses server-side simulation state.

**Response:** XML document with tournament data at the specified progress point.

**Examples:**

```bash
# Get current state (uses server simulation if active)
curl http://localhost:3000/api/feed

# Get specific progress point (manual)
curl http://localhost:3000/api/feed?progress=50
```

## Project Structure

```
golf-feed-simulator/
├── app/
│   ├── api/feed/route.ts    # XML feed API endpoint
│   └── page.tsx              # Main UI with simulation controls
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── sampleData.ts         # Sample tournament data
│   ├── simulator.ts          # Simulation engine
│   └── xmlBuilder.ts         # XML generation utilities
└── README.md
```

## Data Model

The simulator uses real tournament data from the International Series Japan 2025. The XML format follows the MenMac XML standard used by professional golf tours, including:

- Tournament metadata (name, location, dates, status)
- Course layout (holes, par, yardage)
- Player information (names, countries, IDs)
- Round data (status, scores, holes played)
- Hole-by-hole scores (strokes, fairways, bunkers, putts)

## Customization

### Using Your Own Player List

The simulator is currently using player data from `IS Japan - entry list as of 30 Mar.xlsx` (281 players).

To regenerate with an updated Excel file:

1. Place your Excel file at the project root (must have columns: No, Name, Nat.)
2. Update the path in `scripts/generatePlayers.js` if needed
3. Run:
   ```bash
   npm run generate-players
   ```
4. Restart the dev server to see the changes

The script will:
- Extract all players from the Excel file
- Generate realistic golf scores for 4 rounds
- Create proper tournament standings
- Update `lib/sampleData.ts` automatically

### Manual Customization

To manually customize tournament data:

1. Edit `lib/sampleData.ts` with your tournament structure
2. The XML format will automatically match the structure
3. Adjust simulation logic in `lib/simulator.ts` if needed

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## License

MIT
