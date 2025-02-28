import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, jobDescription } = await request.json();
    
    console.log('Analyzing resume content...');
    console.log('Resume text length:', text.length);
    console.log('Job description provided:', !!jobDescription);
    
    const systemPrompt = `You are an expert hiring manager evaluating candidates for a position. 
Analyze the candidate's information and resume against the job description and it should be strict and provide a detailed assessment in JSON format.
Your response must be valid JSON with the following structure:
{
  "score": <number between 0-100 representing match percentage>,
  "status": <string: "Consider", "Approved", or "Declined">,
  "suitable": <boolean: true if candidate is suitable, false otherwise>,
  "summary": <string: one-line summary of candidate's fit>,
  "coldEmail": <string: personalized cold email to the candidate based on their resume>
}

Base your evaluation on how well the candidate's skills, experience, and qualifications match the job requirements.`;

    console.log('Using system prompt for detailed analysis');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Job Description: ${jobDescription || "Not provided"}\n\nResume: ${text}` }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const resultJson = completion.choices[0]?.message?.content || '{"score":0,"status":"Declined","suitable":false,"summary":"Unable to analyze resume","coldEmail":""}';
    
    console.log('Analysis result received');
    
    try {
      // Parse the JSON response
      const resultObject = JSON.parse(resultJson);
      return NextResponse.json(resultObject);
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
