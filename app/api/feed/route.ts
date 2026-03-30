import { NextRequest, NextResponse } from 'next/server';
import { TournamentSimulator } from '@/lib/simulator';
import { buildXML } from '@/lib/xmlBuilder';
import { getCurrentProgress, cleanupInactiveSimulation } from '@/lib/simulationState';

const simulator = new TournamentSimulator();

export async function GET(request: NextRequest) {
  // Clean up old simulations
  cleanupInactiveSimulation();
  
  const searchParams = request.nextUrl.searchParams;
  const progressParam = searchParams.get('progress');
  
  // If progress is specified, use it; otherwise use server-side simulation state
  const progress = progressParam !== null 
    ? parseFloat(progressParam) 
    : getCurrentProgress();
  
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Get simulated state
  const state = simulator.getSimulatedState(clampedProgress);
  
  // Build XML
  const xml = buildXML(state.tournament, state.timestamp);
  
  // Return XML response
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
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
