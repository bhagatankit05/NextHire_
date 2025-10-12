import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FEEDBACK_PROMPT } from "@/services/Constant";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { conversation } = await req.json();
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }
    if (!conversation) {
      return NextResponse.json({ error: 'conversation is required' }, { status: 400 });
    }

    const prompt = FEEDBACK_PROMPT.replace('{{conversation}}', String(conversation));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = completion.choices?.[0]?.message?.content || '';
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Failed to generate feedback' }, { status: 500 });
  }
}