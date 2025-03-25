import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getRecruitApiKey } from '@/utils/supabase-api';

// Removing direct reference to environment variable
// const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;

export async function POST(request: Request) {
  try {
    // Read the request body only once
    const requestData = await request.json();
    const { 
      jobDescription, 
      text, 
      jobSlug, 
      candidateSlug, 
      skills, 
      specialization, 
      salary_expectation, 
      current_salary, 
      selectedJobInfo 
    } = requestData;
    
    // Check if OpenAI API key is available
    const apiKey = process.env.NEXT_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is missing. Please provide it in your environment variables.');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }
    
    // Initialize OpenAI client with API key
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    const systemPrompt = `You are an expert hiring manager evaluating candidates for a position. 
Analyze the candidate's information and resume against the job description then understand the candidate's skills and experience.
Don't just match keywords in the job description - perform a human-level evaluation that considers context and suitability.
candidates with more than 4 grammatical errors should be rejected. consider the candidate if the have relevant educational qualifications or background and skills. make sure the candidate has relevant experience for the job.

Your response MUST be in JSON format with exactly these fields:
{
  "result": "approved" or "declined",
  "reason": "A clear and specific explanation of why the candidate was approved or declined"
}

Provide detailed reasoning for your decision that explains the specific qualifications, skills, or issues that led to your conclusion.`;


    // Prioritize selectedJobInfo.job_description_text if jobDescription is empty
    const jobDescriptionText = jobDescription?.trim() 
      ? jobDescription
      : selectedJobInfo?.job_description_text 
      ? selectedJobInfo.job_description_text 
      : "Not provided";
      
    // Log for debugging
    console.log('Using job description:', jobDescriptionText.substring(0, 100) + '...');
    
    const candidateData = { resume: text, id: candidateSlug }; // Ensure candidateData has an id property

    // Process each candidate individually with a delay for thorough evaluation
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'user', content: `${systemPrompt} Job Description: ${jobDescriptionText} Candidate Data: ${JSON.stringify(candidateData)} ${skills} ${specialization} ${salary_expectation} ${current_salary}` }
      ],
      model: "gpt-4-turbo",
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const resultJson = completion.choices[0]?.message?.content || '{"result": "declined"}';
    console.log(JSON.stringify(completion))
    
    // console.log('Analysis result received');
    
    try {
      // Parse the JSON response
      const resultObject = JSON.parse(resultJson);
      
      // Get the reason from the AI response or use a default message
      const reasonText = resultObject.reason || "No specific reason provided";
      
      // Fetch API key from Supabase
      const RECRUIT_CRM_API_KEY = await getRecruitApiKey();
      
      if (!RECRUIT_CRM_API_KEY) {
        console.error('CRITICAL: RecruitCRM API Key is not available');
        return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
      }
     
      if (resultObject.result === 'approved') {
        console.log('Approved', JSON.stringify(completion.choices[0].message))
        // Update candidate hiring stage to recommended
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523721,
            remark: reasonText
          })
        });
        return NextResponse.json({ 
          score: 100, 
          status: "Approved", 
          suitable: true, 
          summary: `Candidate approved: ${reasonText}`, 
          coldEmail: "" 
        });
      } else if (resultObject.result === 'declined') {
        console.log('Declined', JSON.stringify(completion.choices[0].message))
        // Update candidate hiring stage to rejected
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523720,
            remark: reasonText
          })
        });
        return NextResponse.json({ 
          score: 0, 
          status: "Declined", 
          suitable: false, 
          summary: `Candidate declined: ${reasonText}`, 
          coldEmail: "" 
        });
      } else {
        return NextResponse.json({ 
          score: 0, 
          status: "Declined", 
          suitable: false, 
          summary: "Error analyzing resume: Unrecognized result", 
          coldEmail: "" 
        });
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json({
        score: 0,
        status: "Declined",
        suitable: false,
        summary: "Error analyzing resume",
        coldEmail: ""
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
