// Contact — duplicates one screen into nine, and the grid size follows max(0.1, 1 - p/150) by scroll ratio p, lerping 0.1 at a time.
(() => {
  const { gsap } = window;
  const H = window.H;
  const GRID = { copies: 9, min: 0.1, span: 150, lerp: 0.1, length: 200 };
  const REVEAL = { from: 102, duration: 1.4, ease: H.o6, step: 0.1, globe: 3 };

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  const grid = document.querySelector("[data-grid]");
  const screen = grid.querySelector("[data-screen]");
  for (let i = 1; i < GRID.copies; i++) {
    const copy = screen.cloneNode(true);
    copy.querySelectorAll("[data-slot]").forEach((el) => el.removeAttribute("data-slot"));
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("a").forEach((a) => (a.tabIndex = -1));
    grid.appendChild(copy);
  }
  const progressEl = document.querySelector("[data-progress]");
  document.documentElement.style.setProperty("--c-length", GRID.length);

  async function boot() {
    await document.fonts.ready;
    const steps = [];
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const base = Number(el.dataset.reveal);
      H.splitLines(el).forEach((inner, i) => (steps[base + i] ||= []).push(inner));
    });
    document.querySelectorAll("[data-reveal-block]").forEach((el) => (steps[Number(el.dataset.revealBlock)] ||= []).push(el));
    const inners = steps.flat();
    const globes = [...document.querySelectorAll(".c-globe")];
    if (!H.reduce) {
      gsap.set(inners, { yPercent: REVEAL.from });
      gsap.set(globes, { opacity: 0 });
    }
    grid.classList.add("is-ready");

    const smooth = H.smoothScroll();
    let scale = 1, shown = null;
    function frame(t) {
      if (smooth) smooth.raf(t);
      const s = smooth ? smooth.animatedScroll : scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = Math.min(100, Math.max(0, Math.round(max > 0 ? (s / max) * 100 : 0)));
      if (p !== shown) progressEl.textContent = String((shown = p)).padStart(3, "0");
      const target = Math.max(GRID.min, 1 - p / GRID.span);
      scale = H.reduce ? target : (1 - GRID.lerp) * scale + GRID.lerp * target;
      grid.style.transform = `scale(${scale})`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    H.enter();
    if (H.reduce) return;
    steps.forEach((items, k) =>
      gsap.to(items, {
        yPercent: 0,
        duration: REVEAL.duration,
        ease: REVEAL.ease,
        delay: k * REVEAL.step,
        onComplete: () => items.forEach((i) => i.parentElement.classList.add("is-in")),
      }),
    );
    gsap.to(globes, { opacity: 1, duration: REVEAL.duration, ease: REVEAL.ease, delay: REVEAL.globe * REVEAL.step });
  }
  boot();
})();
