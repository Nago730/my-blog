import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';
import { FALLBACK_FRAMES, FALLBACK_STARTERS } from '@/data/ielts-scaffolds';
import type {
  FrameScaffold,
  Mode,
  Part,
  PinnedIdea,
  Scaffold,
  StarterScaffold,
  TargetBand,
  UpgradeScaffold,
} from '@/lib/ielts-types';

const PART_EN: Record<Part, string> = {
  intro: 'the INTRODUCTION only (2 sentences: paraphrase of the question + clear position)',
  body: 'ONE BODY PARAGRAPH only (topic sentence → reason → specific example → result)',
  conclusion: 'the CONCLUSION only (2 sentences: restate position + summary/final thought)',
  full: 'a FULL 4-paragraph essay (intro, body 1, body 2, conclusion)',
};

interface Body {
  topic: { title: string; prompt: string };
  part: Part;
  mode: Exclude<Mode, 'free'>;
  targetBand?: TargetBand;
  ideas?: PinnedIdea[];
  focusIdeaId?: string | null;
  apiKey?: string;
  model?: string;
}

export async function POST(req: Request) {
  let body: Body | null = null;
  try {
    body = (await req.json()) as Body;
    const { topic, part, mode, targetBand = '6.0', ideas = [], focusIdeaId, apiKey, model } = body;

    if (!topic?.prompt || !PART_EN[part]) {
      return NextResponse.json({ success: false, error: '요청 정보가 올바르지 않습니다.' }, { status: 400 });
    }

    const focus = ideas.find((i) => i.id === focusIdeaId) ?? ideas[0];
    const ideaText = ideas.length
      ? `The learner chose these ideas (use them; for a single body paragraph focus on: "${focus?.ideaEn}"):\n${ideas
          .map((i) => `- [${i.stance}] ${i.ideaEn}`)
          .join('\n')}`
      : 'The learner has not chosen ideas; pick the most common, easy-to-explain ideas.';

    const level =
      targetBand === '6.0'
        ? 'Target Band 6.0: simple, accurate sentences; common linking words (Firstly, Moreover, For example, As a result). Avoid rare vocabulary.'
        : 'Target Band 7.0: varied complex sentences, natural cohesion, topic-specific collocations, but still clear.';

    const common = `IELTS Writing Task 2 question: "${topic.prompt}"
Write scaffolding for ${PART_EN[part]}.
${ideaText}
${level}
Also return 5-8 "chunks": useful phrases (2-5 words) for this exact text, each with Korean meaning.`;

    let prompt = '';
    if (mode === 'frame') {
      prompt = `${common}

MODE: Fill-in-the-frame. About 60% of the text is FIXED academic sentence structure; the learner fills BLANKS that hold the core content (claims, reasons, examples). Blanks must be clause-sized content, NOT single grammar words. ${part === 'full' ? '14-18 blanks.' : '3-6 blanks.'}
Return JSON:
{
  "segments": [
    { "t": "text", "v": "In today's world, " },
    { "t": "blank", "id": "b1", "hintKo": "무엇을 써야 하는지 한국어 힌트(짧게)", "example": "a natural example answer for this blank" },
    { "t": "text", "v": " ..." },
    { "t": "break" }
  ],
  "chunks": [ { "en": "...", "ko": "..." } ]
}
Use {"t":"break"} only between paragraphs. Make sure text + blanks read as grammatical sentences (include spaces and punctuation in text segments).`;
    } else if (mode === 'starter') {
      prompt = `${common}

MODE: Sentence starters. Give the first 3-7 words of every sentence; the learner completes each sentence. ${part === 'full' ? '12-16 lines across 4 paragraphs.' : '2-5 lines.'}
Return JSON:
{
  "lines": [
    { "id": "s1", "para": 0, "starter": "It is often argued that", "roleKo": "이 문장의 역할(예: 주제문)", "hintKo": "무슨 내용을 이어 쓸지 한국어 힌트" }
  ],
  "chunks": [ { "en": "...", "ko": "..." } ]
}
"para" is the paragraph index starting at 0.`;
    } else {
      prompt = `${common}

MODE: Upgrade. Write a deliberately WEAK Band 5.0 version of this text that a Korean learner might write: correct ideas but simple/repetitive words, a few typical errors (articles, subject-verb agreement, tense), weak linking, vague example. Do NOT make it absurd.
Return JSON:
{
  "weakText": "the Band 5 text (paragraphs separated by \\n\\n)",
  "fixPointsKo": ["고칠 포인트 힌트 3-5개 (한국어, 정답은 알려주지 말고 방향만)"],
  "chunks": [ { "en": "...", "ko": "..." } ]
}`;
    }

    const raw = await callGemini(prompt, { apiKey, model, json: true, temperature: 0.5 });

    let scaffold: Scaffold;
    if (mode === 'frame') {
      const p = extractJSON<Omit<FrameScaffold, 'kind'>>(raw);
      if (!Array.isArray(p.segments) || !p.segments.some((s) => s.t === 'blank')) throw new Error('빈칸 구조 생성 실패');
      scaffold = { kind: 'frame', segments: p.segments, chunks: p.chunks ?? [] };
    } else if (mode === 'starter') {
      const p = extractJSON<Omit<StarterScaffold, 'kind'>>(raw);
      if (!Array.isArray(p.lines) || p.lines.length === 0) throw new Error('이어 쓰기 구조 생성 실패');
      scaffold = { kind: 'starter', lines: p.lines.map((l, i) => ({ ...l, id: l.id || `s${i}`, para: l.para ?? 0 })), chunks: p.chunks ?? [] };
    } else {
      const p = extractJSON<Omit<UpgradeScaffold, 'kind'>>(raw);
      if (!p.weakText) throw new Error('고쳐 쓰기 원문 생성 실패');
      scaffold = { kind: 'upgrade', weakText: p.weakText, fixPointsKo: p.fixPointsKo ?? [], chunks: p.chunks ?? [] };
    }

    return NextResponse.json({ success: true, scaffold, source: 'ai' });
  } catch (error: unknown) {
    // 빈칸/이어쓰기는 범용 템플릿으로라도 연습을 이어갈 수 있게 한다
    if (body && (body.mode === 'frame' || body.mode === 'starter') && PART_EN[body.part]) {
      const scaffold = body.mode === 'frame' ? FALLBACK_FRAMES[body.part] : FALLBACK_STARTERS[body.part];
      return NextResponse.json({
        success: true,
        scaffold,
        source: 'fallback',
        notice: 'AI 연결이 불안정해 기본 템플릿을 불러왔어요.',
      });
    }
    const message = error instanceof Error ? error.message : '발판 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
