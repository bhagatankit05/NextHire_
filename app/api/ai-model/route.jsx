import { QUESTIONS_PROMPT } from "@/services/Constant";
import { NextResponse } from "next/server";
import OpenAI from "openai";
export async function POST(req) {
    const { jobPosition, jobDescription, duration, interviewType } = await req.json();
    const FINAL_PROMPT = QUESTIONS_PROMPT.replace("{{jobTitle}}", jobPosition)
        .replace("{{jobDescription}}", jobDescription)
        .replace("{{duration}}", duration)
        .replace("{{interviewType}}", interviewType);

    try {
        const openai = new OpenAI({
            baseURL: 'https://api.openrouter.ai/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [{
                role: "user", content: FINAL_PROMPT
            }],


        })
        console.log(completion.choices[0].message);
        return NextResponse.json({ questions: completion.choices[0].message });
    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to generate interview questions" });
    }
}