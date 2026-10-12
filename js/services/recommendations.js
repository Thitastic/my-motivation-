import { EXERCISES, MUSCLE_GROUPS } from "../data/exercises.js";
import { labelGroup } from "../i18n.js";

const levelMap = { beginner: 2, intermediate: 3, advanced: 5 };

export function recommendWorkout(state, options = {}) {
  const profile = state.profile || {};
  const maxDifficulty = levelMap[profile.level] || 2;
  const equipment = new Set(["None", ...(profile.equipment || [])]);
  const recent = state.workoutHistory.slice(-4).flatMap((workout) => workout.muscleGroups || []);
  const targetGroup = options.group || MUSCLE_GROUPS.find((group) => !recent.includes(group)) || "Full Body";
  const minutes = Number(options.minutes || profile.duration || 15);
  const count = minutes <= 5 ? 2 : minutes <= 10 ? 3 : minutes <= 15 ? 4 : 5;
  const pool = EXERCISES
    .filter((exercise) => exercise.difficulty <= maxDifficulty + 1)
    .filter((exercise) => exercise.equipment.every((item) => equipment.has(item)))
    .filter((exercise) => targetGroup === "Full Body" ? exercise.muscleGroups[0] !== "Mobility and Stretching" : exercise.muscleGroups.includes(targetGroup) || exercise.muscleGroups[0] === "Mobility and Stretching");
  const selected = [];
  const sorted = [...pool].sort((a, b) => a.difficulty - b.difficulty);
  for (const exercise of sorted) {
    if (!selected.some((item) => item.id === exercise.id)) selected.push(exercise);
    if (selected.length >= count) break;
  }
  return {
    id: `recommend-${Date.now()}`,
    name: options.name || `Buổi ${minutes} phút: ${labelGroup(targetGroup)}`,
    source: "recommendation",
    targetMinutes: minutes,
    exercises: selected.map((exercise) => ({
      exerciseId: exercise.id,
      sets: Math.min(exercise.recommendedSets, minutes <= 10 ? 2 : exercise.recommendedSets),
      target: exercise.target,
      restSeconds: exercise.restSeconds
    }))
  };
}

export function initialRecommendation(profile) {
  const focus = profile.goal === "strength" ? "Sức mạnh chống đẩy" : profile.goal === "mobility" ? "Linh hoạt và giãn cơ" : "Nền tảng toàn thân";
  return `Bắt đầu với ${focus}: ${profile.trainingDays} ngày mỗi tuần, khoảng ${profile.duration} phút mỗi buổi.`;
}
