import { heatmap } from "../components/calendar.js";
import { progressRing } from "../components/progressRing.js";
import { levelProgress } from "../services/xpSystem.js";
import { weeklyGoalProgress } from "../services/streakSystem.js";
import { recommendWorkout } from "../services/recommendations.js";
import { aggregateMetrics } from "../services/workoutEngine.js";
import { escapeHTML } from "../utils.js";
import { numberFormat, t } from "../i18n.js";

export function homePage(state) {
  const profile = state.profile;
  const level = levelProgress(state.xp.total);
  const weekly = weeklyGoalProgress(state);
  const metrics = aggregateMetrics(state);
  const recommendation = profile ? recommendWorkout(state, { minutes: profile.duration }) : null;
  return `
    <div class="screen">
      <section class="card hero-card">
        <p class="eyebrow">${profile ? `${t("ui.welcome")}, ${escapeHTML(profile.nickname)}` : t("ui.localFirst")}</p>
        <h2>${profile ? t("ui.buildToday") : t("ui.trainAtHome")}</h2>
        <p style="max-width:44ch;font-weight:800">${profile ? escapeHTML(profile.recommendation) : t("ui.appPitch")}</p>
        <div class="button-row">
          <button class="btn" type="button" data-action="${profile ? "start-recommended" : "open-onboarding"}">${t("ui.startTraining")}</button>
          <a class="ghost-btn" href="#/train">${t("ui.exploreLibrary")}</a>
        </div>
      </section>

      <section class="grid-tight">
        <div class="metric"><span class="label">Cấp</span><strong>${numberFormat.format(level.level)}</strong><p class="muted">${numberFormat.format(level.current)}/${numberFormat.format(level.needed)} XP</p></div>
        <div class="metric"><span class="label">${t("ui.weeklyGoal")}</span><strong>${weekly.done}/${weekly.goal}</strong><p class="muted">${t("ui.recoveryDefault")}</p></div>
        <div class="metric"><span class="label">${t("ui.dailyStreak")}</span><strong>${numberFormat.format(state.streaks.daily.current)}</strong><p class="muted">${t("ui.trainingDays")}</p></div>
        <div class="metric"><span class="label">${t("ui.sessions")}</span><strong>${numberFormat.format(metrics.workouts)}</strong><p class="muted">${numberFormat.format(metrics.minutes)} ${t("ui.minutesLogged")}</p></div>
      </section>

      <section class="split">
        <article class="card">
          <div class="button-row" style="justify-content:space-between;align-items:center">
            <div>
              <p class="eyebrow">${t("ui.accountProgress")}</p>
              <h2>Cấp ${numberFormat.format(level.level)}</h2>
            </div>
            ${progressRing(level.percent, `${level.percent}%`)}
          </div>
          <p class="muted">${t("ui.xpDescription")}</p>
        </article>
        <article class="card">
          <p class="eyebrow">${t("ui.recommendedNow")}</p>
          <h2>${recommendation ? escapeHTML(recommendation.name) : t("ui.setupCoach")}</h2>
          <p class="muted">${recommendation ? `${numberFormat.format(recommendation.exercises.length)} ${t("ui.selectedFromProfile")}` : "Hoàn tất thiết lập để tạo gợi ý tập đầu tiên."}</p>
          <button class="btn accent" type="button" data-action="${recommendation ? "start-recommended" : "open-onboarding"}">${recommendation ? t("ui.startRecommendation") : t("ui.beginSetup")}</button>
        </article>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.recoverySystem")}</p>
            <h2>${numberFormat.format(Math.max(0, weekly.goal - weekly.done))} ${Math.max(0, weekly.goal - weekly.done) === 1 ? t("ui.plannedRestDay") : t("ui.plannedRestDays")}</h2>
            <p class="muted">${t("ui.recoveryCopy")}</p>
          </div>
          <div class="metric" style="min-width:132px"><span class="label">${t("ui.freezes")}</span><strong>${numberFormat.format(state.streaks.freezes)}</strong></div>
        </div>
        <button class="ghost-btn" type="button" data-action="claim-freeze">${t("ui.claimFreeze")}</button>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.heatmap")}</p>
            <h2>${t("ui.lastWeeks")}</h2>
          </div>
          <span class="pill">${numberFormat.format(state.streaks.weekly.current)} ${t("ui.weekStreak")}</span>
        </div>
        ${heatmap(state.workoutHistory)}
      </section>
    </div>
  `;
}
