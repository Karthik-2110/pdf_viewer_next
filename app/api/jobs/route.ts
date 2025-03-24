import { NextResponse } from 'next/server';
import { getRecruitApiKey } from '@/utils/supabase-api';

// Removing direct reference to environment variable
// const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;
const BASE_URL = 'https://api.recruitcrm.io/v1';

export async function GET() {
  try {
    // Fetch API key from Supabase
    const RECRUIT_CRM_API_KEY = await getRecruitApiKey();
    
    if (!RECRUIT_CRM_API_KEY) {
      console.error('CRITICAL: RecruitCRM API Key is not available');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    const response = await fetch(`${BASE_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const hiringstages = await fetch(`${BASE_URL}/hiring-pipelines/0`, {
      headers: {
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const hiringstagesData = await hiringstages.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ data, hiringstagesData });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}