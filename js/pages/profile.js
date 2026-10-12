import { EQUIPMENT } from "../data/exercises.js";
import { levelProgress } from "../services/xpSystem.js";
import { escapeHTML } from "../utils.js";
import { labelEquipment, labelGoal, labelLevel, numberFormat, t } from "../i18n.js";

export function profilePage(state) {
  const profile = state.profile;
  const level = levelProgress(state.xp.total);
  return `
    <div class="screen">
      <section class="split">
        <article class="card">
          <p class="eyebrow">${t("ui.profile")}</p>
          <h2>${profile ? escapeHTML(profile.nickname) : t("ui.noProfile")}</h2>
          <p class="muted">${profile ? `${labelLevel(profile.level)} ${t("ui.profileSummary")} ${labelGoal(profile.goal)}, ${numberFormat.format(profile.trainingDays)} ${t("ui.daysPerWeek")}.` : t("ui.profileSetupCopy")}</p>
          <div class="pill-list">
            ${(profile?.equipment || []).map((item) => `<span class="pill">${labelEquipment(item)}</span>`).join("")}
          </div>
          <div class="button-row" style="margin-top:14px">
            <button class="btn accent" type="button" data-action="open-onboarding">${profile ? t("ui.editSetup") : t("ui.createProfile")}</button>
            <button class="ghost-btn" type="button" data-action="toggle-theme">${t("ui.toggleTheme")}</button>
          </div>
        </article>
        <article class="card">
          <p class="eyebrow">Cấp</p>
          <div class="big-number">${numberFormat.format(level.level)}</div>
          <p class="muted">${numberFormat.format(state.xp.total)} XP tổng, ${level.percent}% ${t("ui.toNextLevel")}.</p>
        </article>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.qrBackup")}</p>
        <h2>${t("ui.manualTransfer")}</h2>
        <p class="muted">${t("ui.qrCopy")}</p>
        <div class="button-row">
          <button class="btn accent" type="button" data-action="generate-qr">${t("ui.generateQR")}</button>
          <button class="ghost-btn" type="button" data-action="export-json">${t("ui.exportJSON")}</button>
          <button class="ghost-btn" type="button" data-action="export-encrypted">${t("ui.exportEncrypted")}</button>
          <label class="ghost-btn">${t("ui.importFile")} <input class="sr-only" type="file" accept=".json,application/json" data-action="import-file"></label>
          <button class="ghost-btn" type="button" data-action="scan-qr">${t("ui.scanQR")}</button>
        </div>
        <div id="transfer-area" style="margin-top:14px"></div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.preferences")}</p>
        <form id="profile-form" class="grid">
          <div class="field">
            <label for="profile-duration">${t("ui.preferredDuration")}</label>
            <select id="profile-duration">
              ${[5, 10, 15, 20].map((value) => `<option value="${value}" ${profile?.duration === value ? "selected" : ""}>${value} phút</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="profile-days">${t("ui.trainingDays")} / tuần</label>
            <select id="profile-days">
              ${[2, 3, 4, 5, 6].map((value) => `<option value="${value}" ${profile?.trainingDays === value ? "selected" : ""}>${value} ngày</option>`).join("")}
            </select>
          </div>
          <fieldset class="field-stack">
            <legend>${t("ui.equipment")}</legend>
            <div class="choice-grid">
              ${EQUIPMENT.map((item) => `<label class="choice"><input type="checkbox" data-profile-equipment value="${item}" ${profile?.equipment?.includes(item) ? "checked" : ""}>${labelEquipment(item)}</label>`).join("")}
            </div>
          </fieldset>
          <button class="btn" type="button" data-action="save-profile-preferences">${t("ui.savePreferences")}</button>
        </form>
      </section>
    </div>
  `;
}
