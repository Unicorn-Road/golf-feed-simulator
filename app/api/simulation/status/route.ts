import { NextResponse } from 'next/server';
import { getSimulationStatus, cleanupInactiveSimulation } from '@/lib/simulationState';

export async function GET() {
  try {
    // Clean up old inactive simulations
    cleanupInactiveSimulation();
    
    const status = getSimulationStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get simulation status' },
      { status: 500 }
    );
  }
}
