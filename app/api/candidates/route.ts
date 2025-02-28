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
    
    // Log the raw API response and structure
    console.log('RecruitCRM API Response Structure:', {
      dataType: typeof data,
      hasData: 'data' in data,
      dataLength: data.data ? data.data.length : 0,
      firstCandidate: data.data && data.data.length > 0 ? {
        candidateStructure: Object.keys(data.data[0].candidate || {}),
        statusStructure: Object.keys(data.data[0].status || {})
      } : 'No candidates found'
    });
    
    // Log each candidate's complete information
    if (data.data && data.data.length > 0) {
      data.data.forEach((item: any, index: number) => {
        console.log(`API Candidate ${index + 1} complete data:`, item.candidate);
        
        // Log detailed candidate information matching the expected structure
        console.log(`API Candidate ${index + 1} detailed:`, {
          id: item.candidate?.id,
          slug: item.candidate?.slug,
          first_name: item.candidate?.first_name,
          last_name: item.candidate?.last_name,
          email: item.candidate?.email,
          contact_number: item.candidate?.contact_number,
          avatar: item.candidate?.avatar,
          gender_id: item.candidate?.gender_id,
          qualification_id: item.candidate?.qualification_id,
          specialization: item.candidate?.specialization,
          work_ex_year: item.candidate?.work_ex_year,
          candidate_dob: item.candidate?.candidate_dob,
          profile_update_link_status: item.candidate?.profile_update_link_status,
          profile_update_requested_on: item.candidate?.profile_update_requested_on,
          profile_updated_on: item.candidate?.profile_updated_on,
          current_salary: item.candidate?.current_salary,
          salary_expectation: item.candidate?.salary_expectation,
          willing_to_relocate: item.candidate?.willing_to_relocate,
          current_organization: item.candidate?.current_organization,
          current_organization_slug: item.candidate?.current_organization_slug,
          current_status: item.candidate?.current_status,
          notice_period: item.candidate?.notice_period,
          currency_id: item.candidate?.currency_id,
          facebook: item.candidate?.facebook,
          twitter: item.candidate?.twitter,
          linkedin: item.candidate?.linkedin,
          github: item.candidate?.github,
          xing: item.candidate?.xing,
          created_on: item.candidate?.created_on,
          updated_on: item.candidate?.updated_on,
          created_by: item.candidate?.created_by,
          updated_by: item.candidate?.updated_by,
          owner: item.candidate?.owner,
          city: item.candidate?.city,
          locality: item.candidate?.locality,
          state: item.candidate?.state,
          country: item.candidate?.country,
          address: item.candidate?.address,
          relevant_experience: item.candidate?.relevant_experience,
          position: item.candidate?.position,
          available_from: item.candidate?.available_from,
          salary_type: item.candidate?.salary_type,
          source: item.candidate?.source,
          language_skills: item.candidate?.language_skills,
          skill: item.candidate?.skill,
          resume: item.candidate?.resume,
          resource_url: item.candidate?.resource_url,
          custom_fields: item.candidate?.custom_fields,
          candidate_summary: item.candidate?.candidate_summary,
          is_email_opted_out: item.candidate?.is_email_opted_out,
          email_opt_out_source: item.candidate?.email_opt_out_source,
          last_calllog_added_on: item.candidate?.last_calllog_added_on,
          last_calllog_added_by: item.candidate?.last_calllog_added_by,
          last_email_sent_on: item.candidate?.last_email_sent_on,
          last_email_sent_by: item.candidate?.last_email_sent_by,
          last_sms_sent_on: item.candidate?.last_sms_sent_on,
          last_sms_sent_by: item.candidate?.last_sms_sent_by,
          last_communication: item.candidate?.last_communication
        });
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
