// About — header entrance, orbit reel, statement fill, photo collage (scroll parallax, mouse tilt, blur clears), bridge where the center photo flies to the team photo spot
(() => {
  const { touch, split } = MD;
  const E = MD.ease();
  const blur = (px) => (touch ? {} : { filter: `blur(${px}px)` });
  const clear = touch ? {} : { filter: "blur(0px)" };
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Heading — title blur 12px, from 12px below over .9s (.1 delay, letters .45s at .02 intervals with .25 delay), small text .6s, orbit reel .9s (.75 delay)
    const h = document.querySelector(".ab-hero__h"), body = document.querySelector(".ab-hero__body"), reel = document.querySelector(".ab-reel__wrap");
    const hc = split(h);
    gsap.set([h, body, reel], { opacity: 0, y: 12, ...blur(12) });
    gsap.set(hc, { opacity: 0, y: 8 });
    MD.onReveal(() => {
      gsap.to(h, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.1 });
      gsap.to(hc, { opacity: 1, y: 0, duration: 0.45, ease: E, stagger: 0.02, delay: 0.25 });
      gsap.to(body, { opacity: 1, y: 0, ...clear, duration: 0.6, ease: E, delay: 0.1 });
      gsap.to(reel, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.75 });
    });

    // Manifesto — while pinned for 1.5 screens, the letters darken one after another (scrub .3)
    const track = document.querySelector(".ab-manifesto-track");
    const chars = [...track.querySelectorAll("[data-fill]")].flatMap((p) => split(p));
    track.classList.add("is-held");
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink-soft").trim();
    gsap.timeline({ scrollTrigger: { trigger: track, start: "top top", end: () => `+=${innerHeight * 1.5}`, scrub: touch ? 1 : 0.3, invalidateOnRefresh: true } })
      .to(chars, { color: ink, duration: 0.02, ease: "none", stagger: { each: 0.98 / Math.max(chars.length - 1, 1) } }, 0);

    // Team text — clears the blur at 82% and rises into place
    const team = document.querySelector(".ab-team__text");
    gsap.fromTo(team.children, { opacity: 0, y: 30, ...blur(6) }, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, stagger: 0.1, scrollTrigger: { trigger: team, start: "top 82%", once: true } });

    // Orbit reel — 8 photos loop around a wide horizontal ellipse in 16s. The nearer (lower) ones are larger, sharper and stacked on top, while the far ones shrink and blur 2→16px
    const orbit = document.querySelector(".ab-orbit"), cards = [...orbit.querySelectorAll(".ab-orbit__card")];
    let visible = true;
    new IntersectionObserver((en) => (visible = en[0].isIntersecting), { rootMargin: "200px" }).observe(orbit);
    const spin = (time) => {
      if (!visible) return;
      const W = orbit.clientWidth, H = orbit.clientHeight;
      cards.forEach((c, i) => {
        const a = (time / 16) * Math.PI * 2 + (i / cards.length) * Math.PI * 2;
        const depth = (Math.sin(a) + 1) / 2;
        const s = 0.42 + depth * 0.58;
        c.style.transform = `translate(${(Math.cos(a) * W * 0.38).toFixed(1)}px, ${((depth - 0.5) * H * 0.22).toFixed(1)}px) scale(${s.toFixed(3)})`;
        c.style.filter = `blur(${(2 + (1 - depth) * 14).toFixed(1)}px)`;
        c.style.zIndex = String(1 + Math.round(depth * 10));
        c.style.opacity = (0.35 + depth * 0.65).toFixed(3);
      });
    };
    gsap.ticker.add(spin);
  });

  // Collage — each photo gets −60×depth px parallax by its distance from screen center and −8° X tilt, mouse adds Y ±5°·X ±3°·horizontal 20×depth px.
  // On entering the screen, at .06s intervals over .9s (ease-out cubic curve) it goes from 12px blur and transparent to sharp, scaling from .94 to 1
  const stage = document.querySelector(".ab-collage__stage"), items = [...stage.querySelectorAll(".ab-item")];
  let mx = 0.5, my = 0.5, live = true;
  if (!touch && matchMedia("(hover: hover)").matches) {
    stage.addEventListener("mousemove", (e) => { const r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width; my = (e.clientY - r.top) / r.height; });
    stage.addEventListener("mouseleave", () => { mx = my = 0.5; });
  }
  const prog = new Map(items.map((el) => [el, MD.reduce ? 1 : 0]));
  const io = new IntersectionObserver((en) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => { const t = Math.min(1, (now - t0) / 900); prog.set(e.target, 1 - (1 - t) ** 3); if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, items.indexOf(e.target) * 60);
  }), { rootMargin: "-10% 0px -10% 0px" });
  if (!MD.reduce) items.forEach((el) => io.observe(el));
  new IntersectionObserver((en) => (live = en[0].isIntersecting), { rootMargin: "200px" }).observe(stage);
  const tilt = () => {
    if (!live) return;
    items.forEach((el) => {
      const d = parseFloat(el.dataset.depth) || 0.2, r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) / innerHeight, p = prog.get(el);
      el.style.setProperty("--rp", p);
      if (MD.reduce) return;
      el.style.transform = `translate3d(${((mx - 0.5) * 20 * d).toFixed(2)}px,${(-off * 60 * d).toFixed(2)}px,0) rotateX(${(off * -8 + (my - 0.5) * -6).toFixed(2)}deg) rotateY(${((mx - 0.5) * 10).toFixed(2)}deg) scale(${(0.94 + 0.06 * p).toFixed(3)})`;
    });
  };
  gsap.ticker.add(tilt);

  // Bridge — from when the team section head enters at the bottom of the screen until it reaches screen center (phone 90px), the collage center photo moves straight to the team photo spot (corners 12→16px).
  // While flying, hide both slots, and once it lands leave the collage slot empty and show the team photo
  const bridge = document.querySelector("[data-morph-bridge]"), src = document.querySelector("[data-morph-source]"), dst = document.querySelector("[data-morph-target]");
  if (!MD.reduce && bridge && src && dst) {
    const apply = (p) => {
      if (document.body.style.position === "fixed") return;
      if (p >= 1) { bridge.style.opacity = "0"; src.style.visibility = "hidden"; dst.style.visibility = ""; return; }
      if (p <= 0) { bridge.style.opacity = "0"; src.style.visibility = ""; dst.style.visibility = ""; return; }
      const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect(), m = (x, y) => x + (y - x) * p;
      Object.assign(bridge.style, { transform: `translate3d(${m(a.left, b.left).toFixed(1)}px,${m(a.top, b.top).toFixed(1)}px,0)`, width: `${m(a.width, b.width).toFixed(1)}px`, height: `${m(a.height, b.height).toFixed(1)}px`, borderRadius: `${m(12, 16).toFixed(1)}px`, opacity: "1" });
      src.style.visibility = "hidden"; dst.style.visibility = "hidden";
    };
    ScrollTrigger.create({
      trigger: ".ab-team", start: "top bottom", end: () => (matchMedia("(max-width: 767px)").matches ? "top 90px" : "top center"),
      onUpdate: (s) => apply(s.progress), onLeave: () => apply(1), onLeaveBack: () => apply(0), onRefresh: (s) => apply(s.progress),
    });
  }
})();
