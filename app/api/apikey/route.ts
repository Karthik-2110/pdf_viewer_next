import { NextResponse } from 'next/server';
import { getRecruitApiKey } from '@/utils/supabase-api';

export async function GET() {
  try {
    // Fetch API key from Supabase
    const apiKey = await getRecruitApiKey();
    
    if (!apiKey) {
      console.error('CRITICAL: RecruitCRM API Key is not available');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Return the API key
    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Error fetching API key:', error);
    return NextResponse.json({ error: 'Failed to fetch API key' }, { status: 500 });
  }
} 