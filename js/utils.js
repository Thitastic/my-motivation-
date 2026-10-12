export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

export function uid(prefix = "id") {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `${prefix}_${Date.now().toString(36)}_${Array.from(random).map((n) => n.toString(36)).join("")}`;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function minutesBetween(start, end) {
  return Math.max(1, Math.round((new Date(end) - new Date(start)) / 60000));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function groupBy(items, getter) {
  return items.reduce((acc, item) => {
    const key = getter(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function downloadFile(filename, mime, content) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function safeJSONParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function isSameWeek(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  const start = (date) => {
    const copy = new Date(date);
    const day = (copy.getDay() + 6) % 7;
    copy.setHours(0, 0, 0, 0);
    copy.setDate(copy.getDate() - day);
    return copy.toISOString().slice(0, 10);
  };
  return start(da) === start(db);
}

export function previousDateKey(key, days = 1) {
  const date = new Date(`${key}T00:00:00`);
  date.setDate(date.getDate() - days);
  return todayKey(date);
}

export function toast(message) {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.remove(), 3400);
}

export function reward(message) {
  const item = document.createElement("div");
  item.className = "reward-pop";
  item.textContent = message;
  document.body.append(item);
  setTimeout(() => item.remove(), 1700);
}

export function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "confetti";
  document.body.append(layer);
  const colors = ["#c7ff3d", "#ff6b4a", "#4ab8ff", "#8c6cff", "#ffb13d"];
  for (let i = 0; i < 56; i += 1) {
    const piece = document.createElement("i");
    piece.style.cssText = `
      position:absolute;left:${Math.random() * 100}vw;top:-20px;width:9px;height:16px;
      background:${colors[i % colors.length]};border-radius:3px;
    `;
    layer.append(piece);
    piece.animate([
      { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${80 + Math.random() * 30}vh) rotate(${180 + Math.random() * 360}deg)`, opacity: 0 }
    ], { duration: 900 + Math.random() * 900, easing: "cubic-bezier(.2,.7,.2,1)" });
  }
  setTimeout(() => layer.remove(), 1900);
}
