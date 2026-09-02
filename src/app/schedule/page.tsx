"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ScheduleItem, YearlyGoal, MonthlyGoal, WeeklyGoal, DailyItem } from "@/types/schedule";
import { getScheduleItems, saveScheduleItem, deleteScheduleItem } from "@/app/actions/schedule";
import YearlyGoals from "@/components/schedule/YearlyGoals";
import MonthlyGoals from "@/components/schedule/MonthlyGoals";
import WeeklyGoals from "@/components/schedule/WeeklyGoals";
import DailySchedule from "@/components/schedule/DailySchedule";
import GoalModal from "@/components/schedule/GoalModal";
import { Target, Calendar as CalendarIcon, CheckSquare, Clock, Sparkles } from "lucide-react";

type TabType = "yearly" | "monthly" | "weekly" | "daily";

const INITIAL_MOCK_ITEMS: ScheduleItem[] = [
  {
    id: "1",
    userId: "demo",
    type: "yearly",
    year: 2026,
    title: "풀스택 개인 웹 플랫폼 완성 및 배포",
    description: "스케줄, 공부, 추억 아카이빙을 담은 나만의 대표 웹사이트 서비스 구축",
    category: "career",
    status: "in_progress",
    progress: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "demo",
    type: "yearly",
    year: 2026,
    title: "매주 3회 운동 루틴 유지",
    description: "체력 증진 및 피트니스 기록 달성",
    category: "health",
    status: "in_progress",
    progress: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "demo",
    type: "monthly",
    year: 2026,
    month: 9,
    title: "일정 및 목표 관리 핵심 모듈 완성",
    description: "연간, 월간, 주간, 일일 일정 컴포넌트 및 Firestore 연동 완료",
    category: "career",
    status: "in_progress",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    userId: "demo",
    type: "weekly",
    year: 2026,
    month: 9,
    weekNumber: 1,
    title: "일정 관리 UI 및 데이터 상태 구현",
    description: "탭 전환 및 반응형 레이아웃 구성",
    category: "career",
    status: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    userId: "demo",
    type: "daily",
    date: new Date().toISOString().split("T")[0],
    timeSlot: "오전",
    title: "일정 관리 모듈 코드 리뷰 및 테스팅",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

export default function SchedulePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("yearly");

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().split("T")[0]);

  const [items, setItems] = useState<ScheduleItem[]>(INITIAL_MOCK_ITEMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [modalType, setModalType] = useState<"yearly" | "monthly" | "weekly">("yearly");

  // Load from local storage or server
  useEffect(() => {
    const localData = localStorage.getItem("my_workspace_schedules");
    if (localData) {
      try {
        setItems(JSON.parse(localData));
      } catch {
        // fallback
      }
    }

    if (user?.uid) {
      getScheduleItems(user.uid).then((res) => {
        if (res && res.length > 0) {
          setItems(res);
        }
      });
    }
  }, [user]);

  // Persist items
  const updateItemsState = (newItems: ScheduleItem[]) => {
    setItems(newItems);
    localStorage.setItem("my_workspace_schedules", JSON.stringify(newItems));
  };

  const handleAddGoal = (type: "yearly" | "monthly" | "weekly") => {
    setEditingItem(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEditGoal = (goal: ScheduleItem) => {
    setEditingItem(goal);
    setModalType(goal.type as "yearly" | "monthly" | "weekly");
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (data: any) => {
    const newItem: ScheduleItem = {
      ...data,
      id: data.id || `item_${Date.now()}`,
      userId: user?.uid || "demo",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updated: ScheduleItem[];
    if (data.id) {
      updated = items.map((i) => (i.id === data.id ? newItem : i));
    } else {
      updated = [newItem, ...items];
    }
    updateItemsState(updated);

    if (user?.uid) {
      try {
        await saveScheduleItem(newItem);
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("정말로 이 항목을 삭제하시겠습니까?")) return;
    const updated = items.filter((i) => i.id !== id);
    updateItemsState(updated);

    if (user?.uid) {
      try {
        await deleteScheduleItem(id);
      } catch (err) {
        console.error("Firestore delete error:", err);
      }
    }
  };

  const handleToggleStatus = (goal: ScheduleItem) => {
    const isCompleted = (goal as any).status === "completed";
    const nextStatus = isCompleted ? "in_progress" : "completed";
    const updatedGoal = { ...(goal as any), status: nextStatus, updatedAt: new Date().toISOString() };
    const updated = items.map((i) => (i.id === goal.id ? updatedGoal : i));
    updateItemsState(updated);
  };

  // Daily handlers
  const handleAddDailyItem = async (title: string, timeSlot?: string) => {
    const newDaily: DailyItem = {
      id: `daily_${Date.now()}`,
      userId: user?.uid || "demo",
      type: "daily",
      date: selectedDate,
      timeSlot,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDaily, ...items];
    updateItemsState(updated);
  };

  const handleToggleDailyItem = (id: string, currentCompleted: boolean) => {
    const updated = items.map((i) => {
      if (i.id === id && i.type === "daily") {
        return { ...i, completed: !currentCompleted };
      }
      return i;
    });
    updateItemsState(updated);
  };

  const yearlyGoals = items.filter((i): i is YearlyGoal => i.type === "yearly");
  const monthlyGoals = items.filter((i): i is MonthlyGoal => i.type === "monthly");
  const weeklyGoals = items.filter((i): i is WeeklyGoal => i.type === "weekly");
  const dailyItems = items.filter((i): i is DailyItem => i.type === "daily");

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "yearly", label: "연간 목표·일정", icon: Target },
    { id: "monthly", label: "월간 목표·일정", icon: CalendarIcon },
    { id: "weekly", label: "주간 목표·일정", icon: CheckSquare },
    { id: "daily", label: "일일 일정", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 sm:pt-28 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nav Tabs Header */}
        <div className="mb-6 sm:mb-8 flex justify-center sm:justify-start border-b border-slate-200/80 pb-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0">
            <div className="flex space-x-1 min-w-max w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center space-x-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex-1 sm:flex-initial ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === "yearly" && (
          <YearlyGoals
            goals={yearlyGoals}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteItem}
          />
        )}

        {activeTab === "monthly" && (
          <MonthlyGoals
            goals={monthlyGoals}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === "weekly" && (
          <WeeklyGoals
            goals={weeklyGoals}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteItem}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === "daily" && (
          <DailySchedule
            items={dailyItems}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddItem={handleAddDailyItem}
            onToggleItem={handleToggleDailyItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* Goal Modal */}
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type={modalType}
          initialData={editingItem}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedWeek={selectedWeek}
          onSave={handleSaveGoal}
        />
      </div>
    </div>
  );
}
