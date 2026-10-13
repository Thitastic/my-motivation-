import { t } from "../i18n.js";

const items = [
  ["home", "nav.home", "⌂"],
  ["train", "nav.train", "▦"],
  ["workout", "nav.workout", "▶"],
  ["progress", "nav.progress", "◌"],
  ["profile", "nav.profile", "●"]
];

export function renderNavigation(route) {
  const nav = document.getElementById("app-nav");
  nav.innerHTML = items.map(([id, label, icon]) => `
    <a class="nav-link" href="#/${id}" ${route === id ? 'aria-current="page"' : ""}>
      <span class="nav-icon" aria-hidden="true">${icon}</span>
      <span class="nav-label">${t(label)}</span>
    </a>
  `).join("");
}
