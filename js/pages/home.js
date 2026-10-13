import { heatmap } from "../components/calendar.js";
import { progressRing } from "../components/progressRing.js";
import { muscleGroupCard, muscleGroupSummary } from "../components/muscleGroupCard.js";
import { levelProgress } from "../services/xpSystem.js";
import { weeklyGoalProgress } from "../services/streakSystem.js";
import { recommendWorkout } from "../services/recommendations.js";
import { aggregateMetrics } from "../services/workoutEngine.js";
import { ACHIEVEMENTS } from "../data/achievements.js";
import { MUSCLE_GROUPS } from "../data/exercises.js";
import { escapeHTML, todayKey } from "../utils.js";
import { numberFormat, t } from "../i18n.js";

export function homePage(state) {
  const profile = state.profile;
  const level = levelProgress(state.xp.total);
  const weekly = weeklyGoalProgress(state);
  const metrics = aggregateMetrics(state);
  const recommendation = profile ? recommendWorkout(state, { minutes: profile.duration }) : null;
  const primaryGroup = recommendation?.exercises?.[0]?.muscleGroups?.[0];
  const today = todayKey();
  const todayMinutes = state.workoutHistory
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
  const targetMinutes = profile?.duration || 15;
  const dailyPercent = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));
  const recentBadges = Object.entries(state.achievements || {})
    .slice(-3)
    .map(([id]) => ACHIEVEMENTS.find((item) => item.id === id))
    .filter(Boolean);
  const weeklyDots = Array.from({ length: 7 }, (_, index) => index < Math.min(7, weekly.done));
  const initials = (profile?.nickname || "K").trim().slice(0, 2).toUpperCase();

  return `
    <div class="screen">
      <section class="home-header">
        <div>
          <p class="eyebrow">${profile ? `${t("ui.welcome")}, ${escapeHTML(profile.nickname)}` : t("ui.localFirst")}</p>
          <h2 style="margin:0">${t("ui.goodDay")}</h2>
          <p class="muted" style="margin:.35rem 0 0">${t("ui.accountProgress")} · Cấp ${numberFormat.format(level.level)}</p>
        </div>
        <div class="avatar" aria-hidden="true">${escapeHTML(initials)}</div>
      </section>

      <section class="card hero-card">
        <p class="eyebrow">${t("ui.recommendedNow")}</p>
        <h2>${t("ui.buildToday")}</h2>
        <p style="max-width:44ch;font-weight:850">${recommendation ? escapeHTML(recommendation.name) : t("ui.appPitch")}</p>
        ${primaryGroup ? `<div class="hero-muscle">${muscleGroupSummary(primaryGroup)}</div>` : ""}
        <div class="pill-list">
          <span class="pill">${numberFormat.format(recommendation?.exercises?.length || 0)} bài</span>
          <span class="pill">${numberFormat.format(targetMinutes)} phút</span>
          <span class="pill">Cấp ${numberFormat.format(level.level)}</span>
        </div>
        <div class="button-row" style="margin-top:16px">
          <button class="btn" type="button" data-action="${profile ? "start-recommended" : "open-onboarding"}">${t("ui.startTraining")}</button>
          <a class="ghost-btn" href="#/train">${t("ui.exploreLibrary")}</a>
        </div>
      </section>

      <section class="grid-tight">
        <article class="metric daily-card">
          <div>
            <span class="label">Hôm nay</span>
            <strong>${numberFormat.format(todayMinutes)}p</strong>
            <p class="muted">${numberFormat.format(targetMinutes)}p mục tiêu</p>
          </div>
          ${progressRing(dailyPercent, `${dailyPercent}%`)}
        </article>
        <article class="metric streak-card">
          <span class="flame" aria-hidden="true"></span>
          <div>
            <span class="label">${t("ui.dailyStreak")}</span>
            <strong>${numberFormat.format(state.streaks.daily.current)}</strong>
            <div class="week-dots">${weeklyDots.map((done) => `<span class="week-dot ${done ? "done" : ""}"></span>`).join("")}</div>
          </div>
        </article>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.muscleTraining")}</p>
            <h2>Chọn vùng tập</h2>
          </div>
          <a class="ghost-btn" href="#/train">${t("ui.details")}</a>
        </div>
        <div class="rail-scroll muscle-carousel">
          ${MUSCLE_GROUPS.map((group) => muscleGroupCard(group, { compact: true, selected: group === primaryGroup })).join("")}
        </div>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.quickWorkout")}</p>
            <h2>Tập theo thời gian</h2>
          </div>
        </div>
        <div class="rail-scroll">
          ${[5, 10, 15, 20].map((minutes) => `
            <button class="btn ${minutes === targetMinutes ? "accent" : ""} quick-card" type="button" data-action="start-quick" data-minutes="${minutes}">
              <span class="big-number" style="font-size:2.7rem">${numberFormat.format(minutes)}</span>
              <span>phút</span>
            </button>
          `).join("")}
        </div>
      </section>

      <section class="grid-tight">
        <div class="metric"><span class="label">${t("ui.sessions")}</span><strong>${numberFormat.format(metrics.workouts)}</strong><p class="muted">${numberFormat.format(metrics.minutes)} ${t("ui.minutesLogged")}</p></div>
        <div class="metric"><span class="label">${t("ui.weeklyGoal")}</span><strong>${weekly.done}/${weekly.goal}</strong><p class="muted">${t("ui.weekStreak")}</p></div>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.unlocked")}</p>
            <h2>Huy hiệu gần đây</h2>
          </div>
          <a class="ghost-btn" href="#/achievements">${t("nav.achievements")}</a>
        </div>
        <div class="grid-tight" style="margin-top:12px">
          ${recentBadges.length ? recentBadges.map((badge) => `<div class="metric"><span class="label">${escapeHTML(badge.name)}</span><strong>+${numberFormat.format(badge.xp)}</strong></div>`).join("") : `<p class="muted">${t("ui.badgesCopy")}</p>`}
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.heatmap")}</p>
        ${heatmap(state.workoutHistory)}
      </section>
    </div>
  `;
}
