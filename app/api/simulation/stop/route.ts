import { NextResponse } from 'next/server';
import { stopSimulation } from '@/lib/simulationState';

export async function POST() {
  try {
    stopSimulation();
    
    return NextResponse.json({
      success: true,
      message: 'Simulation stopped',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop simulation' },
      { status: 500 }
    );
  }
}
