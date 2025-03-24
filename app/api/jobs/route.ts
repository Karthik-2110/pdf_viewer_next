import { NextResponse } from 'next/server';

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;
const BASE_URL = 'https://api.recruitcrm.io/v1';

export async function GET() {
  try {
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