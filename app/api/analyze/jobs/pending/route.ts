import { NextResponse } from 'next/server';
// @ts-ignore - TypeScript error ignore for now
import { getPendingAnalysisJobs } from '@/utils/analysis-jobs';

// Fetch pending analysis jobs
export async function GET(request: Request) {
  try {
    // Get the limit from query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get pending jobs
    const jobs = await getPendingAnalysisJobs(limit);
    
    // Return the jobs
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending jobs' },
      { status: 500 }
    );
  }
} 