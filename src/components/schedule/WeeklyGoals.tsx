"use client";

import { WeeklyGoal, GoalCategory } from "@/types/schedule";
import { Plus, CheckSquare, CheckCircle2, Circle, Trash2, Edit2 } from "lucide-react";

interface WeeklyGoalsProps {
  goals: WeeklyGoal[];
  selectedYear: number;
  selectedMonth: number;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  onAddGoal: (type: "weekly") => void;
  onEditGoal: (goal: WeeklyGoal) => void;
  onDeleteGoal: (id: string) => void;
  onToggleStatus: (goal: WeeklyGoal) => void;
}

const CATEGORY_MAP: Record<GoalCategory, { label: string; color: string }> = {
  career: { label: "커리어", color: "bg-blue-100 text-blue-700" },
  health: { label: "건강", color: "bg-emerald-100 text-emerald-700" },
  finance: { label: "재정", color: "bg-amber-100 text-amber-700" },
  growth: { label: "자아성장", color: "bg-purple-100 text-purple-700" },
  lifestyle: { label: "라이프스타일", color: "bg-rose-100 text-rose-700" },
};

export default function WeeklyGoals({
  goals,
  selectedYear,
  selectedMonth,
  selectedWeek,
  onWeekChange,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onToggleStatus,
}: WeeklyGoalsProps) {
  const currentGoals = goals.filter(
    (g) => g.year === selectedYear && g.month === selectedMonth && g.weekNumber === selectedWeek
  );
  const completedCount = currentGoals.filter((g) => g.status === "completed").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {selectedMonth}월 {selectedWeek}주차 목표 · 일정
          </h2>
          <p className="text-slate-500 text-sm">
            이번 주에 반드시 진행할 주간 목표 및 액션 일정을 관리합니다. ({completedCount}/{currentGoals.length}개 완료)
          </p>
        </div>

        <button
          onClick={() => onAddGoal("weekly")}
          className="flex items-center space-x-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-200 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>주간 목표·일정 추가</span>
        </button>
      </div>

      {/* Week Selector */}
      <div className="flex space-x-3">
        {[1, 2, 3, 4, 5].map((w) => {
          const isSelected = w === selectedWeek;
          return (
            <button
              key={w}
              onClick={() => onWeekChange(w)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
              }`}
            >
              {w}주차
            </button>
          );
        })}
      </div>

      {/* Goals List */}
      {currentGoals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <CheckSquare className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-slate-700 font-bold mb-1">{selectedWeek}주차 목표가 비어있습니다.</h3>
          <p className="text-slate-400 text-sm mb-6">이번 주를 알차게 채울 목표를 등록해 보세요!</p>
          <button
            onClick={() => onAddGoal("weekly")}
            className="px-4 py-2 bg-purple-50 text-purple-600 font-bold text-sm rounded-xl hover:bg-purple-100 transition-colors"
          >
            주간 목표 등록하기
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
                    className="text-slate-300 hover:text-purple-600 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} className="text-purple-600 fill-purple-50" />
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
