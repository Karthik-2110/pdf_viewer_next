import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;
const BASE_URL = 'https://api.recruitcrm.io/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobSlug = searchParams.get('jobSlug');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Fetch candidate stages
    const stagesResponse = await fetch(`${BASE_URL}/hiring-pipeline`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
      }
    });
    const stagesData = await stagesResponse.json();
    console.log('Candidate Stages:', stagesData);

    // console.log('API Route Params:', { 
    //   jobSlug, 
    //   fromDate, 
    //   toDate,
    //   apiKey: RECRUIT_CRM_API_KEY ? 'PRESENT' : 'MISSING' 
    // });

    if (!jobSlug) {
      return NextResponse.json({ error: 'Job slug is required' }, { status: 400 });
    }

    if (!RECRUIT_CRM_API_KEY) {
      console.error('CRITICAL: RecruitCRM API Key is not set');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // First get the job details to ensure it exists
    const jobResponse = await fetch(`${BASE_URL}/jobs/${jobSlug}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
      }
    });

    // Log full job response details
    const jobResponseText = await jobResponse.text();
    // console.log('Job Response Status:', jobResponse.status);
    // console.log('Job Response Body:', jobResponseText);

    if (!jobResponse.ok) {
      return NextResponse.json({ 
        error: 'Job not found', 
        details: jobResponseText 
      }, { status: 404 });
    }

    // Now fetch assigned candidates for this job
    const candidatesResponse = await fetch(`${BASE_URL}/jobs/${jobSlug}/assigned-candidates`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
      }
    });

    // Log full candidates response details
    const candidatesResponseText = await candidatesResponse.text();
    // console.log('Candidates Response Status:', candidatesResponse.status);
    // console.log('Candidates Response Body:', candidatesResponseText);

    if (!candidatesResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch candidates', 
        details: candidatesResponseText 
      }, { status: 500 });
    }

    // Parse the response
    let data;
    try {
      data = JSON.parse(candidatesResponseText);
    } catch (parseError) {
      console.error('Failed to parse candidates response:', parseError);
      return NextResponse.json({ 
        error: 'Invalid response format', 
        rawResponse: candidatesResponseText 
      }, { status: 500 });
    }

    // If no candidates found, return early
    if (!data.data || data.data.length === 0) {
      console.warn('No candidates found for job slug:', jobSlug);
      return NextResponse.json({
        data: [] as any[],
        message: 'No candidates found'
      });
    }

    // Filter candidates by date range if both fromDate and toDate are provided
    let filteredCandidates = data.data;
    if (fromDate && toDate) {
      // Set the time to the start of the day for fromDate
      const fromDateTime = new Date(fromDate);
      fromDateTime.setHours(0, 0, 0, 0);

      // Set the time to the end of the day for toDate
      const toDateTime = new Date(toDate);
      toDateTime.setHours(23, 59, 59, 999);
      
      // console.log('Date Filtering Details:', {
      //   fromDate: fromDateTime.toISOString(),
      //   toDate: toDateTime.toISOString(),
      //   candidates: data.data.length
      // });

      filteredCandidates = data.data.filter((item: any) => {
        const candidateCreatedOn = new Date(item.candidate.created_on);
        
        // Detailed logging for each candidate
        // console.log('Candidate Creation Check:', {
        //   candidateId: item.candidate.id,
        //   candidateCreatedOn: candidateCreatedOn.toISOString(),
        //   fromDate: fromDateTime.toISOString(),
        //   toDate: toDateTime.toISOString(),
        //   inRange: candidateCreatedOn >= fromDateTime && candidateCreatedOn <= toDateTime
        // });

        // Inclusive range check with full day consideration
        return candidateCreatedOn >= fromDateTime && candidateCreatedOn <= toDateTime;
      });

      console.log('Filtered Candidates:', filteredCandidates.length);
    }

    // Create a new response object with filtered data
    const filteredData = {
      ...data,
      data: filteredCandidates
    };
    
    return NextResponse.json(filteredData);
  } catch (error) {
    console.error('Unexpected error fetching candidates:', error);
    return NextResponse.json({ 
      error: 'Unexpected error occurred', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Endpoint to update candidate hiring stage
// PUT https://api.recruitcrm.io/v1/candidates/{candidate}/hiring-stages/{job}
