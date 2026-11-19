/* Shared motion — Lenis (original 1.1.13 defaults) · loader (4s number and line, original curve) · scroll lock for the first 7.8s · header background color · menu panel · booking panel · video panel · random text reveal */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const css = (name) => {
    const el = document.createElement("i");
    el.style.cssText = "display:none;color:var(" + name + ")";
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return c;
  };

  window.MDSphere?.fill();

  // Lenis — the original creates it with no options and drives it with rAF
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({});
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const lock = (on) => {
    document.body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  // Loader — the number 0→100 and the line fill over 4 seconds along the original curve, then the number drops down and the panel vanishes in .3 seconds
  const pre = document.querySelector(".pre");
  const LOADER_EASE = "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";
  const loaded = new Promise((resolve) => {
    if (!pre) return resolve();
    if (reduce) { pre.remove(); document.body.classList.remove("is-loading"); return resolve(); }
    // Original Webflow loader Lottie slot — with the same lottie-web, our own drawing (three dots swelling in turn as they spin) runs on a 1.067s cycle
    const box = pre.querySelector(".pre__lottie");
    if (window.lottie && box) {
      const ink = css("--kf-line").match(/[\d.]+/g).slice(0, 3).map((v) => v / 255).concat(1);
      const dot = (i) => ({
        ddd: 0, ind: i + 1, ty: 4, nm: "dot" + i, sr: 1, ao: 0, ip: 0, op: 32, st: 0, bm: 0,
        ks: {
          o: { a: 0, k: 100 }, r: { a: 1, k: [{ t: 0, s: [i * 120], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 32, s: [i * 120 + 360] }] },
          p: { a: 0, k: [62, 62, 0] }, a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 0, s: [60, 60, 100], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 10 + i * 4, s: [110, 110, 100], i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] } }, { t: 32, s: [60, 60, 100] }] },
        },
        shapes: [{ ty: "gr", it: [
          { ty: "el", p: { a: 0, k: [0, -34] }, s: { a: 0, k: [28, 28] } },
          { ty: "st", c: { a: 0, k: ink }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 }, lc: 2, lj: 2 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ] }],
      });
      lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: true, animationData: { v: "5.7.4", fr: 30, ip: 0, op: 32, w: 124, h: 124, nm: "pre", ddd: 0, assets: [], layers: [0, 1, 2].map(dot) } });
    }
    const num = pre.querySelector(".pre__num"), bar = pre.querySelector(".pre__bar");
    const counter = { v: 0 };
    const ease = CustomEase.create("mdLoader", LOADER_EASE);
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(counter, { v: 100, duration: 4, ease, onUpdate: () => { num.textContent = Math.round(counter.v); } }, 0)
      .to(bar, { width: "100%", duration: 4, ease }, 0);
  });
  loaded.then(() => {
    if (!pre || reduce) return;
    // Original a-71 Hide Preloader — .3s
    gsap.timeline({ onComplete: () => { pre.remove(); document.body.classList.remove("is-loading"); } })
      .to(".pre__nums", { y: 200, duration: 0.3 }, 0)
      .to([".pre__lottie", ".pre__bar"], { opacity: 0, duration: 0.3 }, 0)
      .to(pre, { opacity: 0, duration: 0.3 }, 0);
  });
  // The original locks the body for 7.8 seconds right after opening to block scrolling (4 second loader + Hero intro)
  if (!reduce && pre) {
    scrollTo(0, 0);
    lock(true);
    setTimeout(() => lock(false), 7800);
  }
  window.MDLoaded = loaded;

  // Header background and logo color — when a section enters just under the header, it takes that section’s color (.3s). On light sections (hero, benefits, demo) the logo is dark
  const nav = document.querySelector(".nav");
  const tones = { hero: ["--kf-bg", 0], demo: ["--kf-surface", 0], benefit: ["--kf-surface", 0], intro: ["--site-stage", 1], design: ["--kf-contrast-bg", 1], footer: ["--site-stage", 1] };
  let menuOpen = false;
  const setTone = (id) => {
    const t = tones[id];
    if (!t || menuOpen) return;
    nav.style.backgroundColor = css(t[0]);
    nav.classList.toggle("nav--dark", !!t[1]);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setTone(e.target.id)), { threshold: 0, rootMargin: "0px 0px -99% 0px" });
  Object.keys(tones).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });

  // Menu panel — original a-4/a-14: drops from the top over .5s outQuart, and the dot icon switches in .3s
  const menu = document.querySelector(".menu");
  const toggleMenu = (on) => {
    if (!menu) return;
    menuOpen = on;
    document.body.classList.toggle("is-menu", on);
    menu.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) {
      nav.style.backgroundColor = "transparent";
      nav.classList.add("nav--dark");
      menu.style.display = "flex";
      gsap.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: reduce ? 0 : 0.5, ease: "quart.out" });
      lock(true);
    } else {
      gsap.to(menu, { yPercent: -100, duration: reduce ? 0 : 0.5, ease: "quart.out", onComplete: () => { menu.style.display = "none"; } });
      lock(false);
      ScrollTrigger.refresh();
    }
  };
  document.querySelector("[data-menu]")?.addEventListener("click", () => toggleMenu(!menuOpen));
  menu?.querySelectorAll("[data-close]").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  // Booking plate — original a-5: from below .8s outQuart, close a-6 .5s outQuart
  const pop = document.querySelector(".pop");
  const togglePop = (on) => {
    if (!pop) return;
    if (on && menuOpen) toggleMenu(false);
    pop.setAttribute("aria-hidden", on ? "false" : "true");
    gsap.to(pop, { yPercent: on ? 0 : 100, duration: reduce ? 0 : on ? 0.8 : 0.5, ease: "quart.out" });
    document.querySelectorAll("[data-book]").forEach((b) => b.classList.toggle("is-hide", on));
    lock(on);
  };
  gsap.set(pop, { yPercent: 100 });
  document.querySelectorAll("[data-book]").forEach((b) => b.addEventListener("click", () => togglePop(true)));
  document.querySelector("[data-pop-close]")?.addEventListener("click", () => togglePop(false));
  document.querySelectorAll("form").forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));

  // Video panel
  const vid = document.querySelector(".vid");
  document.querySelectorAll("[data-video]").forEach((b) => b.addEventListener("click", () => { vid.classList.add("is-open"); lock(true); }));
  document.querySelector("[data-video-close]")?.addEventListener("click", () => { vid.classList.remove("is-open"); lock(false); });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (menuOpen) toggleMenu(false);
    if (pop?.getAttribute("aria-hidden") === "false") togglePop(false);
    if (vid?.classList.contains("is-open")) { vid.classList.remove("is-open"); lock(false); }
  });

  // Current language indicator
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".lang a").forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === here));

  // Random letter reveal — original [text-split]: each letter goes transparent 0 → 1 over .4s power2.out, .02 stagger in random order, triggered at 60% of the screen. If scrolled back up out of view, it returns to the start
  if (window.SplitType) {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const split = new SplitType(el, { types: "words, chars", tagName: "span" });
      if (reduce) return;
      const tl = gsap.timeline({ paused: true });
      gsap.set(split.chars, { opacity: 0 });
      tl.to(split.chars, { opacity: 1, duration: 0.4, ease: "power2.out", stagger: { each: 0.02, from: "random" }, delay: +(el.dataset.split || 0) });
      if (el.closest(".next")) { el._mdSplit = tl; return; }
      ScrollTrigger.create({ trigger: el, start: "top bottom", onLeaveBack: () => { tl.progress(0); tl.pause(); } });
      ScrollTrigger.create({ trigger: el, start: "top 60%", onEnter: () => tl.play() });
    });
  }

  window.MD = { lenis, lock, reduce, css };
})();
