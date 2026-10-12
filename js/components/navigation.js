import { t } from "../i18n.js";

const items = [
  ["home", "nav.home", "⌂"],
  ["train", "nav.train", "▦"],
  ["progress", "nav.progress", "◌"],
  ["achievements", "nav.achievements", "★"],
  ["profile", "nav.profile", "◍"]
];

export function renderNavigation(route) {
  const nav = document.getElementById("app-nav");
  nav.innerHTML = items.map(([id, label, icon]) => `
    <a class="nav-link" href="#/${id}" ${route === id ? 'aria-current="page"' : ""}>
      <span aria-hidden="true">${icon}</span>
      ${t(label)}
    </a>
  `).join("");
}
