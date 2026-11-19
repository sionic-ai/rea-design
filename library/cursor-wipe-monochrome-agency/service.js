// Services page: video window expand (pinned 150%) · result cards 33° flow (pinned, depth and speed separate) · card stacking over video · price steps (pinned 350%).
// Original values (marketing-new2.js): window inset(38% 42%) → 0 over 2 beats · text blur 5px · 1.08x → sharp over .5 beat · card flow angle 33° · desktop gain 1.25 · end margin 80
// · Cards over the video one beat each at .8 beat spacing, even −2° · odd 2° · amount .6s power2.out · text blur 8px .4s .02 stagger · step change .25s power2.inOut.
(() => {
  const { reduced } = T7;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const words = (el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(" "); };

  const initHero = () => {
    const sec = $(".sv-hero"), win = $(".sv-hero__win"), p = $(".sv-hero__after p"), btn = $(".sv-hero__btn");
    p.innerHTML = p.textContent.trim().split(/\s+/).map((w) => `<span class="word" style="display:inline-block;white-space:nowrap">${w}</span>`).join(" ");
    const ws = $$(".word", p);
    gsap.set(p, { opacity: 0, scale: 1.08, filter: "blur(5px)" });
    gsap.set(ws, { opacity: 0 });
    gsap.set(btn, { y: 25, opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=150%", scrub: true, pin: true, refreshPriority: 2, invalidateOnRefresh: true } })
      .fromTo(win, { clipPath: () => (matchMedia("(max-width: 768px)").matches ? "inset(40% 35%)" : "inset(38% 42%)") }, { clipPath: "inset(0% 0%)", duration: 2, ease: "none" })
      .to(p, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "none" }, "-=0.5")
      .to(ws, { opacity: 1, duration: 0.5, stagger: { amount: 0.5, from: "start" }, ease: "none" }, "<")
      .to(btn, { y: 0, visibility: "visible", opacity: 1, duration: 0.5, ease: "none" }, "<");
  };

  // Achievement card flow — each card’s path, depth and speed are set backward so it arrives from the front of the screen at its assigned spot (formation)
  const initStream = () => {
    const sec = $(".sv-stats");
    const boxes = $$(".sv-card, .sv-logo, .sv-shot", sec);
    if (!boxes.length) return;
    const A = (33 * Math.PI) / 180, ux = Math.cos(A), uy = Math.sin(A), nx = -uy, ny = ux;
    const F = [{ x: 40, y: 38, s: 1, v: 1.1 }, { x: 61, y: 95, s: 1, v: 0.92 }, { x: 86, y: 105, s: 1, v: 0.85 }, { x: 72, y: 55, s: 1, v: 0.95 },
      { x: 50, y: 70, s: 1, v: 0.94, t: 0.4 }, { x: 75, y: 125, s: 1, v: 1.08, t: 0.4 }, { x: 110, y: 150, s: 1, v: 0.92, t: 0.4 }, { x: 50, y: 120, s: 1, v: 1.1, t: 0.4 }, { x: 100, y: 75, s: 1, v: 0.7, t: 0.4 }];
    const FM = [{ x: 38, y: 17, s: 1.25, v: 1.1 }, { x: 62, y: 62, s: 1.25, v: 0.92 }, { x: 108, y: 92, s: 1.25, v: 0.85 }, { x: 96, y: 32, s: 1.25, v: 0.85 },
      { x: 45, y: 35, s: 1.25, v: 0.94, t: 0.5 }, { x: 96, y: 78, s: 1.25, v: 1.06, t: 0.5 }, { x: 155, y: 94, s: 1.25, v: 0.92, t: 0.5 }, { x: 40, y: 78, s: 1.25, v: 1.1, t: 0.5 }, { x: 120, y: 46, s: 1.6, v: 0.7, t: 0.5 }];
    const stage = document.createElement("div");
    stage.className = "sv-stage";
    stage.innerHTML = '<div class="sv-world"></div>';
    sec.append(stage);
    sec.classList.add("is-stream");
    const world = $(".sv-world", stage);
    const items = boxes.map((el, i) => { const h = document.createElement("div"); h.className = "sv-item"; world.append(h); h.append(el); return { el, h, i }; });
    $(".sv-stats__grid", sec).remove();
    let vw = 0, vh = 0, span = 0, Smin = 0, travel = 0, target = 0;
    const measure = () => {
      vw = innerWidth; vh = innerHeight; span = vw * Math.abs(ux) + vh * Math.abs(uy);
      items.forEach((r) => { r.w = r.el.offsetWidth; r.h2 = r.el.offsetHeight; });
      let fit = 0.83 * clamp(vw / 1440, 0.55, 1);
      if (vw < 768) fit *= clamp(vh / 750, 0.72, 1);
      Smin = span * 0.18;
      const P = vw < 768 ? FM : F;
      items.forEach((r) => {
        const c = P[r.i] || { x: 50, y: 50, s: 1 }, dx = (c.x / 100) * vw - vw / 2, dy = (c.y / 100) * vh - vh / 2;
        r.fit = fit; r.lane = dx * nx + dy * ny; r.depth = clamp(1 + ((c.s || 1) - 1) / 0.42, 0.85, 1.25); r.vel = clamp(c.v || 1, 0.5, 1.5);
        r.spot = (dx * ux + dy * uy + (Smin + (c.t || 0) * 2.2 * span) * r.depth * r.vel) / span;
      });
      let Smax = 0;
      items.forEach((r) => { Smax = Math.max(Smax, (r.spot * span + span * 0.1) / (r.depth * r.vel)); });
      const floor = vh - 80;
      items.forEach((r) => {
        const sc = r.fit * (1 + (r.depth - 1) * 0.42), hw = (r.w * sc) / 2, hh = (r.h2 * sc) / 2, rate = r.depth * r.vel, a = r.spot * span - Smax * rate;
        const X = vw / 2 + ux * a + nx * r.lane, Y = vh / 2 + uy * a + ny * r.lane;
        if (X + hw <= 0 || X - hw >= vw || Y + hh <= floor) return;
        Smax += Math.min((Y + hh - floor) / (uy * rate), (X + hw) / (ux * rate));
      });
      travel = Smax - Smin;
      sec.style.height = Math.round(travel / (vw < 768 ? 1 : 1.25) + vh) + "px";
    };
    const render = () => {
      const S = Smin + target, cx = vw / 2, cy = vh / 2;
      items.forEach((r) => {
        const a = r.spot * span - S * r.depth * r.vel;
        r.h.style.transform = `translate3d(${(cx + ux * a + nx * r.lane).toFixed(2)}px, ${(cy + uy * a + ny * r.lane).toFixed(2)}px, 0) scale(${(r.fit * (1 + (r.depth - 1) * 0.42)).toFixed(4)}) translate(-50%, -50%)`;
      });
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom", pin: stage, pinSpacing: false, invalidateOnRefresh: true, refreshPriority: 2,
      onUpdate: (st) => { target = st.progress * travel; render(); }, onRefresh: (st) => { target = st.progress * travel; render(); } });
    render();
  };

  const initAppear = () => {
    const sec = $(".sv-appear"), stage = $(".sv-appear__stage"), video = $(".sv-appear__video"), cards = $$(".sv-ap");
    cards.forEach((c, i) => (c.style.zIndex = i + 1));
    gsap.set(video, { xPercent: -50, yPercent: -50 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + (cards.length * 60 + 30) + "%", pin: stage, pinSpacing: true, scrub: true, refreshPriority: 1, invalidateOnRefresh: true } });
    cards.forEach((c, i) => tl.fromTo(c, { y: () => innerHeight, rotation: 0, xPercent: -50, yPercent: -50 }, { y: 0, rotation: i % 2 === 0 ? -2 : 2, duration: 1, ease: "none" }, i * 0.8));
  };

  const initBuild = () => {
    $$(".sv-blur").forEach(words);
    const sec = $(".sv-build"), main = $(".sv-build__main"), init = $(".sv-build__init"), numBox = $(".sv-build__num"), num = $(".sv-build__num p");
    const [one, two, three] = $$(".sv-build__item");
    const money = { v: 0 };
    const show = () => (num.textContent = "$" + Math.round(money.v).toLocaleString("en-US"));
    const animIn = (el, to, dir = 1) => {
      const h = $("h3", el), ws = $$(".word", el);
      gsap.killTweensOf([el, h, ...ws, money, num].filter(Boolean));
      const tl = gsap.timeline();
      tl.to(el, { autoAlpha: 1, duration: 0.1 });
      if (h) { tl.fromTo(h, { y: 20 * dir, opacity: 0, filter: "blur(4px)", "--rule": 0 }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }); tl.to(h, { "--rule": 1, duration: 0.5, ease: "power3.out" }, "<0.2"); }
      tl.fromTo(ws, { y: 12 * dir, opacity: 0, filter: "blur(8px) brightness(30%)" }, { y: 0, opacity: 1, filter: "blur(0px) brightness(100%)", duration: 0.4, stagger: 0.02, ease: "power2.out" }, h ? "<-0.4" : 0);
      if (typeof to === "number") {
        tl.to(money, { v: to, duration: 0.6, ease: "power2.out", onUpdate: show }, 0);
        tl.fromTo(num, { scale: 1.06, opacity: 0.35, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 0);
      }
      return tl;
    };
    const animOut = (el, dir = 1) => {
      const h = $("h3", el), ws = $$(".word", el);
      gsap.killTweensOf([el, h, ...ws].filter(Boolean));
      const tl = gsap.timeline();
      tl.to(h ? [h, ...ws] : ws, { y: -10 * dir, opacity: 0, filter: "blur(6px) brightness(30%)", duration: 0.25, ease: "power2.inOut" }).to(el, { autoAlpha: 0, duration: 0.1 });
      if (h) tl.to(h, { "--rule": 0, duration: 0.2, ease: "power2.in" }, 0);
      return tl;
    };
    gsap.set([one, two, three], { autoAlpha: 0 });
    animIn(init);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=350%", pin: true, scrub: true, invalidateOnRefresh: true } });
    const beat = (onStart, onBack) => tl.to({}, { duration: 1 }).to({}, { duration: 0.1, onStart, onReverseComplete: onBack });
    tl.to({}, { duration: 1 }).to({}, { duration: 0.1 }).to({}, { duration: 0.1,
      onStart: () => { animOut(init); gsap.to(numBox, { autoAlpha: 1, duration: 0.2 }); animIn(one, 12000); },
      onReverseComplete: () => { gsap.to(numBox, { autoAlpha: 0, duration: 0.2 }); animOut(one, -1); animIn(init, undefined, -1); gsap.killTweensOf(money); gsap.to(money, { v: 0, duration: 0.3, onUpdate: show }); } });
    beat(() => { animOut(one); animIn(two, 22000); }, () => { animOut(two, -1); animIn(one, 12000, -1); });
    beat(() => { animOut(two); animIn(three, 45000); }, () => { animOut(three, -1); animIn(two, 22000, -1); });
    tl.to({}, { duration: 0.7 });
    gsap.to(main, { top: "5%", transform: "translateY(0%)", ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + Math.round(sec.offsetHeight * 0.45 - main.offsetHeight * 0.5), scrub: true, invalidateOnRefresh: true } });
  };

  if (reduced) { $$(".sv-blur").forEach(words); return; }
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initHero(); initStream(); initAppear(); initBuild();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
