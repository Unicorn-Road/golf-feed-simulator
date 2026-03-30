// Server-side simulation state management
// This works in Vercel's serverless environment by using in-memory state

interface SimulationState {
  isActive: boolean;
  startTime: number;
  durationMs: number;
  lastAccessed: number;
}

// In-memory state (resets on cold start, which is fine for a simulator)
let currentSimulation: SimulationState | null = null;

export function startSimulation(durationMinutes: number): void {
  currentSimulation = {
    isActive: true,
    startTime: Date.now(),
    durationMs: durationMinutes * 60 * 1000,
    lastAccessed: Date.now(),
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

  // Calculate progress (0-100)
  const progress = (elapsed / currentSimulation.durationMs) * 100;
  
  // Update last accessed time
  currentSimulation.lastAccessed = Date.now();
  
  return Math.min(100, Math.max(0, progress));
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
