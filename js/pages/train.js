import { EXERCISES, MUSCLE_GROUPS, PROGRESSION_PATHS, EXERCISE_MAP } from "../data/exercises.js";
import { PROGRAMS } from "../data/programs.js";
import { exerciseCard } from "../components/exerciseCard.js";
import { muscleGroupCard } from "../components/muscleGroupCard.js";
import { performanceStatus } from "../services/workoutEngine.js";
import { escapeHTML } from "../utils.js";
import { labelDifficulty, labelGroup, labelLevel, numberFormat, t, vi } from "../i18n.js";

export function trainPage(state) {
  const custom = state.customRoutines || [];
  const recentGroups = new Set(state.workoutHistory.slice(-4).flatMap((workout) => workout.muscleGroups || []));
  return `
    <div class="screen">
      <section class="card">
        <p class="eyebrow">${t("ui.quickWorkout")}</p>
        <h2>Tập theo thời gian</h2>
        <div class="rail-scroll" style="margin-top:12px">
          ${[5, 10, 15, 20].map((minutes) => `
            <article class="card quick-card">
              <h3>${numberFormat.format(minutes)} phút</h3>
              <p class="muted">${t("ui.generatedWorkout")}</p>
              <button class="btn accent" type="button" data-action="start-quick" data-minutes="${minutes}">${t("ui.start")}</button>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.muscleTraining")}</p>
        <h2>Chọn nhóm cơ</h2>
        <div class="muscle-grid" style="margin-top:12px">
          ${MUSCLE_GROUPS.map((group) => muscleGroupCard(group, { selected: recentGroups.has(group) })).join("")}
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.guidedPrograms")}</p>
        <div class="grid">
          ${PROGRAMS.map((program) => `
            <article class="card">
              <h3>${escapeHTML(program.name)}</h3>
              <p class="muted">${escapeHTML(program.description)}</p>
              <div class="pill-list"><span class="pill">${escapeHTML(program.duration)}</span><span class="pill">${labelLevel(program.level)}</span></div>
              <button class="btn" type="button" data-action="start-program" data-program-id="${program.id}">${t("ui.startNextSession")}</button>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="card">
        <div class="button-row" style="justify-content:space-between">
          <div>
            <p class="eyebrow">${t("ui.customWorkout")}</p>
            <h2>${t("ui.buildRoutine")}</h2>
          </div>
          <button class="btn accent" type="button" data-action="save-custom-routine">${t("ui.saveRoutine")}</button>
        </div>
        <div class="field">
          <label for="custom-name">${t("ui.routineName")}</label>
          <input id="custom-name" value="${t("ui.customRoutineName")}">
        </div>
        <div class="grid-tight" style="margin-top:12px">
          ${EXERCISES.map((exercise) => `
            <label class="choice">
              <input type="checkbox" data-custom-exercise value="${exercise.id}">
              ${escapeHTML(exercise.name)}
            </label>
          `).join("")}
        </div>
        ${custom.length ? `<div class="pill-list">${custom.map((routine) => `<button class="ghost-btn" type="button" data-action="start-custom" data-routine-id="${routine.id}">${escapeHTML(routine.name)}</button>`).join("")}</div>` : ""}
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.skillTrees")}</p>
        <div class="grid">
          ${PROGRESSION_PATHS.map((path) => `
            <article class="card">
              <h3>${escapeHTML(path.name)}</h3>
              <div class="skill-tree">
                ${path.nodes.map((id) => {
                  const exercise = EXERCISE_MAP[id];
                  const status = performanceStatus(state, id);
                  const pr = state.exerciseProgress[id]?.bestReps || 0;
                  const criteria = exercise.easier ? `${t("ui.unlock")}: 6 ${t("ui.set").toLowerCase()} hoặc 40 ${t("ui.totalReps")} ở ${EXERCISE_MAP[exercise.easier]?.name || t("ui.previousExercise")}` : t("ui.starterNode");
                  return `
                    <div class="skill-row ${status === "locked" ? "locked" : ""}">
                      <div>
                        <strong>${escapeHTML(exercise.name)}</strong>
                        <div class="pill-list"><span class="pill difficulty">${labelDifficulty(exercise.difficulty)}</span><span class="pill">Kỷ lục ${numberFormat.format(pr)}</span><span class="pill">${escapeHTML(criteria)}</span></div>
                      </div>
                      <span class="status-dot ${status}" title="${vi.status[status] || status}"></span>
                    </div>
                  `;
                }).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">${t("ui.exerciseLibrary")}</p>
        <div class="toolbar">
          <select id="library-group" aria-label="${t("ui.filterExercises")}">
            <option value="">${t("ui.allMuscleGroups")}</option>
            ${MUSCLE_GROUPS.map((group) => `<option value="${escapeHTML(group)}">${labelGroup(group)}</option>`).join("")}
          </select>
          <input id="exercise-search" placeholder="${t("ui.searchExercises")}" aria-label="${t("ui.searchExercises")}">
        </div>
        <div id="exercise-list" class="grid" style="margin-top:14px">
          ${EXERCISES.map((exercise) => exerciseCard(exercise)).join("")}
        </div>
      </section>
    </div>
  `;
}
