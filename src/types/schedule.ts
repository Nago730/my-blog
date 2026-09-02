export type GoalCategory = 'career' | 'health' | 'finance' | 'growth' | 'lifestyle';

export type GoalStatus = 'todo' | 'in_progress' | 'completed' | 'on_hold';

export type ItemKind = 'goal' | 'event';

export interface BaseGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  itemKind?: ItemKind; // 'goal': 목표, 'event': 일정/이벤트
  eventDate?: string; // 특정 일정/이벤트 날짜
  createdAt: string;
  updatedAt: string;
}

export interface YearlyGoal extends BaseGoal {
  type: 'yearly';
  year: number; // e.g. 2026
  progress: number; // 0 ~ 100
}

export interface MonthlyGoal extends BaseGoal {
  type: 'monthly';
  year: number;
  month: number; // 1 ~ 12
  yearlyGoalId?: string; // Optional link to parent yearly goal
}

export interface WeeklyGoal extends BaseGoal {
  type: 'weekly';
  year: number;
  month: number;
  weekNumber: number; // 1 ~ 5
  monthlyGoalId?: string; // Optional link to parent monthly goal
}

export interface DailyItem {
  id: string;
  userId: string;
  type: 'daily';
  date: string; // YYYY-MM-DD
  timeSlot?: string; // e.g. "09:00 - 10:00" or "Morning"
  title: string;
  completed: boolean;
  weeklyGoalId?: string; // Optional link to parent weekly goal
  createdAt: string;
}

export type ScheduleItem = YearlyGoal | MonthlyGoal | WeeklyGoal | DailyItem;
