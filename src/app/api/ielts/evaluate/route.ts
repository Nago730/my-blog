import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';
import type { CriterionFeedback, DrillFeedback, Mode, Part, TargetBand } from '@/lib/ielts-types';

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
    const isFull = part === 'full';

    const system = `You are a certified, experienced IELTS Writing examiner and a warm, specific personal coach for a Korean learner whose target is Band ${targetBand} (long-term 7.0).
Be thorough and concrete like a paid 1:1 tutor: quote the learner's own words, explain WHY in Korean, and teach reusable rules (not just fixes).
Catch EVERYTHING that matters: spelling, articles, subject-verb agreement, countability (e.g. "works" vs "work"), transitive/intransitive verbs, collocations, Korean-style literal phrasing (Konglish), vague or illogical statements, repeated linking words, thesis clarity.
All explanations in Korean. Quoted English stays in English. Output JSON only.`;

    const prompt = `Question: "${topic.prompt}"
Task: ${PART_EN[part]}. ${MODE_EN[mode]}
${originalWeakText ? `Original weak text given to the learner:\n"""${originalWeakText}"""\n` : ''}
Learner's text (${words} words):
"""
${text}
"""

Return JSON with this exact shape:
{
  "band": 6.5,
  "verdictKo": "총평 2-3문장: 격려 + 현재 수준의 근거 + 7.0으로 가기 위한 핵심 한 줄",
  "goodKo": ["구체적인 강점 2-4개 (학습자가 쓴 표현을 인용하며)"],
  "criteria": [
    { "key": "TR",  "score": 7.0, "strengthKo": "과제 수행 강점 (인용 포함)", "improveKo": "과제 수행 개선점 (구체적, 예: 서론 입장이 모호함 → 결론의 해결책을 서론에도 예고)" },
    { "key": "CC",  "score": 7.0, "strengthKo": "...", "improveKo": "... (반복된 연결어는 대체 표현 제시: 예 For example → For instance / To illustrate)" },
    { "key": "LR",  "score": 6.0, "strengthKo": "...", "improveKo": "... (직역투/부자연스러운 어휘를 짚기)" },
    { "key": "GRA", "score": 6.0, "strengthKo": "...", "improveKo": "... (반복되는 문법 오류 유형을 규칙으로 정리)" }
  ],
  "fixes": [
    { "location": "서론 | 본론 1 | 본론 2 | 결론 | 문단", "original": "exact phrase or sentence copied from learner text", "corrected": "better version", "whyKo": "왜 고쳐야 하는지 + 기억할 규칙 1줄", "type": "grammar|vocabulary|cohesion|idea" }
  ],
  "upgraded": "The learner's text rewritten at about Band ${upTo}: KEEP the learner's ideas, structure and as many of their words as possible; fix errors and improve only what is needed. ${targetBand === '6.0' ? 'Keep vocabulary simple and natural; no rare words.' : 'Use natural collocations and some complex sentences.'} Paragraphs separated by \\n\\n.",
  "modelParagraph": { "label": "${isFull ? '모범 서론' : '모범 문단'}", "text": "${isFull ? 'A model introduction (2-3 sentences) for this question that states a CLEAR position and previews the main points; build on learner\'s own ideas.' : 'A model version of this paragraph at Band 7+ that keeps the learner\'s idea.'}", "whyKo": "이 모범안이 왜 더 좋은지 2-3줄" },
  "expressions": [
    { "en": "reusable phrase for THIS topic", "ko": "뜻", "example": "one short example sentence using it for this topic" }
  ],
  "nextStepKo": "다음 연습에서 딱 하나만 신경 쓸 것 (구체적 행동)"
}
Rules:
- "band" is an indicative band for this ${isFull ? 'essay' : 'part'} (0.5 steps) based on IELTS public band descriptors. Each criterion score uses 0.5 steps; band should be consistent with the four scores.
- "fixes": ${isFull ? '6-10' : '3-6'} items, ordered by importance. Include meaning-level and Konglish problems, not only typos. If the same error type repeats, list the most instructive instances and explain the rule once in whyKo.
- "original" must be copied EXACTLY from the learner's text (shortest span that contains the problem).
- "expressions": 6-8 items, topic-specific collocations/linkers the learner can reuse (Band ${targetBand === '6.0' ? '6.5-7' : '7-8'} level), not already used by the learner.
- Do not invent errors. If a sentence is fine, leave it alone.`;

    const raw = await callGemini(prompt, { apiKey, model, systemInstruction: system, json: true, temperature: 0.3 });
    const parsed = extractJSON<DrillFeedback>(raw);

    const KEYS = ['TR', 'CC', 'LR', 'GRA'];
    const criteria: CriterionFeedback[] = Array.isArray(parsed.criteria)
      ? parsed.criteria
          .filter((c) => KEYS.includes(c?.key))
          .map((c) => ({
            key: c.key,
            score: Number(c.score) || 0,
            strengthKo: c.strengthKo ?? '',
            improveKo: c.improveKo ?? '',
          }))
      : [];

    const feedback: DrillFeedback = {
      band: Number(parsed.band) || 0,
      verdictKo: parsed.verdictKo ?? '',
      goodKo: Array.isArray(parsed.goodKo) ? parsed.goodKo : [],
      fixes: Array.isArray(parsed.fixes) ? parsed.fixes : [],
      upgraded: parsed.upgraded ?? '',
      nextStepKo: parsed.nextStepKo ?? '',
      criteria,
      modelParagraph: parsed.modelParagraph?.text ? parsed.modelParagraph : null,
      expressions: Array.isArray(parsed.expressions) ? parsed.expressions : [],
    };

    return NextResponse.json({ success: true, feedback });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '피드백 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
