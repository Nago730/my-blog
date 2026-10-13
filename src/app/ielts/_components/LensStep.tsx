'use client';

import { useState } from 'react';
import { ArrowRight, Check, Coins, Clock, HeartPulse, Leaf, Loader2, Pin, Users } from 'lucide-react';
import { LENSES, lensById } from '@/data/ielts-scaffolds';
import type { LensId, LensIdea, LensResult, PinnedIdea } from '@/lib/ielts-types';
import { lensBorder, lensStyle, lensTint, ui } from './ui';

const ICONS: Record<LensId, typeof Coins> = {
  money: Coins,
  time: Clock,
  health: HeartPulse,
  social: Users,
  environment: Leaf,
};

const MAX_PINS = 3;

interface Props {
  results: Partial<Record<LensId, LensResult>>;
  loadingLens: LensId | null;
  onOpenLens: (lens: LensId) => void;
  pinned: PinnedIdea[];
  onTogglePin: (idea: LensIdea, lens: LensId) => void;
  onNext: () => void;
}

export default function LensStep({ results, loadingLens, onOpenLens, pinned, onTogglePin, onNext }: Props) {
  const [active, setActive] = useState<LensId | null>(null);

  const open = (id: LensId) => {
    setActive(id);
    if (!results[id]) onOpenLens(id);
  };

  const activeLens = active ? lensById(active) : null;
  const activeResult = active ? results[active] : undefined;
  const isPinned = (idea: LensIdea) => pinned.some((p) => p.ideaEn === idea.ideaEn);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-ink">렌즈를 하나 끼고 주제를 바라보세요</h2>
        <p className="mt-1 text-sm text-ink-soft">
          막막할 땐 &ldquo;이게 <b>돈</b>이랑 무슨 상관이지?&rdquo;처럼 질문 하나만 던지면 됩니다. 마음에 드는 아이디어를{' '}
          <Pin className="inline h-3.5 w-3.5" /> 핀 하세요 (최대 {MAX_PINS}개).
        </p>
      </div>

      {/* 렌즈 선택 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LENSES.map((l) => {
          const Icon = ICONS[l.id];
          const selected = active === l.id;
          const done = !!results[l.id];
          return (
            <button
              key={l.id}
              id={`lens-${l.id}`}
              onClick={() => open(l.id)}
              style={lensStyle(l.color)}
              className={`group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition ${
                selected
                  ? `${lensBorder} ${lensTint} shadow-sm`
                  : 'border-line bg-surface hover:-translate-y-0.5 hover:shadow-sm'
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${lensTint} text-[var(--lens)]`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="text-sm font-semibold text-ink">{l.label}</span>
              <span className="text-xs leading-snug text-ink-mute">{l.questionKo}</span>
              {done && (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[var(--lens)]" title="아이디어 열람함" />
              )}
            </button>
          );
        })}
      </div>

      {/* 렌즈 결과 */}
      {activeLens && (
        <div style={lensStyle(activeLens.color)} className={`${ui.card} overflow-hidden`}>
          <div className={`flex items-center gap-2 border-b border-line px-5 py-3 ${lensTint}`}>
            <span className="text-sm font-semibold text-[var(--lens)]">{activeLens.label} 렌즈</span>
            <span className="text-xs text-ink-mute">— {activeLens.questionKo}</span>
          </div>

          {loadingLens === active && !activeResult ? (
            <div className="flex items-center gap-2 px-5 py-10 text-sm text-ink-mute">
              <Loader2 className="h-4 w-4 animate-spin" /> 이 렌즈로 아이디어를 찾는 중…
            </div>
          ) : activeResult ? (
            <div className="grid gap-6 p-5 lg:grid-cols-[1fr_240px]">
              <div className="flex flex-col gap-4">
                {(['for', 'against'] as const).map((stance) => {
                  const list = activeResult.ideas.filter((i) => i.stance === stance);
                  if (!list.length) return null;
                  return (
                    <div key={stance} className="flex flex-col gap-2">
                      <span className={ui.label}>{stance === 'for' ? '찬성 쪽 근거' : '반대 쪽 근거'}</span>
                      {list.map((idea, idx) => {
                        const pinnedNow = isPinned(idea);
                        const full = !pinnedNow && pinned.length >= MAX_PINS;
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                              pinnedNow ? `${lensBorder} ${lensTint}` : 'border-line bg-paper'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-ink">{idea.ideaKo}</p>
                              <p className="mt-1 font-read text-[15px] text-ink-soft">{idea.ideaEn}</p>
                              <p className="mt-1.5 text-xs text-ink-mute">예) {idea.exampleKo}</p>
                            </div>
                            <button
                              onClick={() => onTogglePin(idea, activeLens.id)}
                              disabled={full}
                              title={full ? `최대 ${MAX_PINS}개까지` : pinnedNow ? '핀 해제' : '이 아이디어 쓰기'}
                              className={`shrink-0 rounded-lg p-2 transition disabled:opacity-30 ${
                                pinnedNow ? 'bg-[var(--lens)] text-white' : 'text-ink-mute hover:bg-sunken hover:text-ink'
                              }`}
                            >
                              {pinnedNow ? <Check className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <span className={ui.label}>이 렌즈의 표현 블록</span>
                <p className="text-xs text-ink-mute">쓰기 단계의 &lsquo;블록 서랍&rsquo;에 자동으로 담겨요.</p>
                <ul className="flex flex-col gap-1.5">
                  {activeResult.chunks.map((c, i) => (
                    <li key={i} className="rounded-lg bg-paper px-3 py-2">
                      <span className="font-read text-[15px] text-ink">{c.en}</span>
                      <span className="ml-2 text-xs text-ink-mute">{c.ko}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="px-5 py-8 text-sm text-ink-mute">
              불러오지 못했어요.{' '}
              <button className="underline" onClick={() => onOpenLens(activeLens.id)}>
                다시 시도
              </button>
            </div>
          )}
        </div>
      )}

      {/* 핀 트레이 */}
      <div className={`${ui.card} sticky bottom-4 z-10 flex flex-wrap items-center gap-3 p-3 pl-4 shadow-lg`}>
        <span className="text-sm font-semibold text-ink">
          고른 아이디어 {pinned.length}/{MAX_PINS}
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {pinned.length === 0 && <span className="text-xs text-ink-mute">아직 없어요 — 렌즈를 눌러보세요</span>}
          {pinned.map((p) => {
            const l = lensById(p.lens);
            return (
              <button
                key={p.id}
                style={lensStyle(l.color)}
                onClick={() => onTogglePin(p, p.lens)}
                title="클릭해서 핀 해제"
                className={`rounded-full border px-3 py-1 text-xs ${lensBorder} ${lensTint} text-ink hover:line-through`}
              >
                <span className="mr-1 font-semibold text-[var(--lens)]">{l.label}</span>
                {p.ideaKo}
              </button>
            );
          })}
        </div>
        <button id="lens-next" onClick={onNext} className={ui.btnPrimary}>
          {pinned.length ? '이 아이디어로 쓰기' : '아이디어 없이 쓰기'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
