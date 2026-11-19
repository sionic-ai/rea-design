// Home: number box → red panel expand (FLIP) → text and headline entrance → coin physics attach, pink line draw, case stagger, list hover, service card landing.
// Original values (Hero·CaseGrid·Archive·ServicesStack): number .7s none · number hide .18s expo.out · corner .55s power3.out · box .7s elastic.out(.6,.8)
// · bottom line .85s expo.out · letters ±100% → 0 .6s elastic.out(1,.55) random .4 · header bar·meta .45s .06 · intro .45s/.36s power2.out
// · line draw to the 66% screen line in .7s power2.out · list photo .34s power4.out, other lines .28 · card landing spread .1s power1.out → 1s elastic.out(1,.3).
(() => {
  const { reduced } = AW;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const covered = sessionStorage.getItem("fx-sheet-label-page") != null;

  // Hero ------------------------------------------------------------------
  const hero = $(".ih-hero"), loader = $(".ih-loader"), count = $(".ih-loader__n");
  const lines = $$(".ih-line", hero);
  const split = window.SplitText ? SplitText.create(lines, { type: "words,chars", mask: "chars" }) : null;
  const chars = split ? split.chars : [];
  // In a justified line the line box spans the full plate width, so coins can’t fall between words — use the words as collision boxes
  if (split) { lines.forEach((l) => l.removeAttribute("data-fx-part")); split.words.forEach((w) => (w.dataset.fxPart = "solid")); }
  // As in the original, the coin pile starts already stacked, and new coins are tossed on top
  const mountCoins = () => { hero.setAttribute("data-fx-coin-drop-physics", "settle: on"); hero.setAttribute("data-fx", "coin-drop-physics"); };
  if (reduced) { loader.remove(); hero.dataset.intro = "done"; mountCoins(); }
  else {
    const rule = $(".ih-meta__rule", hero), items = $$(".ih-nav, .ih-meta__item", hero), kicker = $(".ih-kicker", hero);
    gsap.set(rule, { scaleX: 0 });
    gsap.set(items, { opacity: 0, y: 12 });
    gsap.set(kicker, { opacity: 0, y: 12 });
    gsap.set($(".ih-h1", hero), { opacity: 1 });
    gsap.set(chars, { xPercent: () => (Math.random() < 0.5 ? -100 : 100), opacity: 0 });
    hero.dataset.intro = "playing";
    const tl = gsap.timeline({ paused: true, defaults: { ease: "elastic.out(1, 0.55)" } });
    const n = { v: 0 };
    tl.to(n, { v: 100, duration: 0.7, ease: "none", onUpdate: () => (count.textContent = `${Math.round(n.v)}%`) }, 0)
      .to(count, { opacity: 0, duration: 0.18, ease: "expo.out" }, 0.7)
      .addLabel("flip", 0.88)
      .to(loader, { borderRadius: () => getComputedStyle(hero).borderTopLeftRadius, duration: 0.55, ease: "power3.out" }, "flip")
      .to(loader, { top: () => hero.getBoundingClientRect().top, left: () => hero.getBoundingClientRect().left, width: () => hero.getBoundingClientRect().width, height: () => hero.getBoundingClientRect().height, duration: 0.7, ease: "elastic.out(0.6, 0.8)" }, "flip")
      .addLabel("beats", "flip+=0.7")
      .set(loader, { autoAlpha: 0 }, "beats")
      .call(mountCoins, null, "beats")
      .to(rule, { scaleX: 1, duration: 0.85, ease: "expo.out" }, "beats")
      .to(chars, { xPercent: 0, opacity: 1, duration: 0.6, stagger: { amount: 0.4, from: "random" } }, "beats+=0.3")
      .to(items, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, "beats+=0.55")
      .to(kicker, { y: 0, duration: 0.45 }, "beats+=0.61")
      .to(kicker, { opacity: 0.8, duration: 0.36, ease: "power2.out" }, "beats+=0.61")
      .call(() => { hero.dataset.intro = "done"; loader.remove(); AW.charSwap(hero, chars); });
    // When arriving past the transition curtain, it appears from the start without the number box (original isPageCovered)
    // Appears after the curtain has fully lifted (original whenPageShown) — if the coin 3D prep overlaps with the lift, the lift stutters
    if (covered) {
      gsap.set(loader, { autoAlpha: 0 });
      let went = false;
      const go = () => { if (!went) { went = true; tl.play("beats"); } };
      addEventListener("fx:sheet-label-page:shown", go, { once: true });
      setTimeout(go, 1600);
    }
    // Even if the remote font is late, the number boxes count right away — the text-drawing entrance comes 1.6s later, so the font arrives in between
    else Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 250))]).then(() => tl.play());
  }

  // Pink line — draws the line down to where the 66% screen line reaches (follows with .7s power2.out) -------------------
  const stage = $(".ih-cases__stage"), rope = $(".ih-rope path");
  if (rope && !reduced) {
    let len = 0, marks = [];
    const drawn = { v: 0 };
    const paint = () => { rope.style.strokeDasharray = `${drawn.v} ${len + 1}`; rope.style.visibility = drawn.v > 0.5 ? "" : "hidden"; };
    const measure = () => {
      len = rope.getTotalLength();
      const svg = rope.ownerSVGElement, vb = svg.viewBox.baseVal, sy = svg.getBoundingClientRect().height / vb.height;
      marks = [];
      for (let s = 0; s <= len; s += 8) marks.push({ at: s, y: rope.getPointAtLength(s).y * sy });
      return len > 0;
    };
    const to = gsap.quickTo(drawn, "v", { duration: 0.7, ease: "power2.out", onUpdate: paint });
    const update = () => {
      const top = stage.getBoundingClientRect().top, reach = 0.66 * innerHeight - top;
      let best = 0;
      for (const m of marks) if (m.y <= reach) best = Math.max(best, m.at);
      to(best);
    };
    measure(); paint();
    ScrollTrigger.create({ trigger: stage, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: () => { measure() && update(); } });
  }

  const mm = gsap.matchMedia();
  // Work card parallax — each cell rises from below by its set share (scrub)
  mm.add("(min-width: 1440px) and (prefers-reduced-motion: no-preference)", () => {
    const H = [14, -10, 12, -8];
    $$(".ih-case").forEach((c, i) => gsap.fromTo(c, { yPercent: H[i % H.length] }, { yPercent: -H[i % H.length], ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } }));
  });

  // Service cards — on a pinned panel each card rises from below one at a time and settles at its own tilt, then at the moment it sits it spreads sideways and returns
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pin = $(".ih-svc__pin"), cards = $$(".ih-svc__card");
    const squash = (el) => {
      const w = el.offsetWidth, h = el.offsetHeight, l = 1.5 * parseFloat(getComputedStyle(el).fontSize);
      gsap.timeline().to(el, { scaleX: (w + l) / w, scaleY: (h - 0.33 * l) / h, duration: 0.1, ease: "power1.out" }).to(el, { scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1, 0.3)" });
    };
    const tl = gsap.timeline();
    cards.forEach((c, i) => {
      const rot = parseFloat(getComputedStyle(c).getPropertyValue("--rot")) || 0;
      gsap.set(c, { rotate: 0 });
      tl.fromTo(c, { y: () => innerHeight, opacity: 1, rotate: 0 }, { y: 0, rotate: rot, ease: "power2.out", duration: 1 }, i);
      tl.call(() => { if (st.direction === 1) squash(c); }, null, i + 1);
    });
    const st = ScrollTrigger.create({ animation: tl, trigger: pin, start: "top top", end: () => `+=${innerHeight * 0.8 * cards.length}`, pin: true, scrub: true, invalidateOnRefresh: true });
    return () => { st.kill(); tl.kill(); gsap.set(cards, { clearProps: "transform" }); };
  });
  // The sentence pin (part) is attached by fx-core after DOMContentLoaded so it exists later than this file’s pin — realign in position order and re-measure
  const resort = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
  addEventListener("DOMContentLoaded", () => setTimeout(resort, 0));
  addEventListener("load", resort);
  document.fonts.ready.then(resort);
})();
