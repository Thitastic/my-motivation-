import { monthCalendar, heatmap } from "../components/calendar.js";
import { muscleGroupSummary } from "../components/muscleGroupCard.js";
import { levelProgress } from "../services/xpSystem.js";
import { aggregateMetrics } from "../services/workoutEngine.js";
import { EXERCISES } from "../data/exercises.js";
import { escapeHTML } from "../utils.js";
import { labelGroup, numberFormat, t } from "../i18n.js";

export function progressPage(state) {
  const metrics = aggregateMetrics(state);
  const level = levelProgress(state.xp.total);
  const prs = Object.entries(state.exerciseProgress)
    .filter(([, value]) => value.bestReps)
    .sort((a, b) => b[1].bestReps - a[1].bestReps)
    .slice(0, 8);
  const groupCounts = muscleCounts(state).slice(0, 5);
  return `
    <div class="screen">
      <section class="grid-tight">
        <div class="metric"><span class="label">${t("ui.sessions")}</span><strong>${numberFormat.format(metrics.workouts)}</strong></div>
        <div class="metric"><span class="label">Phút</span><strong>${numberFormat.format(metrics.minutes)}</strong></div>
        <div class="metric"><span class="label">${t("ui.set")}</span><strong>${numberFormat.format(metrics.sets)}</strong></div>
        <div class="metric"><span class="label">Số lần</span><strong>${numberFormat.format(metrics.reps)}</strong></div>
      </section>
      <section class="split">
        <article class="card">
          <p class="eyebrow">${t("ui.calendar")}</p>
          ${monthCalendar(state.workoutHistory)}
        </article>
        <article class="card">
          <p class="eyebrow">${t("ui.dateDetails")}</p>
          <div id="date-details"><p class="muted">${t("ui.selectDay")}</p></div>
        </article>
      </section>
      <section class="card">
        <p class="eyebrow">${t("ui.heatmap")}</p>
        ${heatmap(state.workoutHistory)}
      </section>
      <section class="grid">
        <article class="card">
          <p class="eyebrow">${t("ui.weeklyFrequency")}</p>
          <canvas class="chart" id="weekly-chart" width="640" height="280" data-chart="weekly"></canvas>
        </article>
        <article class="card">
          <p class="eyebrow">${t("ui.muscleDistribution")}</p>
          <canvas class="chart" id="muscle-chart" width="640" height="280" data-chart="muscle"></canvas>
          <div class="muscle-stat-list">
            ${groupCounts.length ? groupCounts.map(({ group, count }) => `
              <div class="muscle-stat">
                ${muscleGroupSummary(group)}
                <strong>${numberFormat.format(count)} buổi</strong>
              </div>
            `).join("") : `<p class="muted">Chưa có dữ liệu nhóm cơ.</p>`}
          </div>
        </article>
        <article class="card">
          <p class="eyebrow">${t("ui.xpProgression")}</p>
          <canvas class="chart" id="xp-chart" width="640" height="280" data-chart="xp"></canvas>
          <p class="muted">Cấp ${numberFormat.format(level.level)}, ${level.percent}% ${t("ui.toNextLevel")}.</p>
        </article>
      </section>
      <section class="card">
        <p class="eyebrow">${t("ui.personalRecords")}</p>
        <div class="grid-tight">
          ${prs.length ? prs.map(([id, record]) => {
            const exercise = EXERCISES.find((item) => item.id === id);
            return `<div class="metric"><span class="label">${escapeHTML(exercise?.name || id)}</span><strong>${numberFormat.format(record.bestReps)}</strong><p class="muted">${numberFormat.format(record.totalSets)} hiệp tổng</p></div>`;
          }).join("") : `<p class="muted">${t("ui.completeForPr")}</p>`}
        </div>
      </section>
    </div>
  `;
}

export function drawCharts(state) {
  document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const ratio = devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = 260 * ratio;
    ctx.scale(ratio, ratio);
    const width = rect.width;
    const height = 260;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--surface-2");
    ctx.fillRect(0, 0, width, height);
    if (canvas.dataset.chart === "muscle") drawMuscle(ctx, width, height, state);
    if (canvas.dataset.chart === "weekly") drawWeekly(ctx, width, height, state);
    if (canvas.dataset.chart === "xp") drawXP(ctx, width, height, state);
  });
}

function muscleCounts(state) {
  const counts = {};
  state.workoutHistory.forEach((workout) => (workout.muscleGroups || []).forEach((group) => counts[group] = (counts[group] || 0) + 1));
  return Object.entries(counts).map(([group, count]) => ({ group, count })).sort((a, b) => b.count - a.count);
}

function drawBars(ctx, width, height, values, labels, color = "#c7ff3d") {
  const max = Math.max(1, ...values);
  const gap = 8;
  const barWidth = (width - 40 - gap * (values.length - 1)) / values.length;
  ctx.font = "12px sans-serif";
  values.forEach((value, index) => {
    const barHeight = (height - 58) * (value / max);
    const x = 20 + index * (barWidth + gap);
    const y = height - 30 - barHeight;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.max(4, barWidth), barHeight);
    ctx.fillStyle = "#171a18";
    ctx.fillText(labels[index], x, height - 10);
  });
}

function drawWeekly(ctx, width, height, state) {
  const labels = [];
  const values = [];
  for (let i = 7; i >= 0; i -= 1) {
    const start = new Date();
    start.setDate(start.getDate() - i * 7);
    labels.push(`${start.getDate()}/${start.getMonth() + 1}`);
    values.push(state.workoutHistory.filter((item) => {
      const d = new Date(`${item.date}T00:00:00`);
      return Math.abs(d - start) < 7 * 86400000 && d >= start;
    }).length);
  }
  drawBars(ctx, width, height, values, labels, "#3aa7ff");
}

function drawMuscle(ctx, width, height, state) {
  const groups = muscleCounts(state).slice(0, 8);
  const labels = groups.map((item) => item.group);
  const values = groups.map((item) => item.count);
  drawBars(ctx, width, height, values.length ? values : [0], labels.length ? labels.map((label) => labelGroup(label).split(" ")[0]) : ["Trống"], "#28c977");
}

function drawXP(ctx, width, height, state) {
  const points = state.workoutHistory.reduce((acc, workout) => {
    const last = acc.length ? acc[acc.length - 1].value : 0;
    acc.push({ label: workout.date.slice(5), value: last + Number(workout.xpEarned || 0) });
    return acc;
  }, []).slice(-10);
  drawBars(ctx, width, height, points.length ? points.map((p) => p.value) : [0], points.length ? points.map((p) => p.label) : ["XP"], "#ffb13d");
}
