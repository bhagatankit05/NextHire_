import { NextResponse } from "next/server";
import OpenAI from "openai";
import { QUESTIONS_PROMPT } from "@/services/Constant";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function extractQuestionsFromContent(content) {
  const text = typeof content === 'string' ? content.trim() : '';
  if (!text) return [];

  const fence = text.match(/```json\s*([\s\S]*?)```|```\s*([\s\S]*?)```/i);
  const fencedBody = fence ? (fence[1] || fence[2] || '').trim() : '';
  const candidates = [];
  if (fencedBody) candidates.push(fencedBody);
  candidates.push(text);

  for (const cand of candidates) {
    const trimmed = cand.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        if (Array.isArray(obj)) return obj;
        if (obj && Array.isArray(obj.interviewQuestions)) return obj.interviewQuestions;
      } catch {}
    }
  }

  const ivq = text.match(/interviewQuestions\s*=\s*(\[[\s\S]*?\])/i);
  if (ivq && ivq[1]) {
    try {
      const arr = JSON.parse(ivq[1]);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }

  const anyArray = text.match(/\[[\s\S]*?\]/);
  if (anyArray) {
    try {
      const arr = JSON.parse(anyArray[0]);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }

  const bullets = text.split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.startsWith('- ') || l.startsWith('* '))
    .map(l => l.replace(/^[-*]\s+/, ''))
    .filter(Boolean);
  if (bullets.length) {
    return bullets.map(line => ({ question: line, type: 'General' }));
  }

  return [];
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let jobPosition = '';
    let jobDescription = '';
    let duration = '';
    let type = [];
    const parseWarnings = [];

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      jobPosition = form.get('jobPosition') || '';
      duration = form.get('duration') || '';
      try { type = JSON.parse(form.get('type') || '[]'); } catch { type = []; }
      const file = form.get('resume');
      if (file && typeof file.arrayBuffer === 'function') {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name || '';
        if (filename.toLowerCase().endsWith('.pdf')) {
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const parsed = await pdfParse(buffer);
            jobDescription = `Resume Content:\n${parsed.text || ''}`;
          } catch (e) {
            console.error('PDF parse error:', e);
            // Fall back to general questions instead of failing hard
            parseWarnings.push('Failed to parse PDF content. Proceeding with general questions.');
            jobDescription = '';
          }
        } else if (filename.toLowerCase().endsWith('.docx')) {
          try {
            const mammoth = (await import('mammoth')).default;
            const result = await mammoth.extractRawText({ buffer });
            jobDescription = `Resume Content:\n${result.value || ''}`;
          } catch (e) {
            console.error('DOCX parse error:', e);
            // Fall back to general questions instead of failing hard
            parseWarnings.push('Failed to parse DOCX content. Proceeding with general questions.');
            jobDescription = '';
          }
        } else {
          return NextResponse.json({ error: 'Unsupported file type. Please upload .pdf or .docx' }, { status: 400 });
        }
      }
    } else {
      // Gracefully handle non-JSON content by catching parse errors
      let body = {};
      try {
        body = await req.json();
      } catch (e) {
        return NextResponse.json({ error: 'Expected JSON body. If uploading a file, use multipart/form-data.' }, { status: 400 });
      }
      jobPosition = body.jobPosition || '';
      jobDescription = body.jobDescription || '';
      duration = body.duration || '';
      type = Array.isArray(body.type) ? body.type : [];
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error: missing OPENAI_API_KEY' }, { status: 500 });
    }
    if (!jobPosition) {
      return NextResponse.json({ error: 'jobPosition is required' }, { status: 400 });
    }
    if (!jobDescription) {
      jobDescription = 'No job description provided. Generate general questions for this role.';
    }

    let FINAL_PROMPT = QUESTIONS_PROMPT
      .replace("{{jobTitle}}", jobPosition)
      .replace("{{jobDescription}}", jobDescription)
      .replace("{{duration}}", duration || '')
      .replace("{{type}}", type && type.length > 0 ? type.join(", ") : "General");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: FINAL_PROMPT }],
    });

    const reply = completion.choices?.[0]?.message?.content || '';
    const questions = extractQuestionsFromContent(reply);
    return NextResponse.json({ questions, raw: reply, warnings: parseWarnings });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: error?.message || 'Something went wrong' }, { status: 500 });
  }
}
