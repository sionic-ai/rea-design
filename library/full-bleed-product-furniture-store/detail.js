// Detail — choosing photo set, color and quantity, bottom cart bar after passing the add button, before/after compare handle drag
(() => {
  const thumbs = [...document.querySelectorAll(".kd-thumb")];
  const main = document.querySelector(".kd-gallery__main .wf-img");
  thumbs.forEach((t) => t.addEventListener("click", () => {
    thumbs.forEach((x) => x.classList.toggle("is-current", x === t));
    main.dataset.label = `${t.querySelector(".wf-img").dataset.label} · Large · landscape 3:2`;
  }));

  const swatches = [...document.querySelectorAll(".kd-swatch__btn")];
  const label = document.querySelector(".kd-info__label strong");
  swatches.forEach((s) => s.addEventListener("click", () => {
    swatches.forEach((x) => x.classList.toggle("is-current", x === s));
    label.textContent = s.querySelector(".kd-swatch__name").textContent;
  }));

  const qty = document.querySelector(".kd-qty");
  if (qty) {
    const n = qty.querySelector("span");
    const [minus, plus] = qty.querySelectorAll("button");
    minus.addEventListener("click", () => { n.textContent = Math.max(1, Number(n.textContent) - 1); });
    plus.addEventListener("click", () => { n.textContent = Number(n.textContent) + 1; });
  }

  const bar = document.querySelector(".kd-sticky");
  const buy = document.querySelector(".kd-buy");
  if (bar && buy) {
    new IntersectionObserver(([e]) => {
      const past = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle("is-on", past);
      bar.setAttribute("aria-hidden", String(!past));
    }).observe(buy);
  }

  document.querySelectorAll(".kd-compare").forEach((box) => {
    const set = (x) => {
      const r = box.getBoundingClientRect();
      box.style.setProperty("--pos", `${Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))}%`);
    };
    let drag = false;
    box.addEventListener("pointerdown", (e) => { drag = true; box.setPointerCapture(e.pointerId); set(e.clientX); });
    box.addEventListener("pointermove", (e) => { if (drag) set(e.clientX); });
    box.addEventListener("pointerup", () => { drag = false; });
    box.addEventListener("pointercancel", () => { drag = false; });
    box.querySelector(".kd-compare__handle").addEventListener("keydown", (e) => {
      const cur = parseFloat(box.style.getPropertyValue("--pos")) || 50;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        box.style.setProperty("--pos", `${Math.min(100, Math.max(0, cur + (e.key === "ArrowLeft" ? -5 : 5)))}%`);
      }
    });
  });
})();
