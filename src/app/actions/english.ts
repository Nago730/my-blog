"use server";

import { adminDb } from "@/lib/firebase-admin";
import { IeltsFeedback, IeltsPracticeLog } from "@/types/english";

const COLLECTION_NAME = "english_practice_logs";

const DEFAULT_QUESTIONS = [
  {
    part: "Part 1" as const,
    topic: "Work & Studies",
    question: "Do you work or are you a student? Tell me about what you do.",
    questionKo: "일하고 계신가요, 아니면 학생이신가요? 당신이 하는 일에 대해 이야기해 주세요.",
  },
  {
    part: "Part 1" as const,
    topic: "Hometown",
    question: "What is the most interesting part of your hometown?",
    questionKo: "당신의 고향에서 가장 흥미로운 부분은 무엇인가요?",
  },
  {
    part: "Part 2" as const,
    topic: "Memorable Experience",
    question: "Describe a memorable journey or trip you have taken. You should say where you went, who you went with, what you did, and explain why it was memorable.",
    questionKo: "기억에 남는 여행 경험에 대해 서술하세요. 어디로 갔는지, 누구와 갔는지, 무엇을 했는지, 그리고 왜 기억에 남는지 설명해 주세요.",
  },
  {
    part: "Part 3" as const,
    topic: "Technology & Society",
    question: "How do you think artificial intelligence and automation will change the way people work in the future?",
    questionKo: "인공지능과 자동화가 향후 사람들의 일하는 방식을 어떻게 변화시킬 것이라고 생각하시나요?",
  },
];

/**
 * Gemini AI를 사용해 IELTS Band 6 목표에 맞춘 질문을 생성합니다.
 */
export async function generateIeltsQuestion(
  part: "Part 1" | "Part 2" | "Part 3",
  topic?: string
): Promise<{ question: string; questionKo: string; topic: string }> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const promptTopic = topic || "Daily Life, Hobbies, Technology, Work, Education, Environment";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an official IELTS Speaking Examiner. Generate ONE authentic IELTS Speaking question for target score Band 6.0.
Part: ${part}
Topic category: ${promptTopic}

Return ONLY valid JSON in the exact structure below, no markdown backticks or code blocks:
{
  "topic": "Topic Name",
  "question": "English question text",
  "questionKo": "한국어 번역 해석"
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        rawText = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(rawText);
        if (parsed.question && parsed.questionKo) {
          return {
            question: parsed.question,
            questionKo: parsed.questionKo,
            topic: parsed.topic || topic || "General",
          };
        }
      }
    } catch (error) {
      console.error("IELTS Question generation error:", error);
    }
  }

  // Fallback template
  const filtered = DEFAULT_QUESTIONS.filter((q) => q.part === part);
  const selected = filtered[Math.floor(Math.random() * filtered.length)] || DEFAULT_QUESTIONS[0];
  return selected;
}

/**
 * Gemini AI를 사용해 답변을 평가하고 IELTS Band 6 수치 및 세부 총괄 피드백을 생성합니다.
 */
export async function analyzeIeltsResponse(
  question: string,
  userAnswer: string
): Promise<IeltsFeedback> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert IELTS Speaking Examiner evaluating a candidate aiming for IELTS Band 6.0.
Question: "${question}"
Candidate Answer: "${userAnswer}"

Evaluate strictly and return JSON only (no markdown, no code blocks):
{
  "estimatedBand": 6.0,
  "fluencySummary": "유창성 및 연결성에 대한 한국어 피드백",
  "vocabularySummary": "어휘 사용 및 뉘앙스 한국어 피드백",
  "grammarSummary": "문법 구조 및 정확도 한국어 피드백",
  "overallSummary": "전체 총괄 종합 한국어 피드백 (강점 및 Band 6 달성을 위한 개선점)",
  "improvedAnswer": "Band 6.5 이상에 적합한 자연스럽고 완성도 높은 영어 모범 답안 예시",
  "keyVocabulary": [
    { "word": "useful expression", "meaning": "한국어 뜻" }
  ]
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        rawText = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(rawText);
        return {
          estimatedBand: parsed.estimatedBand || 6.0,
          fluencySummary: parsed.fluencySummary || "답변 연결성이 양호합니다.",
          vocabularySummary: parsed.vocabularySummary || "기본 어휘 표현이 적절하게 사용되었습니다.",
          grammarSummary: parsed.grammarSummary || "주요 문법 구문이 전반적으로 잘 전달됩니다.",
          overallSummary: parsed.overallSummary || "전반적으로 의사 전달이 명확하며 목표 점수 Band 6 수준에 부합합니다.",
          improvedAnswer: parsed.improvedAnswer || "In my opinion, I believe that...",
          keyVocabulary: parsed.keyVocabulary || [],
        };
      }
    } catch (error) {
      console.error("IELTS Feedback analysis error:", error);
    }
  }

  // Fallback feedback if API key is not configured yet
  return {
    estimatedBand: 6.0,
    fluencySummary: "대답의 흐름과 전달력이 안정적입니다.",
    vocabularySummary: "상황에 맞는 기본적인 영어 어휘가 올바르게 활용되었습니다.",
    grammarSummary: "시제 및 주어-동사 일치 등 기본 문법이 잘 지켜졌습니다.",
    overallSummary: "API 키 설정 전 기본 피드백 모드입니다. Gemini API Key를 등록하면 세부 AI 맞춤 교정이 제공됩니다.",
    improvedAnswer: `Well, speaking of ${question.slice(0, 30)}..., I would say that it plays a significant role in my daily routine because it allows me to stay organized and focused on my primary goals.`,
    keyVocabulary: [
      { word: "play a significant role", meaning: "중요한 역할을 하다" },
      { word: "stay focused on", meaning: "~에 집중하다" },
    ],
  };
}

/**
 * Firestore 연동 CRUD Actions
 */
export async function getIeltsLogs(userId: string): Promise<IeltsPracticeLog[]> {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IeltsPracticeLog[];
  } catch (error) {
    console.error("Error fetching IELTS logs:", error);
    return [];
  }
}

export async function saveIeltsLog(log: IeltsPracticeLog): Promise<{ success: boolean }> {
  try {
    if (!adminDb) return { success: false };
    await adminDb.collection(COLLECTION_NAME).doc(log.id).set(log, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving IELTS log:", error);
    return { success: false };
  }
}

export async function deleteIeltsLog(id: string): Promise<{ success: boolean }> {
  try {
    if (!adminDb) return { success: false };
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting IELTS log:", error);
    return { success: false };
  }
}
