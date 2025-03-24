import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;

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
    const apiKey = process.env.OPENAI_API_KEY;
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
    
    // Mock response for build time to avoid API calls
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
      // Return a mock response during build
      return NextResponse.json({
        score: 85,
        status: 'qualified',
        suitable: true,
        summary: 'This is a placeholder response.',
        coldEmail: 'This is a placeholder email template.'
      });
    }
    
    // console.log('Analyzing resume content...');
    // console.log('Resume text length:', text.length);
    // console.log('Job description provided:', !!jobDescription);
    
    const systemPrompt = `You are an expert hiring manager evaluating candidates for a position. 
Analyze the candidate's information and resume against the job description then understand the candidate's skills and experience don't just match the key words in the job description make sure you are doing more human level thinking while processing and Emphaty is important and it should be strict and reject the candidates if they have made more than 4 grammatical errors and provide a
detailed assessment in JSON format. The result should be either 'approved' or 'declined'.  just return 'approved' or 'declined' and why as a reason in a json format - this should not change and no other datas needed`;

    // console.log('Using system prompt for detailed analysis');

    const jobDescriptionText = jobDescription && selectedJobInfo?.job_description_text || "Not provided";
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
    console.log(completion)
    
    // console.log('Analysis result received');
    
    try {
      // Parse the JSON response
      const resultObject = JSON.parse(resultJson);
     
      if (resultObject.result === 'approved') {
        console.log('Approved', JSON.stringify(completion.choices[0].message))
        // Update candidate hiring stage to recommended
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523721,
            remark: 'Updated'
          })
        });
        return NextResponse.json({ score: 100, status: "Approved", suitable: true, summary: "Candidate approved by AI" });
      } else if (resultObject.result === 'declined') {
        console.log('Declined', JSON.stringify(completion.choices[0].message))
        // Update candidate hiring stage to rejected
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523720,
            remark: 'Updated'
          })
        });
        return NextResponse.json({ score: 0, status: "Declined", suitable: false, summary: "Candidate declined by AI"});
      } else {
        return NextResponse.json({ score: 0, status: "Declined", suitable: false, summary: "Error analyzing resume" });
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
