import { NextResponse } from 'next/server';
import { runDeadlineCheckNow } from '../../../services/cronService';

export async function POST() {
  try {
    console.log('Manual deadline reminder check triggered');
    await runDeadlineCheckNow();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Deadline reminder check completed successfully' 
    });
  } catch (error) {
    console.error('Manual deadline check failed:', error);
    return NextResponse.json(
      { error: 'Failed to run deadline check' },
      { status: 500 }
    );
  }
}
