import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';

export interface ModelAnswerResult {
  estimatedBand: number; // e.g. 8.5 or 9.0
  wordCount: number;
  fullEssay: string;
  paragraphs: {
    title: string; // e.g. 'Introduction', 'Body 1', 'Body 2', 'Conclusion'
    content: string;
    purpose: string; // 단락의 목적 및 작성 전략
  }[];
  keyVocabularies: {
    word: string;
    partOfSpeech: string;
    meaningKo: string;
    inContext: string;
  }[];
  examinerCommentary: string; // 왜 이 글이 Band 8.5~9.0인지에 대한 한국어 해설
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, taskType = 'task2', apiKey, model } = body;

    if (!topic || !topic.prompt) {
      return NextResponse.json(
        { success: false, error: '유효한 주제 정보가 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    const systemInstruction = `You are a world-class Cambridge IELTS Writing master tutor and former examiner.
Generate a benchmark Band 8.5 to 9.0 model answer for the given prompt.
Provide realistic, elegant academic vocabulary, diverse syntactic structures, and flawless coherence.
Explanations and vocabulary definitions should be in Korean so learners can easily digest them.
Return strictly valid JSON.`;

    const promptText = `Generate a Band 8.5-9.0 Model Answer for this IELTS Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'} prompt:

[TOPIC]
Title: ${topic.title || 'Untitled'}
Prompt: ${topic.prompt}
${topic.dataDescription ? `Data Points: ${topic.dataDescription}` : ''}
Target Length: ${taskType === 'task1' ? '170-200 words' : '280-340 words'}

Strictly match this JSON schema:
{
  "estimatedBand": 9.0,
  "wordCount": 310,
  "fullEssay": "The complete essay text with paragraphs separated by double newlines.",
  "paragraphs": [
    {
      "title": "Introduction",
      "content": "Paragraph text...",
      "purpose": "도입부 패러프레이징 및 명확한 주제문(Thesis Statement) 제시 전략"
    },
    {
      "title": "Body Paragraph 1",
      "content": "Paragraph text...",
      "purpose": "첫 번째 핵심 논거 및 구체적 근거/예시 전개"
    },
    {
      "title": "Body Paragraph 2",
      "content": "Paragraph text...",
      "purpose": "두 번째 핵심 논거 및 반론/심화 분석"
    },
    {
      "title": "Conclusion",
      "content": "Paragraph text...",
      "purpose": "핵심 논점 재확인 및 최종 결론 요약"
    }
  ],
  "keyVocabularies": [
    {
      "word": "catalyst",
      "partOfSpeech": "noun",
      "meaningKo": "촉매제, 기폭제",
      "inContext": "served as a catalyst for economic modernization"
    }
  ],
  "examinerCommentary": "이 에세이가 Band 9.0을 받는 이유: Coherence 전개 방식, 어휘 다양성, 복합 문장 활용의 우수성에 대한 상세 분석 (한국어)"
}`;

    const aiResponse = await callGemini(promptText, {
      apiKey,
      model,
      systemInstruction,
      temperature: 0.6,
    });

    const parsedResult = extractJSON<ModelAnswerResult>(aiResponse);

    return NextResponse.json({
      success: true,
      modelAnswer: parsedResult,
    });
  } catch (error: unknown) {
    console.error('Model Answer API Error:', error);
    const message = error instanceof Error ? error.message : '모범 답안 생성 중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
