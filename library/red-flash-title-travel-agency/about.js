(() => {
  const { reduce, hover } = window.dhSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Person name — rises from under the mask
  if (!reduce) $$(".ab-person__name").forEach((n) => gsap.from(n, { yPercent: 110, duration: 1.1, ease: "reveal-expo", scrollTrigger: { trigger: n, start: "top 85%", once: true } }));

  // Timeline — chapters are joined and pushed sideways by the band width (straight, tied to scroll). A step lights up once it passes the screen center
  const sec = $(".ab-time"), rail = $(".ab-time__rail", sec), steps = $$(".ab-step", sec);
  const ruler = $(".ab-time__ruler", sec);
  const needle = document.createElement("span");
  needle.className = "ab-time__needle";
  ruler.append(needle);
  const light = () => {
    const mid = innerWidth / 2;
    steps.forEach((s) => { const r = s.getBoundingClientRect(); if (r.left < mid + r.width / 2) s.setAttribute("data-on", ""); });
  };
  gsap.matchMedia().add({ wide: "(min-width: 992px)", calm: "(prefers-reduced-motion: reduce)" }, (c) => {
    if (!c.conditions.wide) { steps.forEach((s) => s.setAttribute("data-on", "")); return; }
    if (c.conditions.calm) { steps.forEach((s) => s.setAttribute("data-on", "")); return; }
    const dist = () => rail.scrollWidth - innerWidth;
    gsap.to(rail, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: (s) => { light(); gsap.set(needle, { x: s.progress * ruler.offsetWidth }); } } });
  });

  // Photo tail — each time the cursor moves 5.5% of the screen width, an 11·14·9·12·10·15vw photo is placed. It tilts (±18°) by horizontal speed (px/ms)×14
  // Grows at .45× with back.out(1.9) in .5s (inner 1.4 → 1), and shrinks to .9× over .28s at .5s while disappearing
  const drop = $("[data-trail]");
  if (drop && hover && !reduce) {
    const W = ["11vw", "14vw", "9vw", "12vw", "10vw", "15vw"];
    const LABELS = ["Away trip photo · group · portrait", "Match scene · portrait", "City street · Portrait", "Athlete close-up · Portrait", "Outside the stadium · portrait", "Athlete holding a flag · portrait"];
    let n = 0, lx = null, ly = null, lt = 0;
    const place = (x, y, vx) => {
      const c = document.createElement("span");
      c.className = "ab-trail-card";
      c.style.width = W[n % W.length];
      c.style.left = `${x}px`;
      c.style.top = `${y}px`;
      c.innerHTML = `<span class="dh-ph" data-label="${LABELS[n % LABELS.length]}"></span>`;
      drop.append(c);
      const tilt = gsap.utils.clamp(-18, 18, 14 * vx);
      gsap.timeline({ onComplete: () => c.remove() })
        .fromTo(c, { xPercent: -50, yPercent: -50, scale: .45, rotation: tilt * .5, autoAlpha: 0 }, { scale: 1, rotation: tilt, duration: .5, ease: "back.out(1.9)" })
        .fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: .22, ease: "power2.out" }, 0)
        .fromTo(c.firstChild, { scale: 1.4 }, { scale: 1, duration: .5, ease: "back.out(1.2)" }, 0)
        .to(c, { autoAlpha: 0, scale: .9, duration: .28, ease: "power2.in" }, .5);
      n++; lx = x; ly = y; lt = performance.now();
    };
    drop.addEventListener("pointermove", (e) => {
      const r = drop.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (lx === null) return place(x, y, 0);
      if (Math.hypot(x - lx, y - ly) < innerWidth * .055) return;
      place(x, y, (x - lx) / Math.max(1, performance.now() - lt));
    });
    drop.addEventListener("pointerleave", () => { lx = ly = null; });
  }
})();
