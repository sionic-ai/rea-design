// Comparison tool — pressing an answer brings the next question in from 24px to the side in .3s (cubic-bezier(.23,1,.32,1)) and the bar fills, and when a name line attaches the icon grows and the name steps aside
(() => {
  const Q = ["Your first question goes here?", "Your second question goes here?", "Your third question goes here?", "Your fourth question here?", "Your fifth question goes here?", "Your last question here?"];
  const step = document.querySelector("[data-q-step]"), title = document.querySelector("[data-q-title]"), count = document.querySelector("[data-q-count]"), bar = document.querySelector("[data-q-bar]");
  if (step) {
    let i = 0;
    const go = (to, dir) => {
      i = Math.max(0, Math.min(Q.length - 1, to));
      title.textContent = Q[i]; count.textContent = `Question ${i + 1} / ${Q.length}`;
      bar.style.transform = `scaleX(${(i + 1) / Q.length})`;
      step.classList.remove("is-in", "is-back"); step.offsetWidth;
      step.classList.add("is-in"); if (dir < 0) step.classList.add("is-back");
    };
    step.querySelectorAll(".bw-quiz__opts button").forEach((b) => b.addEventListener("click", () => go(i + 1, 1)));
    document.querySelector("[data-q-skip]")?.addEventListener("click", () => go(i + 1, 1));
    document.querySelector("[data-q-back]")?.addEventListener("click", () => go(i - 1, -1));
    document.querySelector("[data-q-reset]")?.addEventListener("click", () => go(0, -1));
  }
  const pin = document.querySelector(".bw-cmp__pin"), table = document.querySelector(".bw-cmp__table");
  if (pin && table) {
    ScrollTrigger.create({ trigger: table, start: "top 110px", end: "bottom 110px", onToggle: (s) => (pin.dataset.pin = s.isActive ? "pinned" : s.progress >= 1 ? "gone" : "rest") });
  }
})();
