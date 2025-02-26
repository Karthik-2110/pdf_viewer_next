import { NextResponse } from 'next/server';

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;
const BASE_URL = 'https://api.recruitcrm.io/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobSlug = searchParams.get('jobSlug');
    const createdOn = searchParams.get('createdOn');

    if (!jobSlug) {
      return NextResponse.json({ error: 'Job slug is required' }, { status: 400 });
    }

    // First get the job details to ensure it exists
    const jobResponse = await fetch(`${BASE_URL}/jobs/${jobSlug}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
      }
    });

    if (!jobResponse.ok) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Now fetch assigned candidates for this job
    const response = await fetch(`${BASE_URL}/jobs/${jobSlug}/assigned-candidates`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
