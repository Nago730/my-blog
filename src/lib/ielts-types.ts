// IELTS Writing Gym 공용 타입 (API route ↔ 클라이언트 공유)

export type TargetBand = '6.0' | '7.0';
export type LensId = 'money' | 'time' | 'health' | 'social' | 'environment';
export type Part = 'intro' | 'body' | 'conclusion' | 'full';
export type Mode = 'frame' | 'starter' | 'upgrade' | 'free';

export interface TopicLite {
  title: string;
  prompt: string;
  subType?: string;
}

/* ---------- 1단계: 렌즈 브레인스토밍 ---------- */
export interface LensIdea {
  stance: 'for' | 'against';
  ideaKo: string;
  ideaEn: string;
  exampleKo: string;
}

export interface Chunk {
  en: string;
  ko: string;
}

export interface LensResult {
  lens: LensId;
  ideas: LensIdea[];
  chunks: Chunk[];
}

export interface PinnedIdea extends LensIdea {
  id: string;
  lens: LensId;
}

/* ---------- 2단계: 발판(Scaffold) ---------- */
export type FrameSegment =
  | { t: 'text'; v: string }
  | { t: 'blank'; id: string; hintKo: string; example: string }
  | { t: 'break' };

export interface FrameScaffold {
  kind: 'frame';
  segments: FrameSegment[];
  chunks: Chunk[];
}

export interface StarterLine {
  id: string;
  para: number;
  starter: string;
  roleKo: string;
  hintKo: string;
}

export interface StarterScaffold {
  kind: 'starter';
  lines: StarterLine[];
  chunks: Chunk[];
}

export interface UpgradeScaffold {
  kind: 'upgrade';
  weakText: string;
  fixPointsKo: string[];
  chunks: Chunk[];
}

export type Scaffold = FrameScaffold | StarterScaffold | UpgradeScaffold;

/* ---------- 3단계: 피드백 ---------- */
export interface Fix {
  original: string;
  corrected: string;
  whyKo: string;
  type: 'grammar' | 'vocabulary' | 'cohesion' | 'idea';
  /** 예: '서론', '본론 1', '결론' */
  location?: string;
}

export interface CriterionFeedback {
  key: 'TR' | 'CC' | 'LR' | 'GRA';
  score: number;
  strengthKo: string;
  improveKo: string;
}

export type VocabKind = 'verb' | 'collocation' | 'linker' | 'phrase';

export interface ExpressionTip {
  en: string;
  ko: string;
  example: string;
  kind?: VocabKind;
}

/** 내 표현 노트(단어장) 항목 */
export interface VocabItem {
  id: string;
  en: string;
  ko: string;
  example: string;
  kind: VocabKind;
  topicTitle: string;
  createdAt: string;
  mastered: boolean;
  /** 내가 쓴 글에서 고친 표현이면 원래 틀린 표현 */
  from?: string;
}

export interface DrillFeedback {
  band: number;
  verdictKo: string;
  goodKo: string[];
  fixes: Fix[];
  upgraded: string;
  nextStepKo: string;
  /** 신규 필드 (이전 기록에는 없을 수 있음) */
  criteria?: CriterionFeedback[];
  modelParagraph?: { label: string; text: string; whyKo: string } | null;
  expressions?: ExpressionTip[];
}

export interface DrillSession {
  id: string;
  createdAt: string;
  topic: TopicLite;
  part: Part;
  mode: Mode;
  targetBand: TargetBand;
  text: string;
  feedback: DrillFeedback | null;
  rewriteDone: boolean;
}

/* ---------- 라벨 ---------- */
export const PART_META: Record<Part, { label: string; words: [number, number]; descKo: string }> = {
  intro: { label: '서론', words: [40, 60], descKo: '주제 바꿔 말하기 + 내 입장 (2문장)' },
  body: { label: '본론 1문단', words: [80, 110], descKo: '주제문 → 이유 → 예시 → 결과' },
  conclusion: { label: '결론', words: [30, 50], descKo: '입장 재확인 + 요약 (2문장)' },
  full: { label: '에세이 전체', words: [250, 290], descKo: '4문단 완성 (실전 감각)' },
};

export const MODE_META: Record<Mode, { label: string; descKo: string }> = {
  frame: { label: '빈칸 채우기', descKo: '문장 뼈대는 주어지고, 핵심 내용만 채웁니다' },
  starter: { label: '이어 쓰기', descKo: '문장 앞부분이 주어지고, 뒷부분을 씁니다' },
  upgrade: { label: '고쳐 쓰기', descKo: 'Band 5 수준의 글을 내 손으로 업그레이드합니다' },
  free: { label: '백지', descKo: '발판 없이 처음부터 씁니다' },
};
