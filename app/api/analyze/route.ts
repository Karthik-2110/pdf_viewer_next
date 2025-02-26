import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert technical recruiter with 20 years of experience in talent evaluation. Your task is to thoroughly analyze if a candidate's profile matches the given job description.

IMPORTANT INSTRUCTIONS:
1. Analyze BOTH the candidate profile AND resume content in detail
2. Look for both explicit and implicit skill matches
3. Consider total years of experience and role relevance
4. Evaluate both technical skills and soft skills
5. Factor in career progression and achievements
6. Be objective and data-driven in your assessment

Provide your analysis in this exact JSON format:
{
  "isMatch": boolean,
  "score": number (0-100),
  "keySkillsFound": string[] (ALL relevant skills found),
  "experienceLevel": string (entry/mid/senior),
  "reason": string (detailed explanation),
  "recommendation": string (Accept/Consider/Reject),
  "additionalNotes": string (any important observations)
}

Evaluation Guidelines:
- Score 0-30: Poor match, missing critical requirements
- Score 31-60: Partial match, has some relevant skills
- Score 61-80: Good match, meets most requirements
- Score 81-100: Excellent match, exceeds requirements

BE THOROUGH AND PRECISE IN YOUR ANALYSIS.`;

interface AnalysisResult {
  isMatch: boolean;
  score: number;
  keySkillsFound: string[];
  experienceLevel: string;
  reason: string;
  recommendation: string;
  additionalNotes?: string;
}

interface AnalysisInput {
  jobDescription: string;
  candidateProfile: any; // Using any for now since we don't have the full Recruit CRM types
  resumeContent: string;
}

export async function POST(request: Request) {
  try {
    const { candidate, jobDescription } = await request.json();

    // Get resume content if available
    let resumeContent = '';
    if (candidate.resume?.file_link) {
      try {
        // First download the resume using Recruit CRM API
        const resumeResponse = await fetch(candidate.resume.file_link, {
          headers: {
            'Authorization': `Bearer ${process.env.RECRUIT_CRM_API_KEY}`,
            'Accept': 'application/pdf'
          }
        });

        if (!resumeResponse.ok) throw new Error('Failed to download resume');

        // Convert the resume to base64
        const resumeBuffer = await resumeResponse.arrayBuffer();
        const base64Resume = Buffer.from(resumeBuffer).toString('base64');

        // Process the PDF
        const pdfResponse = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pdfUrl: `data:application/pdf;base64,${base64Resume}`
          })
        });

        if (pdfResponse.ok) {
          const { text } = await pdfResponse.json();
          resumeContent = text;
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    }

    // Prepare a clean and well-formatted input for analysis
    const analysisInput: AnalysisInput = {
      jobDescription: jobDescription.trim(),
      candidateProfile: candidate,
      resumeContent: resumeContent.trim() || 'No resume content available'
    };

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Job Description:\n${analysisInput.jobDescription}\n\nCandidate Information:\n${JSON.stringify(analysisInput.candidateProfile, null, 2)}\n\nResume Content:\n${analysisInput.resumeContent}` 
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    let result: AnalysisResult;
    try {
      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from GPT');
      }

      result = JSON.parse(content);
      
      // Validate the response format
      const requiredFields = ['isMatch', 'score', 'keySkillsFound', 'experienceLevel', 'reason', 'recommendation'];
      const missingFields = requiredFields.filter(field => !(field in result));
      
      if (missingFields.length > 0) {
        throw new Error(`Invalid analysis result. Missing fields: ${missingFields.join(', ')}`);
      }

      // Ensure score is within bounds
      result.score = Math.max(0, Math.min(100, result.score));
      
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      console.error('Analysis parsing error:', errorMessage);
      result = { 
        isMatch: false, 
        score: 0, 
        keySkillsFound: [],
        experienceLevel: 'unknown',
        reason: 'Failed to parse analysis result: ' + (e instanceof Error ? e.message : 'Unknown error'),
        recommendation: 'Reject',
        additionalNotes: 'Error occurred during analysis'
      };
    }

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error analyzing resume:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to analyze resume', details: errorMessage },
      { status: 500 }
    );
  }
}
