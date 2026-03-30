import { NextRequest, NextResponse } from 'next/server';
import { startSimulation } from '@/lib/simulationState';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const durationParam = searchParams.get('duration');
    
    // Default to 5 minutes if not specified
    const durationMinutes = durationParam ? parseFloat(durationParam) / 60 : 5;
    
    // Validate duration (between 1 and 30 minutes)
    if (durationMinutes < 1 || durationMinutes > 30) {
      return NextResponse.json(
        { error: 'Duration must be between 60 and 1800 seconds (1-30 minutes)' },
        { status: 400 }
      );
    }
    
    startSimulation(durationMinutes);
    
    return NextResponse.json({
      success: true,
      message: 'Simulation started',
      duration: durationMinutes * 60,
      durationMinutes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start simulation' },
      { status: 500 }
    );
  }
}
