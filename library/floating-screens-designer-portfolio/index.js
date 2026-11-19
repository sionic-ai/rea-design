// Home (hero ribbon is in hero.js): work cards in a vertical arc strip · up to 16px blur in the top and bottom 15% bands of the screen · yellow band 24px·.4× → .6s back.out(1.4) ·
// 24 ticks in total, three slots lit right now · the number rolls over with .6s power2.inOut.
(() => {
  const { mm } = window.IM;
  const MOTION = "(prefers-reduced-motion: no-preference)";

  // ── Work Band ──
  const progress = document.querySelector(".progress");
  progress.innerHTML = "<i></i>".repeat(24);
  const ticks = [...progress.children];
  const cards = [...document.querySelectorAll(".work")];
  const num = document.querySelector(".works__num-move");
  let cur = 0;
  const setTicks = (p) => {
    const at = Math.round(p * 21);
    ticks.forEach((t, i) => {
      const k = i - at;
      t.classList.toggle("is-on", k >= 0 && k < 3);
      t.style.width = k === 1 ? "calc(12 * var(--px))" : k === 2 ? "calc(16 * var(--px))" : "";
    });
  };
  setTicks(0);
  const setNum = (i) => {
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    cur = i;
    gsap.timeline()
      .to(num, { yPercent: -110 * dir, duration: 0.3, ease: "power2.in" })
      .set(num, { textContent: String(i + 1).padStart(2, "0"), yPercent: 110 * dir })
      .to(num, { yPercent: 0, duration: 0.3, ease: "power2.out" });
  };
  ScrollTrigger.create({
    trigger: ".works__list", start: "top center", end: "bottom center",
    onUpdate: (self) => { setTicks(self.progress); setNum(Math.min(cards.length - 1, Math.floor(self.progress * cards.length))); },
  });

  // Card strip — the original doesn’t keep cards in place, it picks the current card from the scroll position and re-places it on a vertical arc at screen center.
  // Original values: spacing -20 (phone 0) · bend .16π/screen height · perspective 1400 · tilts forward 12° toward top and bottom (tanh 6x, the center is flattened by .52) ·
  // Center scale 1.11 (spread 2 cells, push-away .6) · hold .2 (smoothstep over the center 35% of the cell) · follow .5 · photos parallax ±20px vertically, scale 1.1 ·
  // Reveal: when the list header reaches 70% of the screen, items come in .7s power3.out staggered .1 from 610px below, 560px forward and tilted 81°, with scale going 0→1 over the first 19%.
  const list = document.querySelector(".works__list");
  const S = { gap: -20, mobileGap: 0, curve: 0.16, persp: 1400, tip: 12, scale: 1.11, spread: 2, push: 0.6, straight: 0.52, dwell: 0.2, follow: 0.5, parallax: 20,
    enter: { at: 0.7, distance: 610, depth: -560, tip: 81, growFor: 0.19, dur: 0.7, stagger: 0.1 } };
  const erf = (x) => { const t = x * x, a = 0.147; return Math.sign(x) * Math.sqrt(1 - Math.exp((-t * (4 / Math.PI + a * t)) / (1 + a * t))); };
  const clamp = gsap.utils.clamp, smooth = (x) => { const t = clamp(0, 1, x); return t * t * (3 - 2 * t); };
  const strip = () => {
    const ease = gsap.parseEase("power3.out"), enter = { t: -1 };
    let tops = [], u = 1, d = 1, place = null, last = performance.now();
    const measure = () => {
      cards.forEach((c) => (c.style.transform = ""));
      tops = cards.map((c) => c.getBoundingClientRect().top + scrollY);
      u = cards[0].offsetHeight; d = Math.max(1, (tops[1] ?? tops[0] + u) - tops[0]);
    };
    const frame = () => {
      const now = performance.now(), dt = Math.max(1, now - last) / 1000;
      last = now;
      const H = innerHeight, mid = H / 2, O = scrollY, P = cards.length;
      if (enter.t < 0 && tops[0] - O < H * S.enter.at) gsap.to(enter, { t: S.enter.dur + S.enter.stagger * (P - 1), duration: S.enter.dur + S.enter.stagger * (P - 1), ease: "none" });
      const F = (O + mid - (tops[0] + u / 2)) / d, at = clamp(0, P - 1, F), base = Math.min(Math.floor(at), P - 2), frac = at - base;
      const hold = 0.35 * S.dwell, target = base + frac + (smooth((frac - hold) / Math.max(0.001, 1 - 2 * hold)) - frac) * S.dwell;
      place = place === null ? target : place + (target - place) * (1 - Math.exp(-dt * (1 - S.follow) * 30));
      const line = mid - (F - at) * d, se = d + (innerWidth < 1024 ? S.mobileGap : S.gap), ce = S.spread * se, V = 1 - 1 / S.scale;
      const press = (e) => e - S.push * (u / se) * V * (e - (Math.sqrt(Math.PI) / 2) * ce * erf(e / ce));
      const bend = (S.curve * Math.PI) / Math.max(1, H);
      list.style.perspective = `${S.persp}px`;
      list.style.perspectiveOrigin = `50% ${line - list.getBoundingClientRect().top}px`;
      cards.forEach((c, n) => {
        const r = (n - place) * se, g = Math.exp(-((r / ce) ** 2)), a = 1 - V * (1 - g), e = press(r);
        let y = e, z = 0, ang = 0;
        if (Math.abs(bend) > 1e-7) { ang = e * bend; y = Math.sin(ang) / bend; z = (1 - Math.cos(ang)) / bend; }
        const m = clamp(-1.5, 1.5, e / (H / 2)), tip = S.tip * Math.tanh(m * 6) * (1 - S.straight * g);
        const p = enter.t < 0 ? 0 : clamp(0, 1, (enter.t - n * S.enter.stagger) / S.enter.dur), w = enter.t < 0 ? 0 : ease(p), T = 1 - w;
        const grow = ease(clamp(0, 1, p / S.enter.growFor)), k = Math.max(1e-4, a * grow);
        const x = tops[n] - O + u / 2;
        c.style.transform = `translate3d(0, ${line + y - x + T * S.enter.distance}px, ${z - T * S.enter.depth}px) rotateX(${(ang * 180) / Math.PI + tip + T * S.enter.tip}deg) scale(${k})`;
        c.style.visibility = w <= 0 ? "hidden" : "";
        c.style.setProperty("--parallax-y", `${(-m * S.parallax).toFixed(2)}px`);
      });
    };
    measure();
    const ro = new ResizeObserver(() => { measure(); frame(); });
    ro.observe(list);
    addEventListener("resize", measure);
    gsap.ticker.add(frame);
    return () => { gsap.ticker.remove(frame); ro.disconnect(); removeEventListener("resize", measure); cards.forEach((c) => { c.style.transform = c.style.visibility = ""; c.style.removeProperty("--parallax-y"); }); list.style.perspective = list.style.perspectiveOrigin = ""; };
  };

  document.addEventListener("im:ready", () => {
    mm.add(MOTION, () => {
      cards.forEach((c, n) => gsap.from(c.querySelector(".work__bar"), { y: 24, scale: 0.4, autoAlpha: 0, duration: 0.6, ease: "back.out(1.4)", delay: 0.25 + n * 0.1, scrollTrigger: { trigger: list, start: "top 70%", once: true } }));
      const stopStrip = strip();
      // Fades out when entering the 15% band at the top and bottom of the screen
      const blur = () => {
        const zone = innerHeight * 0.15;
        cards.forEach((c) => {
          const r = c.getBoundingClientRect();
          const edge = Math.min(r.top + r.height * 0.5, innerHeight - (r.top + r.height * 0.5));
          const k = gsap.utils.clamp(0, 1, (zone - edge) / zone);
          c.style.filter = k > 0.01 ? `blur(${(16 * k).toFixed(1)}px)` : "";
        });
      };
      gsap.ticker.add(blur);
      return () => { gsap.ticker.remove(blur); stopStrip(); cards.forEach((c) => (c.style.filter = "")); };
    });
  });
})();
