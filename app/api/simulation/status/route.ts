import { NextResponse } from 'next/server';
import { getSimulationStatus, cleanupInactiveSimulation } from '@/lib/simulationState';

export async function GET() {
  try {
    // Clean up old inactive simulations
    cleanupInactiveSimulation();
    
    const status = getSimulationStatus();
    
    return NextResponse.json(status, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get simulation status' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
