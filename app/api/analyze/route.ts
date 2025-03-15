import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RECRUIT_CRM_API_KEY = process.env.RECRUIT_CRM_API_KEY;


export async function POST(request: Request) {

//                               text: candidate.resumeText,
//                               jobDescription: jobDescription,
//                               jobSlug: selectedJob,
//                               candidateSlug: candidate.slug,
//                               skills: candidate.skills[0],
//                               specialization: candidate.specialization,
//                               salary_expectation: candidate.salary_expectation,
//                               current_salary: candidate.current_salary,
//                               selectedJobInfo: selectedJobInfo
  try {
    const { text, jobDescription, jobSlug, candidateSlug, skills, specialization, salary_expectation, current_salary, selectedJobInfo } = await request.json();
    
    // console.log('Analyzing resume content...');
    // console.log('Resume text length:', text.length);
    // console.log('Job description provided:', !!jobDescription);
    
    const systemPrompt = `You are an expert hiring manager evaluating candidates for a position. 
Analyze the candidate's information and resume against the job description and it should be strict and provide a
detailed assessment in JSON format. The result should be either 'approved' or 'declined'. no reason or no other datas
needed just return 'approved' or 'declined' in a json format - this should not change and no other datas needed`;

    // console.log('Using system prompt for detailed analysis');

    const jobDescriptionText = jobDescription || selectedJobInfo.job_description_text || "Not provided";
    const candidateData = { resume: text, id: candidateSlug }; // Ensure candidateData has an id property

    // Process each candidate individually with a delay for thorough evaluation
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'user', content: `${systemPrompt} Job Description: ${jobDescriptionText} Candidate Data: ${JSON.stringify(candidateData)} ${skills} ${specialization} ${salary_expectation} ${current_salary}` }
      ],
      model: "gpt-4-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const resultJson = completion.choices[0]?.message?.content || '{"result": "declined"}';
    console.log(completion)
    
    // console.log('Analysis result received');
    
    try {
      // Parse the JSON response
      const resultObject = JSON.parse(resultJson);
     
      if (resultObject.result === 'approved') {
        console.log( 'Approved ' + resultObject.result)
        // Update candidate hiring stage to recommended
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523721,
            remark: 'Updated'
          })
        });
        return NextResponse.json({ score: 100, status: "Approved", suitable: true, summary: "Candidate approved by AI", coldEmail: "" });
      } else if (resultObject.result === 'declined') {
        console.log( 'Declined ' + resultObject.result)
        // Update candidate hiring stage to rejected
        await fetch(`https://api.recruitcrm.io/v1/candidates/${candidateSlug}/hiring-stages/${jobSlug}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RECRUIT_CRM_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status_id: 523720,
            remark: 'Updated'
          })
        });
        return NextResponse.json({ score: 0, status: "Declined", suitable: false, summary: "Candidate declined by AI", coldEmail: "" });
      } else {
        return NextResponse.json({ score: 0, status: "Declined", suitable: false, summary: "Error analyzing resume", coldEmail: "" });
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
    return NextResponse.json({
      score: 0,
      status: "Declined",
      suitable: false,
      summary: "Error processing request",
      coldEmail: ""
    }, { status: 500 });
  }
}
