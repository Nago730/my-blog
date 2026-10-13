'use client';

import { Check, ChevronRight, Flame, Trash2 } from 'lucide-react';
import { MODE_META, PART_META, type DrillSession } from '@/lib/ielts-types';
import { ui } from './ui';

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function streakOf(sessions: DrillSession[]) {
  const days = new Set(sessions.map((s) => dayKey(s.createdAt)));
  let n = 0;
  const cur = new Date();
  if (!days.has(dayKey(cur.toISOString()))) cur.setDate(cur.getDate() - 1); // 오늘 아직 안 했으면 어제부터
  while (days.has(dayKey(cur.toISOString()))) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

interface Props {
  sessions: DrillSession[];
  onOpen: (s: DrillSession) => void;
  onDelete: (id: string) => void;
  onStart: () => void;
}

export default function HistoryView({ sessions, onOpen, onDelete, onStart }: Props) {
  const graded = sessions.filter((s) => s.feedback);
  const recent = graded.slice(0, 5);
  const avg = recent.length ? recent.reduce((a, s) => a + (s.feedback?.band ?? 0), 0) / recent.length : 0;
  const rewriteRate = graded.length ? Math.round((graded.filter((s) => s.rewriteDone).length / graded.length) * 100) : 0;

  const groups = new Map<string, DrillSession[]>();
  sessions.forEach((s) => {
    const k = dayKey(s.createdAt);
    groups.set(k, [...(groups.get(k) ?? []), s]);
  });

  return (
    <section className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="연속 학습" value={`${streakOf(sessions)}일`} icon={<Flame className="h-4 w-4 text-mark-line" />} />
        <Stat label="완료한 드릴" value={`${graded.length}개`} />
        <Stat label="최근 5회 평균" value={avg ? avg.toFixed(1) : '—'} />
        <Stat label="따라 쓰기 완료율" value={`${rewriteRate}%`} />
      </div>

      {sessions.length === 0 ? (
        <div className={`${ui.card} flex flex-col items-center gap-3 p-12 text-center`}>
          <p className="text-sm text-ink-soft">아직 기록이 없어요. 서론 하나만 써도 1회입니다.</p>
          <button onClick={onStart} className={ui.btnPrimary}>
            첫 드릴 시작
          </button>
        </div>
      ) : (
        [...groups.entries()].map(([day, list]) => (
          <div key={day} className="flex flex-col gap-2">
            <span className={ui.label}>
              {new Date(list[0].createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
            <div className={`${ui.card} divide-y divide-line overflow-hidden`}>
              {list.map((s) => (
                <div
                  key={s.id}
                  role="button"
                  onClick={() => onOpen(s)}
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-sunken/60"
                >
                  <div className="w-12 shrink-0 text-center">
                    <span className="font-read text-xl font-semibold text-ink">
                      {s.feedback ? s.feedback.band.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded bg-accent-soft px-1.5 py-0.5 font-medium text-accent">
                        {PART_META[s.part].label}
                      </span>
                      <span className="text-ink-mute">{MODE_META[s.mode].label}</span>
                      {s.rewriteDone && (
                        <span className="inline-flex items-center gap-0.5 text-good">
                          <Check className="h-3 w-3" /> 따라쓰기
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-ink">{s.topic.title}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('이 기록을 삭제할까요?')) onDelete(s.id);
                    }}
                    className="rounded-lg p-2 text-ink-mute transition hover:bg-bad-soft hover:text-bad"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-ink-mute" />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className={`${ui.card} p-4`}>
      <span className={`${ui.label} flex items-center gap-1`}>
        {icon}
        {label}
      </span>
      <div className="mt-1 font-read text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}
