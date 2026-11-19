// Services — process circle (next every 3.8s, pauses on hover, fixed on click), logo swap (2.4s), two-tone photo swap (3.2s)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-process]").forEach((box) => {
    const orbs = [...box.querySelectorAll("[data-orb]")], stages = [...box.querySelectorAll("[data-stage]")];
    let i = 0, timer = 0, held = false;
    const set = (n) => {
      i = n;
      orbs.forEach((o, k) => { o.classList.toggle("on", k === n); o.classList.toggle("done", k < n); });
      stages.forEach((s, k) => { s.classList.toggle("on", k === n); s.querySelector("button")?.setAttribute("aria-pressed", String(k === n)); });
    };
    const stop = () => { clearInterval(timer); timer = 0; };
    const run = () => { if (reduce || held || timer) return; timer = setInterval(() => set((i + 1) % stages.length), 3800); };
    const pick = (n) => { held = true; stop(); set(n); };
    stages.forEach((s, k) => s.querySelector("button")?.addEventListener("click", () => pick(k)));
    orbs.forEach((o, k) => o.addEventListener("click", () => pick(k)));
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", run);
    box.addEventListener("focusin", stop);
    set(0);
    if (reduce) box.classList.add("built");
    else new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return stop();
      if (box.classList.contains("built")) run(); else { box.classList.add("built"); setTimeout(run, 1800); }
    }, { threshold: 0.35 }).observe(box);
  });

  if (reduce) return;
  document.querySelectorAll("[data-photo-fader]").forEach((f) => {
    const layers = [...f.querySelectorAll(".fade-layer")];
    if (layers.length < 2) return;
    let i = 0, timer = 0, on = false;
    const step = () => { layers[i].classList.remove("on"); i = (i + 1) % layers.length; layers[i].classList.add("on"); timer = setTimeout(step, 3200); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; timer = setTimeout(step, 3200); }
      else if (!e.isIntersecting && on) { on = false; clearTimeout(timer); }
    }).observe(f);
  });
  document.querySelectorAll("[data-logo-fader]").forEach((f) => {
    const slides = [...f.querySelectorAll(".logo-slide")];
    if (slides.length < 2) return;
    let i = 0, timer = 0;
    const step = () => { slides[i].classList.remove("on"); i = (i + 1) % slides.length; slides[i].classList.add("on"); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(step, 2400);
      else if (!e.isIntersecting) { clearInterval(timer); timer = 0; }
    }).observe(f);
  });
})();
