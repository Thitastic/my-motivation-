import { ACHIEVEMENTS } from "../data/achievements.js";
import { aggregateMetrics } from "../services/workoutEngine.js";
import { numberFormat, t } from "../i18n.js";

export function achievementsPage(state) {
  const metrics = aggregateMetrics(state);
  return `
    <div class="screen">
      <section class="card hero-card">
        <p class="eyebrow">${t("nav.achievements")}</p>
        <h2>${Object.keys(state.achievements).length}/${ACHIEVEMENTS.length}</h2>
        <p style="font-weight:800">${t("ui.badgesCopy")}</p>
      </section>
      <section class="grid">
        ${ACHIEVEMENTS.map((achievement) => {
          const value = metrics[achievement.metric] || 0;
          const unlocked = Boolean(state.achievements[achievement.id]);
          const pct = Math.min(100, Math.round((value / achievement.target) * 100));
          return `
            <article class="badge ${unlocked ? "unlocked" : ""}">
              <p class="eyebrow">${unlocked ? t("ui.unlocked") : `${pct}%`}</p>
              <h3>${achievement.name}</h3>
              <p class="muted">${achievement.description}</p>
              <div class="pill-list"><span class="pill">${numberFormat.format(Math.min(value, achievement.target))}/${numberFormat.format(achievement.target)}</span><span class="pill">+${numberFormat.format(achievement.xp)} XP</span></div>
            </article>
          `;
        }).join("")}
      </section>
    </div>
  `;
}
