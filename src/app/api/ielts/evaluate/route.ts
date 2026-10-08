import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';

export interface CriterionScore {
  score: number; // 0.0 - 9.0 (0.5 steps)
  comment: string;
  advice: string;
}

export interface SentenceCorrection {
  original: string;
  corrected: string;
  explanation: string;
  category: 'grammar' | 'vocabulary' | 'cohesion' | 'style';
}

export interface EvaluationResult {
  overallScore: number;
  wordCount: number;
  criteria: {
    taskResponse: CriterionScore;
    coherenceCohesion: CriterionScore;
    lexicalResource: CriterionScore;
    grammaticalRange: CriterionScore;
  };
  summary: string;
  strengths: string[];
  keyImprovements: string[];
  corrections: SentenceCorrection[];
  vocabularyUpgrades: {
    originalWordOrPhrase: string;
    advancedAlternatives: string[];
    exampleSentence: string;
  }[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, essay, taskType = 'task2', apiKey, model } = body;

    if (!essay || typeof essay !== 'string' || essay.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: '에세이 내용이 너무 짧습니다. 최소 15자 이상 작성해주세요.' },
        { status: 400 }
      );
    }

    const words = essay.trim().split(/\s+/).filter(Boolean).length;

    const systemInstruction = `You are a certified, senior British Council / IDP IELTS Writing Senior Examiner.
Evaluate the user's essay strictly according to the official IELTS Public Band Descriptors.
Be encouraging yet rigorous, accurate, and pedagogical.
All analysis and explanations should be written in Korean so the learner can easily understand, while keeping quoted terms and corrected sentences in English.
Provide your output strictly in JSON format.`;

    const promptText = `Please grade and evaluate this IELTS Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'} essay.

[TOPIC / QUESTION]
Title: ${topic.title || 'Untitled'}
Prompt: ${topic.prompt}
${topic.dataDescription ? `Data Context: ${topic.dataDescription}` : ''}
Required Minimum Words: ${taskType === 'task1' ? 150 : 250}

[CANDIDATE'S ESSAY SUBMISSION]
"""
${essay}
"""

Word Count: ${words} words.

Evaluate across the 4 official criteria with exact band scores (e.g., 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5):
1. ${taskType === 'task1' ? 'Task Achievement' : 'Task Response'} (Did it answer all parts of the prompt? Is there a clear position or overview?)
2. Coherence and Cohesion (Logical sequencing, paragraphing, cohesive devices without over-use)
3. Lexical Resource (Vocabulary range, precision, collocations, spelling errors)
4. Grammatical Range and Accuracy (Complex structures, tense consistency, punctuation, errors)

Provide a detailed JSON response matching this EXACT JSON schema:
{
  "overallScore": 6.5,
  "wordCount": ${words},
  "criteria": {
    "taskResponse": {
      "score": 6.5,
      "comment": "평가 및 분석 (한국어)",
      "advice": "개선 방향 조언 (한국어)"
    },
    "coherenceCohesion": {
      "score": 6.5,
      "comment": "논리적 전개 및 문단 구성 분석 (한국어)",
      "advice": "연결어 및 구조 개선 팁 (한국어)"
    },
    "lexicalResource": {
      "score": 6.0,
      "comment": "어휘 다양성 및 자연스러움 평가 (한국어)",
      "advice": "더 높은 밴드를 위한 어휘 팁 (한국어)"
    },
    "grammaticalRange": {
      "score": 6.5,
      "comment": "문법적 다양성 및 정확도 분석 (한국어)",
      "advice": "문법 오류 수정 및 복문 활용 조언 (한국어)"
    }
  },
  "summary": "전체 에세이에 대한 총평 (한국어)",
  "strengths": [
    "잘 작성된 점 1 (한국어)",
    "잘 작성된 점 2 (한국어)"
  ],
  "keyImprovements": [
    "우선적으로 보완해야 할 점 1 (한국어)",
    "우선적으로 보완해야 할 점 2 (한국어)"
  ],
  "corrections": [
    {
      "original": "원문 문장 (오류가 있는 문장)",
      "corrected": "자연스럽고 문법적으로 교정된 원어민/고득점 문장",
      "explanation": "수정 이유 및 문법/어휘 설명 (한국어)",
      "category": "grammar"
    }
  ],
  "vocabularyUpgrades": [
    {
      "originalWordOrPhrase": "학생이 쓴 평이한 단어 (e.g. good, bad, solve)",
      "advancedAlternatives": ["Band 8+ 수준의 세련된 대안 1", "대안 2"],
      "exampleSentence": "대안 어휘를 활용한 예문 (English)"
    }
  ]
}

Ensure the "corrections" array contains between 3 to 7 specific, actionable sentence improvements from the essay.
Do NOT enclose the JSON in extra markdown if possible.`;

    const aiResponse = await callGemini(promptText, {
      apiKey,
      model,
      systemInstruction,
      temperature: 0.3, // 일관되고 객관적인 채점
    });

    const parsedResult = extractJSON<EvaluationResult>(aiResponse);

    return NextResponse.json({
      success: true,
      evaluation: parsedResult,
    });
  } catch (error: unknown) {
    console.error('Evaluation API Error:', error);
    const message = error instanceof Error ? error.message : '채점 도중 오류가 발생했습니다.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
