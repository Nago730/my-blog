'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, Focus, Lightbulb, Loader2, PanelRightClose, PanelRightOpen, Sparkles, Wand2 } from 'lucide-react';
import { BAND_CHECKLIST, lensById } from '@/data/ielts-scaffolds';
import {
  MODE_META,
  PART_META,
  type Chunk,
  type Mode,
  type Part,
  type PinnedIdea,
  type Scaffold,
  type TargetBand,
} from '@/lib/ielts-types';
import { countWords, fillProgress, insertIntoFocused, lensStyle, ui } from './ui';

interface Props {
  part: Part;
  setPart: (p: Part) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  scaffold: Scaffold | null;
  scaffoldVersion: number;
  scaffoldLoading: boolean;
  onBuild: () => void;
  fields: Record<string, string>;
  setField: (id: string, v: string) => void;
  freeText: string;
  setFreeText: (v: string) => void;
  pinned: PinnedIdea[];
  focusIdeaId: string | null;
  setFocusIdeaId: (id: string) => void;
  chunks: Chunk[];
  targetBand: TargetBand;
  assembled: string;
  onSubmit: () => void;
  submitting: boolean;
}

export default function WriteStep(p: Props) {
  const [sidebar, setSidebar] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const words = countWords(p.assembled);
  const [minW, maxW] = PART_META[p.part].words;
  const progress = fillProgress(p.scaffold, p.fields);
  const needsScaffold = p.mode !== 'free' && !p.scaffold;
  const canSubmit =
    !p.submitting && words >= 8 && (!progress || progress.filled >= Math.ceil(progress.total / 2));

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const onChunk = (c: Chunk) => {
    if (insertIntoFocused(c.en + ' ')) return;
    navigator.clipboard?.writeText(c.en).catch(() => {});
    flash('쓸 곳을 먼저 클릭하면 바로 들어가요 (지금은 복사됨)');
  };

  return (
    <section className="flex flex-col gap-5">
      {/* 파트 / 모드 선택 */}
      <div className={`${ui.card} flex flex-col gap-4 p-4 sm:p-5`}>
        <div className="flex flex-col gap-2">
          <span className={ui.label}>무엇을 쓸까요</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PART_META) as Part[]).map((k) => (
              <button
                key={k}
                id={`part-${k}`}
                onClick={() => p.setPart(k)}
                className={`rounded-xl border px-3.5 py-2 text-left transition ${
                  p.part === k ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-ink-mute'
                }`}
              >
                <div className={`text-sm font-semibold ${p.part === k ? 'text-accent' : 'text-ink'}`}>
                  {PART_META[k].label}
                  <span className="ml-1.5 text-xs font-normal text-ink-mute">
                    {PART_META[k].words[0]}–{PART_META[k].words[1]}단어
                  </span>
                </div>
                <div className="text-xs text-ink-mute">{PART_META[k].descKo}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={ui.label}>어떻게 쓸까요 (발판 높이)</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(MODE_META) as Mode[]).map((k, i) => (
              <button
                key={k}
                id={`mode-${k}`}
                onClick={() => p.setMode(k)}
                className={`relative rounded-xl border p-3 text-left transition ${
                  p.mode === k ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-ink-mute'
                }`}
              >
                {/* 발판 높이 막대: 쉬움 → 어려움 */}
                <div className="mb-2 flex gap-0.5">
                  {[0, 1, 2, 3].map((b) => (
                    <span
                      key={b}
                      className={`h-1 w-4 rounded-full ${b <= 3 - i ? (p.mode === k ? 'bg-accent' : 'bg-ink-mute/50') : 'bg-line'}`}
                    />
                  ))}
                </div>
                <div className={`text-sm font-semibold ${p.mode === k ? 'text-accent' : 'text-ink'}`}>
                  {MODE_META[k].label}
                </div>
                <div className="mt-0.5 text-xs leading-snug text-ink-mute">{MODE_META[k].descKo}</div>
              </button>
            ))}
          </div>
        </div>

        {p.part === 'body' && p.pinned.length > 1 && (
          <div className="flex flex-col gap-2">
            <span className={ui.label}>이 본론의 중심 아이디어</span>
            <div className="flex flex-wrap gap-2">
              {p.pinned.map((idea) => {
                const l = lensById(idea.lens);
                const on = (p.focusIdeaId ?? p.pinned[0].id) === idea.id;
                return (
                  <button
                    key={idea.id}
                    style={lensStyle(l.color)}
                    onClick={() => p.setFocusIdeaId(idea.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      on ? 'border-[var(--lens)] bg-[var(--lens)] text-white' : 'border-line text-ink-soft hover:border-ink-mute'
                    }`}
                  >
                    {idea.ideaKo}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 에디터 + 사이드바 */}
      <div className={`grid gap-5 ${sidebar ? 'lg:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
        <div className={`${ui.card} flex min-h-[420px] flex-col`} data-editor-root>
          {/* 에디터 헤더 */}
          <div className="flex items-center gap-3 border-b border-line px-5 py-3">
            <span className="text-sm font-semibold text-ink">
              {PART_META[p.part].label} · {MODE_META[p.mode].label}
            </span>
            {p.scaffold && p.mode !== 'free' && (
              <button onClick={p.onBuild} disabled={p.scaffoldLoading} className={`${ui.btnGhost} !px-2 !py-1 text-xs`}>
                <Wand2 className="h-3.5 w-3.5" /> 다른 발판
              </button>
            )}
            <button
              onClick={() => setSidebar((s) => !s)}
              className={`${ui.btnGhost} ml-auto !px-2 !py-1 text-xs`}
              title={sidebar ? '집중 모드 (사이드바 숨김)' : '사이드바 열기'}
            >
              {sidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              <span className="hidden sm:inline">{sidebar ? '집중 모드' : '도구 열기'}</span>
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 px-5 py-6 sm:px-8">
            {needsScaffold ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="max-w-sm text-sm text-ink-soft">
                  {p.mode === 'upgrade'
                    ? '이 주제로 일부러 어설프게 쓴 Band 5 글을 만들어 드릴게요. 직접 고쳐보세요.'
                    : '고른 아이디어를 반영한 문장 뼈대를 만들어 드릴게요.'}
                </p>
                <button id="build-scaffold" onClick={p.onBuild} disabled={p.scaffoldLoading} className={ui.btnPrimary}>
                  {p.scaffoldLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  {p.scaffoldLoading ? '만드는 중…' : '발판 만들기'}
                </button>
              </div>
            ) : p.scaffold?.kind === 'frame' && p.mode === 'frame' ? (
              <FrameEditor key={p.scaffoldVersion} scaffold={p.scaffold} fields={p.fields} setField={p.setField} />
            ) : p.scaffold?.kind === 'starter' && p.mode === 'starter' ? (
              <StarterEditor scaffold={p.scaffold} fields={p.fields} setField={p.setField} />
            ) : (
              <div className="flex flex-col gap-4">
                {p.mode === 'upgrade' && p.scaffold?.kind === 'upgrade' && (
                  <div className="rounded-xl border border-dashed border-line bg-sunken/60 p-4">
                    <span className={ui.label}>고칠 방향 힌트</span>
                    <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-soft">
                      {p.scaffold.fixPointsKo.map((f, i) => (
                        <li key={i}>· {f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <textarea
                  id="free-editor"
                  value={p.freeText}
                  onChange={(e) => p.setFreeText(e.target.value)}
                  spellCheck={false}
                  placeholder={
                    p.pinned.length
                      ? `고른 아이디어로 시작해 보세요:\n${p.pinned.map((i) => `· ${i.ideaEn}`).join('\n')}`
                      : 'Start writing here…'
                  }
                  className="min-h-[340px] w-full resize-none bg-transparent font-read text-[19px] leading-[1.95] text-ink placeholder:text-ink-mute/70 focus:outline-none [field-sizing:content]"
                />
              </div>
            )}
          </div>

          {/* 푸터: 분량 + 제출 */}
          <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3">
            <WordMeter words={words} min={minW} max={maxW} />
            {progress && (
              <span className="text-xs text-ink-mute">
                채운 칸 <b className="text-ink">{progress.filled}</b>/{progress.total}
              </span>
            )}
            <button id="submit-drill" onClick={p.onSubmit} disabled={!canSubmit} className={`${ui.btnPrimary} ml-auto`}>
              {p.submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {p.submitting ? '읽는 중…' : '피드백 받기'}
            </button>
          </div>
        </div>

        {sidebar && (
          <aside className="flex flex-col gap-4">
            {p.pinned.length > 0 && (
              <div className={`${ui.card} p-4`}>
                <span className={ui.label}>내 아이디어</span>
                <ul className="mt-2 flex flex-col gap-2">
                  {p.pinned.map((i) => {
                    const l = lensById(i.lens);
                    return (
                      <li key={i.id} style={lensStyle(l.color)} className="border-l-2 border-[var(--lens)] pl-3">
                        <p className="text-xs font-medium text-ink">{i.ideaKo}</p>
                        <p className="font-read text-sm text-ink-soft">{i.ideaEn}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className={`${ui.card} p-4`}>
              <span className={ui.label}>블록 서랍</span>
              <p className="mt-1 text-xs text-ink-mute">쓸 곳을 클릭한 뒤 블록을 누르면 커서 위치에 들어갑니다.</p>
              {p.chunks.length === 0 ? (
                <p className="mt-3 text-xs text-ink-mute">렌즈를 열거나 발판을 만들면 채워져요.</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.chunks.map((c, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onChunk(c)}
                      title={c.ko}
                      className="group rounded-lg border border-line bg-paper px-2.5 py-1.5 text-left transition hover:border-accent hover:bg-accent-soft"
                    >
                      <span className="font-read text-[14px] text-ink">{c.en}</span>
                      <span className="block text-[10px] text-ink-mute">{c.ko}</span>
                    </button>
                  ))}
                </div>
              )}
              {toast && <p className="mt-2 text-xs text-accent">{toast}</p>}
            </div>

            <div className={`${ui.card} p-4`}>
              <span className={`${ui.label} flex items-center gap-1`}>
                <Focus className="h-3 w-3" /> Band {p.targetBand} 체크리스트
              </span>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs text-ink-soft">
                {BAND_CHECKLIST[p.targetBand].map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

/* ---------------- 분량 미터 ---------------- */
function WordMeter({ words, min, max }: { words: number; min: number; max: number }) {
  const pct = Math.min(100, (words / max) * 100);
  const ok = words >= min;
  return (
    <div className="flex items-center gap-2.5">
      <span className={`font-mono text-sm font-semibold ${ok ? 'text-good' : 'text-ink'}`}>{words}</span>
      <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-sunken">
        <div className={`h-full rounded-full transition-all ${ok ? 'bg-good' : 'bg-ink-mute'}`} style={{ width: `${pct}%` }} />
        <span className="absolute top-0 h-full w-px bg-ink-mute" style={{ left: `${(min / max) * 100}%` }} />
      </div>
      <span className="text-xs text-ink-mute">
        목표 {min}–{max}
      </span>
    </div>
  );
}

/* ---------------- 빈칸 채우기 ---------------- */
function FrameEditor({
  scaffold,
  fields,
  setField,
}: {
  scaffold: Extract<Scaffold, { kind: 'frame' }>;
  fields: Record<string, string>;
  setField: (id: string, v: string) => void;
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const blanks = scaffold.segments.filter((s): s is Extract<typeof s, { t: 'blank' }> => s.t === 'blank');
  const num = (id: string) => blanks.findIndex((b) => b.id === id) + 1;

  // segments → 문단 단위로 분리
  const paras: (typeof scaffold.segments)[] = [[]];
  scaffold.segments.forEach((s) => (s.t === 'break' ? paras.push([]) : paras[paras.length - 1].push(s)));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        {paras.map((segs, pi) => (
          <p key={pi} className="font-read text-[19px] leading-[2.15] text-ink-soft">
            {segs.map((s, i) =>
              s.t === 'text' ? (
                <span key={i}>{s.v}</span>
              ) : s.t === 'blank' ? (
                <span key={s.id} className="whitespace-normal">
                  <sup className="mr-0.5 select-none font-sans text-[10px] font-bold text-mark-line">{num(s.id)}</sup>
                  <BlankField id={s.id} initial={fields[s.id] ?? ''} placeholder={s.hintKo} onChange={setField} />
                </span>
              ) : null
            )}
          </p>
        ))}
      </div>

      <div className="rounded-xl bg-sunken/60 p-4">
        <span className={`${ui.label} flex items-center gap-1`}>
          <Lightbulb className="h-3 w-3" /> 빈칸 가이드 — 막히면 예시를 열어보세요
        </span>
        <ol className="mt-2 flex flex-col gap-1.5">
          {blanks.map((b, i) => (
            <li key={b.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span className="font-bold text-mark-line">{i + 1}</span>
              <span className="text-ink-soft">{b.hintKo}</span>
              {revealed[b.id] ? (
                <span className="font-read italic text-ink-mute">e.g. {b.example}</span>
              ) : (
                <button
                  onClick={() => setRevealed((r) => ({ ...r, [b.id]: true }))}
                  className="inline-flex items-center gap-1 text-xs text-ink-mute underline-offset-2 hover:text-ink hover:underline"
                >
                  <Eye className="h-3 w-3" /> 예시
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** 문장 흐름 속에서 줄바꿈되는 인라인 입력칸 (contentEditable, 비제어) */
function BlankField({
  id,
  initial,
  placeholder,
  onChange,
}: {
  id: string;
  initial: string;
  placeholder: string;
  onChange: (id: string, v: string) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.textContent = initial;
    // 최초 마운트 시에만 초기값 주입 (이후는 사용자가 직접 편집)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={ref}
      id={`blank-${id}`}
      role="textbox"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onInput={(e) => onChange(id, e.currentTarget.textContent ?? '')}
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
      className="blank-field mx-0.5 rounded-sm border-b-2 border-mark-line bg-mark px-1.5 py-0.5 text-ink outline-none transition focus:bg-mark focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-mark-line)_30%,transparent)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
    />
  );
}

/* ---------------- 이어 쓰기 ---------------- */
function StarterEditor({
  scaffold,
  fields,
  setField,
}: {
  scaffold: Extract<Scaffold, { kind: 'starter' }>;
  fields: Record<string, string>;
  setField: (id: string, v: string) => void;
}) {
  const paras = [...new Set(scaffold.lines.map((l) => l.para))].sort((a, b) => a - b);
  return (
    <div className="flex flex-col gap-8">
      {paras.map((pi) => (
        <div key={pi} className="flex flex-col gap-4">
          {paras.length > 1 && <span className={ui.label}>문단 {pi + 1}</span>}
          {scaffold.lines
            .filter((l) => l.para === pi)
            .map((l) => (
              <div key={l.id} className="group flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-accent-soft px-1.5 py-0.5 font-medium text-accent">{l.roleKo}</span>
                  <span className="text-ink-mute">{l.hintKo}</span>
                </div>
                <div className="font-read text-[19px] leading-[1.9]">
                  <span className="text-ink-soft">{l.starter} </span>
                  <textarea
                    id={`starter-${l.id}`}
                    rows={1}
                    value={fields[l.id] ?? ''}
                    onChange={(e) => setField(l.id, e.target.value.replace(/\n/g, ' '))}
                    spellCheck={false}
                    placeholder="…"
                    className="w-full resize-none rounded-md border-b-2 border-mark-line bg-mark/60 px-2 py-1 text-ink placeholder:text-ink-mute focus:bg-mark focus:outline-none [field-sizing:content]"
                  />
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
