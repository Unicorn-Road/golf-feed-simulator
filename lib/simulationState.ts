// Server-side simulation state management
// This works in Vercel's serverless environment by using in-memory state

interface SimulationState {
  isActive: boolean;
  startTime: number;
  durationMs: number;
  lastAccessed: number;
  startDay: number; // 1-4 representing which day/round to start from
}

// In-memory state (resets on cold start, which is fine for a simulator)
let currentSimulation: SimulationState | null = null;

export function startSimulation(durationMinutes: number, startDay: number = 1): void {
  currentSimulation = {
    isActive: true,
    startTime: Date.now(),
    durationMs: durationMinutes * 60 * 1000,
    lastAccessed: Date.now(),
    startDay: Math.max(1, Math.min(4, startDay)), // Clamp between 1-4
  };
}

export function stopSimulation(): void {
  currentSimulation = null;
}

export function getCurrentProgress(): number {
  if (!currentSimulation || !currentSimulation.isActive) {
    return 0;
  }

  const elapsed = Date.now() - currentSimulation.startTime;
  
  // Check if simulation has completed
  if (elapsed >= currentSimulation.durationMs) {
    currentSimulation.isActive = false;
    return 100;
  }

  // Calculate progress within the current day/round
  // Each day represents 25% of the tournament (4 days = 100%)
  const startProgress = (currentSimulation.startDay - 1) * 25;
  const endProgress = currentSimulation.startDay * 25;
  
  // Calculate relative progress within this day
  const relativeProgress = (elapsed / currentSimulation.durationMs) * 25;
  const totalProgress = startProgress + relativeProgress;
  
  // Update last accessed time
  currentSimulation.lastAccessed = Date.now();
  
  return Math.min(100, Math.max(0, totalProgress));
}

export function getSimulationStatus(): {
  isActive: boolean;
  progress: number;
  elapsed: number;
  duration: number;
} {
  if (!currentSimulation) {
    return {
      isActive: false,
      progress: 0,
      elapsed: 0,
      duration: 0,
    };
  }

  const elapsed = Date.now() - currentSimulation.startTime;
  const progress = getCurrentProgress();

  return {
    isActive: currentSimulation.isActive && progress < 100,
    progress,
    elapsed: elapsed / 1000, // in seconds
    duration: currentSimulation.durationMs / 1000, // in seconds
  };
}

// Auto-cleanup: Stop simulation after 10 minutes of inactivity
export function cleanupInactiveSimulation(): void {
  if (currentSimulation) {
    const inactiveTime = Date.now() - currentSimulation.lastAccessed;
    if (inactiveTime > 10 * 60 * 1000) {
      currentSimulation = null;
    }
  }
}
