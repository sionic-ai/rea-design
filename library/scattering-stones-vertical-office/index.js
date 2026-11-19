/* Home — opening (pebbles fall → body → tail), floor pebbles scatter with scroll and pile into a face, lead photo swap,
   Body line lit up, handwritten title, service title, dark band photo cycle, log rice ball rolling, menu button appearing */
(() => {
  if (!window.gsap) return;
  const reduce = Tanu.reduce, html = document.documentElement;
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  gsap.registerEase("tanuPower3Out", gsap.parseEase("power1.out"));
  let scatter = [];

  /* Opening pebble drop — from above (--fy) to 0, x sways by intensity across eight steps using steps(8) */
  const fall = () => {
    document.querySelectorAll(".js-logo-fall").forEach((el, i) => {
      const s = parseFloat(el.dataset.fallStrength) || 1;
      const r = () => (Math.random() - 0.5) * 2 * s * 8;
      gsap.to(el, { delay: i * 0.06, duration: 0.8 + Math.random() * 0.3, y: 0, keyframes: { x: Array.from({ length: 8 }, (_, k) => (k === 7 ? 0 : r())) }, ease: "steps(8)", overwrite: "auto",
        onComplete: () => { gsap.set(el, { x: 0, y: 0 }); el.style.transform = "translate(0px, 0px)"; } });
    });
  };

  /* Bottom line → face. A scrub timeline where each stone starts 70px (phone 30px) later, drawing the arc with a 21-cell steps jerk */
  const gather = () => {
    scatter.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
    const items = document.querySelectorAll(".js-logo-item");
    gsap.set(items, { clearProps: "x,y,rotation" });
    gsap.to(".js-logo", { "--logo-c": css("--site-stone-light") || css("--kf-surface"), duration: 1, overwrite: "auto" });
    const keep = new Map();
    scatter = [];
    const sp = innerWidth <= 960, amp = sp ? 0.45 : 1.3, gap = sp ? 30 : 70, extra = sp ? 200 : 190, damp = 0.5, rise = sp ? 430 : 450;
    ["1", "2", "3", "4", "5", "6", "7", "8"].forEach((n, i, all) => {
      const el = document.querySelector(`.js-logo-item[data-logo="${n}"]`);
      if (!el) return;
      keep.set(el, { x: gsap.getProperty(el, "x"), y: gsap.getProperty(el, "y"), rotation: gsap.getProperty(el, "rotation") || 0 });
      const x0 = keep.get(el).x, y0 = keep.get(el).y, top = n === "7";
      const ang = ((360 / all.length) * i + gsap.utils.random(-12, 12)) * Math.PI / 180, arc = gsap.utils.random(50, 150) * amp;
      const xs = Array.from({ length: 21 }, (_, k) => { const p = (k + 1) / 21; if (k === 20) return 0; return x0 * (1 - p) + Math.sin(p * Math.PI) * arc * Math.cos(ang) * damp + gsap.utils.random(-4, 4) * amp * damp; });
      const ys = Array.from({ length: 21 }, (_, k) => { const p = (k + 1) / 21; if (k === 20) return 0; const up = top ? Math.min(1, (k + 1) / 23) : 0; return (y0 - (top ? rise * up : 0)) * (1 - p) + Math.sin(p * Math.PI) * arc * Math.sin(ang) + gsap.utils.random(-4, 4) * amp; });
      const rs = Array.from({ length: 21 }, (_, k) => (k === 20 ? 0 : gsap.utils.random(-15, 15)));
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".js-fv-logo-trigger", start: `top+=${i * gap} center`, end: top ? `bottom+=${extra} bottom` : "bottom bottom", scrub: gsap.utils.random(0.1, 1, 0.2) },
        onReverseComplete: () => gsap.set(el, keep.get(el)) });
      tl.to(el, { duration: 6, keyframes: { x: xs, y: ys, rotation: rs }, ease: "steps(21)" });
      scatter.push(tl);
    });
  };

  /* When the lower group (contact, footer) appears, the bottom logo is erased in .3s */
  const hideNearBottom = () => {
    const b = document.querySelector(".js-bottom"), logo = document.querySelector(".js-logo");
    if (!b || !logo) return;
    new IntersectionObserver(([e]) => gsap.to(logo, { opacity: e.isIntersecting ? 0 : 1, duration: 0.3, ease: "power2.out" }), { threshold: 0 }).observe(b);
  };
  /* Hero vertical title — each line 1s later, letters turn on at .15s intervals over .35s */
  const title = () => {
    document.querySelectorAll(".js-fv-split-text").forEach((el, i) => {
      const s = new SplitText(el, { type: "chars", charsClass: "char" });
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(s.chars, { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.15, ease: "sine.out", delay: i * 1 });
    });
  };
  /* When the hero header leaves, the top-right menu button drops in */
  const menuButton = () => {
    const fv = document.querySelector(".js-fv-header"), btn = document.querySelector(".js-menu-button");
    if (fv && btn) new IntersectionObserver(([e]) => btn.classList.toggle("is-visible", !e.isIntersecting), { threshold: 0 }).observe(fv);
  };

  const lock = (on) => {
    const s = { position: "fixed", top: "0", left: "0", width: "100%", height: "100%", overflow: "hidden scroll" };
    Object.keys(s).forEach((k) => { html.style[k] = on ? s[k] : ""; });
  };
  const seen = document.cookie.split("; ").find((c) => c.startsWith("opening="))?.split("=")[1] === "yes" && !new URLSearchParams(location.search).has("opening");

  const opening = () => {
    if (reduce) {
      gsap.set([".js-container", ".js-logo-wrapper", ".js-logo", ".js-main-inner", ".js-header", ".js-bottom", ".js-shippo"], { opacity: 1, x: 0 });
      gsap.set(".js-fv-split-text", { opacity: 1 });
      gsap.set(".js-logo-fall", { x: 0, y: 0 });
      document.querySelectorAll(".js-logo-fall").forEach((el) => { el.style.transform = "translate(0px, 0px)"; });
      hideNearBottom(); menuButton();
      return;
    }
    if (seen) {
      html.classList.add("isOpeningSkip");
      const tl = gsap.timeline();
      tl.to(".js-container", { opacity: 1, duration: 0.3, ease: "power4.out" })
        .to(".js-logo-wrapper", { opacity: 1, duration: 0.3, ease: "sine.out" }, "<")
        .to(".js-logo", { opacity: 1, duration: 0.3, ease: "sine.out" }, "<")
        .add(() => { fall(); hideNearBottom(); })
        .to(".js-main-inner", { opacity: 1, duration: 0.3, ease: "sine.out" })
        .to(".js-shippo", { x: 0, duration: 0.3, ease: "tanuPower3Out" }, "<")
        .to(".js-bottom", { opacity: 1, duration: 0.3, ease: "sine.out" }, "<")
        .add(() => { title(); gather(); menuButton(); })
        .to(".js-header", { opacity: 1, duration: 0.6, ease: "sine.out" })
        .to(".js-shippo", { opacity: 1, duration: 0.3, ease: "sine.out" });
      Tanu.registerEntrance?.(tl);
      return;
    }
    lock(true);
    html.classList.add("isOpening1");
    const tl = gsap.timeline();
    tl.to(".js-container", { opacity: 1, duration: 0.6, ease: "sine.out" })
      .add(() => html.classList.add("isOpening2"))
      .to(".js-logo-wrapper", { opacity: 1, duration: 0.3, ease: "sine.out" }, "<")
      .to(".js-logo", { opacity: 1, duration: 0.8, ease: "sine.out" })
      .add(() => fall(), "-=0.5")
      .to(".js-main-inner", { opacity: 1, duration: 0.6, ease: "sine.out" }, "+=1.5")
      .to(".js-header", { opacity: 1, duration: 0.6, ease: "sine.out" })
      .to(".js-bottom", { opacity: 1, duration: 0.6, ease: "sine.out" }, "<")
      .add(() => title())
      .to(".js-shippo", { opacity: 1, duration: 0.6, ease: "sine.out" }, "+=1.5")
      .to(".js-shippo", { x: 0, duration: 0.6, ease: "tanuPower3Out" })
      .add(() => lock(false))
      .add(() => { html.classList.add("isOpeningEnd"); gather(); hideNearBottom(); menuButton(); });
    Tanu.registerEntrance?.(tl);
    document.cookie = "opening=yes; max-age=604800; path=/";
  };

  /* Lead photo — while passing the second range, the next slide’s opacity is tied to scroll, and once passed the front and back numbers are swapped to prepare the next loop */
  const leadImage = () => {
    gsap.utils.toArray(".js-lead-image-trigger").forEach((t) => {
      const n = t.dataset.lead;
      if (n === "1" || n === "3") return;
      const box = document.querySelector(".js-lead-image"), p = { v: 0 };
      let next = null;
      const pick = () => { next = document.querySelector(`.js-lead-image-item[data-change="${box.dataset.sliderAfter}"]`); };
      gsap.timeline({ scrollTrigger: { trigger: t, start: "top center", end: "bottom center", scrub: true, onEnter: pick, onEnterBack: pick,
        onLeave: () => box.setAttribute("data-slider-before", box.dataset.sliderBefore === "3" ? "1" : "3"),
        onLeaveBack: () => box.setAttribute("data-slider-after", box.dataset.sliderAfter === "4" ? "2" : "4") } })
        .to(p, { v: 1, duration: 1, onUpdate: () => next && gsap.set(next, { opacity: p.v }) }, 0);
    });
  };

  /* Body lines — each line turns on at 80% of the screen with 2s power4.out, and turns off when scrolled back up */
  const lines = () => {
    document.querySelectorAll(".js-split-text").forEach((el) => {
      const s = new SplitText(el, { type: "lines", linesClass: "cLine" });
      if (reduce) { gsap.set(s.lines, { opacity: 1 }); return; }
      s.lines.forEach((l) => gsap.to(l, { opacity: 1, duration: 2, ease: "power4.out", scrollTrigger: { trigger: l, start: "top 80%", toggleActions: "play none none reverse" } }));
    });
  };

  /* Service title — the English letters · ‹of› · ‹work› turn on .1s apart, switch once to handwriting, then handwriting for 1s every 3s */
  const serviceHead = () => {
    document.querySelectorAll(".js-service-headline").forEach((h) => {
      const typo = h.querySelector(".js-service-typo"), hand = h.querySelector(".js-service-image"), normal = h.querySelector('[data-type="normal"]'), en = h.querySelector(".js-service-path");
      if (reduce) return;
      const ens = new SplitText(en, { type: "chars" }).chars, s = new SplitText(typo, { type: "chars", charsClass: "char" });
      gsap.set([...ens, normal, hand, ...s.chars], { opacity: 0 });
      const loop = gsap.timeline({ paused: true, repeat: -1 });
      loop.to({}, { duration: 3 }).to(hand, { opacity: 1, duration: 0.1, ease: "power4.out" }).to(typo, { opacity: 0, duration: 0.1, ease: "power4.out" }, "<")
        .to({}, { duration: 1 }).to(hand, { opacity: 0, duration: 0.1, clearProps: "opacity" }).to(typo, { opacity: 1, duration: 0.1, clearProps: "opacity" }, "<");
      gsap.timeline({ scrollTrigger: { trigger: h, start: "top 80%", once: true }, onComplete: () => loop.play() })
        .to(ens, { opacity: 1, duration: 0.1, stagger: 0.05, ease: "power4.out" })
        .to(normal, { opacity: 1, duration: 0.1, ease: "power4.out" })
        .to(s.chars, { opacity: 1, duration: 0.1, stagger: 0.1, ease: "power4.out" })
        .to({}, { duration: 0.4 })
        .to(typo, { opacity: 0, duration: 0.1, ease: "power4.out" }).to(hand, { opacity: 1, duration: 0.1, ease: "power4.out" }, "<")
        .to({}, { duration: 0.4 })
        .to(hand, { opacity: 0, duration: 0.1, clearProps: "opacity" }).to(typo, { opacity: 1, duration: 0.1, clearProps: "opacity" }, "<");
    });
  };

  /* Dark band photo — while passing the screen center, the next photo comes every 3s (the previous stays below and cross-fades over 1.2s) */
  const cycle = () => {
    document.querySelectorAll(".js-change-image-group").forEach((g) => {
      const imgs = g.querySelectorAll(".js-change-image"), total = imgs.length;
      if (total < 3) return;
      let cur = 0, timer = null;
      const show = () => {
        const c = cur % total + 1, prev = (cur - 1 + total) % total + 1, next = (cur + 1) % total + 1;
        g.dataset.slider = c; g.dataset.sliderAfter = prev; g.dataset.sliderBefore = next;
        imgs.forEach((im) => { const k = +im.dataset.change; im.classList.remove("is-active", "is-prev", "is-next"); im.classList.add(k === c ? "is-active" : k === prev ? "is-prev" : k === next ? "is-next" : "x"); im.classList.remove("x"); });
      };
      show();
      const start = () => { if (!timer && !reduce) timer = setInterval(() => { cur = (cur + 1) % total; show(); }, 3000); };
      const stop = () => { clearInterval(timer); timer = null; };
      ScrollTrigger.create({ trigger: g, start: "top center", end: "bottom center", onEnter: start, onLeave: stop, onEnterBack: start, onLeaveBack: stop });
    });
  };

  /* Logbook — on entry the intro text lights up at .1s intervals and a rice ball floats up, then after a 4s rest it rolls down in 2s steps(10) and returns 6s later */
  const lifelog = () => {
    document.querySelectorAll(".js-lifelog").forEach((t) => {
      const words = t.querySelectorAll(".js-lifelog-item-pc"), ball = t.querySelector(".js-lifelog-item");
      if (reduce) return;
      gsap.set([words, ball], { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", once: true } })
        .to(words, { opacity: 1, duration: 0.3, stagger: 0.1, ease: "power4.out" })
        .to(ball, { opacity: 1, duration: 0.1, ease: "power4.out" })
        .add(() => {
          gsap.set(ball, { transformOrigin: "50% 50%" });
          const roll = gsap.timeline({ repeat: -1, paused: true });
          roll.to({}, { duration: 4 }).to(ball, { x: 280, y: 280, rotation: 720, duration: 2, ease: "steps(10)" }).set(ball, { opacity: 0, x: 0, y: 0, rotation: 0 }).to({}, { duration: 6 }).to(ball, { duration: 0.2, opacity: 1, ease: "sine.out" });
          ScrollTrigger.create({ trigger: t, start: "top bottom", end: "bottom top", onEnter: () => roll.play(), onEnterBack: () => roll.play(), onLeave: () => roll.pause(), onLeaveBack: () => roll.pause() });
        });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    opening();
    lines();
    leadImage();
    cycle();
    Tanu.reveal();
    Tanu.tegaki();
    serviceHead();
    lifelog();
    let w = innerWidth, rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth !== w && !matchMedia("(hover: none)").matches) { w = innerWidth; if (html.classList.contains("isOpeningEnd") || html.classList.contains("isOpeningSkip")) gather(); ScrollTrigger.refresh(); } }, 500); });
  });
})();
