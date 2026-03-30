import { NextResponse } from 'next/server';
import { stopSimulation } from '@/lib/simulationState';

export async function POST() {
  try {
    stopSimulation();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Simulation stopped',
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop simulation' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
