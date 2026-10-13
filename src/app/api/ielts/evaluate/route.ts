import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';
import type { DrillFeedback, Mode, Part, TargetBand } from '@/lib/ielts-types';

const PART_EN: Record<Part, string> = {
  intro: 'an introduction paragraph',
  body: 'a single body paragraph',
  conclusion: 'a conclusion paragraph',
  full: 'a full Task 2 essay',
};

const MODE_EN: Record<Mode, string> = {
  frame: 'The learner filled blanks in a given sentence frame (the frame text was provided; judge mainly the learner-written parts and how well they fit).',
  starter: 'The learner completed sentences from given sentence starters.',
  upgrade: 'The learner rewrote a deliberately weak Band 5 text to improve it.',
  free: 'The learner wrote from a blank page.',
};

export async function POST(req: Request) {
  try {
    const { topic, part, mode, text, targetBand = '6.0', originalWeakText, apiKey, model } = (await req.json()) as {
      topic: { title: string; prompt: string };
      part: Part;
      mode: Mode;
      text: string;
      targetBand?: TargetBand;
      originalWeakText?: string;
      apiKey?: string;
      model?: string;
    };

    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    if (words < 8) {
      return NextResponse.json({ success: false, error: '조금만 더 써주세요. (최소 8단어)' }, { status: 400 });
    }

    const upTo = targetBand === '6.0' ? '6.5' : '7.5';

    const system = `You are a kind but honest IELTS Writing examiner and coach for a Korean learner whose target is Band ${targetBand}.
Focus on the FEW changes that move this learner toward Band ${targetBand}. Do not overwhelm.
All explanations in Korean. Quoted English stays in English. Output JSON only.`;

    const prompt = `Question: "${topic.prompt}"
Task: ${PART_EN[part]}. ${MODE_EN[mode]}
${originalWeakText ? `Original weak text given to the learner:\n"""${originalWeakText}"""\n` : ''}
Learner's text (${words} words):
"""
${text}
"""

Return JSON:
{
  "band": 6.0,
  "verdictKo": "한 줄 총평 (격려 + 핵심 문제 하나)",
  "goodKo": ["잘한 점 1-3개 (구체적으로)"],
  "fixes": [
    { "original": "exact phrase/sentence from learner text", "corrected": "fixed version", "whyKo": "짧은 이유", "type": "grammar|vocabulary|cohesion|idea" }
  ],
  "upgraded": "The learner's text rewritten at about Band ${upTo}: KEEP the learner's ideas, structure and as many of their words as possible; fix errors and improve only what is needed. ${targetBand === '6.0' ? 'Keep vocabulary simple and natural; no rare words.' : 'Use natural collocations and some complex sentences.'} Paragraphs separated by \\n\\n.",
  "nextStepKo": "다음 연습에서 딱 하나만 신경 쓸 것"
}
Rules:
- "band" is an indicative band for this ${part === 'full' ? 'essay' : 'part'} (0.5 steps), judged by IELTS descriptors.
- 2-5 fixes, most important first. Prefer errors that actually cost marks at Band ${targetBand}.
- "original" must be copied exactly from the learner text.`;

    const raw = await callGemini(prompt, { apiKey, model, systemInstruction: system, json: true, temperature: 0.3 });
    const parsed = extractJSON<DrillFeedback>(raw);

    const feedback: DrillFeedback = {
      band: Number(parsed.band) || 0,
      verdictKo: parsed.verdictKo ?? '',
      goodKo: Array.isArray(parsed.goodKo) ? parsed.goodKo : [],
      fixes: Array.isArray(parsed.fixes) ? parsed.fixes : [],
      upgraded: parsed.upgraded ?? '',
      nextStepKo: parsed.nextStepKo ?? '',
    };

    return NextResponse.json({ success: true, feedback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '피드백 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
