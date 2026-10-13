import type { FrameScaffold, LensId, Part, StarterScaffold } from '@/lib/ielts-types';

/* ------------------------------------------------------------------
 * 5대 렌즈: 주제를 바라보는 관점. 막히면 렌즈 하나를 끼고 질문에 답하면 된다.
 * ------------------------------------------------------------------ */
export const LENSES: { id: LensId; label: string; en: string; color: string; questionKo: string }[] = [
  { id: 'money', label: '돈·경제', en: 'Money', color: '#b07a1f', questionKo: '비용이 줄거나 늘어나나? 일자리·이익엔?' },
  { id: 'time', label: '시간·효율', en: 'Time', color: '#2b74b0', questionKo: '시간이 절약되나? 생산성은?' },
  { id: 'health', label: '건강·심리', en: 'Health', color: '#bb4561', questionKo: '몸과 마음, 스트레스엔 어떤 영향?' },
  { id: 'social', label: '사회·관계', en: 'Society', color: '#7559bd', questionKo: '가족·공동체·불평등엔 어떤 변화?' },
  { id: 'environment', label: '환경', en: 'Environment', color: '#2f8a58', questionKo: '탄소·쓰레기·자원엔 어떤 영향?' },
];

export const lensById = (id: LensId) => LENSES.find((l) => l.id === id)!;

/* ------------------------------------------------------------------
 * AI 호출 실패 시에도 연습이 끊기지 않도록 쓰는 범용 발판
 * ------------------------------------------------------------------ */
const T = (v: string) => ({ t: 'text' as const, v });
const B = (id: string, hintKo: string, example: string) => ({ t: 'blank' as const, id, hintKo, example });
const BR = { t: 'break' as const };

const INTRO = [
  T('It is often argued that '),
  B('i1', '문제 지문을 내 말로 바꿔 쓰기', 'working from home is better than working in an office'),
  T('. In my opinion, '),
  B('i2', '내 입장 (찬성/반대/부분 동의)', 'this trend brings more benefits than drawbacks'),
  T(' because '),
  B('i3', '이유 1 (짧게)', 'it saves time'),
  T(' and '),
  B('i4', '이유 2 (짧게)', 'it reduces stress'),
  T('.'),
];

const body = (p: string, opener: string) => [
  T(`${opener} `),
  B(`${p}1`, '이 문단의 핵심 주장 (주제문)', 'remote work allows employees to save a great deal of time'),
  T('. This is mainly because '),
  B(`${p}2`, '왜 그런지 이유 설명', 'they no longer need to commute for hours every day'),
  T('. For example, '),
  B(`${p}3`, '구체적인 예시나 상황', 'an office worker in Seoul can spend up to two hours on the subway'),
  T('. As a result, '),
  B(`${p}4`, '그래서 생기는 결과', 'they have more energy to focus on their tasks'),
  T('.'),
];

const CONCLUSION = [
  T('In conclusion, I believe that '),
  B('c1', '내 입장 다시 말하기 (서론과 다른 표현)', 'the advantages of remote work outweigh its disadvantages'),
  T('. Although '),
  B('c2', '반대 측 의견 살짝 인정', 'it may reduce face-to-face interaction'),
  T(', '),
  B('c3', '최종 메시지', 'the time and energy it saves make it a positive change'),
  T('.'),
];

export const FALLBACK_FRAMES: Record<Part, FrameScaffold> = {
  intro: { kind: 'frame', segments: INTRO, chunks: [] },
  body: { kind: 'frame', segments: body('b', 'To begin with,'), chunks: [] },
  conclusion: { kind: 'frame', segments: CONCLUSION, chunks: [] },
  full: {
    kind: 'frame',
    segments: [...INTRO, BR, ...body('b', 'To begin with,'), BR, ...body('d', 'Another key reason is that'), BR, ...CONCLUSION],
    chunks: [],
  },
};

const S = (id: string, para: number, starter: string, roleKo: string, hintKo: string) => ({ id, para, starter, roleKo, hintKo });

const INTRO_S = [
  S('s1', 0, 'It is often argued that', '지문 바꿔 말하기', '문제의 핵심 주장을 내 말로'),
  S('s2', 0, 'In my opinion,', '내 입장', '찬성/반대 + 이유 두 개를 짧게'),
];
const BODY_S = (p: number, opener: string) => [
  S(`s${p}a`, p, opener, '주제문', '이 문단의 핵심 주장 한 줄'),
  S(`s${p}b`, p, 'This is mainly because', '이유', '왜 그런지'),
  S(`s${p}c`, p, 'For example,', '예시', '구체적 상황이나 사례'),
  S(`s${p}d`, p, 'As a result,', '결과', '그래서 어떻게 되는지'),
];
const CONC_S = (p: number) => [
  S(`s${p}a`, p, 'In conclusion, I believe that', '입장 재확인', '서론과 다른 표현으로'),
  S(`s${p}b`, p, 'Although', '반대 측 인정 + 최종 메시지', '~이긴 하지만, ~이다'),
];

export const FALLBACK_STARTERS: Record<Part, StarterScaffold> = {
  intro: { kind: 'starter', lines: INTRO_S, chunks: [] },
  body: { kind: 'starter', lines: BODY_S(0, 'To begin with,'), chunks: [] },
  conclusion: { kind: 'starter', lines: CONC_S(0), chunks: [] },
  full: {
    kind: 'starter',
    lines: [...INTRO_S, ...BODY_S(1, 'To begin with,'), ...BODY_S(2, 'Another key reason is that'), ...CONC_S(3)],
    chunks: [],
  },
};

/* 목표 밴드별 핵심 체크리스트 (사이드바에 상시 노출) */
export const BAND_CHECKLIST: Record<'6.0' | '7.0', string[]> = {
  '6.0': [
    '분량 채우기 (Task 2 = 250단어+)',
    '4문단 구조: 서론·본론·본론·결론',
    '본론마다 주장 → 이유 → 예시',
    '수일치·시제·관사(a/the) 실수 줄이기',
  ],
  '7.0': [
    '모든 본론 주장에 구체적 근거',
    'However / As a result 등 연결어를 자연스럽게',
    '주제별 짝단어(collocation) 사용',
    '복문(관계사·분사구문) 섞되 정확하게',
  ],
};
