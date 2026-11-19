// Per-section motion — text-flip drag (first page), filter bar (list), pinned service video swap, testimonial splide (service), photo slider (detail)
(() => {
  const $ = (s, r) => r.querySelector(s), $$ = (s, r) => [...r.querySelectorAll(s)];

  // Drag the horizontal row by hand (wheel · fingers stay as native browser horizontal scroll)
  const dragScroll = (track) => {
    let down = false, sx = 0, sl = 0;
    const d = (e) => { down = true; sx = e.clientX; sl = track.scrollLeft; track.style.scrollSnapType = "none"; };
    const m = (e) => { if (down) track.scrollLeft = sl - (e.clientX - sx); };
    const u = () => { if (!down) return; down = false; track.style.scrollSnapType = ""; };
    track.addEventListener("pointerdown", d); addEventListener("pointermove", m); addEventListener("pointerup", u);
    return () => { track.removeEventListener("pointerdown", d); removeEventListener("pointermove", m); removeEventListener("pointerup", u); };
  };

  FI.page("home", (c) => {
    const t = $("[data-carousel]", c);
    return t ? dragScroll(t) : undefined;
  });

  FI.page("list", (c) => {
    const bar = $("[data-filters]", c), grid = $("[data-grid]", c);
    if (!bar || !grid) return;
    // When it enters the work cell row the bars rise from below (.6s power3.out), and drop down when leaving the row
    const show = (on) => gsap.to(bar, { yPercent: on ? 0 : 160, duration: on ? 0.6 : 0.4, ease: on ? "power3.out" : "power3.in", overwrite: true });
    const st = ScrollTrigger.create({ trigger: grid, start: "top 70%", end: "bottom 60%", onToggle: (s) => show(s.isActive) });
    const tiles = $$("[data-cat]", grid);
    const pick = (e) => {
      const b = e.target.closest("[data-filter]");
      if (!b) return;
      $$("[data-filter]", bar).forEach((x) => x.classList.toggle("is-active", x === b));
      const f = b.dataset.filter;
      const shown = tiles.filter((t) => f === "all" || t.dataset.cat.split(" ").includes(f));
      tiles.forEach((t) => t.classList.toggle("is-hidden", !shown.includes(t)));
      if (!FI.reduce) gsap.fromTo(shown, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "circ.out" });
      ScrollTrigger.refresh();
    };
    bar.addEventListener("click", pick);
    return () => { st.kill(); bar.removeEventListener("click", pick); gsap.set(bar, { clearProps: "transform" }); };
  });

  FI.page("service", (c) => {
    const offs = [];
    // When a service text passes the screen center, it turns on and the pinned video panel switches to that video (.6s staggered swap)
    const items = $$("[data-svc-item]", c), panels = $$("[data-svc-panel]", c);
    const set = (i) => { items.forEach((x, k) => x.classList.toggle("is-active", k === i)); panels.forEach((x, k) => x.classList.toggle("is-active", k === i)); };
    items.forEach((it, i) => {
      const st = ScrollTrigger.create({ trigger: it, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && set(i) });
      offs.push(() => st.kill());
    });
    // Testimonials — splide fade in and out, chosen with face buttons
    const box = $("[data-quotes]", c), thumbs = $$("[data-quote-thumbs] button", c);
    if (box && window.Splide) {
      const sp = new Splide(box, { type: "fade", rewind: true, arrows: false, pagination: false, speed: 600, drag: true });
      sp.on("move", (i) => thumbs.forEach((b, k) => b.classList.toggle("is-active", k === i)));
      sp.mount();
      thumbs.forEach((b, k) => b.addEventListener("click", () => sp.go(k)));
      offs.push(() => sp.destroy());
    }
    return () => offs.forEach((f) => f());
  });

  FI.page("detail", (c) => {
    const track = $("[data-car-track]", c), prev = $("[data-car-prev]", c), next = $("[data-car-next]", c);
    if (!track) return;
    const slides = [...track.children];
    let i = 0;
    const go = (d) => {
      i = (i + d + slides.length) % slides.length;
      const x = -(slides[i].offsetLeft - slides[0].offsetLeft);
      FI.reduce ? gsap.set(track, { x }) : gsap.to(track, { x, duration: 1, ease: "circ.out", overwrite: true });
    };
    const p = () => go(-1), n = () => go(1);
    prev.addEventListener("click", p); next.addEventListener("click", n);
    return () => { prev.removeEventListener("click", p); next.removeEventListener("click", n); };
  });
})();
