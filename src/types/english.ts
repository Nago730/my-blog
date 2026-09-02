export interface IeltsFeedback {
  estimatedBand: number; // e.g., 5.5, 6.0, 6.5
  fluencySummary: string; // 유창성 및 일관성 피드백
  vocabularySummary: string; // 어휘력 피드백
  grammarSummary: string; // 문법 및 정확도 피드백
  overallSummary: string; // 총괄 종합 피드백
  improvedAnswer: string; // Band 6.0~6.5 추천 모범 답안
  keyVocabulary: { word: string; meaning: string }[]; // 추천 표현/단어 목록
}

export interface IeltsPracticeLog {
  id: string;
  userId: string;
  createdAt: string;
  part: "Part 1" | "Part 2" | "Part 3";
  topic: string;
  question: string;
  questionKo: string;
  userAnswer: string;
  feedback: IeltsFeedback;
}
