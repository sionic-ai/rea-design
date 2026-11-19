// Home page motion — loader timetable (10·3000·4200·4500ms), pinned sections opened and closed by scrub as a blank slot in the flow passes, letter card keyframes,
// Photo wall zoom and blur, consultation card slide-in, video cover. Values are as in the original, hooked to window scroll instead of the original’s inner panel.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Like the original, skip the loader if returning within 10 minutes or arriving via back navigation
  const navEntry = performance.getEntriesByType("navigation")[0];
  const isBack = navEntry?.type === "back_forward";
  const last = +localStorage.getItem("lp-last-visit") || 0;
  const now = Date.now();
  const recentlyVisited = now - last < 10 * 60 * 1000;
  localStorage.setItem("lp-last-visit", String(now));
  const fromSub = /(about|lookbook|works|detail)\.html/.test(document.referrer);
  const skip = reduce || isBack || recentlyVisited || fromSub;

  const lenis = (window.lenis = new Lenis({
    syncTouch: true,
    lerp: 0.07,
    wheelMultiplier: 0.8,
    touchMultiplier: 1,
    touchInertiaMultiplier: 15,
    smoothWheel: !reduce,
  }));
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || !id) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: 0 });
    });
  });

  // Move the heading h1 to the end of the bottom hub — the original puts the search h1 at the footer spot
  const h1 = $(".lp-h1"), slot = $(".lp-h1-insert");
  if (h1 && slot) slot.appendChild(h1);

  function loader() {
    const splash = $(".lp-splash"), fv = $(".lp-fv");
    lenis.stop();
    const start = () => { lenis.start(); ScrollTrigger.refresh(); };
    if (skip) {
      splash.classList.add("load01", "load02");
      fv.classList.add("load03");
      splash.style.display = "none";
      const saved = +sessionStorage.getItem("lp-scroll-pos");
      if (isBack && saved) setTimeout(() => requestAnimationFrame(() => { lenis.start(); lenis.scrollTo(saved, { immediate: true }); ScrollTrigger.refresh(); }), 100);
      else start();
      return;
    }
    setTimeout(() => splash.classList.add("load01"), 10);
    setTimeout(() => splash.classList.add("load02"), 3000);
    setTimeout(() => fv.classList.add("load03"), 4200);
    setTimeout(() => lenis.start(), 4500);
    setTimeout(() => ScrollTrigger.refresh(), 1000);
  }

  // Splits characters into even and odd so they appear in two beats. Each word is grouped as one chunk so lines do not break mid-word
  function splitChars(el) {
    const parts = el.innerHTML.split(/(<br[^>]*>)/);
    el.innerHTML = parts.map((part) => {
      if (/^<br/.test(part)) return part;
      let i = 0;
      return part.split(/(\s+)/).map((w) => {
        if (!w) return "";
        if (/^\s+$/.test(w)) { i += w.length; return w; }
        const chars = [...w].map((c) => `<span class="lp-ch ${i++ % 2 === 0 ? "char-even" : "char-odd"}" style="opacity:0">${c}</span>`).join("");
        return `<span class="lp-word">${chars}</span>`;
      }).join("");
    }).join("");
  }

  function scrollScenes() {
    const st = (trigger, start, end, extra = {}) => ({ scrollTrigger: { trigger, start, end, scrub: true, ...extra } });

    gsap.from(".lp-float-ig", { ...st(".lp-kv-trigger--1", "top 100%", "bottom 0%"), autoAlpha: 0, left: "20px" });
    gsap.to(".lp-fv__img--1", { ...st(".lp-kv-trigger--1", "top 100%", "top 0%"), clipPath: "inset(0 0 100% 0)" });
    gsap.to(".lp-fv__img--6", { ...st(".lp-kv-trigger--1", "top 100%", "top 0%"), clipPath: "inset(100% 0 0 0)" });
    gsap.to(".lp-fv__img--2", { ...st(".lp-kv-trigger--2", "top 100%", "top 0%"), clipPath: "inset(0 0 100% 0)" });
    gsap.to(".lp-fv__img--7", { ...st(".lp-kv-trigger--2", "top 100%", "top 0%"), clipPath: "inset(100% 0 0 0)" });
    gsap.to(".lp-fv__wrap--1", { ...st(".lp-kv-trigger--3", "top 100%", "top 0%"), clipPath: "inset(0 0 100% 0)" });
    gsap.to(".lp-fv__wrap--2", { ...st(".lp-kv-trigger--3", "top 100%", "top 0%"), clipPath: "inset(100% 0 0 0)" });
    gsap.to(".lp-fv__copy .lp-fv__line--2", { ...st(".lp-kv-trigger--3", "top 100%", "bottom 0%"), transform: "translateY(100vh)" });
    gsap.to(".lp-fv__copy .lp-fv__line--1", { ...st(".lp-kv-trigger--3", "top 100%", "bottom 0%"), transform: "translateY(-100vh)" });

    gsap.from(".lp-float-cta", { ...st(".lp-section-message", "top 100%", "top 80%"), bottom: "-10px", autoAlpha: 0 });
    gsap.from(".lp-message__head", { ...st(".lp-section-message", "top 100%", "top 60%"), filter: "blur(8px)", autoAlpha: 0 });
    gsap.from(".lp-message__text", { ...st(".lp-section-message", "top 55%", "top 10%"), filter: "blur(8px)", autoAlpha: 0 });
    gsap.to(".lp-message", { ...st(".lp-scroll--1", "top 50%", "top 0%"), filter: "blur(4px)", autoAlpha: 0.3 });

    const cards = gsap.timeline({ scrollTrigger: { trigger: ".lp-scroll--2", start: "top 50%", end: "bottom 0%", scrub: true } });
    [".lp-card--1", ".lp-card--2", ".lp-card--3"].forEach((card) => {
      cards.to(card, {
        keyframes: [
          { duration: 1, top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg) " },
          { duration: 2, top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(0deg) " },
          { duration: 1, top: "-50%", left: "120%", transform: "translate(-50%, -50%) rotate(10deg) " },
        ],
      }, ">");
    });

    gsap.from(".lp-letter", { ...st(".lp-scroll--1", "top 80%", "top 40%"), top: "110%" });
    gsap.to(".lp-letter__img", { ...st(".lp-scroll--1", "top -20%", "top -100%"), filter: "blur(8px)" });
    gsap.from(".lp-letter-btn", { ...st(".lp-scroll--3", "top 50%", "top 40%"), autoAlpha: 0, transform: "translate(-50%, -50%)scale(0.3)" });
    gsap.to(".lp-letter", { ...st(".lp-scroll--4", "top 80%", "top 0%"), autoAlpha: 0 });

    gsap.from(".lp-proposal", { ...st(".lp-scroll--4", "top 80%", "top 0%"), top: "200%", clipPath: "inset(100% 0 0 0)", pointerEvents: "none" });
    gsap.to(".lp-proposal", { ...st(".lp-scroll--4", "top 50%", "top 0%"), transform: "translate(-50%, -50%) scale(1.2)" });

    const mm = gsap.matchMedia();
    mm.add({ narrow: "(max-width: 1024px)", wide: "(min-width: 1025px)" }, (ctx) => {
      const m = ctx.conditions.narrow ? -20 : -40;
      gsap.to(".lp-proposal__row--b", { ...st(".lp-scroll--4", "top 0%", "top -200%"), marginTop: `${m}px` });
      gsap.to(".lp-proposal__row--a", { ...st(".lp-scroll--4", "top 0%", "top -100%"), marginTop: `${-m}px` });
      gsap.to(".lp-proposal", { ...st(".lp-scroll--4", "top -100%", "top -150%"), filter: `blur(${ctx.conditions.narrow ? 24 : 64}px)` });
    });

    gsap.to(".lp-contact--1", { ...st(".lp-contact-trigger--1", "top 50%", "top 0%"), left: "49%" });
    gsap.to(".lp-contact--2", { ...st(".lp-contact-trigger--2", "top 50%", "top 0%"), left: "50%" });
    gsap.to(".lp-contact--3", { ...st(".lp-contact-trigger--3", "top 50%", "top 0%"), left: "51%" });
    gsap.to(".lp-letter-btn", { ...st(".lp-contact-trigger--1", "top 100%", "top 90%"), pointerEvents: "none" });

    ScrollTrigger.create({ trigger: ".lp-footer-trigger", start: "top 100%", end: "top 0%", toggleClass: { targets: ".lp-proposal", className: "is-off" } });
    gsap.to(".lp-letter-btn", { ...st(".lp-footer-trigger", "top 100%", "top 90%"), opacity: 0 });
    gsap.to(".lp-footer", { ...st(".lp-footer-trigger", "top 100%", "top 0%"), clipPath: "inset(0% 0% 0% 0%)" });
    gsap.to(".lp-footer", { ...st(".lp-footer-trigger", "top 0%", "top -200%"), top: "-100%" });
    gsap.to(".lp-footer", { ...st(".lp-footer-trigger", "top 150%", "top 130%"), display: "block" });

    const msg = $(".lp-proposal-message");
    splitChars(msg);
    mm.add({ sp: "(max-width: 767px)", pc: "(min-width: 768px)" }, (ctx) => {
      const sp = ctx.conditions.sp;
      gsap.to(".lp-proposal-message .char-even", { ...st(".lp-proposal-trigger", sp ? "top 100%" : "top 80%", sp ? "top 50%" : "top 60%"), autoAlpha: 1 });
      gsap.to(".lp-proposal-message .char-odd", { ...st(".lp-proposal-trigger", sp ? "top 75%" : "top 90%", sp ? "top 50%" : "top 70%"), autoAlpha: 1 });
    });
    gsap.to(msg, { ...st(".lp-proposal-trigger", "top 0%", "top -130%"), autoAlpha: 0 });
  }

  // Original waits 10ms after the press, then changes the address (the cover layer is display:none so it isn’t visible)
  document.querySelectorAll(".lp-nav").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      setTimeout(() => { location.href = href; }, 10);
    });
  });
  addEventListener("pagehide", () => sessionStorage.setItem("lp-scroll-pos", String(Math.round(lenis.scroll))));

  const init = () => { loader(); scrollScenes(); };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", init);
  else init();
})();
