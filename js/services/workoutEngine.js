import { EXERCISE_MAP, EXERCISES } from "../data/exercises.js";
import { awardXP, XP_REWARDS } from "./xpSystem.js";
import { updateStreaks } from "./streakSystem.js";
import { uid, todayKey, minutesBetween, unique } from "../utils.js";

export function createSession(plan) {
  const now = new Date().toISOString();
  return {
    id: uid("session"),
    planId: plan.id || "custom",
    name: plan.name || "Buổi tập",
    startedAt: now,
    elapsedSeconds: 0,
    status: "ready",
    currentExerciseIndex: 0,
    currentSet: 1,
    restUntil: null,
    exercises: plan.exercises.map((item) => ({
      exerciseId: item.exerciseId,
      sets: Number(item.sets || EXERCISE_MAP[item.exerciseId]?.recommendedSets || 3),
      target: item.target || EXERCISE_MAP[item.exerciseId]?.target || "8 reps",
      restSeconds: Number(item.restSeconds || EXERCISE_MAP[item.exerciseId]?.restSeconds || 60),
      completedSets: []
    }))
  };
}

export function recordSet(session, reps) {
  const exercise = session.exercises[session.currentExerciseIndex];
  if (!exercise) return session;
  exercise.completedSets.push({
    id: uid("set"),
    reps: Math.max(0, Number(reps || 0)),
    completedAt: new Date().toISOString()
  });
  if (exercise.completedSets.length >= exercise.sets) {
    session.currentExerciseIndex += 1;
    session.currentSet = 1;
  } else {
    session.currentSet += 1;
    session.restUntil = new Date(Date.now() + exercise.restSeconds * 1000).toISOString();
  }
  if (session.currentExerciseIndex >= session.exercises.length) session.status = "complete";
  return session;
}

export function skipExercise(session) {
  session.currentExerciseIndex += 1;
  session.currentSet = 1;
  session.restUntil = null;
  if (session.currentExerciseIndex >= session.exercises.length) session.status = "complete";
  return session;
}

export function addSet(session) {
  const exercise = session.exercises[session.currentExerciseIndex];
  if (exercise) exercise.sets += 1;
  return session;
}

export function finishWorkout(state, session) {
  if (!session || state.completedSessionIds.includes(session.id)) {
    return { duplicate: true, workout: null, xpAwarded: 0, levelUp: false, newPRs: [] };
  }
  const completed = session.exercises.map((item) => {
    const exercise = EXERCISE_MAP[item.exerciseId];
    const reps = item.completedSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
    return {
      exerciseId: item.exerciseId,
      name: exercise?.name || "Bài tập",
      muscleGroups: exercise?.muscleGroups || [],
      difficulty: exercise?.difficulty || 1,
      sets: item.completedSets.length,
      reps
    };
  }).filter((item) => item.sets > 0);
  const completedSets = completed.reduce((sum, item) => sum + item.sets, 0);
  const totalReps = completed.reduce((sum, item) => sum + item.reps, 0);
  const finishedAt = new Date().toISOString();
  const workout = {
    id: uid("workout"),
    sessionId: session.id,
    name: session.name,
    date: todayKey(new Date(finishedAt)),
    startedAt: session.startedAt,
    finishedAt,
    durationMinutes: minutesBetween(session.startedAt, finishedAt),
    completedExercises: completed,
    completedSets,
    totalReps,
    muscleGroups: unique(completed.flatMap((item) => item.muscleGroups)),
    xpEarned: completedSets * XP_REWARDS.set + XP_REWARDS.workout
  };

  const newPRs = [];
  state.workoutHistory.push(workout);
  state.completedSessionIds.push(session.id);
  state.activeSession = null;

  completed.forEach((item) => {
    const progress = state.exerciseProgress[item.exerciseId] || { totalSets: 0, totalReps: 0, bestReps: 0, completedAt: [] };
    progress.totalSets += item.sets;
    progress.totalReps += item.reps;
    if (item.reps > progress.bestReps) {
      progress.bestReps = item.reps;
      progress.lastPRAt = finishedAt;
      newPRs.push(item.exerciseId);
    }
    progress.completedAt = unique([...(progress.completedAt || []), workout.date]);
    state.exerciseProgress[item.exerciseId] = progress;
  });

  let xpAwarded = 0;
  let levelUp = false;
  const workoutReward = awardXP(state, XP_REWARDS.workout, `workout:${session.id}`);
  xpAwarded += workoutReward.awarded;
  levelUp = levelUp || workoutReward.levelUp;
  session.exercises.forEach((exercise) => {
    exercise.completedSets.forEach((set) => {
      const result = awardXP(state, XP_REWARDS.set, `set:${set.id}`);
      xpAwarded += result.awarded;
      levelUp = levelUp || result.levelUp;
    });
  });
  newPRs.forEach((id) => {
    const result = awardXP(state, XP_REWARDS.personalRecord, `pr:${workout.id}:${id}`);
    xpAwarded += result.awarded;
    levelUp = levelUp || result.levelUp;
  });
  completed.forEach((item) => {
    const harder = EXERCISE_MAP[item.exerciseId]?.harder;
    if (harder && performanceStatus(state, harder) !== "locked") {
      const result = awardXP(state, XP_REWARDS.unlock, `unlock:${harder}`);
      xpAwarded += result.awarded;
      levelUp = levelUp || result.levelUp;
    }
  });
  const daily = awardXP(state, XP_REWARDS.dailyGoal, `daily-goal:${workout.date}`);
  xpAwarded += daily.awarded;
  levelUp = levelUp || daily.levelUp;
  if (updateStreaks(state, workout)) {
    const result = awardXP(state, XP_REWARDS.weeklyChallenge, `weekly-goal:${workout.date}`);
    xpAwarded += result.awarded;
    levelUp = levelUp || result.levelUp;
  }
  workout.xpEarned = xpAwarded;
  return { duplicate: false, workout, xpAwarded, levelUp, newPRs };
}

export function buildPlanFromExerciseIds(name, ids, sets = 3) {
  return {
    id: uid("plan"),
    name: name || "Buổi tập",
    exercises: ids.filter((id) => EXERCISE_MAP[id]).map((id) => ({
      exerciseId: id,
      sets,
      target: EXERCISE_MAP[id].target,
      restSeconds: EXERCISE_MAP[id].restSeconds
    }))
  };
}

export function performanceStatus(state, exerciseId) {
  const exercise = EXERCISE_MAP[exerciseId];
  const progress = state.exerciseProgress[exerciseId];
  if (!exercise) return "locked";
  if (progress?.totalSets >= 12 || progress?.bestReps >= 50) return "mastered";
  if (progress?.totalSets >= 4) return "unlocked";
  if (!exercise.easier) return "ready";
  const previous = state.exerciseProgress[exercise.easier];
  if (previous?.totalSets >= 6 || previous?.bestReps >= 40) return "ready";
  return "locked";
}

export function aggregateMetrics(state) {
  const workouts = state.workoutHistory;
  const exercises = workouts.flatMap((workout) => workout.completedExercises || []);
  const uniqueExercises = new Set(exercises.map((item) => item.exerciseId));
  const pushIds = new Set(EXERCISES.filter((exercise) => ["wall-push-up", "incline-push-up", "knee-push-up", "push-up", "diamond-push-up", "archer-push-up"].includes(exercise.id)).map((exercise) => exercise.id));
  const metric = {
    workouts: workouts.length,
    minutes: workouts.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0),
    sets: workouts.reduce((sum, item) => sum + Number(item.completedSets || 0), 0),
    reps: workouts.reduce((sum, item) => sum + Number(item.totalReps || 0), 0),
    trainingDays: new Set(workouts.map((item) => item.date)).size,
    uniqueExercises: uniqueExercises.size,
    pushups: exercises.filter((item) => pushIds.has(item.exerciseId)).reduce((sum, item) => sum + item.reps, 0),
    dailyStreak: state.streaks.daily.current,
    weeklyGoals: state.streaks.weekly.longest,
    level: state.xp.level,
    prs: Object.values(state.exerciseProgress).filter((item) => item.lastPRAt).length,
    advancedExercises: exercises.filter((item) => item.difficulty >= 4).length,
    backSets: exercises.filter((item) => item.muscleGroups.includes("Back")).reduce((sum, item) => sum + item.sets, 0),
    coreSets: exercises.filter((item) => item.muscleGroups.includes("Abs and Core")).reduce((sum, item) => sum + item.sets, 0),
    legReps: exercises.filter((item) => item.muscleGroups.includes("Legs and Glutes")).reduce((sum, item) => sum + item.reps, 0),
    mobilityExercises: exercises.filter((item) => item.muscleGroups.includes("Mobility and Stretching")).length
  };
  return metric;
}
