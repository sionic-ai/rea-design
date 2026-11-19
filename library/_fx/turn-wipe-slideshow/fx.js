// A full-bleed slideshow whose wipe direction rotates per section: left, up, left, down — the panel and the inner image move in opposite directions for depth, and the image slowly sinks until the next section arrives
(() => {
  const TURNS = {
    x: { out: { xPercent: -100 }, outIn: { xPercent: 50 }, from: { xPercent: 100, yPercent: 0 }, to: { xPercent: 0 }, fromIn: { xPercent: -50, yPercent: 0 }, toIn: { xPercent: 0 } },
    up: { out: { yPercent: -100 }, outIn: { yPercent: 50 }, from: { xPercent: 0, yPercent: 100 }, to: { yPercent: 0 }, fromIn: { xPercent: 0, yPercent: -50 }, toIn: { yPercent: 0 } },
    down: { out: { yPercent: 100 }, outIn: { yPercent: -50 }, from: { xPercent: 0, yPercent: -100 }, to: { yPercent: 0 }, fromIn: { xPercent: 0, yPercent: 50 }, toIn: { yPercent: 0 } },
  };
  kfFx.register("turn-wipe-slideshow", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const imgOf = (s) => s.querySelector('[data-fx-part="img"]') || s.firstElementChild || s;
    const zoomOf = (s) => s.querySelector('[data-fx-part="zoom"]') || imgOf(s);
    const bar = el.querySelector('[data-fx-part="bar"]');
    const count = el.querySelector('[data-fx-part="count"]');
    const every = +(options.every ?? 4.5);
    const dur = +(options.dur ?? 1.1);
    const settle = +(options.settle ?? 3.8);
    const zoom = +(options.zoom ?? 1.14);
    const outZoom = +(options.out ?? 1.2);
    const turns = String(options.turns || "x up x down").split(/[\s,]+/).filter((t) => TURNS[t]);
    const ease = kfFx.ease(options.ease || "0.6,0.08,0.02,0.99", "expo.inOut");
    let index = Math.min(slides.length - 1, Math.max(0, +(options.start ?? 0)));
    let turn = 0, timer = null, tl = null, paused = false, busy = false;

    slides.forEach((s, i) => { s.classList.toggle("is-active", i === index); gsap.set(s, { xPercent: 0, yPercent: 0 }); });
    const writeCount = () => {
      if (!count) return;
      const [cur, nxt] = count.children;
      if (cur) cur.textContent = String(index + 1);
      if (nxt) nxt.textContent = String(((index + 1) % slides.length) + 1);
      gsap.set(count.children, { yPercent: 0 });
    };
    writeCount();
    if (reduce) return () => slides.forEach((s) => s.classList.remove("is-active"));

    const settleIn = (s) => gsap.fromTo(zoomOf(s), { scale: zoom }, { scale: 1, duration: every + dur + settle, ease: "power2.out", overwrite: true });
    const runBar = () => bar && gsap.fromTo(bar, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: every, ease: "none", overwrite: true });
    const schedule = () => { clearTimeout(timer); if (!paused) { runBar(); timer = setTimeout(() => go((index + 1) % slides.length), every * 1000); } };

    const go = (next) => {
      if (busy || next === index) return;
      busy = true;
      const prev = index, cur = slides[prev], nx = slides[next];
      const t = TURNS[turns[turn % turns.length] || "x"];
      index = next;
      el.classList.add("is-slide-change");
      nx.classList.add("is-active");
      el.dispatchEvent(new CustomEvent("fx:slide", { bubbles: true, detail: { index: next, prev } }));
      if (bar) gsap.to(bar, { scaleX: 0, transformOrigin: "right center", duration: 1, ease, overwrite: true });
      if (count) gsap.to(count.children, { yPercent: -100, duration: 1, ease, overwrite: true });
      tl?.kill();
      tl = gsap.timeline({ defaults: { duration: dur, ease } });
      tl.to(cur, { ...t.out }, 0)
        .to(imgOf(cur), { ...t.outIn }, 0)
        .to(zoomOf(cur), { scale: outZoom, overwrite: true }, 0)
        .fromTo(nx, t.from, { ...t.to }, 0)
        .fromTo(imgOf(nx), t.fromIn, { ...t.toIn, onComplete: () => {
          cur.classList.remove("is-active");
          gsap.set([cur, imgOf(cur)], { xPercent: 0, yPercent: 0 });
          el.classList.remove("is-slide-change");
          writeCount();
          turn++;
          busy = false;
          schedule();
        } }, 0);
      settleIn(nx);
    };

    const pause = () => { paused = true; clearTimeout(timer); if (bar) gsap.killTweensOf(bar); };
    let settled = false;
    const play = () => {
      if (!paused) return;
      paused = false;
      // wait: play — the settle also starts on first play (original: timer after the loader lifts, 1.14→1)
      if (!settled) { settled = true; settleIn(slides[index]); }
      if (!busy) schedule();
    };
    const jump = (e) => { const n = +e.detail?.index; if (Number.isFinite(n)) { clearTimeout(timer); go(((n % slides.length) + slides.length) % slides.length); } };
    el.addEventListener("fx:pause", pause);
    el.addEventListener("fx:play", play);
    el.addEventListener("fx:go", jump);
    if (options.wait === "play") { paused = true; gsap.set(zoomOf(slides[index]), { scale: zoom }); }
    else { settled = true; settleIn(slides[index]); schedule(); }

    return () => {
      clearTimeout(timer);
      tl?.kill();
      el.removeEventListener("fx:pause", pause);
      el.removeEventListener("fx:play", play);
      el.removeEventListener("fx:go", jump);
      gsap.killTweensOf([bar, ...(count ? count.children : []), ...slides, ...slides.map(imgOf), ...slides.map(zoomOf)].filter(Boolean));
      gsap.set([...slides, ...slides.map(imgOf), ...slides.map(zoomOf)], { clearProps: "transform" });
      slides.forEach((s) => s.classList.remove("is-active"));
      el.classList.remove("is-slide-change");
    };
  });
})();
