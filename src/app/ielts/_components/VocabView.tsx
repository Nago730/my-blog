'use client';

import { useMemo, useState } from 'react';
import { Check, Eye, EyeOff, Search, Trash2 } from 'lucide-react';
import type { VocabItem, VocabKind } from '@/lib/ielts-types';
import { ui } from './ui';

export const KIND_LABEL: Record<VocabKind, string> = {
  verb: '동사',
  collocation: '연어',
  linker: '연결어',
  phrase: '구문',
};

type Filter = 'all' | VocabKind;
type Cover = 'none' | 'ko' | 'en';

interface Props {
  items: VocabItem[];
  onToggleMastered: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function VocabView({ items, onToggleMastered, onDelete }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [hideMastered, setHideMastered] = useState(false);
  const [cover, setCover] = useState<Cover>('none');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((i) => (c[i.kind] = (c[i.kind] ?? 0) + 1));
    return c;
  }, [items]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === 'all' || i.kind === filter) &&
        (!hideMastered || !i.mastered) &&
        (!q || i.en.toLowerCase().includes(q) || i.ko.includes(q) || i.example.toLowerCase().includes(q))
    );
  }, [items, filter, query, hideMastered]);

  const mastered = items.filter((i) => i.mastered).length;

  if (items.length === 0) {
    return (
      <div className={`${ui.card} flex flex-col items-center gap-2 p-12 text-center`}>
        <p className="text-sm text-ink-soft">아직 모은 표현이 없어요.</p>
        <p className="text-xs text-ink-mute">에세이를 제출해 피드백을 받으면, 쓸만한 동사·연어·연결어가 여기에 자동으로 쌓입니다.</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">내 표현 노트</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {items.length}개 모음 · 익힌 표현 <b className="text-good">{mastered}</b>개
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-mute">가리고 외우기</span>
          {(['none', 'ko', 'en'] as Cover[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                setCover(c);
                setRevealed({});
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                cover === c ? 'border-accent bg-accent-soft text-accent' : 'border-line text-ink-soft hover:border-ink-mute'
              }`}
            >
              {c === 'none' ? '끔' : c === 'ko' ? '뜻 가리기' : '영어 가리기'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'verb', 'collocation', 'linker', 'phrase'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === f ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface text-ink-soft hover:border-ink-mute'
            }`}
          >
            {f === 'all' ? '전체' : KIND_LABEL[f]} <span className="opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft">
          <input type="checkbox" checked={hideMastered} onChange={(e) => setHideMastered(e.target.checked)} />
          익힌 표현 숨기기
        </label>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색"
            className={`${ui.input} !py-1.5 pl-8 text-xs`}
          />
        </div>
      </div>

      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-mute">조건에 맞는 표현이 없어요.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((it) => {
            const open = revealed[it.id];
            const hideEn = cover === 'en' && !open;
            const hideKo = cover === 'ko' && !open;
            return (
              <div
                key={it.id}
                className={`${ui.card} flex flex-col gap-2 p-4 transition ${it.mastered ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <button
                        type="button"
                        disabled={cover === 'none'}
                        onClick={() => setRevealed((r) => ({ ...r, [it.id]: !r[it.id] }))}
                        className={`font-read text-[17px] font-semibold text-ink ${hideEn ? 'rounded bg-sunken px-6 text-transparent' : ''}`}
                      >
                        {it.en}
                      </button>
                      <span
                        className={`text-xs text-ink-mute ${hideKo ? 'rounded bg-sunken px-6 text-transparent' : ''}`}
                      >
                        {it.ko}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-line px-1.5 py-px text-[10px] font-semibold text-ink-mute">
                    {KIND_LABEL[it.kind]}
                  </span>
                </div>

                {!hideEn && it.example && (
                  <p className="font-read text-sm italic leading-relaxed text-ink-soft">{it.example}</p>
                )}
                {it.from && (
                  <p className="text-xs text-ink-mute">
                    내가 쓴 표현: <span className="text-bad line-through">{it.from}</span>
                  </p>
                )}

                <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-ink-mute">
                  <span className="truncate">{it.topicTitle}</span>
                  <span>·</span>
                  <span>{new Date(it.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                  <div className="ml-auto flex items-center gap-0.5">
                    {cover !== 'none' && (
                      <button
                        onClick={() => setRevealed((r) => ({ ...r, [it.id]: !r[it.id] }))}
                        className="rounded-lg p-1.5 hover:bg-sunken hover:text-ink"
                        title="보기/가리기"
                      >
                        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => onToggleMastered(it.id)}
                      className={`rounded-lg p-1.5 transition ${
                        it.mastered ? 'bg-good-soft text-good' : 'hover:bg-sunken hover:text-ink'
                      }`}
                      title={it.mastered ? '익힘 해제' : '익혔어요'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="rounded-lg p-1.5 hover:bg-bad-soft hover:text-bad"
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
