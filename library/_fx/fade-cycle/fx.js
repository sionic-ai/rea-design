// The default curve settle follows flickity’s drag physics (every frame, 1/60 s, velocity += (remaining distance × .025, speed × .72) baked into a 120-frame table —
// So the swipe feel (half at .2s, 90% at .5s) stays the same when rebuilding the same fade slider
(() => {
  const settle = (() => {
    const pts = [0];
    let x = 0, v = 0;
    for (let f = 0; f < 120; f++) { v = (v + (1 - x) * 0.025) * 0.72; x += v; pts.push(x); }
    pts[120] = 1;
    return (p) => {
      const t = Math.min(1, Math.max(0, p)) * 120, i = Math.floor(t);
      return i >= 120 ? 1 : pts[i] + (pts[i + 1] - pts[i]) * (t - i);
    };
  })();
  kfFx.register("fade-cycle", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const bar = q("bar"), now = q("now"), total = q("total");
    const every = +options.every || 3, fade = +(options.fade ?? 2);
    // fade-out — gives the length of the fading-out section separately (School first photo: incoming 1.2s · outgoing .8s, both CSS ease-in-out)
    const fadeOut = +(options["fade-out"] ?? fade);
    const ease = !options.ease || options.ease === "settle" ? settle : kfFx.ease(options.ease, "power1.inOut");
    // out-ease — only the section turning off uses a different curve (reference site: on .25,.46,.45,.94 · off .55,.085,.68,.53, both 2s)
    const outEase = options["out-ease"] ? kfFx.ease(options["out-ease"], "power1.in") : ease;
    // With zoom given, the incoming section’s first child (photo) slowly approaches from that scale to 1 — a Ken Burns longer than the fade (brand 1.15 → 1, 9.5s ease-in-out)
    // With zoom-to, it approaches at a scale other than 1 — Name goes 1 → 1.05 over 5s linear (zoom in)
    const zoom = +(options.zoom ?? 1), zoomTo = +(options["zoom-to"] ?? 1), zoomDur = +(options["zoom-dur"] ?? fade), zoomEase = kfFx.ease(options["zoom-ease"] || "0.42,0,0.58,1", "sine.inOut");
    const zoomIn = (s) => { const z = zoom !== zoomTo && s.firstElementChild; if (z) gsap.fromTo(z, { scale: zoom }, { scale: zoomTo, duration: zoomDur, ease: zoomEase, overwrite: true }); };
    // zoom-back: on — the photo of the section turning off also returns to the zoom scale with the same length and curve (Brand: CSS transition, so when active is removed it recedes 1.02 → 1 over 4s)
    const zoomBack = options["zoom-back"] === "on";
    const zoomOut = (s) => { const z = zoom !== zoomTo && zoomBack && s.firstElementChild; if (z) gsap.to(z, { scale: zoom, duration: zoomDur, ease: zoomEase, overwrite: true }); };
    // out: hold — Keep the previous slide as is, and hide it only after the new slide floats up on top (Studio carousel fade where the background doesn’t show through the overlap)
    const hold = options.out === "hold";
    const pad = (n) => String(n).padStart(2, "0");
    // start: random — first slide random on each open (Brand first screen, seven slides)
    let at = options.start === "random" ? Math.floor(Math.random() * slides.length) : 0, timer;
    if (total) total.textContent = pad(slides.length);
    if (now) now.textContent = pad(at + 1);
    gsap.set(slides, { opacity: (i) => (i === at ? 1 : 0) });
    slides[at].classList.add("is-on");
    if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
    const show = (n) => {
      const from = slides[at], to = slides[n];
      from.classList.remove("is-on");
      to.classList.add("is-on");
      if (hold) gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: fade, ease, overwrite: true, onComplete: () => { if (!from.classList.contains("is-on")) gsap.set(from, { opacity: 0 }); } });
      else {
        gsap.to(from, { opacity: 0, duration: fadeOut, ease: outEase, overwrite: true });
        gsap.to(to, { opacity: 1, duration: fade, ease, overwrite: true });
      }
      zoomOut(from);
      // A photo that was returning approaches again from the current scale (like a transition) — so it doesn’t jump back to the initial scale
      const z = zoomBack && zoom !== zoomTo && to.firstElementChild;
      if (z) gsap.to(z, { scale: zoomTo, duration: zoomDur, ease: zoomEase, overwrite: true });
      else if (!zoomBack) zoomIn(to);
      at = n;
      if (now) now.textContent = pad(n + 1);
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: n } }));
      run();
    };
    // Advance the moment the progress bar fills — without a bar, use a delay of the same interval
    const run = (wait = every) => {
      timer?.kill();
      timer = bar
        ? gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: wait, ease: "none", onComplete: () => show((at + 1) % slides.length) })
        : gsap.delayedCall(wait, () => show((at + 1) % slides.length));
    };
    // intro: with fade, the first one also rises from 0 with the same length and curve (Brand: turns on at 8.5s the moment current is attached to the first one)
    if (!reduce && options.intro === "fade") gsap.fromTo(slides[at], { opacity: 0 }, { opacity: 1, duration: fade, ease });
    // first — delay before the first transition. For making several panels change in turn, one beat apart (the three About photos on the Studio page: 9s interval at 3·6·9s)
    // on: event — starts running when fx:play arrives at the element (brand: the section’s script sends it to the three panels at once when 30% is visible)
    const first = +(options.first ?? every);
    let started = false;
    const go = () => { if (started) return; started = true; zoomIn(slides[at]); run(first); };
    if (!reduce) { if (options.on === "event") el.addEventListener("fx:play", go); else go(); }
    // view: pause — when the panel is off-screen the transition clock stops and resumes when it re-enters (brand: plays only within ScrollTrigger top bottom ~ bottom top)
    const io = options.view === "pause" ? new IntersectionObserver(([e]) => { if (e.isIntersecting) timer?.resume(); else timer?.pause(); }) : null;
    io?.observe(el);
    // click: next — pressing the panel jumps straight to the next slide and restarts the interval from zero (the original’s .js-enable-click)
    const tap = () => { if (started) show((at + 1) % slides.length); };
    if (options.click === "next") el.addEventListener("click", tap);
    return () => {
      io?.disconnect();
      el.removeEventListener("click", tap);
      el.removeEventListener("fx:play", go);
      timer?.kill();
      gsap.killTweensOf(slides);
      gsap.set(slides, { clearProps: "opacity" });
      if (zoom !== zoomTo) slides.forEach((s) => { const z = s.firstElementChild; if (z) { gsap.killTweensOf(z); gsap.set(z, { clearProps: "scale,transform" }); } });
      slides.forEach((s) => s.classList.remove("is-on"));
      if (bar) gsap.set(bar, { clearProps: "all" });
    };
  });
})();
