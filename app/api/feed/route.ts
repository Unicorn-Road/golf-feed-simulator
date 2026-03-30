import { NextRequest, NextResponse } from 'next/server';
import { TournamentSimulator } from '@/lib/simulator';
import { buildXML } from '@/lib/xmlBuilder';

const simulator = new TournamentSimulator();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const progressParam = searchParams.get('progress');
  
  // Default to 0 if no progress specified
  const progress = progressParam ? parseFloat(progressParam) : 0;
  
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
    },
  });
}
