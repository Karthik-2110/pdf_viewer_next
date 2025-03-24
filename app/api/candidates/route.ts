import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;
const BASE_URL = 'https://api.recruitcrm.io/v1';

interface StageData {
  status_id: number;
  label: string;
  // Add other properties as needed
}

interface StagesResponse {
  data: StageData[];
  // Add other properties as needed
}

interface CandidateData {
  data: any[];
  // Add other properties as needed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobSlug = searchParams.get('jobSlug');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const hiringStage = searchParams.get('hiringStage');

    // Define the target status IDs we want to filter by
    let targetStatusIds: number[] = [];
    
    // If hiringStage is provided, use only that status ID
    if (hiringStage) {
      targetStatusIds = [parseInt(hiringStage, 10)];
      console.log('Filtering by specific hiring stage ID:', hiringStage);
    } else {
      // Default to Assigned (1) and Applied (10) if no specific stage is requested
      targetStatusIds = [1, 10]; // 1 = Assigned, 10 = Applied
      console.log('Using default status IDs:', targetStatusIds);
    }

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
    
    if (!jobResponse.ok) {
      return NextResponse.json({ 
        error: 'Job not found', 
        details: jobResponseText 
      }, { status: 404 });
    }

    // Create an array to store all candidates from both status IDs
    let allCandidates: any[] = [];
    
    // Fetch candidates for each status ID
    for (const statusId of targetStatusIds) {
      // Build the URL with status_id as a query parameter
      const url = new URL(`${BASE_URL}/jobs/${jobSlug}/assigned-candidates`);
      url.searchParams.append('status_id', statusId.toString());
      
      console.log(`Fetching candidates with status_id ${statusId}`);
      
      const candidatesResponse = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`
        }
      });

      if (!candidatesResponse.ok) {
        console.warn(`Failed to fetch candidates with status_id ${statusId}: ${candidatesResponse.status} ${candidatesResponse.statusText}`);
        continue; // Skip to the next status ID if this one fails
      }

      const candidatesData = await candidatesResponse.json() as CandidateData;
      
      if (candidatesData.data && candidatesData.data.length > 0) {
        console.log(`Found ${candidatesData.data.length} candidates with status_id ${statusId}`);
        allCandidates = [...allCandidates, ...candidatesData.data];
      } else {
        console.log(`No candidates found with status_id ${statusId}`);
      }
    }

    console.log(`Total candidates found before date filtering: ${allCandidates.length}`);

    // If no candidates found, return early
    if (allCandidates.length === 0) {
      console.warn('No candidates found for job slug with specified status IDs:', jobSlug);
      return NextResponse.json({
        data: [] as any[],
        message: 'No candidates found'
      });
    }

    // Filter candidates by date range if both fromDate and toDate are provided
    let filteredCandidates = allCandidates;
    if (fromDate && toDate) {
      // Set the time to the start of the day for fromDate
      const fromDateTime = new Date(fromDate);
      fromDateTime.setHours(0, 0, 0, 0);

      // Set the time to the end of the day for toDate
      const toDateTime = new Date(toDate);
      toDateTime.setHours(23, 59, 59, 999);
      
      filteredCandidates = allCandidates.filter((item: any) => {
        const candidateCreatedOn = new Date(item.candidate.created_on);
        
        // Inclusive range check with full day consideration
        return candidateCreatedOn >= fromDateTime && candidateCreatedOn <= toDateTime;
      });

      console.log(`Filtered by date range: ${filteredCandidates.length} of ${allCandidates.length} candidates matched`);
    }

    // Create a response object with filtered data
    const responseData = {
      data: filteredCandidates,
      meta: {
        total: filteredCandidates.length,
        filtered_by_status: targetStatusIds,
        filtered_by_date: fromDate && toDate ? true : false,
        filtered_by_specific_stage: hiringStage ? true : false
      }
    };
    
    return NextResponse.json(responseData);
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
