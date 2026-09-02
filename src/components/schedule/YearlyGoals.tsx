"use client";

import { YearlyGoal, GoalCategory, GoalStatus } from "@/types/schedule";
import { Plus, Target, CheckCircle2, Circle, Clock, Trash2, Edit2 } from "lucide-react";

interface YearlyGoalsProps {
  goals: YearlyGoal[];
  selectedYear: number;
  onYearChange: (year: number) => void;
  onAddGoal: (type: "yearly") => void;
  onEditGoal: (goal: YearlyGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const CATEGORY_MAP: Record<GoalCategory, { label: string; color: string }> = {
  career: { label: "커리어", color: "bg-blue-100 text-blue-700" },
  health: { label: "건강", color: "bg-emerald-100 text-emerald-700" },
  finance: { label: "재정", color: "bg-amber-100 text-amber-700" },
  growth: { label: "자아성장", color: "bg-purple-100 text-purple-700" },
  lifestyle: { label: "라이프스타일", color: "bg-rose-100 text-rose-700" },
};

const STATUS_MAP: Record<GoalStatus, { label: string; color: string }> = {
  todo: { label: "시작 전", color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "진행 중", color: "bg-indigo-100 text-indigo-700" },
  completed: { label: "달성 완료", color: "bg-emerald-100 text-emerald-700" },
  on_hold: { label: "보류", color: "bg-amber-100 text-amber-700" },
};

export default function YearlyGoals({
  goals,
  selectedYear,
  onYearChange,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}: YearlyGoalsProps) {
  const currentGoals = goals.filter((g) => g.year === selectedYear);
  const completedCount = currentGoals.filter((g) => g.status === "completed").length;
  const overallProgress = currentGoals.length > 0
    ? Math.round(currentGoals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / currentGoals.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header controls & Progress overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-black text-slate-900">{selectedYear}년 연간 목표 · 일정</h2>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
          </div>
          <p className="text-slate-500 text-sm">
            올해 반드시 이루고 싶은 비전과 핵심 연간 일정을 통합 관리하세요. ({completedCount}/{currentGoals.length}개 완료)
          </p>
        </div>

        <button
          onClick={() => onAddGoal("yearly")}
          className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>연간 목표·일정 추가</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm font-bold">
          <span className="text-slate-700">전체 연간 달성률</span>
          <span className="text-indigo-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {currentGoals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <Target className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-slate-700 font-bold mb-1">등록된 연간 목표가 없습니다.</h3>
          <p className="text-slate-400 text-sm mb-6">올해 이룰 새로운 목표를 추가해 보세요!</p>
          <button
            onClick={() => onAddGoal("yearly")}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors"
          >
            목표 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentGoals.map((goal) => {
            const cat = CATEGORY_MAP[goal.category] || CATEGORY_MAP.growth;
            const status = STATUS_MAP[goal.status] || STATUS_MAP.todo;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${cat.color}`}>
                      {cat.label}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${status.color}`}>
                        {status.label}
                      </span>
                      <button
                        onClick={() => onEditGoal(goal)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{goal.description}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>진행률</span>
                    <span className="text-indigo-600 font-extrabold">{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
