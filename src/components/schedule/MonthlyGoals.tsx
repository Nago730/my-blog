"use client";

import { MonthlyGoal, GoalCategory, GoalStatus } from "@/types/schedule";
import { Plus, Calendar as CalendarIcon, CheckCircle2, Circle, Clock, Trash2, Edit2 } from "lucide-react";

interface MonthlyGoalsProps {
  goals: MonthlyGoal[];
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onAddGoal: (type: "monthly") => void;
  onEditGoal: (goal: MonthlyGoal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleStatus: (goal: MonthlyGoal) => void;
}

const CATEGORY_MAP: Record<GoalCategory, { label: string; color: string }> = {
  career: { label: "커리어", color: "bg-blue-100 text-blue-700" },
  health: { label: "건강", color: "bg-emerald-100 text-emerald-700" },
  finance: { label: "재정", color: "bg-amber-100 text-amber-700" },
  growth: { label: "자아성장", color: "bg-purple-100 text-purple-700" },
  lifestyle: { label: "라이프스타일", color: "bg-rose-100 text-rose-700" },
};

export default function MonthlyGoals({
  goals,
  selectedYear,
  selectedMonth,
  onMonthChange,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onToggleStatus,
}: MonthlyGoalsProps) {
  const currentGoals = goals.filter((g) => g.year === selectedYear && g.month === selectedMonth);
  const completedCount = currentGoals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {selectedYear}년 {selectedMonth}월 목표 · 일정
          </h2>
          <p className="text-slate-500 text-sm">
            이번 달 주요 마일스톤 및 월간 주요 일정을 함께 관리하세요. ({completedCount}/{currentGoals.length}개 완료)
          </p>
        </div>

        <button
          onClick={() => onAddGoal("monthly")}
          className="flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>월간 목표·일정 추가</span>
        </button>
      </div>

      {/* Month Pills Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const isSelected = m === selectedMonth;
          return (
            <button
              key={m}
              onClick={() => onMonthChange(m)}
              className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all shrink-0 ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {m}월
            </button>
          );
        })}
      </div>

      {/* Goals List */}
      {currentGoals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <CalendarIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-slate-700 font-bold mb-1">{selectedMonth}월에 설정된 목표가 없습니다.</h3>
          <p className="text-slate-400 text-sm mb-6">이번 달을 내실 있게 보낼 목표를 세워 보세요!</p>
          <button
            onClick={() => onAddGoal("monthly")}
            className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors"
          >
            월간 목표 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentGoals.map((goal) => {
            const isCompleted = goal.status === "completed";
            const cat = CATEGORY_MAP[goal.category] || CATEGORY_MAP.growth;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex items-center justify-between gap-4 ${
                  isCompleted ? "border-slate-200 opacity-75" : "border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onToggleStatus(goal)}
                    className="text-slate-300 hover:text-emerald-500 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    <h4
                      className={`text-base font-bold text-slate-900 ${
                        isCompleted ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {goal.title}
                    </h4>
                    {goal.description && (
                      <p className="text-slate-500 text-xs mt-0.5">{goal.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onEditGoal(goal)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
