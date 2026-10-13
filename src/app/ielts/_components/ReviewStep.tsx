'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, Keyboard, RotateCcw, Sparkles, Target } from 'lucide-react';
import { PART_META, type DrillFeedback, type Fix, type Part, type TargetBand } from '@/lib/ielts-types';
import { ui } from './ui';

interface Props {
  feedback: DrillFeedback;
  myText: string;
  part: Part;
  targetBand: TargetBand;
  rewriteDone: boolean;
  onRewriteDone: () => void;
  onRetry: () => void;
  onNextPart: (() => void) | null;
  nextPartLabel?: string;
  onNewTopic: () => void;
  readOnly?: boolean;
}

const FIX_TYPE: Record<Fix['type'], string> = {
  grammar: '문법',
  vocabulary: '어휘',
  cohesion: '연결',
  idea: '내용',
};

export default function ReviewStep(p: Props) {
  const fb = p.feedback;
  const target = Number(p.targetBand);
  const gap = fb.band - target;

  return (
    <section className="flex flex-col gap-5">
      {/* 총평 */}
      <div className={`${ui.card} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6`}>
        <div className="flex shrink-0 items-end gap-3">
          <div className="flex flex-col">
            <span className={ui.label}>{PART_META[p.part].label} 예상 밴드</span>
            <span className="font-read text-5xl font-semibold leading-none text-ink">{fb.band.toFixed(1)}</span>
          </div>
          <span
            className={`mb-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              gap >= 0 ? 'bg-good-soft text-good' : 'bg-sunken text-ink-soft'
            }`}
          >
            {gap >= 0 ? `목표 ${p.targetBand} 달성` : `목표까지 ${Math.abs(gap).toFixed(1)}`}
          </span>
        </div>
        <div className="flex-1 border-line sm:border-l sm:pl-6">
          <p className="text-[15px] leading-relaxed text-ink">{fb.verdictKo}</p>
          {fb.goodKo.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {fb.goodKo.map((g, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink-soft">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" />
                  {g}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 핵심 교정 */}
      {fb.fixes.length > 0 && (
        <div className={`${ui.card} p-5 sm:p-6`}>
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-base font-bold text-ink">이것만 고치면 됩니다</h3>
            <span className="text-xs text-ink-mute">중요한 순서</span>
          </div>
          <ol className="flex flex-col gap-4">
            {fb.fixes.map((f, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[28px_1fr]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sunken text-xs font-bold text-ink-soft">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="font-read text-[16px] leading-relaxed">
                    <span className="rounded bg-bad-soft px-1 text-bad line-through decoration-bad/60">{f.original}</span>
                    <ArrowRight className="mx-2 inline h-3.5 w-3.5 text-ink-mute" />
                    <span className="rounded bg-good-soft px-1 text-good">{f.corrected}</span>
                  </div>
                  <p className="text-sm text-ink-soft">
                    <span className="mr-1.5 rounded border border-line px-1.5 py-px text-[10px] font-semibold text-ink-mute">
                      {FIX_TYPE[f.type] ?? f.type}
                    </span>
                    {f.whyKo}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 내 글 vs 업그레이드 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={`${ui.card} p-5`}>
          <span className={ui.label}>내가 쓴 글</span>
          <div className="mt-3 whitespace-pre-wrap font-read text-[16px] leading-[1.9] text-ink-soft">{p.myText}</div>
        </div>
        <div className={`${ui.card} border-accent/40 p-5`}>
          <span className={`${ui.label} !text-accent`}>
            <Sparkles className="mr-1 inline h-3 w-3" />내 글을 고친 버전 (Band {p.targetBand === '6.0' ? '6.5' : '7.5'} 수준)
          </span>
          <div className="mt-3 whitespace-pre-wrap font-read text-[16px] leading-[1.9] text-ink">{fb.upgraded}</div>
        </div>
      </div>

      {/* 따라 쓰기 */}
      {fb.upgraded && (
        <ShadowTyper target={fb.upgraded} done={p.rewriteDone} onDone={p.onRewriteDone} readOnly={p.readOnly} />
      )}

      {/* 다음 한 가지 */}
      {fb.nextStepKo && (
        <div className="flex items-start gap-3 rounded-2xl border border-mark-line/60 bg-mark/50 p-4">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-mark-line" />
          <div>
            <span className={ui.label}>다음 연습에서 딱 하나만</span>
            <p className="mt-0.5 text-[15px] text-ink">{fb.nextStepKo}</p>
          </div>
        </div>
      )}

      {!p.readOnly && (
        <div className="flex flex-wrap items-center gap-2 pb-6">
          <button onClick={p.onRetry} className={ui.btnOutline}>
            <RotateCcw className="h-4 w-4" /> 같은 파트 다시 쓰기
          </button>
          <button onClick={p.onNewTopic} className={ui.btnGhost}>
            새 주제
          </button>
          {p.onNextPart && (
            <button id="next-part" onClick={p.onNextPart} className={`${ui.btnPrimary} ml-auto`}>
              다음: {p.nextPartLabel} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
 * 따라 쓰기: 고친 버전을 직접 타이핑해서 손에 익힌다 (붙여넣기 금지)
 * ------------------------------------------------------------------ */
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

function ShadowTyper({
  target,
  done,
  onDone,
  readOnly,
}: {
  target: string;
  done: boolean;
  onDone: () => void;
  readOnly?: boolean;
}) {
  const [typed, setTyped] = useState('');
  const [open, setOpen] = useState(false);
  const fired = useRef(done);

  const paras = useMemo(() => target.split(/\n\s*\n/).map((p) => p.trim().split(/\s+/).filter(Boolean)), [target]);
  const flat = useMemo(() => paras.flat(), [paras]);
  const typedWords = typed.trim() ? typed.trim().split(/\s+/) : [];
  const typingCurrent = typed.length > 0 && !/\s$/.test(typed); // 마지막 단어 입력 중
  const completed = typingCurrent ? typedWords.length - 1 : typedWords.length;

  let correct = 0;
  for (let i = 0; i < Math.min(completed, flat.length); i++) if (norm(typedWords[i]) === norm(flat[i])) correct++;
  const pct = Math.round((correct / flat.length) * 100);

  useEffect(() => {
    if (!fired.current && typedWords.length >= flat.length && correct / flat.length >= 0.9) {
      fired.current = true;
      onDone();
    }
  }, [typedWords.length, flat.length, correct, onDone]);

  let gi = 0;
  return (
    <div className={`${ui.card} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center gap-3">
        <Keyboard className="h-5 w-5 text-accent" />
        <div className="flex-1">
          <h3 className="text-base font-bold text-ink">따라 쓰기로 내 것 만들기</h3>
          <p className="text-xs text-ink-mute">눈으로 읽기만 하면 남지 않아요. 고친 버전을 직접 타이핑해 보세요 (붙여넣기 불가).</p>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good">
            <Check className="h-3.5 w-3.5" /> 완료
          </span>
        ) : (
          !readOnly &&
          !open && (
            <button id="start-shadow" onClick={() => setOpen(true)} className={ui.btnOutline}>
              시작하기
            </button>
          )
        )}
      </div>

      {open && !readOnly && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl bg-paper p-4 font-read text-[17px] leading-[2]">
            {paras.map((words, pi) => (
              <p key={pi}>
                {words.map((w) => {
                  const i = gi++;
                  let cls = 'text-ink-mute/70';
                  if (i < completed) cls = norm(typedWords[i]) === norm(w) ? 'text-ink' : 'text-bad underline decoration-wavy';
                  else if (i === completed) cls = 'text-ink bg-mark rounded-sm';
                  return (
                    <span key={i} className={`${cls} transition-colors`}>
                      {w}{' '}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
          <textarea
            id="shadow-input"
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            spellCheck={false}
            placeholder="여기에 그대로 타이핑…"
            className="min-h-[140px] w-full resize-none rounded-xl border border-line bg-surface p-4 font-read text-[17px] leading-[1.9] text-ink focus:border-accent focus:outline-none [field-sizing:content]"
          />
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-mono text-xs text-ink-mute">{pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
