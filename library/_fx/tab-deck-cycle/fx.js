// Tab progress card stack: the progress cell in the chosen tab fills linearly over every seconds, then moves to the next tab, and the front card of the stack
// While shrinking to .976x and vanishing, the new card appears settling to its size from 1.065x vertical (.5s cubic-bezier(.44,0,.56,1)).
// Pressing a tab goes to that tab and progress restarts — pauses when the panel is offscreen — Brand home page intro case.
(() => {
  kfFx.register("tab-deck-cycle", (el, { options, reduce }) => {
    const tabs = [...el.querySelectorAll('[data-fx-part="tab"]')];
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!tabs.length || !cards.length) return;
    const fills = tabs.map((t) => t.querySelector('[data-fx-part="fill"]'));
    const every = +options.every || 7, dur = +(options.dur ?? 0.5);
    const press = +(options.press ?? 0.976), stretch = +(options.stretch ?? 1.065);
    const ease = kfFx.ease(options.ease || "0.44,0,0.56,1", "sine.inOut");
    const hasGsap = typeof gsap !== "undefined";
    let cur = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    let start = performance.now(), raf = 0, seen = true, paused = 0;

    const paint = (i) => {
      tabs.forEach((t, n) => { t.classList.toggle("is-fx-on", n === i); t.setAttribute("aria-selected", n === i ? "true" : "false"); });
      fills.forEach((f) => f && (f.style.transform = "scaleX(0)"));
    };
    const place = (i) => cards.forEach((c, n) => { c.style.visibility = n === i ? "visible" : "hidden"; c.style.zIndex = n === i ? 2 : 1; c.style.opacity = n === i ? 1 : 0; c.style.transform = ""; });
    const go = (i) => {
      i = ((i % tabs.length) + tabs.length) % tabs.length;
      if (i === cur) { start = performance.now(); return; }
      const out = cards[cur % cards.length], inn = cards[i % cards.length];
      cur = i; start = performance.now();
      paint(i);
      if (!hasGsap || reduce || out === inn) { place(i % cards.length); return; }
      gsap.killTweensOf([out, inn]);
      inn.style.visibility = "visible"; inn.style.zIndex = 2; out.style.zIndex = 1;
      gsap.to(out, { scale: press, opacity: 0, duration: dur, ease, onComplete: () => { out.style.visibility = "hidden"; gsap.set(out, { scale: 1 }); } });
      gsap.fromTo(inn, { scaleY: stretch, opacity: 0, transformOrigin: "50% 0%" }, { scaleY: 1, opacity: 1, duration: dur, ease });
    };
    const onTab = (e) => { const i = tabs.indexOf(e.currentTarget); if (i >= 0) go(i); };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!seen) { if (!paused) paused = now; return; }
      if (paused) { start += now - paused; paused = 0; }
      const p = Math.min(1, (now - start) / (every * 1000));
      const f = fills[cur];
      if (f) f.style.transform = `scaleX(${p})`;
      if (p >= 1) go(cur + 1);
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });

    paint(cur); place(cur % cards.length);
    tabs.forEach((t) => t.addEventListener("click", onTab));
    if (!reduce) { io.observe(el); raf = requestAnimationFrame(tick); }
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      tabs.forEach((t) => { t.removeEventListener("click", onTab); t.classList.remove("is-fx-on"); });
      if (hasGsap) gsap.killTweensOf(cards);
      fills.forEach((f) => f && (f.style.transform = ""));
      cards.forEach((c) => { c.style.visibility = c.style.zIndex = c.style.opacity = c.style.transform = ""; });
    };
  });
})();
