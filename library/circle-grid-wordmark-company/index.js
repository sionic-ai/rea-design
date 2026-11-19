// Loader: the number counts up to 100 from 0.2s over 2.8s on a front-loaded curve, the side ball (bounce-ball) changes among five colors every .2s while dropping from 240px and bouncing. It exits at 3.0s.
// The scene waits for fonts before starting, so only the loader spins first
(() => {
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;
  if (mSite.reduce) { loader.remove(); return; }
  mSite.lenis?.stop();
  const num = loader.querySelector("[data-loader-num]");
  const st = { p: 0 };
  gsap.timeline()
    .to(st, { p: 100, duration: 2.8, ease: "power1.out", onUpdate: () => (num.textContent = Math.round(st.p)) }, 0.2)
    .add(() => loader.classList.add("is-done"), 3.0);
})();

// First page: percent loader → building a circle-grid wordmark, dots with different scroll speeds, photo row flow · bracket word swap, big text horizontal push, dotted circle pushed in by scroll, news filter.
mSite.scene(({ reduce, lenis, buildMark, playMark, dotSpeed, spring, EASE, EASE_OUT }) => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const mark = buildMark($("[data-hero-mark]"));

  // The 3.0s loader leaves, the 3.6s title comes in as a spring (stiffness 525 · damping 100), and from 3.5s the wordmark is built — times are counted from when the page loads, so they are pulled earlier by the time spent waiting for fonts
  const loader = $("[data-loader]");
  if (!reduce) {
    const at = -performance.now() / 1000;
    const rise = spring({ stiffness: 525, damping: 100 });
    gsap.set([".hm-hero__title", ".hm-hero__sub", ".hm-hero__down"], { opacity: 0, y: 30 });
    gsap.timeline({ delay: Math.max(0, 3.6 + at) })
      .to([".hm-hero__title", ".hm-hero__sub", ".hm-hero__down"], { opacity: 1, y: 0, duration: rise.duration, ease: rise.ease, clearProps: "opacity,transform" })
      .add(() => { loader?.remove(); lenis?.start(); });
    playMark(mark, Math.min(0, at));
    dotSpeed(mark);
  }

  // Photo card row flow (keeps moving left)
  const strip = $("[data-strip]");
  strip.append(...[...strip.children].map((n) => n.cloneNode(true)));
  if (!reduce) gsap.to(strip, { xPercent: -50, duration: 36, ease: "none", repeat: -1 });

  // Word between brackets: every 2s it rises from below and swaps — a curve unrolled from the original spring bounce .2 · duration .4 (settles at .392s)
  const words = $$("[data-words] span");
  let w = 0;
  gsap.set(words, { y: 0, yPercent: 110, visibility: "visible" });
  gsap.set(words[0], { yPercent: 0 });
  const swap = spring({ bounce: 0.2, duration: 0.4 });
  if (!reduce) setInterval(() => {
    const prev = words[w];
    w = (w + 1) % words.length;
    gsap.to(prev, { yPercent: -110, duration: swap.duration, ease: swap.ease });
    gsap.fromTo(words[w], { yPercent: 110 }, { yPercent: 0, duration: swap.duration, ease: swap.ease });
  }, 2000);

  // A line larger than the screen moves sideways with the scroll
  const big = $("[data-big]");
  if (!reduce) gsap.fromTo(big, { x: () => innerWidth * 0.1 }, { x: () => -(big.scrollWidth - innerWidth * 0.6), ease: "none", scrollTrigger: { trigger: ".hm-big", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });

  // Six dotted circles: original Scroll Lottie (1343×767, 60fps 132 frames) values as is — each circle goes from right 960 to its place (72 frames, 0,0,0,1), 12 frames later each, appearing during the first 36 frames.
  // Progress is 0 when the board’s top edge touches the screen bottom and ends when the board’s center is at the screen center (speed 2 · clamp).
  const STEP_X = [6, 224, 442, 661, 879, 1097];
  const stepSvg = $("[data-steps]");
  const steps = STEP_X.map((x, i) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "hm-steps__one");
    g.innerHTML = `<circle cx="377.5" cy="377.5" r="376.6"/><text class="hm-steps__no" x="38.5" y="345.9">0${i + 1}</text><text class="hm-steps__name" x="38.5" y="386.6">Step ${["One", "Two", "Three", "Four", "Five", "Six"][i]}</text>`;
    stepSvg.append(g);
    return { g, x };
  });
  const place = (s, dx) => s.g.setAttribute("transform", `translate(${s.x + dx} 6)`);
  if (reduce) steps.forEach((s) => place(s, 0));
  else {
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".hm-steps__stage", start: "top bottom", end: "center center", scrub: true } });
    steps.forEach((s, i) => {
      const st = { dx: 960 };
      place(s, 960);
      gsap.set(s.g, { opacity: 0 });
      tl.to(st, { dx: 0, duration: 72, ease: EASE_OUT, onUpdate: () => place(s, st.dx) }, i * 12);
      tl.to(s.g, { opacity: 1, duration: 36, ease: "none" }, i * 12);
    });
    tl.to({}, { duration: 132 - tl.duration() });
  }

  // News filter
  const cats = $$("[data-cats] [data-cat]");
  const rows = $$("[data-news] li");

  // News row underline: original layout spring (stiffness 500 · damping 60). On enter the gray line folds away at once and a 22px black line at the left end spreads to the full row width.
  // On entry the black line folds up at once and the gray line unfolds from the right end at 33px
  const firm = spring({ stiffness: 500, damping: 60 });
  // Pill color: on enter background .467s (0,0,0,1) · text stiffness 369 · damping 60, on exit background 113 · 31 spring fit into 1.18s and text .4s (0,0,0,1)
  const pillText = spring({ stiffness: 369, damping: 60 }), pillBack = spring({ stiffness: 113, damping: 31 });
  const kf = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  rows.forEach((li) => {
    const a = li.querySelector("a");
    const barIn = document.createElement("i"), barOut = document.createElement("i");
    barIn.className = "hm-news__bar";
    barOut.className = "hm-news__bar hm-news__bar--out";
    a.append(barIn, barOut);
    if (reduce) return;
    // In the original, hovering a row redraws the pill text and shows it in .4s (.44,0,.56,1), and on leave it returns to the original text at once (state change)
    const pill = a.querySelector(".hm-pill");
    const swapLabel = (fade) => {
      const old = pill?.firstElementChild;
      if (!old) return;
      gsap.killTweensOf(old);
      const fresh = old.cloneNode(true);
      fresh.removeAttribute("style");
      if (fade) fresh.style.opacity = "0";
      old.replaceWith(fresh);
      if (fade) gsap.to(fresh, { opacity: 1, duration: 0.4, ease: EASE, delay: 0.03 });
    };
    a.addEventListener("pointerleave", () => {
      swapLabel(false);
      gsap.to(pill, { backgroundColor: kf("--kf-ink"), duration: 1.18, ease: pillBack.ease, overwrite: "auto" });
      gsap.to(pill, { color: kf("--kf-bg"), duration: 0.4, ease: EASE_OUT, overwrite: "auto" });
    });
    a.addEventListener("pointerenter", () => {
      swapLabel(true);
      gsap.to(pill, { backgroundColor: kf("--kf-accent"), duration: 0.467, ease: EASE_OUT, overwrite: "auto" });
      gsap.to(pill, { color: kf("--kf-on-accent"), duration: pillText.duration, ease: pillText.ease, overwrite: "auto" });
      const W = a.offsetWidth;
      gsap.set(barOut, { width: 0, x: 0, scaleX: 1, overwrite: true });
      gsap.set(barIn, { width: W });
      gsap.fromTo(barIn, { x: -(W / 2 - 11), scaleX: 22 / W }, { x: 0, scaleX: 1, duration: firm.duration, ease: firm.ease, overwrite: true });
    });
    a.addEventListener("pointerleave", () => {
      const W = a.offsetWidth;
      gsap.set(barIn, { width: 0, x: 0, scaleX: 1, overwrite: true });
      gsap.set(barOut, { width: W });
      gsap.fromTo(barOut, { x: W / 2 - 16.5, scaleX: 33 / W }, { x: 0, scaleX: 1, duration: firm.duration, ease: firm.ease, overwrite: true });
    });
  });
  // Category color (a spring measured from the original variant transition — stiffness 490 · damping 35): on hover in and out, text and dot shift together between ink and gray,
  // On press, only the pressed item’s text turns ink color with a spring, while the dot and other categories change right away. On phones only the off All fades to ink at .3 instead of gray (spring).
  // The original (Framer) blends text color by light intensity (squared), so it goes slowly when darkening and fast when brightening, while dot color is blended linearly.
  // Gray is an oklab mix so GSAP can’t read the computed value and jumps to the end value — color is painted on a canvas, decoded to sRGB numbers and mixed directly
  const S4 = spring({ bounce: 0.2, duration: 0.4 }), HOV = spring({ stiffness: 490, damping: 35 });
  const tween = { duration: S4.duration, ease: S4.ease, overwrite: "auto" };
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgbOf = (c) => {
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    return [...px.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const mix = (a, b, p, light) => `rgb(${a.map((x, i) => (light ? Math.sqrt(Math.max(0, x * x + (b[i] * b[i] - x * x) * p)) : x + (b[i] - x) * p)).join(",")})`;
  const tints = new Map();
  // Desired values are read in place from what CSS sets (so they follow even when the skin changes)
  const settled = (el, props) => {
    const was = props.map((k) => el.style[k]);
    props.forEach((k) => (el.style[k] = ""));
    const cs = getComputedStyle(el), to = Object.fromEntries(props.map((k) => [k, k === "opacity" ? +cs[k] : cs[k]]));
    props.forEach((k, i) => (el.style[k] = was[i]));
    return to;
  };
  const dotOf = (b) => b.querySelector(".hm-cat__dot");
  // If there is no to, goes to the color set by css and clears the inline style when done (so it follows when the skin changes)
  const tint = (b, to, { dot = true, from } = {}) => {
    tints.get(b)?.kill();
    const d = dotOf(b);
    const a = [from || rgbOf(getComputedStyle(b).color), rgbOf(getComputedStyle(d).backgroundColor)];
    const z = to ? [rgbOf(to), rgbOf(to)] : [rgbOf(settled(b, ["color"]).color), rgbOf(settled(d, ["backgroundColor"]).backgroundColor)];
    const st = { p: 0 };
    const draw = () => {
      b.style.color = mix(a[0], z[0], st.p, true);
      if (dot) d.style.backgroundColor = mix(a[1], z[1], st.p, false);
    };
    draw();
    tints.set(b, gsap.to(st, { p: 1, duration: HOV.duration, ease: HOV.ease, onUpdate: draw, onComplete: () => !to && gsap.set([b, d], { clearProps: "color,backgroundColor" }) }));
  };
  // On touch screens, even if mouse events are emulated, no hover color is applied — the original 834·390 press started directly from gray (175)
  const canHover = matchMedia("(hover: hover)");
  const hoverable = (e) => e.pointerType === "mouse" && canHover.matches && !reduce;
  cats.forEach((b) => {
    b.addEventListener("pointerenter", (e) => hoverable(e) && tint(b, kf("--kf-ink")));
    b.addEventListener("pointerleave", (e) => hoverable(e) && tint(b, null));
  });
  const select = (b) => {
    const from = rgbOf(getComputedStyle(b).color), fade = cats.map((c) => +getComputedStyle(c).opacity);
    cats.forEach((c) => {
      tints.get(c)?.kill();
      gsap.killTweensOf(c);
      c.classList.toggle("is-on", c === b);
      c.setAttribute("aria-pressed", String(c === b));
      gsap.set([c, dotOf(c)], { clearProps: "color,backgroundColor,opacity" });
    });
    if (reduce) return;
    tint(b, null, { dot: false, from });
    cats.forEach((c, i) => {
      const to = +getComputedStyle(c).opacity;
      if (to !== fade[i]) gsap.fromTo(c, { opacity: fade[i] }, { opacity: to, ...tween });
    });
  };

  // News filter: the original (Framer) layers layout animations from the old look to the new position for each changed box — news section · list box · row box as bounce .2 · .4s springs,
  // Scale grown or shrunk by the parent is undone by the child so it isn’t squashed. Remaining rows slide into place with a spring, removed rows vanish immediately, and newly added rows stand in place immediately
  const sec = $(".hm-news"), side = $(".hm-news__side"), list = $("[data-news]"), LEAD = 0.033;
  const box = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; };
  let cur = cats.find((b) => b.classList.contains("is-on"))?.dataset.cat || "all", run = null;
  const pick = (b) => {
    const cat = b.dataset.cat;
    if (cat === cur) return;
    cur = cat;
    select(b);
    const all = [sec, side, list, ...rows];
    const old = new Map(all.filter((el) => el.offsetParent).map((el) => [el, box(el)]));
    run?.kill();
    gsap.set(all, { clearProps: "transform" });
    rows.forEach((r) => (r.hidden = !(cat === "all" || r.dataset.cat === cat)));
    lenis?.resize();
    ScrollTrigger.refresh();
    if (reduce) return;
    const shown = rows.filter((r) => !r.hidden);
    const now = new Map([sec, side, list, ...shown].map((el) => [el, box(el)]));
    // Parents first: each box is placed with translate·scaleY (center axis) to fit its desired screen box (old → new via spring), within the position and scale the parent is currently drawn at.
    // The original list box has already advanced by LEAD seconds on its first drawn frame after the press (measured first scale) — it’s an invisible box, so the line simply sits on its own spring
    const nodes = [[sec, null, 0], [side, sec, 0], [list, sec, LEAD], ...shown.map((li) => [li, list, 0])];
    const st = { t: 0 };
    const draw = () => {
      const drawn = new Map();
      for (const [el, up, lead] of nodes) {
        const L = now.get(el), O = old.get(el) || L, p = S4.ease(Math.min(1, (st.t + lead) / S4.duration));
        const top = O.top + (L.top - O.top) * p, h = O.h + (L.h - O.h) * p;
        const [a, k0] = up ? drawn.get(up) : [0, 1];
        const y = up ? L.top - now.get(up).top : L.top;
        const k = h / (k0 * L.h);
        el.style.transform = `translateY(${(top - a) / k0 - y - L.h / 2 + (k * L.h) / 2}px) scaleY(${k})`;
        drawn.set(el, [top, h / L.h]);
      }
    };
    draw();
    run = gsap.to(st, { t: S4.duration, duration: S4.duration, ease: "none", onUpdate: draw, onComplete: () => gsap.set(all, { clearProps: "transform" }) });
  };
  // The original redraws after release and measures the box, changing on the next frame — all three widths started moving 37~56ms after release
  let wait = null;
  const later = (b) => {
    wait?.kill();
    wait = gsap.delayedCall(reduce ? 0 : 0.04, pick, [b]);
  };
  cats.forEach((b) => {
    b.addEventListener("click", () => later(b));
    b.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), later(b)));
  });
});
