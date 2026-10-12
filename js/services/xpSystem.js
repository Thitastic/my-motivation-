const BASE_XP = 120;

export const XP_REWARDS = {
  set: 5,
  workout: 30,
  dailyGoal: 20,
  weeklyChallenge: 100,
  unlock: 50,
  personalRecord: 25
};

export function xpForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 2; i <= level; i += 1) {
    total += Math.round(BASE_XP * Math.pow(i - 1, 1.18));
  }
  return total;
}

export function levelFromXP(total) {
  let level = 1;
  while (level < 50 && total >= xpForLevel(level + 1)) level += 1;
  return level;
}

export function levelProgress(total) {
  const level = levelFromXP(total);
  const floor = xpForLevel(level);
  const next = xpForLevel(Math.min(level + 1, 50));
  return {
    level,
    current: total - floor,
    needed: Math.max(1, next - floor),
    percent: level >= 50 ? 100 : Math.round(((total - floor) / (next - floor)) * 100)
  };
}

export function awardXP(state, amount, rewardId) {
  if (!rewardId || state.xp.rewards.includes(rewardId)) return { awarded: 0, levelUp: false };
  const before = levelFromXP(state.xp.total);
  state.xp.total += amount;
  state.xp.level = levelFromXP(state.xp.total);
  state.xp.rewards.push(rewardId);
  return { awarded: amount, levelUp: state.xp.level > before };
}
