import { escapeHTML } from "../utils.js";
import { labelDifficulty, t } from "../i18n.js";

export function exerciseCard(exercise, action = "view-exercise") {
  const src = exercise.media?.thumbnail || exercise.media?.src || exercise.illustration;
  const alt = exercise.media?.type === "missing" ? "" : `${exercise.name} minh họa`;
  return `
    <article class="card exercise-card">
      <div class="exercise-art"><img src="${src}" alt="${escapeHTML(alt)}" loading="lazy" decoding="async"></div>
      <div>
        <h3>${escapeHTML(exercise.name)}</h3>
        <p class="muted">${escapeHTML(exercise.description)}</p>
        <div class="pill-list">
          <span class="pill difficulty">${labelDifficulty(exercise.difficulty)}</span>
          <span class="pill">${escapeHTML(exercise.target)}</span>
          <span class="pill">${exercise.recommendedSets} ${t("ui.set").toLowerCase()}</span>
          ${exercise.media?.type === "missing" ? `<span class="pill">${t("ui.mediaMissing")}</span>` : ""}
        </div>
        <div class="button-row" style="margin-top:12px">
          <button class="ghost-btn" type="button" data-action="${action}" data-exercise-id="${exercise.id}">${t("ui.details")}</button>
          <button class="btn accent" type="button" data-action="start-single" data-exercise-id="${exercise.id}">${t("ui.train")}</button>
        </div>
      </div>
    </article>
  `;
}
