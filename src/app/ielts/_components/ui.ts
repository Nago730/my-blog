import type { CSSProperties } from 'react';
import type { FrameScaffold, Mode, Scaffold, StarterScaffold } from '@/lib/ielts-types';

/* 공용 클래스 — 모든 색은 globals.css 토큰을 통해서만 사용 (테마 전환 일관성) */
export const ui = {
  card: 'rounded-2xl border border-line bg-surface',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent shadow-sm transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100',
  btnOutline:
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink-soft transition hover:border-ink-mute hover:text-ink disabled:opacity-40',
  btnGhost:
    'inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm text-ink-soft transition hover:bg-sunken hover:text-ink disabled:opacity-40',
  label: 'text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-mute',
  input:
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute focus:border-accent focus:outline-none',
};

/** 렌즈 색을 CSS 변수로 주입 → text-[var(--lens)] 등으로 사용 */
export const lensStyle = (color: string) => ({ '--lens': color }) as CSSProperties;
export const lensTint = 'bg-[color-mix(in_srgb,var(--lens)_10%,transparent)]';
export const lensBorder = 'border-[color-mix(in_srgb,var(--lens)_35%,transparent)]';

export const countWords = (t: string) =>
  t.replace(/_{2,}/g, ' ').trim().split(/\s+/).filter(Boolean).length;

/** 발판 + 입력값 → 제출용 영어 텍스트 */
export function assembleText(
  mode: Mode,
  scaffold: Scaffold | null,
  fields: Record<string, string>,
  freeText: string
): string {
  if (mode === 'free' || mode === 'upgrade' || !scaffold) return freeText.trim();

  if (scaffold.kind === 'frame') {
    const paras: string[] = [];
    let cur = '';
    for (const s of (scaffold as FrameScaffold).segments) {
      if (s.t === 'text') cur += s.v;
      else if (s.t === 'blank') cur += fields[s.id]?.trim() || '____';
      else {
        paras.push(cur);
        cur = '';
      }
    }
    paras.push(cur);
    return paras
      .map((p) => p.replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim())
      .filter(Boolean)
      .join('\n\n');
  }

  if (scaffold.kind === 'starter') {
    const byPara = new Map<number, string[]>();
    for (const l of (scaffold as StarterScaffold).lines) {
      const v = fields[l.id]?.trim();
      if (!v) continue;
      const arr = byPara.get(l.para) ?? [];
      arr.push(`${l.starter} ${v}`.replace(/\s+/g, ' '));
      byPara.set(l.para, arr);
    }
    return [...byPara.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, lines]) => lines.join(' '))
      .join('\n\n');
  }

  return freeText.trim();
}

/** 빈칸/줄 채움 현황 */
export function fillProgress(scaffold: Scaffold | null, fields: Record<string, string>) {
  if (!scaffold) return null;
  const ids =
    scaffold.kind === 'frame'
      ? scaffold.segments.flatMap((s) => (s.t === 'blank' ? [s.id] : []))
      : scaffold.kind === 'starter'
        ? scaffold.lines.map((l) => l.id)
        : [];
  if (!ids.length) return null;
  return { filled: ids.filter((id) => fields[id]?.trim()).length, total: ids.length };
}

/** 포커스된 입력칸(textarea / 빈칸)에 표현 블록 삽입. 성공 여부 반환 */
export function insertIntoFocused(text: string): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el || !el.closest('[data-editor-root]')) return false;
  const isField = el.tagName === 'TEXTAREA' || el.isContentEditable;
  if (!isField) return false;
  // execCommand는 네이티브 input 이벤트를 발생시켜 React onChange/onInput과 자연스럽게 연동됨
  return document.execCommand('insertText', false, text);
}
