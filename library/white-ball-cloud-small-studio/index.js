(() => {
  const stage = document.querySelector("[data-hy-stage]");
  if (!stage) return;
  const html = document.documentElement;

  // Arriving from an inner page, the stage hides tilted, then stands upright right away at 1s, and the camera moves in from 12 → 10.
  // Parts attach after DOMContentLoaded, so set the options now
  if (html.classList.contains("hy-enter")) {
    stage.classList.remove("is-active");
    stage.setAttribute("data-fx-ball-cloud-push", "enter: 1");
    requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add("is-active")));
  }

  // On leaving — the stage tilts 5° and vanishes in 1s, the camera pulls back and the ball turns off in .5s
  document.addEventListener("hy:leave", () => {
    stage.classList.remove("is-active");
    stage.dispatchEvent(new CustomEvent("fx:active", { detail: { active: false } }));
  });
  document.addEventListener("hy:back", () => {
    stage.classList.add("is-active");
    stage.dispatchEvent(new CustomEvent("fx:active", { detail: { active: true } }));
  });
})();
