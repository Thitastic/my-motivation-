import { previousDateKey, todayKey } from "../utils.js";

function weekKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date.toISOString().slice(0, 10);
}

function previousWeekKey(key) {
  return previousDateKey(key, 7);
}

export function updateStreaks(state, workout) {
  const date = workout.date || todayKey();
  const daily = state.streaks.daily;
  if (daily.lastWorkoutDate !== date) {
    if (daily.lastWorkoutDate === previousDateKey(date)) daily.current += 1;
    else daily.current = 1;
    daily.longest = Math.max(daily.longest, daily.current);
    daily.lastWorkoutDate = date;
  }

  const goal = Number(state.profile?.trainingDays || 3);
  const currentWeek = weekKey(date);
  const daysThisWeek = new Set(
    state.workoutHistory
      .filter((item) => weekKey(item.date) === currentWeek)
      .map((item) => item.date)
  );
  if (daysThisWeek.size >= goal && state.streaks.weekly.lastGoalWeek !== currentWeek) {
    const weekly = state.streaks.weekly;
    weekly.current = weekly.lastGoalWeek === previousWeekKey(currentWeek) ? weekly.current + 1 : 1;
    weekly.longest = Math.max(weekly.longest, weekly.current);
    weekly.lastGoalWeek = currentWeek;
    return true;
  }
  return false;
}

export function weeklyGoalProgress(state) {
  const goal = Number(state.profile?.trainingDays || 3);
  const current = weekKey(todayKey());
  const days = new Set(state.workoutHistory.filter((item) => weekKey(item.date) === current).map((item) => item.date));
  return { done: days.size, goal, percent: Math.min(100, Math.round((days.size / goal) * 100)) };
}
