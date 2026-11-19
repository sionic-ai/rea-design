/* Scene motion — original constants: parallax panel height×.07 (ground is 70) · horizontal band (14 + speed×26)px/s · clock hand 330°→+60° · three balls .22 apart · screen .763
   · bar↔pill corner 79 · fan opening ±.5 (carry 2) · window disc 90°×3 (scrub .8) · deck cell .18 · field words .9s power3.out stagger .13 · 30 chips (scrolling down fast gives gravity −.2) */
(() => {
  const S = () => innerWidth / 1440;
  const reduce = Fm.reduce;
  const mm = gsap.matchMedia();
  const clamp01 = gsap.utils.clamp(0, 1);
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;

  // Small clock (beside the first card): three dots from the real time
  const mini = document.querySelector(".fm-app [data-clock=mini]");
  if (mini) {
    const dots = { h: mini.querySelector(".fm-mini__dot--h"), m: mini.querySelector(".fm-mini__dot--m"), s: mini.querySelector(".fm-mini__dot--s") };
    const tick = () => {
      const d = new Date(), s = d.getSeconds(), m = d.getMinutes() + s / 60, h = (d.getHours() % 12) + m / 60;
      const R = mini.offsetWidth / 2;
      [["h", h / 12, 0.42], ["m", m / 60, 0.62], ["s", s / 60, 0.78]].forEach(([k, f, r]) => {
        const a = f * Math.PI * 2 - Math.PI / 2;
        gsap.set(dots[k], { x: Math.cos(a) * R * r, y: Math.sin(a) * R * r });
      });
    };
    tick(); setInterval(tick, 1000);
  }

  mm.add("(min-width: 768px) and (pointer: fine)", () => {
    Fm.ready.then(() => {
      // ── Photo Parallax ──
      gsap.utils.toArray("[data-par]").forEach((fill) => {
        const frame = fill.parentElement;
        const t = () => (fill.dataset.par ? +fill.dataset.par * S() : frame.clientHeight * 0.07);
        if (!reduce) gsap.fromTo(fill, { y: () => -t() }, { y: t, ease: "none", immediateRender: false, scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      });

      // ── Horizontal panel strip: always flows up, faster the faster you scroll ──
      const reel = document.querySelector(".fm-wide__reel-in");
      if (reel && !reduce) {
        const set = gsap.quickSetter(reel, "y", "px");
        let i = 0;
        gsap.ticker.add((t, dt) => {
          const v = (14 + Math.abs(Fm.lenis.velocity || 0) * 26) * S();
          i = (i + (v * dt) / 1000) % (reel.offsetHeight / 2);
          set(-i);
        });
      }

      // ── Big clock and three balls ──
      const sec = document.querySelector(".fm-clocksec"), hand = sec.querySelector(".fm-clock__hand"), marks = gsap.utils.toArray(".fm-clock__mark", sec);
      const balls = { dot: document.querySelector(".fm-ball--dot"), light: document.querySelector(".fm-ball--light"), dark: document.querySelector(".fm-ball--dark") };
      const ease2io = gsap.parseEase("power2.inOut"), ease2o = gsap.parseEase("power2.out");
      const rot = gsap.quickSetter(hand, "rotation", "deg");
      let active = -1;
      const sizeBalls = () => { const d = Math.ceil(Math.hypot(innerWidth, innerHeight)) + 4; gsap.set(Object.values(balls), { width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2 }); };
      sizeBalls();
      const phase1 = () => innerHeight / 2 + 256.5 * S(), phase2 = () => innerHeight * 0.763;
      const drawClock = (p) => {
        const total = phase1() + phase2() * 1.44, t = p * total, n = phase1(), i = phase2(), a = t - n;
        const ang = a <= 0 ? 330 * clamp01(t / n) : 330 + 60 * ease2o(clamp01(a / i));
        rot(ang);
        const k = gsap.utils.wrap(0, marks.length, Math.round(ang / 30));
        if (k !== active) { marks[active]?.classList.remove("is-active"); marks[k].classList.add("is-active"); active = k; }
        // Ball: leaves the needle tip and travels to the screen center, covering the screen (black → white → background color)
        const r = sec.querySelector(".fm-clock").getBoundingClientRect();
        const tipX = r.left + r.width / 2 + Math.cos((ang * Math.PI) / 180) * 197 * S(), tipY = r.top + r.height / 2 + Math.sin((ang * Math.PI) / 180) * 197 * S();
        const g = [clamp01(a / i), clamp01((a - i * 0.22) / i), clamp01((a - i * 0.44) / i)].map(ease2io);
        const done = g[2] >= 1;
        [["dot", g[0]], ["light", g[1]], ["dark", g[2]]].forEach(([key, s]) => {
          const w = s * s * (3 - 2 * s);
          gsap.set(balls[key], { scale: done ? 0 : s, x: tipX + (innerWidth / 2 - tipX) * w, y: tipY + (innerHeight / 2 - tipY) * w });
        });
      };
      const st = { p: 0 };
      if (!reduce) gsap.to(st, { p: 1, ease: "none", onUpdate: () => drawClock(st.p), scrollTrigger: { trigger: sec, start: "top bottom", end: () => `+=${phase1() + phase2() * 1.44}`, scrub: true, invalidateOnRefresh: true, onRefresh: sizeBalls } });
      drawClock(0);

      // ── Bar ↔ pill: nearer the screen center, the bar gets sharper corners and the pill gets rounder ──
      const bar = document.querySelector(".fm-bar__plate"), pill = document.querySelector(".fm-pill__plate"), barBox = document.querySelector(".fm-bar");
      ScrollTrigger.create({
        start: 0, end: () => document.documentElement.scrollHeight, invalidateOnRefresh: true,
        onUpdate: () => {
          const top = docTop(barBox), o = top - innerHeight, s = top + barBox.offsetHeight / 2 - innerHeight / 2;
          const e = ease2io(clamp01((scrollY - o) / Math.max(1, s - o))), r = 79 * S();
          bar.style.borderRadius = `${r * (1 - e)}px`;
          pill.style.borderRadius = `${r * e}px`;
        },
      });

      // ── Disc clock · spinning A-side ──
      document.querySelectorAll(".fm-seven__dial .fm-dial").forEach((d) => Fm.dial(d));
      const spin = gsap.to(".fm-sidea__spin", { rotation: 360, duration: 100, ease: "none", repeat: -1, paused: true });
      ScrollTrigger.create({ trigger: ".fm-sidea", start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive && !reduce ? spin.play() : spin.pause()) });

      // ── Deck: seven photo cells roll downward with the scroll ──
      const deck = document.querySelector(".fm-deck"), pics = gsap.utils.toArray(".fm-deck__pic");
      const drawDeck = () => {
        const pitch = 104.6 * S(), all = pitch * pics.length, off = (scrollY - docTop(deck)) * 0.18;
        pics.forEach((p, i) => gsap.set(p, { y: ((((i * pitch - off) % all) + all) % all) - pitch }));
      };
      ScrollTrigger.create({ trigger: deck, start: "top bottom", end: "bottom top", onUpdate: drawDeck, onRefresh: drawDeck });
      drawDeck();

      // ── Fan: cards spread from −.5 to .5 while passing through the screen ──
      const fan = document.querySelector(".fm-fan");
      fan.style.setProperty("--carry", "2");
      ScrollTrigger.create({ trigger: fan, start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => fan.style.setProperty("--open", String((s.progress - 0.5) * 2 * 0.5)) });
      fan.style.setProperty("--open", "-0.5");

      // ── Window: the disc rotates 90° three times and the photo strip inside the window advances one cell at a time ──
      const win = document.querySelector(".fm-win"), disc = win.querySelector(".fm-win__disc"), reels = gsap.utils.toArray(".fm-win__reel", win);
      const w = { at: 0 };
      const drawWin = () => {
        disc.style.setProperty("--turn", `${w.at * 90}deg`);
        const n = ((w.at % 3) + 3) % 3;
        reels.forEach((r) => {
          const h = r.parentElement.offsetHeight;
          r.style.transform = `translateY(${-n * h}px)`;
          [...r.children].forEach((f, k) => (f.style.filter = `brightness(${1 - Math.min(1, Math.abs(k - n)) * 0.45})`));
        });
      };
      drawWin();
      if (!reduce) gsap.to(w, { at: 3, ease: "none", onUpdate: drawWin, scrollTrigger: { trigger: win, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } });

      // ── Gauge: two rings turn against each other with scroll and the needle sweeps across ──
      const gauge = document.querySelector(".fm-gauge");
      gsap.utils.toArray(".fm-gauge__dial", gauge).forEach((d, k) => {
        if (!reduce) gsap.fromTo(d, { "--turn": k ? "18deg" : "-18deg" }, { "--turn": k ? "-18deg" : "18deg", ease: "none", scrollTrigger: { trigger: gauge, start: "top bottom", end: "bottom top", scrub: true } });
        if (!reduce) gsap.fromTo(d, { "--hand-a": "-40deg" }, { "--hand-a": "40deg", ease: "power1.inOut", scrollTrigger: { trigger: gauge, start: "top center", end: "bottom center", scrub: true } });
      });

      // ── Dot: small dot at the gauge center grows and descends to the poster’s circle ──
      const pip = document.querySelector(".fm-pip"), ring = document.querySelector(".fm-poster__ring"), poster = document.querySelector(".fm-poster");
      gsap.set(ring, { opacity: 0 });
      if (!reduce) gsap.fromTo(pip, { x: 0, y: 0, scale: 1 }, {
        x: () => docTopX(ring) - (innerWidth / 2), y: () => docTop(ring) + ring.offsetHeight / 2 - docTop(pip) - pip.offsetHeight / 2, scale: () => ring.offsetWidth / pip.offsetWidth,
        ease: "power2.inOut", scrollTrigger: { trigger: gauge, start: "center center", end: () => `+=${docTop(ring) - docTop(gauge) - gauge.offsetHeight / 2 + innerHeight * 0.1}`, scrub: true, invalidateOnRefresh: true },
      });
      function docTopX(el) { const r = el.getBoundingClientRect(); return r.left + r.width / 2; }

      // ── Poster: text circling along a circle, then shrinking into a small card in the middle of the field ──
      if (!reduce) gsap.to(".fm-poster__arc", { rotation: 120, ease: "none", scrollTrigger: { trigger: poster, start: "top bottom", end: "bottom top", scrub: true } });
      const field = document.querySelector(".fm-field");
      const shrink = 0.17;
      if (!reduce) gsap.fromTo(poster, { y: 0, scale: 1 }, {
        // Original landing point: the upper third of the field — fully shrunk when that spot is at screen center
        y: () => docTop(field) + field.offsetHeight / 3 - (docTop(poster) + poster.offsetHeight / 2), scale: shrink, ease: "power2.inOut",
        scrollTrigger: { trigger: poster, start: "bottom bottom", end: () => `+=${docTop(field) + field.offsetHeight / 3 - innerHeight / 2 - (docTop(poster) + poster.offsetHeight - innerHeight)}`, scrub: true, invalidateOnRefresh: true },
      });

      // ── Field: words rise, and clicking drops a chip ──
      const words = gsap.utils.toArray(".fm-field__word", field);
      ScrollTrigger.create({ trigger: field.querySelector(".fm-field__call"), start: "top 100%", once: true, onEnter: () => gsap.to(words, { y: 0, duration: reduce ? 0 : 0.9, ease: "power3.out", stagger: 0.13, onComplete: () => field.classList.add("is-up") }) });
      dropField(field);
    });
  });

  // Format chips: vertical, horizontal, circle, triangle (our drawing) — .5× plate width
  const CHIPS = [
    { w: 335, h: 426, svg: '<rect class="fm-chip__plate" x="0" y="0" width="335" height="426"/><rect class="fm-chip__line" x="12" y="12" width="100" height="402"/>' },
    { w: 426, h: 226, svg: '<rect class="fm-chip__plate" x="0" y="0" width="426" height="226"/><path class="fm-chip__line" d="M140 0V226"/>' },
    { w: 300, h: 300, round: true, svg: '<circle class="fm-chip__plate" cx="150" cy="150" r="150"/><circle class="fm-chip__line" cx="150" cy="150" r="110"/>' },
    { w: 320, h: 277, tri: true, svg: '<path class="fm-chip__plate" d="M0 0H320L160 277Z"/>' },
  ];
  function dropField(field) {
    const M = window.Matter;
    if (!M) return;
    const engine = M.Engine.create();
    engine.gravity.y = 1;
    let walls = [];
    const setWalls = () => {
      M.Composite.remove(engine.world, walls);
      const w = field.clientWidth, h = field.clientHeight;
      walls = [M.Bodies.rectangle(w / 2, h + 100, w + 400, 200, { isStatic: true }), M.Bodies.rectangle(-100, h / 2, 200, h * 3, { isStatic: true }), M.Bodies.rectangle(w + 100, h / 2, 200, h * 3, { isStatic: true })];
      M.Composite.add(engine.world, walls);
    };
    setWalls();
    addEventListener("resize", setWalls);
    const live = [];
    const kill = (c) => { M.Composite.remove(engine.world, c.body); c.el.remove(); live.splice(live.indexOf(c), 1); };
    const add = (x, y) => {
      const o = CHIPS[Math.floor(Math.random() * CHIPS.length)], k = 0.5 * S(), w = o.w * k, h = o.h * k;
      const el = document.createElement("div");
      el.className = "fm-chip";
      el.style.cssText = `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px`;
      el.innerHTML = `<svg viewBox="0 0 ${o.w} ${o.h}" aria-hidden="true">${o.svg}</svg>`;
      field.appendChild(el);
      const opt = { restitution: 0.15, friction: 0.4, frictionAir: 0.01 };
      const body = o.round ? M.Bodies.circle(x, y - h * 0.35, w / 2, opt) : o.tri ? M.Bodies.fromVertices(x, y - h * 0.35, [[{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w / 2, y: h }]], opt) : M.Bodies.rectangle(x, y - h * 0.35, w, h, opt);
      M.Body.setAngle(body, (Math.random() - 0.5) * 0.4);
      M.Composite.add(engine.world, body);
      const c = { el, body, cx: o.tri ? 0 : 0, cy: o.tri ? -h / 6 : 0 };
      live.push(c);
      if (live.length > 30) kill(live[0]);
    };
    field.addEventListener("pointerdown", (e) => {
      const r = field.getBoundingClientRect(), k = r.width / field.clientWidth || 1;
      add((e.clientX - r.left) / k, (e.clientY - r.top) / k);
      field.classList.add("is-played");
    });
    let on = false, lastY = scrollY;
    gsap.ticker.add((t, dt) => {
      const y = scrollY, v = (Math.abs(y - lastY) * 1000) / Math.max(dt, 4) / innerHeight;
      lastY = y;
      if (!on || !live.length) return;
      engine.gravity.y = v > 0.15 ? -0.2 : 1;
      M.Engine.update(engine, Math.min(dt, 32));
      for (let i = live.length - 1; i >= 0; i--) {
        const c = live[i], { x, y: py } = c.body.position;
        if (py < -field.clientHeight) { kill(c); continue; }
        const a = c.body.angle;
        c.el.style.transform = `translate3d(${x + c.cx * Math.cos(a) - c.cy * Math.sin(a)}px,${py + c.cx * Math.sin(a) + c.cy * Math.cos(a)}px,0) rotate(${a}rad)`;
      }
    });
    ScrollTrigger.create({ trigger: field, start: "top bottom", end: "bottom top", onToggle: (s) => (on = s.isActive) });
  }
})();
