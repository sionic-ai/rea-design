// Work list: grid·list switch · on card hover the title/category line splits from the center (.8s expo.inOut) and follows the mouse height at 1.2s expo.out · list rows rotate like cubes.
// Original values: card appear opacity .4s (.125 stagger) + scale 1.1 · y 10rem → .6s expo.out · card disappear .2s (.0625 stagger) · list row rotateX 90→0 .6s expo.out (.0625 stagger)
(() => {
  const { rem, isXL, reduced } = SD;
  const btns = [...document.querySelectorAll("[data-view-btn]")];
  const views = Object.fromEntries([...document.querySelectorAll("[data-view]")].map((v) => [v.dataset.view, v]));
  const cards = [...document.querySelectorAll("[data-wcard]")];
  const rows = [...document.querySelectorAll("[data-wrow]")];
  document.querySelector(".wk-head__count").textContent = `${String(cards.length).padStart(2, "0")} Project`;
  let view = "grid";

  // Original show(): only on-screen cards get opacity .4s alpha together with scale 1.1·y 10rem → 1·0 .6s expo.out (.125 interval), while off-screen cards snap straight into place
  const showGrid = () => {
    gsap.killTweensOf(cards, "autoAlpha,scale,y");
    const seen = cards.filter((c) => ScrollTrigger.isInViewport(c)), rest = cards.filter((c) => !seen.includes(c));
    gsap.set(rest, { autoAlpha: 1, scale: 1, y: 0 });
    gsap.timeline()
      .fromTo(seen, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "alpha", stagger: 0.125 })
      .fromTo(seen, { scale: 1.1, y: rem(10) }, { scale: 1, y: 0, duration: 0.6, ease: "expo.out", stagger: 0.125 }, "<");
  };
  const showList = () => {
    gsap.fromTo(rows, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "alpha", stagger: 0.0625 });
    gsap.fromTo(rows.map((r) => r.querySelector(".wrow__in")), { rotateX: -90 }, { rotateX: 0, duration: 0.6, ease: "expo.out", stagger: 0.0625 });
  };
  const switchTo = (v) => {
    if (v === view) return;
    const d = reduced ? 0 : 1;
    const out = view === "grid" ? cards : rows;
    btns.forEach((b) => b.classList.toggle("is-on", b.dataset.viewBtn === v));
    gsap.to(out, {
      autoAlpha: 0, duration: 0.2 * d, ease: "alpha", stagger: 0.0625 * d, overwrite: true,
      onComplete: () => {
        views[view].classList.remove("is-on");
        views[v].classList.add("is-on");
        view = v;
        setH();
        if (!reduced) (v === "grid" ? showGrid : showList)();
        else gsap.set(v === "grid" ? cards : rows, { autoAlpha: 1 });
        ScrollTrigger.refresh();
      },
    });
  };
  btns.forEach((b) => b.addEventListener("click", () => switchTo(b.dataset.viewBtn)));

  // List row cube — same rules as the button (±90° toward the side it entered from, .6s expo.out on enter, .8s expo.inOut on leave)
  const setH = () => rows.forEach((r) => r.style.setProperty("--h", `${r.querySelector(".wrow__face").offsetHeight}px`));
  setH();
  addEventListener("resize", setH);
  rows.forEach((r) => {
    const inner = r.querySelector(".wrow__in");
    const top = r.querySelector(".wrow__f.is-top"), bot = r.querySelector(".wrow__f.is-bot");
    let dir = 0;
    const faces = () => { gsap.set(top, { autoAlpha: dir < 0 ? 1 : 0 }); gsap.set(bot, { autoAlpha: dir < 0 ? 0 : 1 }); };
    r.addEventListener("mouseenter", (e) => {
      if (reduced || !matchMedia("(hover: hover)").matches) return;
      const b = r.getBoundingClientRect();
      dir = e.clientY < b.top + b.height / 2 ? -90 : 90;
      faces();
      gsap.to(inner, { rotateX: dir, duration: 0.6, ease: "expo.out", overwrite: true });
    });
    r.addEventListener("mouseleave", () => {
      if (reduced || !matchMedia("(hover: hover)").matches) return;
      faces();
      gsap.to(inner, { rotateX: 0, duration: 0.8, ease: "expo.inOut", overwrite: true });
    });
  });

  // Card hover — the title starts from the right (center side), the category from the left, splitting out to both ends
  cards.forEach((c) => {
    const fm = c.querySelector(".wcard__fm"), ov = c.querySelector(".wcard__ov");
    const t = c.querySelector(".wcard__t"), g = c.querySelector(".wcard__g");
    // Original work-card: the video plays on hover and stops when released
    const vid = c.querySelector("video");
    const offs = () => {
      const w = c.offsetWidth, tw = t.offsetWidth, gw = g.offsetWidth;
      const k = (w - rem(1) * 2) / 2 - (tw + gw) / 2 - rem(0.5);
      return { t: k, g: -k };
    };
    const prep = () => { if (!isXL() || reduced) return gsap.set([fm, ov, t, g], { clearProps: "all" }); const o = offs(); gsap.set([fm, ov], { autoAlpha: 0 }); gsap.set(t, { x: o.t }); gsap.set(g, { x: o.g }); };
    document.fonts.ready.then(prep);
    addEventListener("resize", prep);
    let inside = false;
    const yAt = (e) => {
      const b = c.getBoundingClientRect();
      return gsap.utils.clamp(0, b.height - fm.offsetHeight, e.clientY - b.top - fm.offsetHeight / 2);
    };
    c.addEventListener("mousemove", (e) => {
      if (!isXL() || reduced) return;
      if (!inside) {
        inside = true;
        gsap.killTweensOf([t, g], "x");
        gsap.killTweensOf([fm, ov], "autoAlpha");
        gsap.set(fm, { y: yAt(e) });
        gsap.timeline().to([t, g], { x: 0, duration: 0.8, ease: "expo.inOut" }).to([fm, ov], { autoAlpha: 1, duration: 0.4, ease: "alpha" }, 0.2);
        vid && SD.vidPlay(vid);
      } else gsap.to(fm, { y: yAt(e), duration: 1.2, ease: "expo.out", overwrite: "auto" });
    });
    c.addEventListener("mouseleave", () => {
      if (!isXL() || reduced) return;
      inside = false;
      vid && SD.vidPause(vid);
      gsap.killTweensOf([fm, ov], "autoAlpha");
      gsap.to([fm, ov], { autoAlpha: 0, duration: 0.2, ease: "alpha", onComplete: () => { if (!inside) { const o = offs(); gsap.set(t, { x: o.t }); gsap.set(g, { x: o.g }); } } });
    });
  });

  // Cards line up one by one on first entry
  if (!reduced) {
    gsap.set(cards, { autoAlpha: 0 });
    SD.ready(showGrid);
  }
})();
