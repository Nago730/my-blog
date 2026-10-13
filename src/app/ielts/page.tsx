'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpenCheck,
  Cloud,
  History,
  Loader2,
  Moon,
  PenLine,
  Settings,
  Shuffle,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';

import { PRESET_TOPICS, type IELTSTopic } from '@/data/ielts-topics';
import {
  PART_META,
  type Chunk,
  type DrillFeedback,
  type DrillSession,
  type LensId,
  type LensIdea,
  type LensResult,
  type Mode,
  type Part,
  type PinnedIdea,
  type Scaffold,
  type TargetBand,
} from '@/lib/ielts-types';
import LensStep from './_components/LensStep';
import WriteStep from './_components/WriteStep';
import ReviewStep from './_components/ReviewStep';
import HistoryView from './_components/HistoryView';
import { assembleText, ui } from './_components/ui';

/* 기존 키(설정/테마/동기화 코드)는 그대로 재사용 */
const KEY = {
  drills: 'ielts_drills_v1',
  settings: 'ielts_practice_settings_v1',
  theme: 'ielts_theme_mode',
  uid: 'ielts_sync_user_id_v1',
  band: 'ielts_target_band_v1',
  draft: 'ielts_gym_draft_v1',
};

const TASK2 = PRESET_TOPICS.filter((t) => t.taskType === 'task2');
const NEXT_PART: Partial<Record<Part, Part>> = { intro: 'body', body: 'conclusion', conclusion: 'full' };
type Step = 1 | 2 | 3;

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
  if (!data.success) throw new Error(data.error || '요청 실패');
  return data as T;
}

export default function IELTSWritingGym() {
  /* ---------- 환경 ---------- */
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [targetBand, setTargetBand] = useState<TargetBand>('6.0');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [userId, setUserId] = useState('jun');
  const [view, setView] = useState<'gym' | 'history'>('gym');
  const [modal, setModal] = useState<'topic' | 'settings' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* ---------- 드릴 상태 ---------- */
  const [topic, setTopic] = useState<IELTSTopic>(TASK2[0]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [lensResults, setLensResults] = useState<Partial<Record<LensId, LensResult>>>({});
  const [loadingLens, setLoadingLens] = useState<LensId | null>(null);
  const [pinned, setPinned] = useState<PinnedIdea[]>([]);
  const [focusIdeaId, setFocusIdeaId] = useState<string | null>(null);
  const [part, setPartState] = useState<Part>('intro');
  const [mode, setModeState] = useState<Mode>('frame');
  const [scaffold, setScaffold] = useState<Scaffold | null>(null);
  const [scaffoldVersion, setScaffoldVersion] = useState(0);
  const [scaffoldLoading, setScaffoldLoading] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<DrillFeedback | null>(null);
  const [submittedText, setSubmittedText] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  /* ---------- 기록 ---------- */
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [openedSession, setOpenedSession] = useState<DrillSession | null>(null);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'off'>('idle');

  const flashError = (e: unknown) => setError(e instanceof Error ? e.message : String(e));
  const flashNotice = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(null), 3500);
  };

  /* ---------- 클라우드 동기화 (drills 컬렉션) ---------- */
  const saveLocal = (list: DrillSession[]) => {
    try {
      localStorage.setItem(KEY.drills, JSON.stringify(list));
    } catch {}
  };

  const loadCloud = useCallback(async (uid: string) => {
    setSyncState('syncing');
    try {
      const res = await fetch(`/api/ielts/sessions?collection=drills&userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (!data.success) {
        setSyncState('off');
        return;
      }
      setSessions((prev) => {
        const map = new Map<string, DrillSession>();
        prev.forEach((s) => map.set(s.id, s));
        (data.sessions as DrillSession[]).forEach((s) => map.set(s.id, s));
        const merged = [...map.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        saveLocal(merged);
        return merged;
      });
      setSyncState('synced');
    } catch {
      setSyncState('off');
    }
  }, []);

  const uploadSession = (s: DrillSession) =>
    fetch('/api/ielts/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, collection: 'drills', session: s }),
    })
      .then((r) => r.json())
      .then((d) => setSyncState(d.success ? 'synced' : 'off'))
      .catch(() => setSyncState('off'));

  /* ---------- 최초 로드 ---------- */
  useEffect(() => {
    try {
      const th = localStorage.getItem(KEY.theme);
      if (th === 'dark' || th === 'light') setTheme(th);
      const b = localStorage.getItem(KEY.band);
      if (b === '6.0' || b === '7.0') setTargetBand(b);
      const s = JSON.parse(localStorage.getItem(KEY.settings) || '{}');
      if (s.apiKey) setApiKey(s.apiKey);
      if (s.model) setModel(s.model);
      const uid = localStorage.getItem(KEY.uid) || 'jun';
      setUserId(uid);
      const list = JSON.parse(localStorage.getItem(KEY.drills) || '[]');
      if (Array.isArray(list)) setSessions(list);

      const d = JSON.parse(localStorage.getItem(KEY.draft) || 'null');
      if (d?.topic) {
        setTopic(d.topic);
        setStep(d.step ?? 1);
        setLensResults(d.lensResults ?? {});
        setPinned(d.pinned ?? []);
        setFocusIdeaId(d.focusIdeaId ?? null);
        setPartState(d.part ?? 'intro');
        setModeState(d.mode ?? 'frame');
        setScaffold(d.scaffold ?? null);
        setScaffoldVersion(d.scaffoldVersion ?? 0);
        setFields(d.fields ?? {});
        setFreeText(d.freeText ?? '');
        setFeedback(d.feedback ?? null);
        setSubmittedText(d.submittedText ?? '');
        setSessionId(d.sessionId ?? null);
      }
      loadCloud(uid);
    } catch {}
    setHydrated(true);
  }, [loadCloud]);

  /* ---------- 진행 상황 자동 저장 ---------- */
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          KEY.draft,
          JSON.stringify({
            topic, step, lensResults, pinned, focusIdeaId, part, mode, scaffold, scaffoldVersion,
            fields, freeText, feedback, submittedText, sessionId,
          })
        );
      } catch {}
    }, 600);
    return () => clearTimeout(t);
  }, [hydrated, topic, step, lensResults, pinned, focusIdeaId, part, mode, scaffold, scaffoldVersion, fields, freeText, feedback, submittedText, sessionId]);

  const persistSetting = (k: 'apiKey' | 'model', v: string) => {
    const next = { apiKey, model, [k]: v };
    if (k === 'apiKey') setApiKey(v);
    else setModel(v);
    localStorage.setItem(KEY.settings, JSON.stringify(next));
  };

  const ai = { apiKey: apiKey || undefined, model: model || undefined };

  /* ---------- 주제 ---------- */
  const resetDrill = () => {
    setStep(1);
    setLensResults({});
    setPinned([]);
    setFocusIdeaId(null);
    setPartState('intro');
    setScaffold(null);
    setFields({});
    setFreeText('');
    setFeedback(null);
    setSubmittedText('');
    setSessionId(null);
  };

  const chooseTopic = (t: IELTSTopic) => {
    setTopic(t);
    resetDrill();
    setModal(null);
    setView('gym');
  };

  const aiTopic = async () => {
    setTopicLoading(true);
    try {
      const d = await post<{ topic: IELTSTopic; source: string }>('/api/ielts/topic', { taskType: 'task2', ...ai });
      chooseTopic(d.topic);
      if (d.source === 'preset') flashNotice('AI 연결이 불안정해 기출 주제를 골랐어요.');
    } catch (e) {
      flashError(e);
    } finally {
      setTopicLoading(false);
    }
  };

  /* ---------- 1단계: 렌즈 ---------- */
  const openLens = async (lens: LensId) => {
    setLoadingLens(lens);
    try {
      const d = await post<{ result: LensResult }>('/api/ielts/lens', { topic, lens, targetBand, ...ai });
      setLensResults((r) => ({ ...r, [lens]: d.result }));
    } catch (e) {
      flashError(e);
    } finally {
      setLoadingLens(null);
    }
  };

  const togglePin = (idea: LensIdea, lens: LensId) => {
    setPinned((list) =>
      list.some((p) => p.ideaEn === idea.ideaEn)
        ? list.filter((p) => p.ideaEn !== idea.ideaEn)
        : [...list, { ...idea, lens, id: `${lens}-${Date.now()}` }]
    );
  };

  /* ---------- 2단계: 쓰기 ---------- */
  const clearWriting = () => {
    setScaffold(null);
    setFields({});
    setFreeText('');
  };
  const setPart = (p: Part) => {
    if (p === part) return;
    setPartState(p);
    clearWriting();
  };
  const setMode = (m: Mode) => {
    if (m === mode) return;
    setModeState(m);
    clearWriting();
  };

  const buildScaffold = async () => {
    if (mode === 'free') return;
    setScaffoldLoading(true);
    try {
      const d = await post<{ scaffold: Scaffold; source: string; notice?: string }>('/api/ielts/scaffold', {
        topic, part, mode, targetBand, ideas: pinned, focusIdeaId, ...ai,
      });
      setScaffold(d.scaffold);
      setScaffoldVersion((v) => v + 1);
      setFields({});
      setFreeText(d.scaffold.kind === 'upgrade' ? d.scaffold.weakText : '');
      if (d.notice) flashNotice(d.notice);
    } catch (e) {
      flashError(e);
    } finally {
      setScaffoldLoading(false);
    }
  };

  const chunks: Chunk[] = useMemo(() => {
    const all = [...(scaffold?.chunks ?? []), ...Object.values(lensResults).flatMap((r) => r?.chunks ?? [])];
    const seen = new Set<string>();
    return all.filter((c) => c?.en && !seen.has(c.en.toLowerCase()) && seen.add(c.en.toLowerCase()));
  }, [scaffold, lensResults]);

  const assembled = useMemo(() => assembleText(mode, scaffold, fields, freeText), [mode, scaffold, fields, freeText]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const d = await post<{ feedback: DrillFeedback }>('/api/ielts/evaluate', {
        topic, part, mode, text: assembled, targetBand,
        originalWeakText: scaffold?.kind === 'upgrade' ? scaffold.weakText : undefined,
        ...ai,
      });
      const s: DrillSession = {
        id: `drill-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topic: { title: topic.title, prompt: topic.prompt, subType: topic.subType },
        part, mode, targetBand,
        text: assembled,
        feedback: d.feedback,
        rewriteDone: false,
      };
      const next = [s, ...sessions];
      setSessions(next);
      saveLocal(next);
      uploadSession(s);
      setFeedback(d.feedback);
      setSubmittedText(assembled);
      setSessionId(s.id);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      flashError(e);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- 3단계: 다듬기 ---------- */
  const markRewriteDone = useCallback(
    (id: string | null) => {
      if (!id) return;
      setSessions((list) => {
        const next = list.map((s) => (s.id === id ? { ...s, rewriteDone: true } : s));
        saveLocal(next);
        const updated = next.find((s) => s.id === id);
        if (updated) uploadSession(updated);
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId]
  );
  const onRewriteDone = useCallback(() => markRewriteDone(sessionId), [markRewriteDone, sessionId]);

  const goNextPart = () => {
    const n = NEXT_PART[part];
    if (!n) return;
    setPartState(n);
    clearWriting();
    setFeedback(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    saveLocal(next);
    fetch(`/api/ielts/sessions?collection=drills&userId=${encodeURIComponent(userId)}&sessionId=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
    if (openedSession?.id === id) setOpenedSession(null);
  };

  const currentRewriteDone = sessions.find((s) => s.id === sessionId)?.rewriteDone ?? false;

  /* ================================================================= */
  return (
    <div data-theme={theme === 'dark' ? 'night' : 'paper'} className="min-h-screen bg-paper text-ink transition-colors">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/ielts" onClick={() => setView('gym')} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-on-accent">
              <PenLine className="h-4 w-4" />
            </span>
            <span className="font-read text-[17px] font-semibold tracking-tight">Writing Gym</span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="mr-1 flex items-center rounded-xl border border-line bg-surface p-0.5" title="목표 밴드에 맞춰 발판·피드백 난이도가 바뀝니다">
              <span className="hidden px-2 text-[11px] text-ink-mute sm:inline">목표</span>
              {(['6.0', '7.0'] as TargetBand[]).map((b) => (
                <button
                  key={b}
                  id={`band-${b}`}
                  onClick={() => {
                    setTargetBand(b);
                    localStorage.setItem(KEY.band, b);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold transition ${
                    targetBand === b ? 'bg-accent text-on-accent' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <button
              id="nav-history"
              onClick={() => {
                setView(view === 'history' ? 'gym' : 'history');
                setOpenedSession(null);
              }}
              className={`${ui.btnGhost} ${view === 'history' ? 'bg-sunken text-ink' : ''}`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">기록</span>
            </button>
            <button
              onClick={() => {
                const t = theme === 'dark' ? 'light' : 'dark';
                setTheme(t);
                localStorage.setItem(KEY.theme, t);
              }}
              className={ui.btnGhost}
              title={theme === 'dark' ? '종이 모드' : '야간 모드'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setModal('settings')} className={ui.btnGhost} title="설정">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {view === 'history' ? (
          openedSession && openedSession.feedback ? (
            <>
              <button onClick={() => setOpenedSession(null)} className={`${ui.btnGhost} self-start`}>
                ← 기록 목록
              </button>
              <div className={`${ui.card} p-5`}>
                <span className={ui.label}>{openedSession.topic.subType ?? 'Task 2'}</span>
                <p className="mt-1 font-read text-[17px] leading-relaxed text-ink">{openedSession.topic.prompt}</p>
              </div>
              <ReviewStep
                feedback={openedSession.feedback}
                myText={openedSession.text}
                part={openedSession.part}
                targetBand={openedSession.targetBand}
                rewriteDone={openedSession.rewriteDone}
                onRewriteDone={() => markRewriteDone(openedSession.id)}
                onRetry={() => {}}
                onNextPart={null}
                onNewTopic={() => {}}
                readOnly
              />
            </>
          ) : (
            <HistoryView
              sessions={sessions}
              onOpen={setOpenedSession}
              onDelete={deleteSession}
              onStart={() => setView('gym')}
            />
          )
        ) : (
          <>
            {/* 주제 */}
            <div className={`${ui.card} p-5 sm:p-6`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-sunken px-2 py-0.5 text-[11px] font-semibold text-ink-soft">Task 2</span>
                <span className="text-xs text-ink-mute">{topic.subType}</span>
                <span className="text-xs text-ink-mute">· {topic.category}</span>
                <div className="ml-auto flex gap-1.5">
                  <button id="topic-ai" onClick={aiTopic} disabled={topicLoading} className={ui.btnGhost}>
                    {topicLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span className="hidden sm:inline">AI 새 주제</span>
                  </button>
                  <button id="topic-change" onClick={() => setModal('topic')} className={ui.btnOutline}>
                    <Shuffle className="h-4 w-4" /> 주제 바꾸기
                  </button>
                </div>
              </div>
              <h1 className="mt-3 text-base font-semibold text-ink-soft">{topic.title}</h1>
              <p className="mt-1.5 font-read text-[19px] leading-[1.75] text-ink sm:text-[20px]">{topic.prompt}</p>
            </div>

            {/* 단계 */}
            <Stepper step={step} canReview={!!feedback} onGo={setStep} part={part} />

            {step === 1 && (
              <LensStep
                results={lensResults}
                loadingLens={loadingLens}
                onOpenLens={openLens}
                pinned={pinned}
                onTogglePin={togglePin}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <WriteStep
                part={part}
                setPart={setPart}
                mode={mode}
                setMode={setMode}
                scaffold={scaffold}
                scaffoldVersion={scaffoldVersion}
                scaffoldLoading={scaffoldLoading}
                onBuild={buildScaffold}
                fields={fields}
                setField={(id, v) => setFields((f) => ({ ...f, [id]: v }))}
                freeText={freeText}
                setFreeText={setFreeText}
                pinned={pinned}
                focusIdeaId={focusIdeaId}
                setFocusIdeaId={setFocusIdeaId}
                chunks={chunks}
                targetBand={targetBand}
                assembled={assembled}
                onSubmit={submit}
                submitting={submitting}
              />
            )}

            {step === 3 && feedback && (
              <ReviewStep
                feedback={feedback}
                myText={submittedText}
                part={part}
                targetBand={targetBand}
                rewriteDone={currentRewriteDone}
                onRewriteDone={onRewriteDone}
                onRetry={() => setStep(2)}
                onNextPart={NEXT_PART[part] ? goNextPart : null}
                nextPartLabel={NEXT_PART[part] ? PART_META[NEXT_PART[part]!].label : undefined}
                onNewTopic={() => setModal('topic')}
              />
            )}
          </>
        )}
      </main>

      {/* 토스트 */}
      {(error || notice) && (
        <div className="fixed bottom-5 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2">
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              error ? 'border-bad/40 bg-bad-soft text-bad' : 'border-line bg-surface text-ink-soft'
            }`}
          >
            <span className="flex-1">{error ?? notice}</span>
            <button onClick={() => (error ? setError(null) : setNotice(null))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* 모달 */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className={`${ui.card} max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            {modal === 'topic' ? (
              <TopicPicker current={topic} onPick={chooseTopic} onClose={() => setModal(null)} />
            ) : (
              <SettingsPanel
                apiKey={apiKey}
                model={model}
                userId={userId}
                syncState={syncState}
                onSet={persistSetting}
                onApplyUser={(uid) => {
                  setUserId(uid);
                  localStorage.setItem(KEY.uid, uid);
                  loadCloud(uid);
                }}
                onUploadAll={async () => {
                  setSyncState('syncing');
                  const r = await fetch('/api/ielts/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, collection: 'drills', sessions }),
                  }).then((x) => x.json()).catch(() => ({ success: false }));
                  setSyncState(r.success ? 'synced' : 'off');
                  flashNotice(r.success ? `${sessions.length}개 기록을 클라우드에 올렸어요.` : '클라우드 연결 실패 — 기록은 이 기기에 저장돼 있어요.');
                }}
                onClose={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- 단계 표시 ---------------- */
function Stepper({ step, canReview, onGo, part }: { step: Step; canReview: boolean; onGo: (s: Step) => void; part: Part }) {
  const items: { n: Step; label: string; sub: string }[] = [
    { n: 1, label: '생각하기', sub: '렌즈로 아이디어' },
    { n: 2, label: '쓰기', sub: PART_META[part].label },
    { n: 3, label: '다듬기', sub: '피드백 · 따라 쓰기' },
  ];
  return (
    <nav className="flex items-center gap-2" aria-label="학습 단계">
      {items.map((it, i) => {
        const active = step === it.n;
        const disabled = it.n === 3 && !canReview;
        return (
          <div key={it.n} className="flex flex-1 items-center gap-2">
            <button
              id={`step-${it.n}`}
              disabled={disabled}
              onClick={() => onGo(it.n)}
              className={`flex flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-ink-mute'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active ? 'bg-accent text-on-accent' : step > it.n ? 'bg-good-soft text-good' : 'bg-sunken text-ink-mute'
                }`}
              >
                {step > it.n ? '✓' : it.n}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${active ? 'text-accent' : 'text-ink'}`}>{it.label}</span>
                <span className="hidden truncate text-xs text-ink-mute sm:block">{it.sub}</span>
              </span>
            </button>
            {i < items.length - 1 && <span className="hidden h-px w-4 bg-line sm:block" />}
          </div>
        );
      })}
    </nav>
  );
}

/* ---------------- 주제 선택 ---------------- */
function TopicPicker({ current, onPick, onClose }: { current: IELTSTopic; onPick: (t: IELTSTopic) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">주제 고르기</h2>
        <button onClick={onClose} className={ui.btnGhost}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <span className={ui.label}>기출 유형</span>
        {TASK2.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className={`rounded-xl border p-3 text-left transition ${
              current.id === t.id ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-ink-mute'
            }`}
          >
            <span className="text-xs text-ink-mute">{t.subType} · {t.category}</span>
            <span className="block text-sm font-medium text-ink">{t.title}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-line pt-4">
        <span className={ui.label}>직접 입력 (교재·기출 붙여넣기)</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목 (선택)" className={ui.input} />
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Some people believe that… To what extent do you agree or disagree?"
          className={`${ui.input} resize-none font-read text-[15px]`}
        />
        <button
          disabled={!prompt.trim()}
          onClick={() =>
            onPick({
              id: `custom-${Date.now()}`,
              taskType: 'task2',
              subType: 'Custom',
              category: 'General',
              title: title.trim() || 'My Topic',
              prompt: prompt.trim(),
              instructions: [],
              recommendedMinutes: 40,
              minWords: 250,
            })
          }
          className={`${ui.btnPrimary} self-end`}
        >
          이 주제로 시작
        </button>
      </div>
    </div>
  );
}

/* ---------------- 설정 ---------------- */
function SettingsPanel({
  apiKey,
  model,
  userId,
  syncState,
  onSet,
  onApplyUser,
  onUploadAll,
  onClose,
}: {
  apiKey: string;
  model: string;
  userId: string;
  syncState: string;
  onSet: (k: 'apiKey' | 'model', v: string) => void;
  onApplyUser: (uid: string) => void;
  onUploadAll: () => void;
  onClose: () => void;
}) {
  const [uid, setUid] = useState(userId);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">설정</h2>
        <button onClick={onClose} className={ui.btnGhost}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className={`${ui.label} flex items-center gap-1`}>
          <Cloud className="h-3 w-3" /> 기기 간 동기화 코드
        </span>
        <div className="flex gap-2">
          <input value={uid} onChange={(e) => setUid(e.target.value)} className={`${ui.input} font-mono`} placeholder="예: jun" />
          <button onClick={() => uid.trim() && onApplyUser(uid.trim())} className={ui.btnOutline}>
            불러오기
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-ink-mute">
          <span>
            상태:{' '}
            {syncState === 'synced' ? '동기화됨' : syncState === 'syncing' ? '동기화 중…' : syncState === 'off' ? '클라우드 연결 안 됨 (이 기기에만 저장)' : '대기'}
          </span>
          <button onClick={onUploadAll} className="underline-offset-2 hover:text-ink hover:underline">
            이 기기 기록 올리기
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={ui.label}>Gemini API Key (선택)</span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onSet('apiKey', e.target.value)}
          placeholder="비우면 서버 기본 키 사용"
          className={ui.input}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={ui.label}>모델</span>
        <select value={model} onChange={(e) => onSet('model', e.target.value)} className={ui.input}>
          <option value="">자동 (사용 가능한 모델로 순차 시도)</option>
          <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
          <option value="gemini-flash-latest">gemini-flash-latest</option>
          <option value="gemini-3.8-flash">gemini-3.8-flash</option>
          <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
        </select>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-sunken/60 p-3 text-xs leading-relaxed text-ink-soft">
        <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        추천 루틴: 하루 15분 — 렌즈 1개 → 서론 빈칸 → 따라 쓰기. 익숙해지면 이어 쓰기 → 고쳐 쓰기 → 백지 순으로 발판을 낮추세요.
      </p>
    </div>
  );
}
