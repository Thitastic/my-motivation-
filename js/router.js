import { renderNavigation } from "./components/navigation.js";
import { t } from "./i18n.js";

export class Router {
  constructor(routes, getState) {
    this.routes = routes;
    this.getState = getState;
    this.current = "home";
  }

  start() {
    window.addEventListener("hashchange", () => this.render());
    this.render();
  }

  go(route) {
    location.hash = `#/${route}`;
  }

  render() {
    const route = (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];
    this.current = this.routes[route] ? route : "home";
    renderNavigation(this.current);
    document.getElementById("page-title").textContent = t(`pageTitles.${this.current}`) || "Kineto";
    const view = document.getElementById("app-view");
    view.classList.remove("view-enter");
    view.innerHTML = this.routes[this.current](this.getState());
    requestAnimationFrame(() => view.classList.add("view-enter"));
    view.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent("route-rendered", { detail: { route: this.current } }));
  }
}
