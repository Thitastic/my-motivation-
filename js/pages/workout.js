import { EXERCISE_MAP } from "../data/exercises.js";
import { formatDuration, escapeHTML } from "../utils.js";
import { exerciseMedia } from "../components/exerciseMedia.js";
import { numberFormat, t } from "../i18n.js";

export function workoutPage(state) {
  const session = state.activeSession;
  if (!session) {
    return `
      <div class="screen">
        <section class="card hero-card">
          <p class="eyebrow">${t("ui.noActiveSession")}</p>
          <h2>${t("ui.readyWhenYouAre")}</h2>
          <p style="font-weight:800">${t("ui.chooseWorkoutCopy")}</p>
          <a class="btn" href="#/train">${t("ui.chooseWorkout")}</a>
        </section>
      </div>
    `;
  }
  const current = session.exercises[session.currentExerciseIndex];
  const exercise = current ? EXERCISE_MAP[current.exerciseId] : null;
  const completedSets = session.exercises.reduce((sum, item) => sum + item.completedSets.length, 0);
  const totalSets = session.exercises.reduce((sum, item) => sum + item.sets, 0);
  const percent = totalSets ? Math.round((completedSets / totalSets) * 100) : 0;
  const restLeft = session.restUntil ? Math.max(0, Math.ceil((new Date(session.restUntil) - Date.now()) / 1000)) : 0;
  const next = session.exercises[session.currentExerciseIndex + 1];
  return `
    <div class="workout-full">
      <section class="workout-panel">
        <p class="eyebrow">${escapeHTML(session.name)}</p>
        <h2 class="workout-title">${exercise ? escapeHTML(exercise.name) : t("ui.workoutComplete")}</h2>
        ${exercise ? `
          ${exerciseMedia(exercise, { large: true, lazy: false })}
          <p class="muted">${escapeHTML(exercise.description)}</p>
          <div class="pill-list">
            <span class="pill difficulty">${t("ui.set")} ${current.completedSets.length + 1}/${current.sets}</span>
            <span class="pill">${escapeHTML(current.target)}</span>
            <span class="pill">${percent}% ${t("ui.done")}</span>
          </div>
          <ol id="exercise-instructions">
            ${exercise.instructions.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}
          </ol>
          <div class="field">
            <label for="actual-reps">${t("ui.recordedReps")}</label>
            <input id="actual-reps" type="number" min="0" inputmode="numeric" value="${parseInt(current.target, 10) || 10}">
          </div>
        ` : `
          <p class="muted">${t("ui.saveSessionCopy")}</p>
        `}
        <div class="button-row" style="margin-top:14px">
          <button class="btn accent" type="button" data-action="workout-start">${t("ui.start")}</button>
          <button class="ghost-btn" type="button" data-action="workout-pause">${t("ui.pause")}</button>
          <button class="ghost-btn" type="button" data-action="workout-resume">${t("ui.resume")}</button>
          ${exercise ? `<button class="btn" type="button" data-action="finish-set">${t("ui.finishSet")}</button><button class="ghost-btn" type="button" data-action="add-set">${t("ui.addSet")}</button><button class="ghost-btn" type="button" data-action="skip-exercise">${t("ui.skip")}</button><button class="ghost-btn" type="button" data-action="show-active-exercise">${t("ui.showInstructions")}</button>` : ""}
          <button class="danger-btn" type="button" data-action="finish-workout">${t("ui.finishWorkout")}</button>
        </div>
      </section>

      <aside class="screen">
        <section class="timer-face">
          <div>
            <p class="eyebrow" style="color:var(--accent)">${t("ui.elapsed")}</p>
            <strong id="elapsed-time">${formatDuration(session.elapsedSeconds)}</strong>
          </div>
        </section>
        <section class="card">
          <p class="eyebrow">${t("ui.restTimer")}</p>
          <div class="big-number" id="rest-time">${formatDuration(restLeft)}</div>
          <p class="muted">${restLeft > 0 ? t("ui.restCopy") : t("ui.noRestTimer")}</p>
        </section>
        <section class="card">
          <p class="eyebrow">${t("ui.next")}</p>
          <h3>${next ? escapeHTML(EXERCISE_MAP[next.exerciseId]?.name || t("ui.next")) : t("ui.summary")}</h3>
          <p class="muted">${next ? escapeHTML(next.target) : t("ui.finishToSave")}</p>
        </section>
      </aside>
    </div>
  `;
}
