export function progressRing(percent, label = `${percent}%`) {
  const radius = 48;
  const circumference = Math.PI * 2 * radius;
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference;
  return `
    <svg class="progress-ring" viewBox="0 0 120 120" aria-label="${label}">
      <circle class="ring-track" cx="60" cy="60" r="${radius}"></circle>
      <circle class="ring-value" cx="60" cy="60" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
      <text class="ring-text" x="60" y="66">${label}</text>
    </svg>
  `;
}
