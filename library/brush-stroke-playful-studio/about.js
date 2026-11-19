// About — hero, a thick path drawn by scroll then spreading to thickness 2500 to cover the story panel in orange, story line rise,
// Team card → an intro panel that grows in the card’s place, two mood-board strips (opposite directions · flip with scroll direction · pause on hover), sticky rule cards with a progress line, skill pills with a brush fill
(() => {
  const TW = window.TW, reduce = TW.reduce;
  TW.hero(document.querySelector(".tw-hero2"), { pillAt: [0.25, 0.5], pathAt: 0.35, art: "[data-hero-art]", artAt: 0.45, paraAt: 0.5 });

  // ── Story path and orange tinting ──
  (() => {
    const box = document.querySelector(".tw-story"), path = box?.querySelector(".tw-story__path path");
    if (!path || reduce) return;
    const wrap = box.querySelector(".tw-story__wrap");
    const mobile = innerWidth < 768, base = innerWidth < 768 ? 50 : innerWidth < 992 ? 75 : 100;
    const L = path.getTotalLength(), seg = { b: 0.001 };
    const paint = () => { path.style.strokeDasharray = `${seg.b * L} ${L * 2}`; path.style.strokeDashoffset = "0"; };
    paint();
    gsap.set(path, { strokeWidth: base });
    const keys = mobile
      ? [[0.55, 0.05, "power1.out"], [0.9, 0.07, "power1.inOut"], [1, 0.03, "power1.out"]]
      : [[0.25, 0.08, "power1.out"], [0.88, 0.12, "power2.in"], [1, 0.05, "power1.out"]];
    const st = { trigger: box, start: "top 80%", end: "bottom bottom", scrub: 0.8 };
    const draw = gsap.timeline({ scrollTrigger: st });
    let at = 0;
    keys.forEach(([b, d, ease]) => { draw.to(seg, { b, duration: d, ease, onUpdate: paint }, at); at += d; });
    draw.to({}, { duration: mobile ? 0.17 : 0.07 }, mobile ? 0.15 : 0.25);
    const f0 = mobile ? 0.1 : 0.2, fd = mobile ? 0.03 : 0.05, bd = mobile ? 0.06 : 0.1;
    const flood = gsap.timeline({ scrollTrigger: { ...st } });
    flood.to(path, { strokeWidth: 2500, duration: fd, ease: "power2.inOut" }, f0)
      .fromTo(wrap, { backgroundColor: "transparent" }, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim(), duration: bd, ease: "power2.inOut" }, f0)
      .to({}, { duration: 0.32 - (f0 + bd) }, f0 + bd);
  })();

  // ── Two story beats ──
  if (!reduce) document.querySelectorAll(".tw-story__sec").forEach((sec, i) => {
    const art = sec.querySelector(".tw-story__art"), tag = sec.querySelector(".tw-story__tag");
    const h = TW.lines(sec.querySelector(".tw-story__h")), p = TW.lines(sec.querySelector(".tw-story__p"));
    gsap.set(art, { opacity: 0, scale: 0.65, rotation: i % 2 ? 6 : -6, transformOrigin: "50% 50%" });
    gsap.set(tag, { opacity: 0, y: 16 });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", toggleActions: "play none none none" } })
      .to(tag, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0)
      .to(h, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "back.out(1.7)" }, 0.05)
      .to(p, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: "power2.out" }, 0.15)
      .to(art, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: "back.out(2.2)" }, 0.1);
  });

  // ── Team About panel — grows in .65s back.out(1.4) from the position and size of the tapped card ──
  (() => {
    const pop = document.querySelector(".tw-pop"), card = pop?.querySelector(".tw-pop__card");
    if (!card) return;
    const name = pop.querySelector(".tw-pop__name"), role = pop.querySelector(".tw-pop__role"), body = pop.querySelector(".tw-pop__body");
    const links = pop.querySelector(".tw-pop__links"), close = pop.querySelector(".tw-pop__close");
    let open = false, tl = null;
    const show = (src) => {
      if (open) return;
      open = true;
      name.textContent = src.querySelector(".tw-team__name").textContent;
      role.textContent = src.querySelector(".tw-team__role").textContent;
      body.innerHTML = src.dataset.bio.split("|").map((t) => `<p>${t}</p>`).join("");
      pop.classList.add("is-on");
      TW.lenis?.stop();
      const s = src.getBoundingClientRect(), c = card.getBoundingClientRect();
      tl?.kill();
      tl = gsap.timeline()
        .fromTo(card, { x: s.left + s.width / 2 - (c.left + c.width / 2), y: s.top + s.height / 2 - (c.top + c.height / 2), scaleX: Math.max(s.width / c.width, 0.25), scaleY: Math.max(s.height / c.height, 0.25), opacity: 0.6, borderRadius: 16 },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: 24, duration: reduce ? 0 : 0.65, ease: "back.out(1.4)" }, 0)
        .fromTo([name, role, ...body.children, ...links.children], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power2.out" }, 0.18)
        .fromTo(close, { scale: 0, opacity: 0, rotation: -90 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: "back.out(2.5)" }, 0.3);
    };
    const hide = () => {
      if (!open) return;
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { pop.classList.remove("is-on"); open = false; gsap.set(card, { clearProps: "all" }); TW.lenis?.start(); } })
        .to(card, { scale: 0.88, opacity: 0, duration: 0.28, ease: "power2.inOut" }, 0);
    };
    document.querySelectorAll(".tw-team__card").forEach((c) => c.addEventListener("click", () => show(c)));
    close.addEventListener("click", (e) => { e.stopPropagation(); hide(); });
    pop.addEventListener("click", (e) => e.target === pop && hide());
    addEventListener("keydown", (e) => e.key === "Escape" && hide());
  })();

  // ── Two moodboard bands ──
  (() => {
    const rows = [...document.querySelectorAll(".tw-mood__row")];
    if (!rows.length) return;
    let mul = 1, want = 1, boost = 0;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { want = s.direction === -1 ? -1 : 1; boost = Math.min(Math.abs(s.getVelocity() || 0) / 220, 8); } });
    const state = rows.map((row, i) => {
      const track = row.querySelector(".tw-mood__track"), first = [...track.children];
      first.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); });
      const st = { track, dir: i % 2 ? 1 : -1, x: 0, hover: 1, w: 0, drag: 0 };
      const measure = () => { st.w = track.children[first.length].offsetLeft - track.children[0].offsetLeft; };
      measure();
      let total = st.w * 2;
      while (st.w > 0 && total < innerWidth * 3.5 + st.w) { first.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); }); total += st.w; }
      addEventListener("resize", measure);
      document.fonts?.ready.then(measure);
      if (innerWidth >= 992 && !matchMedia("(pointer: coarse)").matches) {
        row.addEventListener("mouseenter", () => gsap.to(st, { hover: 0, duration: 0.7, ease: "power2.out", overwrite: "auto" }));
        row.addEventListener("mouseleave", () => gsap.to(st, { hover: 1, duration: 0.7, ease: "power2.out", overwrite: "auto" }));
      }
      // Drag to push — grab the strip with the mouse and move it (it flows again on release)
      let px = null;
      row.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse") { px = e.clientX; row.setPointerCapture(e.pointerId); row.style.cursor = "grabbing"; } });
      row.addEventListener("pointermove", (e) => { if (px != null) { st.x += e.clientX - px; px = e.clientX; } });
      const up = () => { px = null; row.style.cursor = ""; };
      row.addEventListener("pointerup", up);
      row.addEventListener("pointercancel", up);
      return st;
    });
    if (reduce) return;
    gsap.ticker.add(() => {
      mul += (want - mul) * 0.06;
      boost *= 0.92;
      state.forEach((s) => {
        if (s.w <= 0) return;
        s.x += (1.35 + boost) * s.dir * mul * s.hover;
        while (s.x <= -s.w) s.x += s.w;
        while (s.x >= 0) s.x -= s.w;
        gsap.set(s.track, { x: s.x, force3D: true });
      });
    });
  })();

  // ── Rule cards — stick at 5em intervals (3em on phones) starting 5em down, and the line above fills from the left until they stick ──
  (() => {
    const wrap = document.querySelector(".tw-rules__in"), cards = [...document.querySelectorAll(".tw-rule")];
    if (!cards.length) return;
    const em = (n) => parseFloat(getComputedStyle(wrap).fontSize) * n;
    const top = (i) => em(5) + i * (innerWidth < 768 ? em(3) : em(5));
    let spacer = null;
    const place = () => {
      cards.forEach((c, i) => { c.style.position = "sticky"; c.style.top = `${top(i)}px`; c.style.zIndex = String(10 + i * 10); });
      spacer?.remove();
      spacer = document.createElement("div");
      spacer.style.height = `${Math.max(0, innerHeight - top(cards.length - 1) - cards.at(-1).offsetHeight)}px`;
      wrap.append(spacer);
    };
    place();
    addEventListener("resize", () => { place(); ScrollTrigger.refresh(); });
    if (reduce) return;
    cards.forEach((c, i) => {
      const bar = c.querySelector(".tw-rule__bar");
      gsap.set(bar, { scaleX: 0 });
      ScrollTrigger.create({ trigger: c, start: i === 0 ? "top center" : "top bottom", end: () => `top ${top(i)}px`, scrub: true, invalidateOnRefresh: true, onUpdate: (s) => gsap.set(bar, { scaleX: s.progress }) });
      const h = c.querySelector(".tw-rule__h");
      const chars = new SplitText(h, { type: "chars,words", wordsClass: "tw-chars-word" }).chars;
      chars.forEach((ch) => { const m = document.createElement("span"); m.className = "tw-mask-c"; ch.before(m); m.append(ch); });
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      const lines = TW.lines(c.querySelector(".tw-rule__p"));
      gsap.timeline({ scrollTrigger: { trigger: c, start: i === 0 ? "top 72%" : "top 75%", toggleActions: "play none none none" } })
        .to(chars, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "back.out(1.7)" }, 0)
        .to(lines, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: "back.out(1.4)" }, 0.12);
    });
  })();

  // ── Skills pill — on hover a weight 200 brush stroke paints the pill and the text brightens ──
  if (!reduce) document.querySelectorAll(".tw-cap").forEach((cap) => {
    const p = cap.querySelector("path"), L = p.getTotalLength();
    gsap.set(p, { strokeDasharray: `${L} ${L * 2}`, strokeDashoffset: L, strokeWidth: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } })
      .to(p, { strokeDashoffset: 0, strokeWidth: 200, duration: 0.95 }, 0)
      .to(cap, { "--t": 1, duration: 0.6, ease: "power1.out" }, 0.15);
    cap.addEventListener("mouseenter", () => tl.timeScale(1).play());
    cap.addEventListener("mouseleave", () => tl.timeScale(1.1).reverse());
  });
})();
