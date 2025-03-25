import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// @ts-ignore - TypeScript error ignore for now
import { getPendingAnalysisJobs, getAnalysisJob, updateAnalysisJobStatus } from '@/utils/analysis-jobs';
import { getRecruitApiKey } from '@/utils/supabase-api';
// @ts-ignore - TypeScript error ignore for now
import { AnalysisJob, AnalysisResult } from '@/app/types/analysis';

// Update max duration to comply with Vercel hobby plan limitations
export const maxDuration = 60; // 60 seconds maximum for hobby plan

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    // Only allow authenticated requests to this endpoint
    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract job ID if provided
    let jobId: string | null = null;
    try {
      const body = await request.json();
      jobId = body.jobId || null;
    } catch (error) {
      // If no body is provided, that's okay - we'll just process the next pending job
    }
    
    // If a specific job ID was provided, process that job
    if (jobId) {
      const job = await getAnalysisJob(jobId);
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      // Only process jobs that are in pending status
      if (job.status !== 'pending') {
        return NextResponse.json({ 
          error: `Job is already in '${job.status}' status and cannot be processed again`,
          jobId,
          status: job.status
        }, { status: 400 });
      }
      
      try {
        // Process the specific job
        await processJob(job);
        
        // Get the updated job to return the current status and result
        const updatedJob = await getAnalysisJob(jobId);
        
        return NextResponse.json({
          message: `Successfully processed job ${jobId}`,
          jobId,
          status: updatedJob?.status || 'unknown',
          result: updatedJob?.result || null
        });
      } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        return NextResponse.json({
          error: `Failed to process job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          jobId,
          status: 'failed'
        }, { status: 500 });
      }
    } 
    // Otherwise, get the next pending job
    else {
      // Get the oldest pending job
      const pendingJobs = await getPendingAnalysisJobs(1);
      
      if (pendingJobs.length === 0) {
        return NextResponse.json({ message: 'No pending jobs found' });
      }
      
      const job = pendingJobs[0];
      
      try {
        // Process the job
        await processJob(job);
        
        // Get the updated job to return the current status and result
        const updatedJob = await getAnalysisJob(job.id);
        
        return NextResponse.json({
          message: `Successfully processed job ${job.id}`,
          jobId: job.id,
          status: updatedJob?.status || 'unknown',
          result: updatedJob?.result || null
        });
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        return NextResponse.json({
          error: `Failed to process job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          jobId: job.id,
          status: 'failed'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error in job processor:', error);
    return NextResponse.json(
      { error: 'Worker process failed' },
      { status: 500 }
    );
  }
}

/**
 * Process a single analysis job
 */
async function processJob(job: AnalysisJob): Promise<void> {
  try {
    console.log(`Processing job ${job.id} for candidate ${job.candidate_slug}`);
    
    // Mark job as processing
    await updateAnalysisJobStatus(job.id, 'processing');
    
    // Check if OpenAI API key is available
    const apiKey = process.env.NEXT_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Extract necessary data from job
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
    } = job.request_data;
    
    // Define system prompt (same as original)
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
    
    // Determine job description text
    const jobDescriptionText = jobDescription?.trim() 
      ? jobDescription
      : selectedJobInfo?.job_description_text 
      ? selectedJobInfo.job_description_text 
      : "Not provided";
    
    // Truncate long text to avoid token limits
    const truncatedText = text?.length > 10000 ? text.substring(0, 10000) + "..." : text;
    const truncatedJobDesc = jobDescriptionText?.length > 2000 
      ? jobDescriptionText.substring(0, 2000) + "..." 
      : jobDescriptionText;
    
    const candidateData = { resume: truncatedText, id: candidateSlug };
    
    // Process with OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'user', 
          content: `${systemPrompt} Job Description: ${truncatedJobDesc} Candidate Data: ${JSON.stringify(candidateData)} ${skills || ''} ${specialization || ''} ${salary_expectation || ''} ${current_salary || ''}` 
        }
      ],
      model: "gpt-4-turbo",
      temperature: 0.4,
      response_format: { type: "json_object" }
    });
    
    const resultJson = completion.choices[0]?.message?.content || '{"result": "declined"}';
    
    // Parse the JSON response
    const resultObject = JSON.parse(resultJson);
    const reasonText = resultObject.reason || "No specific reason provided";
    
    // Get RecruitCRM API key
    const RECRUIT_CRM_API_KEY = await getRecruitApiKey();
    
    if (!RECRUIT_CRM_API_KEY) {
      throw new Error('RecruitCRM API Key is not available');
    }
    
    // Prepare result object
    let result: AnalysisResult;
    
    // Update candidate status in RecruitCRM API
    if (resultObject.result === 'approved') {
      // Update candidate hiring stage to recommended
      await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_id: 523721,
          remark: reasonText
        })
      });
      
      result = {
        score: 100,
        status: "Approved",
        suitable: true,
        summary: `Candidate approved: ${reasonText}`,
        coldEmail: ""
      };
    } else {
      // Update candidate hiring stage to rejected
      await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_id: 523720,
          remark: reasonText
        })
      });
      
      result = {
        score: 0,
        status: "Declined",
        suitable: false,
        summary: `Candidate declined: ${reasonText}`,
        coldEmail: ""
      };
    }
    
    // Update job as completed with result
    await updateAnalysisJobStatus(job.id, 'completed', result);
    
    console.log(`Successfully processed job ${job.id}, result: ${result.status}`);
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    
    // Mark the job as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateAnalysisJobStatus(job.id, 'failed', null, errorMessage);
    
    // Re-throw the error to be caught by the caller
    throw error;
  }
} 