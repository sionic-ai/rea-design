// Motion attached per section type — with Taxi, finds only the sections on whichever screen is entered and hooks them up. The returned function is the detach
(() => {
  const { reduce } = TS;
  const EASE = "cubic-bezier(0.4,0,0,1)";

  // Floating photos: while the section crosses the screen, each photo flows up by data-speed × 30vh (scrub)
  const floats = (view) => [...view.querySelectorAll("[data-speed]")].map((el) => {
    if (reduce) return null;
    const s = +el.dataset.speed || 1;
    return gsap.fromTo(el, { y: () => innerHeight * 0.3 * s }, { y: () => -innerHeight * 0.3 * s, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  });

  // Family card: pressing plus covers with a cover panel from below in .5s, close lifts it
  const cards = (view) => {
    const on = (e) => {
      const card = e.target.closest(".t-card");
      if (!card) return;
      if (e.target.closest(".t-card__open")) card.classList.add("is-open");
      if (e.target.closest(".t-card__close")) card.classList.remove("is-open");
    };
    view.addEventListener("click", on);
    return () => view.removeEventListener("click", on);
  };

  // Competition rows: the photo cell of the hovered row follows the cursor’s bottom right on a .5s curve
  const rows = (view) => {
    const pic = view.querySelector(".t-row__pic");
    if (!pic) return null;
    const p = { x: 0, y: 0 };
    const xTo = gsap.quickTo(pic, "x", { duration: 0.5, ease: EASE }), yTo = gsap.quickTo(pic, "y", { duration: 0.5, ease: EASE });
    const move = (e) => { p.x = e.clientX + 24; p.y = e.clientY - pic.offsetHeight / 2; xTo(p.x); yTo(p.y); };
    const over = (e) => { const r = e.target.closest(".t-row"); pic.classList.toggle("is-on", !!r); if (r) pic.dataset.label = r.dataset.pic || ""; };
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerover", over);
    view.addEventListener("pointerleave", () => pic.classList.remove("is-on"));
    return () => { view.removeEventListener("pointermove", move); view.removeEventListener("pointerover", over); };
  };

  // Highlight: the prev/next buttons push the photo strip one step at a time (1s original curve)
  const slides = (view) => {
    const track = view.querySelector(".t-slides__track");
    if (!track) return null;
    let i = 0;
    const go = (d) => {
      const n = track.children.length, step = track.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      i = Math.max(0, Math.min(n - 2, i + d));
      track.style.transform = `translateX(${-i * step}px)`;
    };
    const click = (e) => { const b = e.target.closest("[data-slide]"); if (b) go(+b.dataset.slide); };
    view.addEventListener("click", click);
    return () => view.removeEventListener("click", click);
  };

  // Body info: a bent line is drawn (1s) and the figures count up
  const bodyLines = (view) => [...view.querySelectorAll(".t-body__item")].map((it, k) => {
    if (reduce) return null;
    const path = it.querySelector("path"), len = path ? path.getTotalLength() : 0;
    const tl = gsap.timeline({ scrollTrigger: { trigger: it.closest("section"), start: "top 40%", toggleActions: "play none none reverse" } });
    if (path) tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1, ease: EASE }, k * 0.1);
    tl.from(it.querySelectorAll("p"), { yPercent: 100, opacity: 0, duration: 1, ease: EASE, stagger: 0.1 }, k * 0.1 + 0.2);
    return tl;
  });

  const kill = (list) => list.forEach((m) => { if (!m) return; if (typeof m === "function") m(); else { m.scrollTrigger?.kill(); m.kill?.(); } });
  const common = (view) => { const made = [...floats(view), cards(view), rows(view), slides(view), ...bodyLines(view)]; return () => kill(made); };

  // Family card strip: while the section passes through the screen, it flows left by the overflow width (scrub). On phones the cards are stacked vertically
  const legacy = (view) => {
    const list = view.querySelector(".t-legacy__list");
    if (!list || reduce) return null;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      gsap.to(list, { x: () => -Math.max(0, list.scrollWidth - innerWidth * 0.66), ease: "none", scrollTrigger: { trigger: list.closest("section"), start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    return () => mm.revert();
  };

  TS.page("home", (view) => {
    const off = common(view);
    const offLegacy = legacy(view);
    // Hero name: around when the curtain lifts, two words rise from below and a yellow line spreads out from the center
    if (!reduce) {
      const t = view.querySelector(".t-hero__title");
      gsap.from(t.querySelectorAll(".t-h1"), { yPercent: 100, opacity: 0, duration: 1, ease: EASE, stagger: 0.1, delay: 1.1 });
      gsap.from(t.querySelector(".t-title__line"), { scaleX: 0, duration: 1.5, ease: EASE, delay: 1.1 });
      gsap.from(view.querySelectorAll(".t-hero__data > div, .t-hero__scroll"), { y: 20, opacity: 0, duration: 1, ease: EASE, stagger: 0.05, delay: 1.3 });
    }
    return () => { off(); offLegacy?.(); };
  });
  TS.page("on-court", common);
  TS.page("off-court", common);
  TS.page("sponsors", common);
})();
