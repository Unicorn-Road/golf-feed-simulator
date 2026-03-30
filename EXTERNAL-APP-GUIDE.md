# External App Integration Guide

## Quick Start

Your external app can now consume the golf feed simulator just like a real tournament feed!

## Simple Integration

```javascript
// 1. Start a simulation (once)
await fetch('https://your-domain.vercel.app/api/simulation/start?duration=300', {
  method: 'POST'
});

// 2. Poll the feed every 30 seconds
setInterval(async () => {
  const response = await fetch('https://your-domain.vercel.app/api/feed');
  const xml = await response.text();
  
  // Parse and use the XML
  console.log('Got updated tournament data');
}, 30000);
```

That's it! The feed will automatically progress from:
- 0%: Tee times only
- 25%: Round 1 in progress
- 50%: Round 2 in progress
- 75%: Round 3 in progress
- 100%: Tournament complete

## For Your Specific Use Case

Based on your mention of "my other app", here's how to integrate:

### Step 1: Deploy to Vercel

The simulator is already in your GitHub repo. Deploy it:

```bash
# Link to Vercel (if not already)
vercel

# Or deploy directly
vercel --prod
```

You'll get a URL like: `https://golf-feed-simulator.vercel.app`

### Step 2: Update Your App

In your other app, replace the real feed URL with the simulator URL:

**Before:**
```javascript
const feedUrl = 'https://real-tournament-feed.com/api/feed';
```

**After:**
```javascript
const feedUrl = 'https://golf-feed-simulator.vercel.app/api/feed';
```

### Step 3: Start Simulation When Testing

Add a button or startup script in your app to start the simulation:

```javascript
async function startTestSimulation() {
  const response = await fetch(
    'https://golf-feed-simulator.vercel.app/api/simulation/start?duration=300',
    { method: 'POST' }
  );
  
  const result = await response.json();
  console.log('Simulation started:', result);
}

// Call this when you want to start testing
startTestSimulation();
```

### Step 4: Your Existing Polling Works!

If your app already polls a feed URL every 30 seconds, it will just work! The simulator will automatically:
- Return updated scores each time you poll
- Progress through rounds
- Show realistic tournament state changes

## Example: Full Integration

```javascript
class TournamentFeedClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.pollInterval = null;
  }
  
  // Start a test simulation
  async startSimulation(minutes = 5) {
    await fetch(`${this.baseUrl}/api/simulation/start?duration=${minutes * 60}`, {
      method: 'POST'
    });
    console.log(`Started ${minutes}-minute simulation`);
  }
  
  // Poll the feed
  startPolling(callback) {
    this.pollInterval = setInterval(async () => {
      const response = await fetch(`${this.baseUrl}/api/feed`);
      const xml = await response.text();
      
      // Your XML parsing logic
      callback(xml);
      
      // Check if simulation is done
      const status = await fetch(`${this.baseUrl}/api/simulation/status`);
      const { isActive } = await status.json();
      
      if (!isActive) {
        this.stopPolling();
        console.log('Simulation complete');
      }
    }, 30000); // Every 30 seconds
  }
  
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

// Usage
const client = new TournamentFeedClient('https://golf-feed-simulator.vercel.app');

// Start a 5-minute simulation
await client.startSimulation(5);

// Start polling
client.startPolling((xml) => {
  console.log('Received XML:', xml.substring(0, 100) + '...');
  // Parse and process the XML...
});
```

## Testing Different Scenarios

```javascript
// Quick 1-minute test
await fetch('https://your-domain.vercel.app/api/simulation/start?duration=60', 
  { method: 'POST' });

// Full 5-minute tournament
await fetch('https://your-domain.vercel.app/api/simulation/start?duration=300', 
  { method: 'POST' });

// Extended 10-minute test
await fetch('https://your-domain.vercel.app/api/simulation/start?duration=600', 
  { method: 'POST' });
```

## Troubleshooting

### Simulation not progressing?

Check the status:
```bash
curl https://your-domain.vercel.app/api/simulation/status
```

### Need to restart?

Stop and start again:
```bash
curl -X POST https://your-domain.vercel.app/api/simulation/stop
curl -X POST "https://your-domain.vercel.app/api/simulation/start?duration=300"
```

### Want to see a specific point in time?

You can still use manual progress:
```bash
curl "https://your-domain.vercel.app/api/feed?progress=50"
```

## Next Steps

1. Deploy the simulator to Vercel
2. Get your deployment URL
3. Point your app to the simulator URL
4. Start a simulation
5. Your app will receive updated tournament data automatically!

See [API.md](API.md) for complete API documentation.
