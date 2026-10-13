import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';
import type { LensId, LensResult, TargetBand } from '@/lib/ielts-types';

const LENS_EN: Record<LensId, string> = {
  money: 'Money & Economy (costs, savings, jobs, profit, taxes)',
  time: 'Time & Efficiency (time saved or lost, productivity, convenience)',
  health: 'Health & Wellbeing (physical health, stress, mental health)',
  social: 'Society & Relationships (family, community, inequality, culture)',
  environment: 'Environment (pollution, carbon emissions, waste, resources)',
};

export async function POST(req: Request) {
  try {
    const { topic, lens, targetBand = '6.0', apiKey, model } = (await req.json()) as {
      topic: { title: string; prompt: string };
      lens: LensId;
      targetBand?: TargetBand;
      apiKey?: string;
      model?: string;
    };

    if (!topic?.prompt || !LENS_EN[lens]) {
      return NextResponse.json({ success: false, error: '주제 또는 렌즈 정보가 올바르지 않습니다.' }, { status: 400 });
    }

    const level =
      targetBand === '6.0'
        ? 'Use simple, clear, high-frequency English (B1-B2). Ideas must be easy to explain.'
        : 'Use precise B2-C1 English with natural topic collocations.';

    const prompt = `IELTS Writing Task 2 question:
"${topic.prompt}"

Look at this question ONLY through the lens of: ${LENS_EN[lens]}.
Help a Korean learner (target Band ${targetBand}) who cannot think of ideas.
${level}

Return JSON:
{
  "ideas": [
    { "stance": "for", "ideaKo": "한 줄 아이디어(한국어)", "ideaEn": "One short English sentence stating the idea", "exampleKo": "구체적 예시 한 줄(한국어)" },
    { "stance": "for", ... },
    { "stance": "against", ... }
  ],
  "chunks": [ { "en": "useful collocation or phrase", "ko": "뜻" } ]
}
Rules: exactly 2 "for" ideas and 1-2 "against" ideas ("for" = supports the statement in the question). 5-6 chunks, each 2-5 words, directly usable in this essay. If this lens barely applies, still give the most reasonable ideas.`;

    const raw = await callGemini(prompt, { apiKey, model, json: true, temperature: 0.6 });
    const parsed = extractJSON<Omit<LensResult, 'lens'>>(raw);

    const result: LensResult = {
      lens,
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas.slice(0, 4) : [],
      chunks: Array.isArray(parsed.chunks) ? parsed.chunks.slice(0, 6) : [],
    };
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '아이디어 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
