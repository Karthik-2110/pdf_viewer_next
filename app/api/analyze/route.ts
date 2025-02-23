import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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",
});

const SYSTEM_PROMPT = `You are a hiring a computer science for a developer position. 
Analyze the resume content and respond with ONLY "Yes" or "No" based on whether 
the candidate's experience and skills align with a developer role. 
Consider factors like:Proficient in R, MATLAB, C++, Advanced Proficiency in Java, Python, NodeJS, ReactJS,
Chart.js, HTML, CSS, and relevant work experience.`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 1,
    });

    const result = completion.choices[0]?.message?.content || "No";

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
