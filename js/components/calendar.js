import { todayKey } from "../utils.js";
import { dateFormat, monthYearFormat } from "../i18n.js";

export function heatmap(history, days = 98) {
  const byDate = new Map();
  history.forEach((workout) => byDate.set(workout.date, (byDate.get(workout.date) || 0) + workout.durationMinutes));
  const cells = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = todayKey(date);
    const minutes = byDate.get(key) || 0;
    const level = minutes === 0 ? 0 : minutes < 10 ? 1 : minutes < 25 ? 2 : minutes < 45 ? 3 : 4;
    cells.push(`<button class="heat-cell" type="button" data-action="show-date" data-date="${key}" data-level="${level}" aria-label="${dateFormat.format(date)}: ${minutes} phút tập"></button>`);
  }
  return `<div class="heatmap">${cells.join("")}</div>`;
}

export function monthCalendar(history, active = todayKey()) {
  const selected = new Date(`${active}T00:00:00`);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const byDate = new Set(history.map((workout) => workout.date));
  const cells = Array.from({ length: offset }, () => `<span></span>`);
  for (let day = 1; day <= days; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push(`<button class="calendar-day ${byDate.has(key) ? "has-workout" : ""}" type="button" data-action="show-date" data-date="${key}">${day}</button>`);
  }
  return `
    <div class="calendar">
      <div class="button-row" style="justify-content:space-between">
        <h3>${monthYearFormat.format(selected)}</h3>
        <span class="pill">Chọn ngày</span>
      </div>
      <div class="calendar-grid">
        ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => `<strong class="muted" style="text-align:center">${d}</strong>`).join("")}
        ${cells.join("")}
      </div>
    </div>
  `;
}
