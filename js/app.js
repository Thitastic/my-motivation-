import { Router } from "./router.js";
import { Storage } from "./storage.js";
import { EXERCISES, EXERCISE_MAP, MUSCLE_GROUPS, EQUIPMENT } from "./data/exercises.js";
import { PROGRAMS } from "./data/programs.js";
import { ACHIEVEMENTS } from "./data/achievements.js";
import { homePage } from "./pages/home.js";
import { trainPage } from "./pages/train.js";
import { workoutPage } from "./pages/workout.js";
import { progressPage, drawCharts } from "./pages/progress.js";
import { achievementsPage } from "./pages/achievements.js";
import { profilePage } from "./pages/profile.js";
import { recommendWorkout, initialRecommendation } from "./services/recommendations.js";
import { buildPlanFromExerciseIds, createSession, recordSet, skipExercise, addSet, finishWorkout, aggregateMetrics } from "./services/workoutEngine.js";
import { awardXP } from "./services/xpSystem.js";
import { createQRFrames, resolveQRFrames, exportJSON, encryptBackup, parseBackupFile, validateBackupObject } from "./services/qrTransfer.js";
import { escapeHTML, safeJSONParse, toast, reward, confetti, uid } from "./utils.js";
import { exerciseMedia } from "./components/exerciseMedia.js";
import { dateFormat, labelDifficulty, labelEquipment, labelGoal, labelGroup, labelLevel, numberFormat, t } from "./i18n.js";

const routes = { home: homePage, train: trainPage, workout: workoutPage, progress: progressPage, achievements: achievementsPage, profile: profilePage };
Storage.load();
document.getElementById("app").dataset.theme = Storage.state.preferences.theme || "light";

const router = new Router(routes, () => Storage.state);
let workoutTimer = null;
let scannerStream = null;
const scannedFrames = new Map();
let scannerTransferId = null;
let qrFrames = [];
let qrFrameIndex = 0;
let qrAutoplay = null;

router.start();
if (!Storage.state.profile) requestAnimationFrame(() => showOnboarding());

Storage.subscribe(() => {
  document.getElementById("app").dataset.theme = Storage.state.preferences.theme || "light";
});

window.addEventListener("route-rendered", (event) => {
  if (event.detail.route === "progress") requestAnimationFrame(() => drawCharts(Storage.state));
  if (event.detail.route === "workout") startWorkoutClock();
  else stopWorkoutClock();
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  haptic();
  if (action === "toggle-theme") toggleTheme();
  if (action === "open-onboarding") showOnboarding();
  if (action === "start-recommended") startPlan(recommendWorkout(Storage.state));
  if (action === "claim-freeze") claimFreeze();
  if (action === "start-quick") startPlan(recommendWorkout(Storage.state, { minutes: target.dataset.minutes }));
  if (action === "start-group") startPlan(recommendWorkout(Storage.state, { group: target.dataset.group }));
  if (action === "start-program") startProgram(target.dataset.programId);
  if (action === "start-single") startPlan(buildPlanFromExerciseIds(EXERCISE_MAP[target.dataset.exerciseId].name, [target.dataset.exerciseId], 3));
  if (action === "start-custom") startCustom(target.dataset.routineId);
  if (action === "save-custom-routine") saveCustomRoutine();
  if (action === "view-exercise") showExercise(target.dataset.exerciseId);
  if (action === "workout-start") setSessionStatus("running");
  if (action === "workout-pause") setSessionStatus("paused");
  if (action === "workout-resume") setSessionStatus("running");
  if (action === "finish-set") finishSet();
  if (action === "skip-exercise") updateSession((session) => skipExercise(session));
  if (action === "add-set") updateSession((session) => addSet(session));
  if (action === "finish-workout") completeWorkout();
  if (action === "show-date") showDateDetailsClean(target.dataset.date);
  if (action === "generate-qr") generateQR();
  if (action === "qr-next") showQRFrame(qrFrameIndex + 1);
  if (action === "qr-prev") showQRFrame(qrFrameIndex - 1);
  if (action === "qr-autoplay") toggleQRAutoplay();
  if (action === "download-backup") exportJSON(`kineto-backup-${Date.now()}.json`, Storage.exportState());
  if (action === "export-json") exportJSON(`kineto-backup-${Date.now()}.json`, Storage.exportState());
  if (action === "export-encrypted") exportEncrypted();
  if (action === "scan-qr") showScanner();
  if (action === "retry-camera") showScanner();
  if (action === "restore-preview") restorePreview(target.dataset.payloadId);
  if (action === "close-modal") closeModal();
  if (action === "save-profile-preferences") saveProfilePreferences();
  if (action === "toggle-media") toggleMedia(target);
  if (action === "replay-media") replayMedia(target);
  if (action === "scroll-instructions") document.getElementById("exercise-instructions")?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (action === "show-active-exercise") {
    const active = Storage.state.activeSession?.exercises?.[Storage.state.activeSession.currentExerciseIndex]?.exerciseId;
    if (active) showExercise(active);
  }
});

document.addEventListener("change", async (event) => {
  if (event.target.matches("#library-group, #exercise-search")) filterLibrary();
  if (event.target.matches("[data-action='import-file']")) importFile(event.target.files[0]);
  if (event.target.matches("#camera-select")) startCamera(event.target.value);
});

let sheetDragStart = null;
let exerciseSwipeStart = null;
document.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".modal-panel")) sheetDragStart = event.clientY;
  if (event.target.closest("[data-swipe-exercise]")) {
    exerciseSwipeStart = { x: event.clientX, y: event.clientY };
  }
});
document.addEventListener("pointerup", (event) => {
  if (sheetDragStart === null) return;
  const delta = event.clientY - sheetDragStart;
  sheetDragStart = null;
  if (delta > 110 && event.target.closest(".modal-panel")) closeModal();
});
document.addEventListener("pointerup", (event) => {
  if (!exerciseSwipeStart) return;
  const dx = event.clientX - exerciseSwipeStart.x;
  const dy = event.clientY - exerciseSwipeStart.y;
  exerciseSwipeStart = null;
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
  if (dx < 0) updateSession((session) => skipExercise(session));
  if (dx > 0) {
    const active = Storage.state.activeSession?.exercises?.[Storage.state.activeSession.currentExerciseIndex]?.exerciseId;
    if (active) showExercise(active);
  }
});

function toggleTheme() {
  Storage.update((draft) => {
    draft.preferences.theme = draft.preferences.theme === "dark" ? "light" : "dark";
  });
}

function haptic(pattern = 12) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

function claimFreeze() {
  if (Storage.markTodayFreezeEarned()) {
    reward(t("ui.freezeEarned"));
    router.render();
  } else {
    toast(t("ui.freezeAlready"));
  }
}

function showOnboarding() {
  const current = Storage.state.profile || {};
  const modal = document.getElementById("modal-root");
  modal.innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div class="modal-body">
        <p class="eyebrow">${t("ui.coachSetup")}</p>
        <h2 id="onboarding-title">${t("ui.buildFirstPlan")}</h2>
        <form id="onboarding-form" class="screen">
          <div class="field"><label for="nickname">${t("ui.nickname")}</label><input id="nickname" required maxlength="40" value="${escapeHTML(current.nickname || "")}" placeholder="An"></div>
          <div class="grid">
            <div class="field"><label for="fitness-level">${t("ui.currentLevel")}</label><select id="fitness-level"><option value="beginner">${labelLevel("beginner")}</option><option value="intermediate">${labelLevel("intermediate")}</option><option value="advanced">${labelLevel("advanced")}</option></select></div>
            <div class="field"><label for="main-goal">${t("ui.mainGoal")}</label><select id="main-goal"><option value="foundation">${labelGoal("foundation")}</option><option value="strength">${labelGoal("strength")}</option><option value="mobility">${labelGoal("mobility")}</option><option value="consistency">${labelGoal("consistency")}</option></select></div>
            <div class="field"><label for="duration">${t("ui.workoutDuration")}</label><select id="duration">${[5, 10, 15, 20].map((n) => `<option value="${n}">${n} phút</option>`).join("")}</select></div>
            <div class="field"><label for="training-days">${t("ui.trainingDays")} / tuần</label><select id="training-days">${[2, 3, 4, 5, 6].map((n) => `<option value="${n}">${n} ngày</option>`).join("")}</select></div>
          </div>
          <fieldset class="field-stack">
            <legend>${t("ui.availableEquipment")}</legend>
            <div class="choice-grid">
              ${EQUIPMENT.map((item) => `<label class="choice"><input type="checkbox" name="equipment" value="${item}" ${item === "None" ? "checked" : ""}>${labelEquipment(item)}</label>`).join("")}
            </div>
          </fieldset>
          <div class="button-row">
            <button class="btn accent" type="submit">${t("ui.saveSetup")}</button>
            ${Storage.state.profile ? `<button class="ghost-btn" type="button" data-action="close-modal">${t("ui.cancel")}</button>` : ""}
          </div>
        </form>
      </div>
    </section>
  `;
  modal.querySelector("#fitness-level").value = current.level || "beginner";
  modal.querySelector("#main-goal").value = current.goal || "foundation";
  modal.querySelector("#duration").value = current.duration || 15;
  modal.querySelector("#training-days").value = current.trainingDays || 3;
  modal.querySelector("#onboarding-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const equipment = [...form.querySelectorAll("[name='equipment']:checked")].map((input) => input.value);
    const profile = {
      nickname: form.querySelector("#nickname").value.trim() || t("ui.athlete"),
      level: form.querySelector("#fitness-level").value,
      goal: form.querySelector("#main-goal").value,
      equipment: equipment.length ? equipment : ["None"],
      duration: Number(form.querySelector("#duration").value),
      trainingDays: Number(form.querySelector("#training-days").value)
    };
    profile.recommendation = initialRecommendation(profile);
    Storage.createProfile(profile);
    closeModal();
    router.render();
    toast(t("ui.profileSaved"));
  });
}

function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
  stopScanner();
  if (qrAutoplay) clearInterval(qrAutoplay);
  qrAutoplay = null;
  scannedFrames.clear();
  scannerTransferId = null;
}

function startPlan(plan) {
  if (!plan.exercises.length) {
    toast(t("ui.noSafeExercises"));
    return;
  }
  closeModal();
  Storage.update((draft) => {
    draft.activeSession = createSession(plan);
  });
  router.go("workout");
}

function startProgram(programId) {
  const program = PROGRAMS.find((item) => item.id === programId);
  if (!program) return;
  const index = Storage.state.workoutHistory.filter((item) => item.planId === programId).length % program.days.length;
  startPlan(buildPlanFromExerciseIds(program.name, program.days[index], 3));
}

function startCustom(id) {
  const routine = Storage.state.customRoutines.find((item) => item.id === id);
  if (routine) startPlan(routine);
}

function saveCustomRoutine() {
  const selected = [...document.querySelectorAll("[data-custom-exercise]:checked")].map((input) => input.value);
  const name = document.getElementById("custom-name")?.value.trim() || t("ui.customWorkout");
  if (!selected.length) {
    toast(t("ui.chooseExercise"));
    return;
  }
  const routine = buildPlanFromExerciseIds(name, selected, 3);
  routine.id = uid("routine");
  Storage.update((draft) => draft.customRoutines.push(routine));
  router.render();
  toast(t("ui.routineSaved"));
}

function setSessionStatus(status) {
  updateSession((session) => {
    session.status = status;
    if (status !== "running") session.restUntil = null;
    return session;
  }, false);
  startWorkoutClock();
}

function updateSession(mutator, rerender = true) {
  Storage.update((draft) => {
    if (draft.activeSession) draft.activeSession = mutator(draft.activeSession);
  });
  if (rerender) router.render();
}

function finishSet() {
  const reps = Number(document.getElementById("actual-reps")?.value || 0);
  updateSession((session) => recordSet(session, reps));
  reward(t("ui.setSaved"));
}

function completeWorkout() {
  if (!Storage.state.activeSession) return;
  let result;
  Storage.update((draft) => {
    result = finishWorkout(draft, draft.activeSession);
    evaluateAchievements(draft);
  });
  if (result?.duplicate) {
    toast(t("ui.duplicateWorkout"));
    return;
  }
  confetti();
  showSummaryClean(result);
  router.render();
}

function evaluateAchievements(state) {
  const metrics = aggregateMetrics(state);
  ACHIEVEMENTS.forEach((achievement) => {
    if (state.achievements[achievement.id]) return;
    if ((metrics[achievement.metric] || 0) >= achievement.target) {
      state.achievements[achievement.id] = new Date().toISOString();
      awardXP(state, achievement.xp, `achievement:${achievement.id}`);
    }
  });
}

function showSummary(result) {
  const workout = result.workout;
  const modal = document.getElementById("modal-root");
  modal.innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div class="modal-body">
        <p class="eyebrow">${t("ui.workoutComplete")}</p>
        <h2 id="summary-title">${escapeHTML(workout.name)}</h2>
        <div class="grid-tight">
          <div class="metric"><span class="label">Thời lượng</span><strong>${numberFormat.format(workout.durationMinutes)}p</strong></div>
          <div class="metric"><span class="label">${t("ui.set")}</span><strong>${numberFormat.format(workout.completedSets)}</strong></div>
          <div class="metric"><span class="label">Số lần</span><strong>${numberFormat.format(workout.totalReps)}</strong></div>
          <div class="metric"><span class="label">XP</span><strong>${numberFormat.format(result.xpAwarded)}</strong></div>
        </div>
        <p class="muted">${result.newPRs.length ? `${numberFormat.format(result.newPRs.length)} kỷ lục cá nhân mới.` : t("ui.noNewPr")} ${result.levelUp ? t("ui.levelUp") : ""}</p>
        <button class="btn accent" type="button" data-action="close-modal">${t("ui.doneButton")}</button>
      </div>
    </section>
  `;
}

function showSummaryClean(result) {
  const workout = result.workout;
  const modal = document.getElementById("modal-root");
  modal.innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="summary-title">
      <div class="modal-body">
        <p class="eyebrow">${t("ui.workoutComplete")}</p>
        <h2 id="summary-title">${escapeHTML(workout.name)}</h2>
        <div class="grid-tight">
          <div class="metric"><span class="label">Thời lượng</span><strong>${numberFormat.format(workout.durationMinutes)}p</strong></div>
          <div class="metric"><span class="label">${t("ui.set")}</span><strong>${numberFormat.format(workout.completedSets)}</strong></div>
          <div class="metric"><span class="label">Số lần</span><strong>${numberFormat.format(workout.totalReps)}</strong></div>
          <div class="metric"><span class="label">XP</span><strong>${numberFormat.format(result.xpAwarded)}</strong></div>
        </div>
        <p class="muted">${result.newPRs.length ? `${numberFormat.format(result.newPRs.length)} kỷ lục cá nhân mới.` : t("ui.noNewPr")} ${result.levelUp ? t("ui.levelUp") : ""}</p>
        <button class="btn accent" type="button" data-action="close-modal">${t("ui.doneButton")}</button>
      </div>
    </section>
  `;
}

function startWorkoutClock() {
  stopWorkoutClock();
  if (!Storage.state.activeSession || location.hash.replace(/^#\/?/, "") !== "workout") return;
  workoutTimer = setInterval(() => {
    const session = Storage.state.activeSession;
    if (!session) return;
    if (session.status === "running") {
      Storage.update((draft) => {
        if (draft.activeSession) draft.activeSession.elapsedSeconds += 1;
      });
    }
    const elapsed = document.getElementById("elapsed-time");
    if (elapsed) elapsed.textContent = `${Math.floor(session.elapsedSeconds / 60)}:${String(session.elapsedSeconds % 60).padStart(2, "0")}`;
    const rest = document.getElementById("rest-time");
    if (rest) {
      const restLeft = session.restUntil ? Math.max(0, Math.ceil((new Date(session.restUntil) - Date.now()) / 1000)) : 0;
      rest.textContent = `${Math.floor(restLeft / 60)}:${String(restLeft % 60).padStart(2, "0")}`;
    }
  }, 1000);
}

function stopWorkoutClock() {
  if (workoutTimer) clearInterval(workoutTimer);
  workoutTimer = null;
}

function showExercise(id) {
  const exercise = EXERCISE_MAP[id];
  if (!exercise) return;
  document.getElementById("modal-root").innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="exercise-title">
      <div class="modal-body">
        ${exerciseMedia(exercise, { large: true })}
        <p class="eyebrow">${labelGroup(exercise.muscleGroups[0])}</p>
        <h2 id="exercise-title">${escapeHTML(exercise.name)}</h2>
        <p class="muted">${escapeHTML(exercise.description)}</p>
        <div class="pill-list">
          <span class="pill difficulty">${labelDifficulty(exercise.difficulty)}</span>
          <span class="pill">${exercise.equipment.map(labelEquipment).join(", ")}</span>
          <span class="pill">${escapeHTML(exercise.target)}</span>
        </div>
        <div class="grid">
          <div id="exercise-instructions"><h3>${t("ui.instructions")}</h3><ol>${exercise.instructions.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ol></div>
          <div><h3>${t("ui.commonMistakes")}</h3><ul>${exercise.commonMistakes.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
          <div><h3>${t("ui.safety")}</h3><ul>${exercise.safetyTips.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
        </div>
        <article class="card">
          <p class="eyebrow">${t("ui.suggestedWorkout")}</p>
          <h3>${numberFormat.format(exercise.recommendedSets)} ${t("ui.set").toLowerCase()} x ${escapeHTML(exercise.target)}</h3>
          <p class="muted">${t("ui.restBetweenSets")}: ${numberFormat.format(exercise.restSeconds)} giây</p>
        </article>
        <div class="button-row" style="margin-top:14px">
          ${exercise.easier ? `<button class="ghost-btn" data-action="view-exercise" data-exercise-id="${exercise.easier}">${t("ui.easierVariation")}</button>` : ""}
          ${exercise.harder ? `<button class="ghost-btn" data-action="view-exercise" data-exercise-id="${exercise.harder}">${t("ui.harderVariation")}</button>` : ""}
          <button class="btn accent" data-action="start-single" data-exercise-id="${exercise.id}">${t("ui.trainExercise")}</button>
          <button class="ghost-btn" data-action="close-modal">${t("ui.close")}</button>
        </div>
      </div>
    </section>
  `;
}

function filterLibrary() {
  const group = document.getElementById("library-group")?.value || "";
  const query = (document.getElementById("exercise-search")?.value || "").toLowerCase();
  const list = document.getElementById("exercise-list");
  if (!list) return;
  const items = EXERCISES.filter((exercise) => (!group || exercise.muscleGroups.includes(group)) && `${exercise.name} ${exercise.originalName}`.toLowerCase().includes(query));
  list.innerHTML = items.map((exercise) => `
    <article class="card exercise-card">
      <div class="exercise-art"><img src="${exercise.media?.thumbnail || exercise.media?.src || exercise.illustration}" alt="" loading="lazy"></div>
      <div><h3>${escapeHTML(exercise.name)}</h3><p class="muted">${escapeHTML(exercise.description)}</p><button class="ghost-btn" data-action="view-exercise" data-exercise-id="${exercise.id}">${t("ui.details")}</button></div>
    </article>
  `).join("");
}

function showDateDetails(date) {
  const target = document.getElementById("date-details");
  if (!target) return;
  const workouts = Storage.state.workoutHistory.filter((item) => item.date === date);
  target.innerHTML = workouts.length ? workouts.map((workout) => `
    <article class="metric">
      <span class="label">${escapeHTML(workout.name)}</span>
      <strong>${numberFormat.format(workout.durationMinutes)}p</strong>
      <p class="muted">${numberFormat.format(workout.completedSets)} hiệp, ${numberFormat.format(workout.totalReps)} lần, ${numberFormat.format(workout.xpEarned)} XP</p>
      <div class="pill-list">${workout.muscleGroups.map((group) => `<span class="pill">${labelGroup(group)}</span>`).join("")}</div>
    </article>
  `).join("") : `<p class="muted">${t("ui.noWorkoutDate")} ${escapeHTML(dateFormat.format(new Date(`${date}T00:00:00`)))}.</p>`;
}

function showDateDetailsClean(date) {
  const target = document.getElementById("date-details");
  if (!target) return;
  const workouts = Storage.state.workoutHistory.filter((item) => item.date === date);
  target.innerHTML = workouts.length ? workouts.map((workout) => `
    <article class="metric">
      <span class="label">${escapeHTML(workout.name)}</span>
      <strong>${numberFormat.format(workout.durationMinutes)}p</strong>
      <p class="muted">${numberFormat.format(workout.completedSets)} hiệp, ${numberFormat.format(workout.totalReps)} lần, ${numberFormat.format(workout.xpEarned)} XP</p>
      <div class="pill-list">${workout.muscleGroups.map((group) => `<span class="pill">${labelGroup(group)}</span>`).join("")}</div>
    </article>
  `).join("") : `<p class="muted">${t("ui.noWorkoutDate")} ${escapeHTML(dateFormat.format(new Date(`${date}T00:00:00`)))}.</p>`;
}

async function generateQR() {
  if (!window.QRCode) {
    toast(t("ui.qrUnavailable"));
    return;
  }
  try {
    qrFrames = await createQRFrames(Storage.exportState());
    qrFrameIndex = 0;
    document.getElementById("modal-root").innerHTML = `
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="qr-title">
        <div class="modal-body qr-transfer">
          <div>
            <p class="eyebrow">${t("ui.qrBackup")}</p>
            <h2 id="qr-title">${t("ui.generateQR")}</h2>
            <p class="muted">${t("ui.qrInstruction")}</p>
          </div>
          <div class="qr-progress">
            <div class="progress-track"><div id="qr-progress-fill" class="progress-fill"></div></div>
            <strong id="qr-progress-text"></strong>
          </div>
          <div class="qr-stage"><canvas id="qr-canvas" aria-label="Mã QR chuyển dữ liệu"></canvas></div>
          <p id="qr-frame-copy" class="muted"></p>
          <div class="button-row">
            <button class="ghost-btn" type="button" data-action="qr-prev">${t("ui.previousFrame")}</button>
            <button class="ghost-btn" type="button" data-action="qr-next">${t("ui.nextFrame")}</button>
            ${qrFrames.length > 1 ? `<button class="ghost-btn" type="button" data-action="qr-autoplay">${t("ui.autoplayFrames")}</button>` : ""}
            <button class="ghost-btn" type="button" data-action="download-backup">${t("ui.downloadBackup")}</button>
            <button class="danger-btn" type="button" data-action="close-modal">${t("ui.cancel")}</button>
          </div>
        </div>
      </section>
    `;
    showQRFrame(0);
  } catch (error) {
    if (error.code === "QR_TOO_LARGE") {
      document.getElementById("modal-root").innerHTML = `
        <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="large-transfer-title">
          <div class="modal-body">
            <p class="eyebrow">${t("ui.qrBackup")}</p>
            <h2 id="large-transfer-title">${t("ui.largeTransfer")}</h2>
            <p class="muted">Dữ liệu cần khoảng ${numberFormat.format(error.frameCount || 0)} mã QR. Tệp sao lưu sẽ đáng tin cậy hơn.</p>
            <div class="button-row">
              <button class="btn accent" type="button" data-action="download-backup">${t("ui.downloadBackup")}</button>
              <button class="ghost-btn" type="button" data-action="close-modal">${t("ui.cancel")}</button>
            </div>
          </div>
        </section>
      `;
      return;
    }
    toast(error.message || t("ui.importFailed"));
  }
}

function showQRFrame(index) {
  if (!qrFrames.length) return;
  qrFrameIndex = (index + qrFrames.length) % qrFrames.length;
  const canvas = document.getElementById("qr-canvas");
  if (!canvas) return;
  window.QRCode.toCanvas(canvas, qrFrames[qrFrameIndex], { margin: 2, width: 320, errorCorrectionLevel: "M" });
  const progress = Math.round(((qrFrameIndex + 1) / qrFrames.length) * 100);
  document.getElementById("qr-progress-fill")?.style.setProperty("--value", `${progress}%`);
  const text = document.getElementById("qr-progress-text");
  if (text) text.textContent = `${qrFrameIndex + 1}/${qrFrames.length}`;
  const copy = document.getElementById("qr-frame-copy");
  if (copy) copy.textContent = qrFrames.length === 1 ? t("ui.qrSingleReady") : `${t("ui.frame")} ${qrFrameIndex + 1}/${qrFrames.length}. ${t("ui.qrSequential")}`;
}

function toggleQRAutoplay() {
  if (qrAutoplay) {
    clearInterval(qrAutoplay);
    qrAutoplay = null;
    toast(t("ui.pauseAutoplay"));
    return;
  }
  qrAutoplay = setInterval(() => showQRFrame(qrFrameIndex + 1), 1600);
  toast(t("ui.autoplayFrames"));
}

async function exportEncrypted() {
  const password = prompt(t("ui.backupPassword"));
  if (!password) return;
  const encrypted = await encryptBackup(Storage.exportState(), password);
  exportJSON(`kineto-encrypted-${Date.now()}.json`, encrypted);
}

async function importFile(file) {
  if (!file) return;
  try {
    const password = file.name.toLowerCase().includes("encrypted") ? prompt(t("ui.passwordPrompt")) : "";
    const text = await parseBackupFile(file, password || "");
    previewIncoming(text);
  } catch (error) {
    toast(error.message || t("ui.importFailed"));
  }
}

function previewIncoming(text) {
  const incoming = safeJSONParse(text);
  try {
    validateBackupObject(incoming);
  } catch (error) {
    toast(t("ui.invalidBackup"));
    return;
  }
  const payloadId = uid("payload");
  window[payloadId] = incoming;
  document.getElementById("modal-root").innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="restore-title">
      <div class="modal-body">
        <p class="eyebrow">${t("ui.restorePreview")}</p>
        <h2 id="restore-title">${escapeHTML(incoming.profile?.nickname || t("ui.incomingProfile"))}</h2>
        <p class="muted">${t("ui.overwriteWarning")}</p>
        <div class="grid-tight">
          <div class="metric"><span class="label">${t("ui.workouts")}</span><strong>${numberFormat.format(incoming.workoutHistory?.length || 0)}</strong></div>
          <div class="metric"><span class="label">XP</span><strong>${numberFormat.format(incoming.xp?.total || 0)}</strong></div>
          <div class="metric"><span class="label">${t("ui.customWorkout")}</span><strong>${numberFormat.format(incoming.customRoutines?.length || 0)}</strong></div>
        </div>
        <div class="button-row"><button class="danger-btn" data-action="restore-preview" data-payload-id="${payloadId}">${t("ui.restoreData")}</button><button class="ghost-btn" data-action="close-modal">${t("ui.cancel")}</button></div>
      </div>
    </section>
  `;
}

function restorePreview(payloadId) {
  const incoming = window[payloadId];
  if (!incoming) return;
  try {
    Storage.importState(incoming);
    delete window[payloadId];
    closeModal();
    router.render();
    toast(t("ui.profileRestored"));
  } catch (error) {
    toast(error.message || t("ui.importFailed"));
  }
}

async function showScanner() {
  const modal = document.getElementById("modal-root");
  stopScanner();
  scannedFrames.clear();
  scannerTransferId = null;
  modal.innerHTML = `
    <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
      <div class="modal-body scanner-box">
        <p class="eyebrow">${t("ui.qrImport")}</p>
        <h2 id="scanner-title">${t("ui.scanFrames")}</h2>
        <p class="muted">${t("ui.scannerCopy")}</p>
        <div class="field" id="camera-field" hidden>
          <label for="camera-select">${t("ui.cameraSelect")}</label>
          <select id="camera-select"></select>
        </div>
        <video id="scanner-video" autoplay playsinline muted></video>
        <canvas id="scanner-canvas" class="sr-only"></canvas>
        <div class="scanner-status-grid">
          <p id="scanner-status" class="muted">${t("ui.startingCamera")}</p>
          <p id="scanner-missing" class="muted"></p>
        </div>
        <div class="button-row"><button class="ghost-btn" data-action="retry-camera">${t("ui.retryCamera")}</button><button class="btn" data-action="close-modal">${t("ui.stop")}</button></div>
      </div>
    </section>
  `;
  if (!window.jsQR) {
    document.getElementById("scanner-status").textContent = t("ui.scannerUnavailable");
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    document.getElementById("scanner-status").textContent = t("ui.cameraFailed");
    return;
  }
  try {
    await populateCameras();
    await startCamera();
  } catch (error) {
    document.getElementById("scanner-status").textContent = t("ui.cameraFailed");
  }
}

async function populateCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const select = document.getElementById("camera-select");
  const field = document.getElementById("camera-field");
  if (!select || !field || cameras.length < 2) return;
  field.hidden = false;
  select.innerHTML = cameras.map((camera, index) => `<option value="${camera.deviceId}">${camera.label || `Camera ${index + 1}`}</option>`).join("");
}

async function startCamera(deviceId = "") {
  stopScanner();
  const constraints = deviceId ? { video: { deviceId: { exact: deviceId } } } : { video: { facingMode: "environment" } };
  scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
  const video = document.getElementById("scanner-video");
  if (!video) return;
  video.srcObject = scannerStream;
  await video.play().catch(() => {});
  scanLoop();
}

function scanLoop() {
  const video = document.getElementById("scanner-video");
  const canvas = document.getElementById("scanner-canvas");
  const status = document.getElementById("scanner-status");
  const missingText = document.getElementById("scanner-missing");
  if (!video || !canvas || !scannerStream) return;
  const ctx = canvas.getContext("2d");
  const tick = async () => {
    if (!scannerStream || !video.videoWidth) {
      requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const code = window.jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
    if (code?.data) {
      const frame = safeJSONParse(code.data);
      if (frame?.type === "kineto-transfer") {
        if (scannerTransferId && scannerTransferId !== frame.transferId) {
          scannedFrames.clear();
        }
        scannerTransferId = frame.transferId;
        if (!scannedFrames.has(frame.index)) haptic(24);
        scannedFrames.set(frame.index, code.data);
        const missing = [];
        for (let i = 0; i < frame.total; i += 1) {
          if (!scannedFrames.has(i)) missing.push(i + 1);
        }
        status.textContent = `${t("ui.captured")} ${scannedFrames.size}/${frame.total} ${t("ui.frames")}.`;
        if (missingText) missingText.textContent = missing.length ? `${t("ui.missingFrames")}: ${missing.join(", ")}` : "";
        if (scannedFrames.size === frame.total && missing.length === 0) {
          try {
            const text = await resolveQRFrames([...scannedFrames.values()]);
            stopScanner();
            scannedFrames.clear();
            previewIncoming(text);
            return;
          } catch (error) {
            status.textContent = error.message;
          }
        }
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

function stopScanner() {
  if (scannerStream) scannerStream.getTracks().forEach((track) => track.stop());
  scannerStream = null;
}

function saveProfilePreferences() {
  const profile = Storage.state.profile;
  if (!profile) return;
  const equipment = [...document.querySelectorAll("[data-profile-equipment]:checked")].map((input) => input.value);
  Storage.update((draft) => {
    draft.profile.duration = Number(document.getElementById("profile-duration").value);
    draft.profile.trainingDays = Number(document.getElementById("profile-days").value);
    draft.profile.equipment = equipment.length ? equipment : ["None"];
    draft.profile.recommendation = initialRecommendation(draft.profile);
  });
  router.render();
  toast(t("ui.preferencesSaved"));
}

function toggleMedia(button) {
  const media = button.closest(".exercise-demo")?.querySelector("video, img");
  if (!media) return;
  if (media.tagName === "VIDEO") {
    if (media.paused) media.play();
    else media.pause();
    return;
  }
  media.classList.toggle("media-paused");
}

function replayMedia(button) {
  const media = button.closest(".exercise-demo")?.querySelector("video, img");
  if (!media) return;
  if (media.tagName === "VIDEO") {
    media.currentTime = 0;
    media.play();
  } else {
    media.animate([{ transform: "scale(.985)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out" });
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
