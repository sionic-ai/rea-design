// First page scene: loading (first visit only) → title letters on, Hero slide·pin, product step pin, brand philosophy stair pin,
// Photo pile pins, News load more. Values are exactly as in the original inline script.
(() => {
  const { pinwheel, wordmark } = window.ab;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("[data-load-logo]").innerHTML = pinwheel();
  $("[data-load-mark]").innerHTML = wordmark();
  $('[data-mark="pc"]').innerHTML = wordmark();
  // On phone the title stacks onto two lines
  $('[data-mark="sp"]').innerHTML = `<svg viewBox="0 0 640 430" aria-label="Your wordmark here">${
    ["Brand", "Name"].map((w, i) => `<text x="0" y="${190 + i * 230}" font-family="Inter, Helvetica, sans-serif" font-weight="500" font-size="250" textLength="640" lengthAdjust="spacingAndGlyphs" fill="currentColor">${[...w].map((c) => `<tspan>${c}</tspan>`).join("")}</text>`).join("")
  }</svg>`;

  // ── Loading → title letters light up from the left (1.0s, stagger 0.07, power1.out). From the second visit on, no loading, straight in
  const load = $("#load");
  const letters = (sel) => $$(`${sel} text tspan`).filter((t) => !t.querySelector("tspan"));
  const pcLetters = letters('[data-mark="pc"]');
  const spLetters = letters('[data-mark="sp"]');
  const visited = sessionStorage.getItem("ab-visited");
  if (visited || reduce) {
    load.style.display = "none";
  } else {
    gsap.set([...pcLetters, ...spLetters], { attr: { "fill-opacity": 0 } });
    const run = () => {
      const tl = gsap.timeline();
      tl.to(load, { autoAlpha: 0, duration: 0.8, ease: "power2.out", onComplete: () => {
        load.style.display = "none";
        sessionStorage.setItem("ab-visited", "1");
      } });
      tl.to(pcLetters, { attr: { "fill-opacity": 1 }, duration: 1.0, stagger: 0.07, ease: "power1.out" }, "+=0.2");
      tl.to(spLetters, { attr: { "fill-opacity": 1 }, duration: 1.0, stagger: 0.07, ease: "power1.out" }, "<");
    };
    if (document.readyState === "complete") run(); else addEventListener("load", run);
  }

  // ── Hero: crossfades every 5 seconds over 1.8s. The first scene’s cutout is turned off in 0.1s so they don’t show overlapping, and on return it is turned on in 0.1s after 1.7s
  const slides = $$(".fv__slide");
  const cuts = $$(".fv__cut");
  const now = $("[data-fv-now]");
  const bar = $(".fv__bar b");
  gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
  gsap.set(cuts, { autoAlpha: 0, zIndex: 0 });
  gsap.set([slides[0], cuts[0]], { autoAlpha: 1, zIndex: 1 });
  let cur = 0;
  if (!reduce) setInterval(() => {
    const next = (cur + 1) % slides.length;
    gsap.set([slides, cuts], { zIndex: 0 });
    gsap.set([slides[cur], cuts[cur]], { zIndex: 1 });
    gsap.set([slides[next], cuts[next]], { zIndex: 2, autoAlpha: 0 });
    if (cur === 0) {
      gsap.to(cuts[cur], { autoAlpha: 0, duration: 0.1 });
      gsap.to(slides[cur], { autoAlpha: 0, duration: 1.8 });
    } else gsap.to([slides[cur], cuts[cur]], { autoAlpha: 0, duration: 1.8 });
    if (next === 0) {
      gsap.to(slides[next], { autoAlpha: 1, duration: 1.8 });
      gsap.to(cuts[next], { autoAlpha: 1, duration: 0.1, delay: 1.7 });
    } else gsap.to([slides[next], cuts[next]], { autoAlpha: 1, duration: 1.8 });
    now.textContent = next + 1;
    gsap.to(bar, { height: `${((next + 1) / slides.length) * 100}%`, duration: 1.8, ease: "power2.out" });
    cur = next;
  }, 5000);

  const mm = gsap.matchMedia();
  const fv = $("#fv");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The hero is held in place (pinSpacing false), while the next panel covers it, the photo scales to 1.1x and the title and number move up by the hero height
    const tl = gsap.timeline({ scrollTrigger: { trigger: fv, start: "top top", end: "bottom top", pin: true, pinSpacing: false, anticipatePin: 2, scrub: 1 } });
    tl.to([".fv__img", ".fv__icon"], { scale: 1.1, transformOrigin: "center top", ease: "none" }, 0);
    tl.to([".fv__txt", ".fv__num"], { y: () => -fv.offsetHeight, ease: "none" }, 0);
  });

  // ── Product step — scrolling inside the description box isn’t intercepted by Lenis, like the original
  $$(".prd__right").forEach((el) => { el.setAttribute("data-lenis-prevent", "true"); el.setAttribute("data-lenis-prevent-touch", "true"); });
  const boxes = $$("[data-prd-boxes] .prd__box");
  const menu = $("[data-prd-menu]");
  const tag = $("[data-prd-tag]");
  const markMenu = (i, dur) => {
    menu.classList.toggle("is-2", boxes[i].dataset.cat === "2");
    gsap.to(tag, { autoAlpha: boxes[i].hasAttribute("data-limited") ? 1 : 0, duration: dur });
  };
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    const MASK = "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 47%, black 53%, black 100%)"; // Not clothing: mask alpha
    gsap.set(".prd__boxes", { overflow: "hidden" });
    gsap.set(boxes.slice(1), {
      position: "absolute", top: 0, left: 0, width: "100%",
      WebkitMaskImage: MASK, maskImage: MASK, WebkitMaskSize: "100% 300%", maskSize: "100% 300%",
      WebkitMaskPosition: "0% 0%", maskPosition: "0% 0%", filter: "blur(10px)", autoAlpha: 0, pointerEvents: "none",
    });
    let idx = 0;
    gsap.set(tag, { autoAlpha: 0 });
    const st = ScrollTrigger.create({
      trigger: ".prd", start: "top top", end: () => `+=${boxes.length * 600}`, pin: true, anticipatePin: 1,
      onUpdate(self) {
        const target = Math.min(boxes.length - 1, Math.max(0, Math.floor(self.progress * boxes.length)));
        if (target === idx) return;
        boxes.forEach((box, i) => gsap.to(box, i <= target
          ? { WebkitMaskPosition: "0% 100%", maskPosition: "0% 100%", filter: "blur(0px)", autoAlpha: 1, pointerEvents: "auto", duration: 0.5, ease: "power1.out" }
          : { WebkitMaskPosition: "0% 0%", maskPosition: "0% 0%", filter: "blur(10px)", autoAlpha: 0, pointerEvents: "none", duration: 0.5, ease: "power1.out" }));
        markMenu(target, 0.5);
        idx = target;
      },
    });
    return () => { st.kill(); gsap.set(boxes, { clearProps: "all" }); gsap.set(".prd__boxes", { clearProps: "all" }); };
  });
  mm.add("(max-width: 768px)", () => {
    gsap.set(tag, { autoAlpha: 0 });
    const sts = boxes.map((box, i) => ScrollTrigger.create({
      trigger: box, start: "top 50%", end: "bottom 50%",
      onEnter: () => markMenu(i, 0.3), onEnterBack: () => markMenu(i, 0.3),
    }));
    markMenu(0, 0);
    return () => sts.forEach((t) => t.kill());
  });

  // ── Brand philosophy: only the chosen item lights up, and the big photo and small photo swap in 0.3s
  const infos = $$(".brand__info");
  const bigs = $$(".brand__img");
  const pick = (i) => {
    infos.forEach((el, k) => { el.classList.toggle("is-on", k === i); el.querySelector("input").checked = k === i; });
    bigs.forEach((el, k) => el.classList.toggle("is-on", k === i));
  };
  infos.forEach((el, i) => el.querySelector("input").addEventListener("change", () => pick(i)));

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(".brand__inner", { y: 50 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".brand", start: "top bottom", end: "top top", scrub: 1.2 } });
    // Pin length is 1200px per item (400px on phone). Only one box advances at a time, and once advanced it holds it in that box for 0.8s
    let i = 0;
    let locked = false;
    let timer = null;
    const n = infos.length;
    // As in the original, move only the window scroll — if Lenis is mid-flow it gets overwritten on the next frame, so only a snag remains and the distance isn’t consumed
    const jump = (self, p) => self.scroll(self.start + p * (self.end - self.start));
    ScrollTrigger.create({
      trigger: ".brand", start: "top top", end: () => `+=${n * (innerWidth <= 768 ? 400 : 1200)}`, pin: true, anticipatePin: 2,
      onUpdate(self) {
        const step = 1 / n;
        const p = self.progress;
        if (window.ab.isAnchorScrolling) {
          const t = Math.min(n - 1, Math.max(0, Math.floor(p / step)));
          if (t !== i) { i = t; pick(i); }
          return;
        }
        if (locked) {
          const hi = (i + 1) * step - 0.0001;
          const lo = i * step + 0.0001;
          if (p > hi) jump(self, hi);
          else if (p < lo && i > 0) jump(self, lo);
          return;
        }
        let t = Math.floor(p / step);
        t = Math.min(n - 1, Math.max(0, Math.min(i + 1, Math.max(i - 1, t))));
        if (t === i) return;
        jump(self, t > i ? t * step : i * step - 0.0001);
        i = t;
        pick(i);
        locked = true;
        clearTimeout(timer);
        timer = setTimeout(() => (locked = false), 800);
      },
    });
  });

  // ── Photo stack: the next photo rises from 100vh below and covers, only the scene name crossfades at 0.5
  const panels = $$(".act__panel");
  const texts = $$(".act__text");
  mm.add({ pc: "(min-width: 769px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) { gsap.set(panels.slice(1), { autoAlpha: 0 }); return; }
    gsap.set(panels.slice(1), { y: "100vh" });
    gsap.set(texts.slice(1), { opacity: 0 });
    gsap.set(".act", { marginTop: ctx.conditions.pc ? "80vh" : 0 });
    gsap.fromTo([".act__left", ".act__center", ".act__right"], { y: 50 }, { y: 0, ease: "none", scrollTrigger: { trigger: ".act", start: "top bottom", end: "top top", scrub: 1.2 } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".act", start: "top top", end: "+=400%", pin: true, anticipatePin: 2, scrub: 1 } });
    panels.forEach((panel, k) => {
      if (k === 0) return;
      tl.to(panel, { y: 0, ease: "none", duration: 1 });
      tl.addLabel(`fade${k}`);
      tl.to(texts[k - 1], { opacity: 0, duration: 0.5 }, `fade${k}`);
      tl.to(texts[k], { opacity: 1, duration: 0.5 }, `fade${k}`);
      tl.to({}, { duration: 0.5 });
    });
  });

  // ── News: shows 4 at a time, Load more adds 4 more
  const news = $$(".news__box");
  const more = $("[data-news-more]");
  let shown = 4;
  news.forEach((b, k) => b.classList.toggle("is-hidden", k >= shown));
  if (news.length <= shown) more.style.display = "none";
  more.addEventListener("click", () => {
    shown += 4;
    news.forEach((b, k) => { if (k < shown) b.classList.remove("is-hidden"); });
    if (shown >= news.length) more.style.display = "none";
    ScrollTrigger.refresh();
  });

  // When arriving from another page with something like #brand, it jumps to that spot right after the pins are all set
  if (location.hash) {
    window.ab.isAnchorScrolling = true;
    addEventListener("load", () => setTimeout(() => {
      ScrollTrigger.refresh();
      const t = document.querySelector(location.hash);
      if (t) {
        const y = t.getBoundingClientRect().top + scrollY;
        if (window.ab.lenis) window.ab.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
      }
      setTimeout(() => (window.ab.isAnchorScrolling = false), 100);
    }, 300));
  }
})();
