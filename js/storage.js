import { safeJSONParse, todayKey, uid } from "./utils.js";

const KEY = "kineto:data";
const SCHEMA_VERSION = 1;

export function createDefaultState() {
  return {
    version: SCHEMA_VERSION,
    profile: null,
    preferences: {
      theme: "light",
      defaultStreakMode: "weekly"
    },
    workoutHistory: [],
    exerciseProgress: {},
    xp: {
      total: 0,
      level: 1,
      rewards: []
    },
    achievements: {},
    streaks: {
      daily: { current: 0, longest: 0, lastWorkoutDate: null },
      weekly: { current: 0, longest: 0, lastGoalWeek: null },
      freezes: 0
    },
    customRoutines: [],
    activeSession: null,
    completedSessionIds: []
  };
}

function migrate(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== "object") return base;
  const merged = {
    ...base,
    ...raw,
    preferences: { ...base.preferences, ...(raw.preferences || {}) },
    xp: { ...base.xp, ...(raw.xp || {}) },
    streaks: {
      daily: { ...base.streaks.daily, ...((raw.streaks || {}).daily || {}) },
      weekly: { ...base.streaks.weekly, ...((raw.streaks || {}).weekly || {}) },
      freezes: Number((raw.streaks || {}).freezes || 0)
    }
  };
  merged.version = SCHEMA_VERSION;
  return validateState(merged);
}

export function validateState(state) {
  const safe = createDefaultState();
  const output = { ...safe, ...state };
  output.workoutHistory = Array.isArray(output.workoutHistory) ? output.workoutHistory : [];
  output.customRoutines = Array.isArray(output.customRoutines) ? output.customRoutines : [];
  output.completedSessionIds = Array.isArray(output.completedSessionIds) ? output.completedSessionIds : [];
  output.exerciseProgress = output.exerciseProgress && typeof output.exerciseProgress === "object" ? output.exerciseProgress : {};
  output.achievements = output.achievements && typeof output.achievements === "object" ? output.achievements : {};
  output.xp.total = Number.isFinite(Number(output.xp.total)) ? Number(output.xp.total) : 0;
  output.xp.level = Number.isFinite(Number(output.xp.level)) ? Number(output.xp.level) : 1;
  output.xp.rewards = Array.isArray(output.xp.rewards) ? output.xp.rewards : [];
  return output;
}

export const Storage = {
  state: createDefaultState(),
  listeners: new Set(),

  load() {
    const raw = localStorage.getItem(KEY);
    this.state = migrate(safeJSONParse(raw, null));
    this.save();
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
      this.emit();
      return true;
    } catch (error) {
      console.error("Storage save failed", error);
      return false;
    }
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  emit() {
    this.listeners.forEach((listener) => listener(this.state));
  },

  update(mutator) {
    const draft = structuredClone(this.state);
    mutator(draft);
    this.state = validateState(draft);
    this.save();
    return this.state;
  },

  exportState() {
    return JSON.stringify(validateState(this.state), null, 2);
  },

  importState(incoming) {
    const restored = validateState(migrate(incoming));
    this.state = restored;
    this.save();
    return this.state;
  },

  reset() {
    this.state = createDefaultState();
    this.save();
  },

  createProfile(profile) {
    this.update((draft) => {
      draft.profile = {
        id: uid("profile"),
        nickname: String(profile.nickname || "Athlete").slice(0, 40),
        level: profile.level,
        goal: profile.goal,
        equipment: profile.equipment,
        duration: Number(profile.duration),
        trainingDays: Number(profile.trainingDays),
        createdAt: new Date().toISOString(),
        recommendation: profile.recommendation
      };
    });
  },

  markTodayFreezeEarned() {
    const key = `freeze:${todayKey()}`;
    if (this.state.xp.rewards.includes(key)) return false;
    this.update((draft) => {
      draft.streaks.freezes += 1;
      draft.xp.rewards.push(key);
    });
    return true;
  }
};
