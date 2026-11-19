// Gallery: each section’s thumbnail strip keeps flowing (mouse sets speed · direction), and clicking a thumbnail opens a large white photo window in 0.3s.
// The index moves the dot to the section currently in view.
(() => {
  document.querySelectorAll(".sl-gal__pager").forEach((p) => SL.flow(p, p.querySelector(".sl-gal__track")));

  const modal = document.querySelector(".sl-modal");
  const cur = modal.querySelector(".sl-modal__current");
  const max = modal.querySelector(".sl-modal__max");
  const img = modal.querySelector(".sl-modal__image");
  const dots = modal.querySelector(".sl-modal__dots-track");
  const prev = modal.querySelector(".sl-modal__prev");
  const next = modal.querySelector(".sl-modal__next");
  let list = [], at = 0;
  // Original numbers: stops at the ends (no loop) and hides the end-side button. Page dots are a five-slot window — dots more than three away from the current dot are small
  const show = (i) => {
    const n = list.length;
    at = Math.max(0, Math.min(n - 1, i));
    prev.style.display = at <= 0 ? "none" : "block";
    next.style.display = at >= n - 1 ? "none" : "block";
    cur.textContent = String(at + 1).padStart(2, "0");
    img.dataset.label = list[at] + " · Large · landscape 3:2";
    const first = Math.min(Math.max(n - 5, 0), Math.max(0, at - 2));
    [...dots.children].forEach((d, k) => {
      let mini = Math.abs(at - k) > 2;
      if (at < 2 && k < 5) mini = false;
      if (at > n - 3 && k > n - 6) mini = false;
      d.classList.toggle("is-current", k === at);
      d.classList.toggle("is-mini", mini);
    });
    dots.style.transform = `translateX(${-first * 2}rem)`;
  };
  document.querySelectorAll(".sl-gal").forEach((g) => {
    const labels = [...g.querySelector(".sl-gal__set").children].map((a) => a.querySelector(".wf-img").dataset.label);
    g.querySelector(".sl-gal__pager").addEventListener("click", (e) => {
      const a = e.target.closest(".sl-gal__page");
      if (!a) return;
      e.preventDefault();
      list = labels;
      max.textContent = String(list.length).padStart(2, "0");
      dots.innerHTML = list.map(() => '<span class="sl-modal__dot"></span>').join("");
      show(Number(a.dataset.n));
      modal.classList.add("is-open");
      requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add("is-active")));
      SL.lenis?.stop();
    });
  });
  const close = () => {
    SL.lenis?.start();
    modal.classList.remove("is-active");
    setTimeout(() => modal.classList.contains("is-active") || modal.classList.remove("is-open"), SL.reduced ? 0 : 500);
  };
  prev.addEventListener("click", () => show(at - 1));
  next.addEventListener("click", () => show(at + 1));
  // Phone: a horizontal swipe over 50px turns the page — only intercepted when horizontal movement is larger than vertical (as in the original)
  const box = modal.querySelector(".sl-modal__container");
  let sx = 0, sy = 0, lock = null;
  box.addEventListener("touchstart", (e) => { lock = false; sx = e.changedTouches[0].pageX; sy = e.changedTouches[0].pageY; }, { passive: true });
  box.addEventListener("touchmove", (e) => {
    if (lock === null) return;
    const dx = e.changedTouches[0].pageX - sx, dy = e.changedTouches[0].pageY - sy;
    if (lock === false) lock = Math.abs(dx) > Math.abs(dy) ? true : null;
    if (lock) e.preventDefault();
  }, { passive: false });
  box.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].pageX - sx;
    if (lock && Math.abs(dx) > 50) show(at + (dx < 0 ? 1 : -1));
    lock = null;
  }, { passive: true });
  modal.querySelector(".sl-modal__close").addEventListener("click", close);
  addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });

  const links = [...document.querySelectorAll(".sl-toc__link")];
  links.forEach((a) => {
    const href = a.getAttribute("href");
    const target = href.length > 1 ? document.querySelector(href) : null;
    if (!target) return;
    const on = () => { links.forEach((l) => l.classList.remove("is-active")); a.classList.add("is-active"); };
    ScrollTrigger.create({ trigger: target, start: "top center", end: "bottom center", onEnter: on, onEnterBack: on });
  });
})();
