// Home page: hero (title width fit·entrance·echo trickle·picture recede) · recommended play grid · PLAY record card (sitting in an arc·drag and throw) · record table
(() => {
  const html = document.documentElement;
  const reduced = TT.reduced;
  // The 3D horse must fly in together when the hero sequence starts — delayed by the loader if there is one (options are fixed before the part attaches)
  const stage = document.querySelector("[data-hero-stage]");
  let fromDeal = false;
  try { fromDeal = sessionStorage.getItem("kf-card-deal") === "1"; } catch {}
  if (stage) stage.setAttribute("data-fx-float-pieces-3d", `delay: ${html.classList.contains("tt-loading") ? 2.6 : fromDeal ? 0.32 : 0}`);

  // ── Hero title: stretched horizontally and vertically to fill the box (1272:446) regardless of text width
  const box = document.querySelector("[data-hero-box]");
  const title = document.querySelector("[data-hero-title]");
  const echoes = [...document.querySelectorAll("[data-hero-echo]")];
  const fit = () => {
    if (!box || !title) return;
    const all = [title, ...echoes];
    gsap.set(all, { scaleX: 1, scaleY: 1 });
    const r = title.getBoundingClientRect();
    if (!r.width) return;
    gsap.set(all, { scaleX: box.clientWidth / r.width, scaleY: box.clientHeight / r.height });
  };
  fit();
  document.fonts?.ready.then(fit);
  if (box) new ResizeObserver(fit).observe(box);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Entrance: the panel goes from 24px below and transparent over 1.1s power2.out, overlapping by .55s the title letters rise from below over .9s power4.out (.03 gap), the echo turns on and one gold line follows over .8s power3.out
    const tag = document.querySelector("[data-hero-tagline]");
    const chars = title ? SplitText.create(title, { type: "chars", mask: "chars" }) : null;
    const lines = tag ? SplitText.create(tag, { type: "lines", mask: "lines" }) : null;
    if (stage) gsap.set(stage, { opacity: 0, y: 24 });
    if (chars) gsap.set(chars.chars, { yPercent: 100 });
    if (lines) gsap.set(lines.lines, { yPercent: 100 });
    gsap.set(echoes, { opacity: 0 });
    const intro = gsap.timeline({ paused: true })
      .to(stage, { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" })
      .to(chars?.chars || [], { yPercent: 0, duration: 0.9, stagger: 0.03, ease: "power4.out" }, "-=0.55")
      .set(echoes, { opacity: 1 })
      .to(lines?.lines || [], { yPercent: 0, duration: 0.8, ease: "power3.out" }, "-=0.35");
    TT.onReveal(() => intro.play());
    // Scroll: two echoes go down by .22 and .42 of the panel height, the image goes 14% down at .94 scale
    const hero = document.querySelector(".tt-hero");
    echoes.forEach((e, i) => gsap.to(e, { y: () => hero.clientHeight * [0.22, 0.42][i], ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } }));
    gsap.fromTo("[data-hero-illust]", { yPercent: 0, scale: 1 }, { yPercent: 14, scale: 0.94, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });

    TT.games();
    TT.rows();
    TT.night();
    return () => { chars?.revert(); lines?.revert(); };
  });

  // ── PLAY: four letters rise from 105% below at 55% of the screen in 1.3s expo.out (.09). Nine cards wait off-screen right (1.12x width) at 52% of screen height
  //    gathered at their own tilts (10,−8,7,9,−9,8,−7,6,−6°) and .94 scale, then while passing the section (scrub .55) they come in the order [6,8,5,4,1,3,2,7,0] each delayed by .085
  //    horizontal .62 (deal) · vertical is an arc (.26 arc lifts, .36 settle lands) · tilt overshoots the final angle by .7° then settles back
  const play = document.querySelector("[data-play]");
  if (play) {
    if (window.Draggable) gsap.registerPlugin(Draggable);
    if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
    CustomEase.create("playArc", "0.65, 0, 0.35, 1");
    CustomEase.create("playSettle", "0.25, 1, 0.5, 1");
    const ORDER = [6, 8, 5, 4, 1, 3, 2, 7, 0], START = [10, -8, 7, 9, -9, 8, -7, 6, -6];
    const REST = { wide: [0, 3, -3, 3, -3, -2.5, 2.5, 2, -2], narrow: [0, 4, -4, 5, -5, 0, 0, 0, 0] };
    const pmm = gsap.matchMedia();
    pmm.add({ wide: "(min-width: 701px)", narrow: "(max-width: 700px)", reduce: "(prefers-reduced-motion: reduce)", drag: "(hover: hover) and (pointer: fine)" }, (ctx) => {
      const { narrow, reduce, drag } = ctx.conditions;
      const wraps = [...play.querySelectorAll("[data-stat]")];
      const rest = narrow ? REST.narrow : REST.wide;
      const letters = play.querySelectorAll("[data-play-letter]");
      gsap.set(wraps, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: "50% 68%" });
      let top = wraps.length + 1;
      const drags = drag && window.Draggable ? wraps.map((w) => {
        const face = w.querySelector("[data-card-face]");
        const turn = gsap.quickTo(face, "rotation", { duration: 0.4, ease: "power3.out" });
        return Draggable.create(face, {
          type: "x,y", bounds: play.querySelector("[data-play-sticky]"), inertia: !reduce && !!window.InertiaPlugin, zIndexBoost: false,
          onPress() { top += 1; gsap.set(w, { zIndex: top }); gsap.to(face, { scale: 1.04, duration: 0.3, ease: "power3.out" }); },
          onDrag() { turn(gsap.utils.clamp(-14, 14, (window.InertiaPlugin ? InertiaPlugin.getVelocity(face, "x") : 0) / 90)); },
          onRelease() { gsap.to(face, { scale: 1, duration: 0.5, ease: "power3.out" }); },
          onThrowComplete() { turn(gsap.utils.random(-4, 4)); },
        })[0];
      }) : [];
      if (reduce) { wraps.forEach((w, i) => gsap.set(w, { rotation: rest[i] })); return () => drags.forEach((d) => d?.kill()); }
      gsap.set(letters, { yPercent: 105 });
      const word = ScrollTrigger.create({ trigger: play, start: "top 55%", once: true, onEnter: () => gsap.to(letters, { yPercent: 0, duration: 1.3, stagger: 0.09, ease: "expo.out" }) });
      const box = new Map(wraps.map((w) => [w, w.getBoundingClientRect()]));
      const fromX = innerWidth * (narrow ? 1.22 : 1.12), fromY = 0.52 * innerHeight;
      wraps.forEach((w, i) => { const r = box.get(w); gsap.set(w, { x: fromX - (r.left + r.width / 2), y: fromY - (r.top + r.height / 2), rotation: START[i], scale: 0.94 }); });
      const tl = gsap.timeline({ scrollTrigger: { trigger: play, start: "top top", end: "bottom bottom", scrub: 0.55, invalidateOnRefresh: true } });
      ORDER.map((i) => wraps[i]).filter(Boolean).forEach((w, k) => {
        const i = wraps.indexOf(w), r = box.get(w), cy = r.top + r.height / 2;
        const lift = i === 0 ? -0.055 * innerHeight : cy < 0.45 * innerHeight ? -0.065 * innerHeight : 0.065 * innerHeight;
        const end = rest[i], over = end + (START[i] > 0 ? -0.7 : 0.7);
        tl.add(gsap.timeline()
          .to(w, { x: 0, duration: 0.62, ease: "deal" }, 0)
          .to(w, { y: 0.45 * (fromY - cy) + lift, duration: 0.42 * 0.62, ease: "playArc" }, 0)
          .to(w, { y: 0, duration: 0.3596, ease: "playSettle" }, 0.42 * 0.62)
          .to(w, { rotation: over, scale: 1.008, duration: 0.496, ease: "deal" }, 0)
          .to(w, { rotation: end, scale: 1, duration: 0.124, ease: "playSettle" }, 0.496), 0.085 * k);
      });
      tl.to({}, { duration: 0.24 });
      return () => { drags.forEach((d) => d?.kill()); word.kill(); };
    });
  }

  TT.reveal();
})();
