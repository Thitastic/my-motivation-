import { escapeHTML } from "../utils.js";
import { labelGroup, t } from "../i18n.js";

export function exerciseMedia(exercise, { large = false, lazy = true } = {}) {
  const media = exercise.media || {};
  const src = media.src || media.fallback || exercise.illustration;
  const thumbnail = media.thumbnail || media.src || exercise.illustration;
  const missing = media.type === "missing";
  const alt = missing ? "" : `${exercise.name} minh họa động tác`;
  const mediaTag = media.type === "video"
    ? `<video class="exercise-demo-media" src="${src}" poster="${thumbnail}" autoplay loop muted playsinline ${lazy ? "preload=\"metadata\"" : ""}></video>`
    : `<img class="exercise-demo-media" src="${src}" alt="${escapeHTML(alt)}" ${lazy ? "loading=\"lazy\"" : ""}>`;

  return `
    <figure class="exercise-demo ${large ? "large" : ""}" data-media-type="${media.type || "image"}">
      <div class="exercise-demo-frame">
        ${mediaTag}
        ${missing ? `<div class="media-missing"><strong>${t("ui.mediaMissing")}</strong><span>${t("ui.fallbackGuide")}</span></div>` : ""}
      </div>
      <figcaption>
        <span>${labelGroup(exercise.muscleGroups[0])}</span>
        ${media.license ? `<span>${t("ui.mediaAttribution")}: ${escapeHTML(media.author || "wger")} · ${escapeHTML(media.license)}</span>` : `<span>${t("ui.fallbackGuide")}</span>`}
      </figcaption>
      <div class="button-row media-controls">
        <button class="ghost-btn" type="button" data-action="toggle-media">${t("ui.playPause")}</button>
        <button class="ghost-btn" type="button" data-action="replay-media">${t("ui.replay")}</button>
        <button class="ghost-btn" type="button" data-action="scroll-instructions">${t("ui.showInstructions")}</button>
      </div>
    </figure>
  `;
}
