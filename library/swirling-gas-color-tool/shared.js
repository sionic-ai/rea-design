// All pages — Lenis 1.2 (lerp .22) · first-visit loader · [data-arrive] entrance · dark panel swap · consent card · page wipe · text entrance · footer wordmark width fit
(() => {
  const D = document, H = D.documentElement;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);
  const E = {
    entrance: CustomEase.create("a-entrance", "0.16,1,0.3,1"),
    overlay: CustomEase.create("a-overlay", "0.19,1,0.22,1"),
    fold: CustomEase.create("a-fold", "0.625,0.05,0,1"),
    exit: CustomEase.create("a-exit", "0.4,0,1,1"),
    progress: CustomEase.create("a-progress", "0.33,1,0.68,1"),
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bus = {};
  const site = (window.aSite = { E, reduce, on: (n, f) => (bus[n] = bus[n] || []).push(f), emit: (n) => (bus[n] || []).forEach((f) => f()), lenis: null });

  // ───── Scroll ─────
  if (!reduce && matchMedia("(hover: hover)").matches) {
    const lenis = (site.lenis = new Lenis({ lerp: 0.22 }));
    gsap.ticker.add((t) => lenis.raf(t * 1000), false, true);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }

  // ───── Dark panel ─────
  D.querySelectorAll(".a-switch").forEach((b) => b.addEventListener("click", () => {
    const next = H.dataset.theme === "dark" ? "light" : "dark";
    H.dataset.theme = next;
    b.setAttribute("aria-label", next === "dark" ? "To the light version" : "To the dark board");
    try { localStorage.setItem("a-theme", next); } catch (e) { /* Even if saving fails, this round still changes */ }
  }));

  // ───── Consent card — like the original, it enters .4s after the first interaction (16px below→0, blur 6px→0, transparent→1, glass border, .24s entrance) ─────
  const consent = D.querySelector(".a-consent");
  const turn = (on, ease) => {
    const parts = consent.querySelectorAll(".a-consent__text, .a-btn");
    consent.classList.remove("is-aside");
    const tl = gsap.timeline({ onComplete: () => { if (!on) consent.classList.add("is-gone"); else gsap.set([consent, ...parts], { clearProps: "transform,opacity,filter,--consent-glass" }); } });
    if (on) H.style.setProperty("--consent-foot", `${Math.round(consent.offsetHeight + 16)}px`); else H.style.removeProperty("--consent-foot");
    tl.fromTo(consent, { y: on ? 16 : 0, "--consent-glass": on ? 0 : 1 }, { y: on ? 0 : 16, "--consent-glass": on ? 1 : 0, duration: 0.24, ease }, 0)
      .fromTo(parts, { opacity: on ? 0 : 1, filter: on ? "blur(6px)" : "blur(0px)" }, { opacity: on ? 1 : 0, filter: on ? "blur(0px)" : "blur(6px)", duration: 0.24, ease }, 0);
    return tl;
  };
  if (consent) {
    if (sessionStorage.getItem("a-consent")) consent.classList.add("is-gone");
    else {
      consent.classList.add("is-aside");
      const first = () => { ["pointerdown", "wheel", "keydown", "touchstart"].forEach((t) => removeEventListener(t, first, true)); gsap.delayedCall(0.4, () => consent.classList.contains("is-aside") && turn(true, E.entrance)); };
      ["pointerdown", "wheel", "keydown", "touchstart"].forEach((t) => addEventListener(t, first, { capture: true, passive: true }));
    }
    consent.querySelectorAll("[data-consent]").forEach((b) => b.addEventListener("click", () => { sessionStorage.setItem("a-consent", "1"); turn(false, E.exit); }));
    D.querySelectorAll("[data-consent-open]").forEach((b) => b.addEventListener("click", () => {
      consent.classList.remove("is-gone");
      if (!reduce) turn(true, E.entrance);
      // The terms line on the hero yields to the consent card — as in the original, it lets go at .2s (text roll reverts) and disappears starting at .17s over .24s
      const legal = b.closest(".a-land__legal");
      if (legal) {
        gsap.to(legal, { opacity: 0, duration: 0.18, ease: E.exit, delay: 0.05 });
        gsap.delayedCall(0.14, () => legal.classList.add("is-off"));
      }
    }));
  }

  // ───── Text entrance ─────
  const reveal = () => {
    if (reduce) return;
    D.querySelectorAll("[data-reveal]").forEach((el) => gsap.from(el, { opacity: 0, y: 16, duration: 0.62, ease: E.entrance, scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
    D.querySelectorAll("[data-sec-head]").forEach((el) => {
      const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "a-line" });
      gsap.from(s.lines, { yPercent: 105, duration: 0.8, stagger: 0.05, ease: E.entrance, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    D.querySelectorAll("[data-cascade]").forEach((el) => gsap.from(el.children, { opacity: 0, y: 24, duration: 0.8, stagger: 0.05, ease: E.entrance, scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
  };
  // Fit the Footer wordmark to the full screen width
  const fit = () => D.querySelectorAll("[data-fit]").forEach((el) => {
    el.style.fontSize = "100px";
    const w = el.parentElement.clientWidth;
    el.style.fontSize = `${(100 * w) / el.scrollWidth}px`;
  });
  addEventListener("resize", fit);

  // ───── Entering — rises from the center and both end spots with a .8s entrance ─────
  const arrive = () => {
    H.classList.add("a-ready");
    const els = [...D.querySelectorAll("[data-arrive]")];
    // Pre-drawn document pages (how it works) stay put, like the original
    if (reduce || D.body.dataset.page === "about") {
      // How it works: in the original, background and text stand first, then around .45s the header line, first heading and photo plate stand all at once (data-arrive·data-plate-arrive)
      const plate = D.querySelector("[data-plate]");
      if (reduce) gsap.set(els, { opacity: 1 });
      else { gsap.set([...els, plate], { opacity: 0 }); gsap.delayedCall(0.44, () => gsap.set([...els, plate], { opacity: 1 })); }
      return site.emit("arrive");
    }
    gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: E.entrance, clearProps: "transform" });
    site.emit("arrive");
  };

  // ───── First-visit loader: the wordmark rises in .8s, the number .18s later, the progress line fills from .4s counting a little over 1s, and the curtain lifts in .62s ─────
  const loader = D.querySelector(".a-loader");
  const runLoader = () => new Promise((res) => {
    // The original loader appears only on app screens (Hero, Create) — pre-rendered document pages (How it works) stand immediately
    if (!loader || reduce || D.body.dataset.page === "about" || sessionStorage.getItem("a-loaded")) { loader?.remove(); return res(); }
    sessionStorage.setItem("a-loaded", "1");
    const logo = loader.querySelector(".a-loader__logo > *"), num = loader.querySelector(".a-loader__num > *"), fill = loader.querySelector(".a-loader__fill");
    const n = { v: 0 };
    gsap.set([logo, num], { y: 0, yPercent: 105, visibility: "visible" });
    gsap.timeline({ delay: 0.24, onComplete: () => { loader.remove(); res(); } })
      .to(logo, { yPercent: 0, duration: 0.8, ease: E.entrance }, 0)
      .to(num, { yPercent: 0, duration: 0.8, ease: E.entrance }, 0.18)
      .to(n, { v: 100, duration: 0.9, ease: E.progress, onUpdate: () => { num.textContent = Math.round(n.v); gsap.set(fill, { scaleX: n.v / 100 }); } }, 0.4)
      .to([logo, num], { yPercent: -105, duration: 0.62, ease: E.overlay }, 1.35)
      .to(loader, { opacity: 0, duration: 0.62, ease: E.overlay }, 1.45);
  });

  // Page wipe — a background-color panel covers from below with a .5s fold, and lifts upward in .62s on the new page
  const wipe = D.querySelector(".a-wipe"), win = D.querySelector(".a-window");
  D.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return;
    e.preventDefault();
    sessionStorage.setItem("a-arrive", "1");
    if (reduce) return void (location.href = href);
    // Original: old window y -10vh · 1.2x · veil .2 folds over 1.2s — the copy must open the document anew, so it hands off after about .35s, and the back veil covers the rest while the new window grows
    gsap.to(win, { y: "-10vh", scale: 1.2, duration: 1.2, ease: E.fold, delay: 0.5 });
    gsap.to(wipe, { opacity: 0.2, duration: 1.2, ease: E.fold, delay: 0.5 });
    gsap.delayedCall(0.95, () => (location.href = href));
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  const arrived = H.classList.contains("a-arrive");
  sessionStorage.removeItem("a-arrive");
  // The loader doesn’t wait for fonts (the original font comes straight from the same place, while the copy uses Google Fonts, so waiting would cost about 1s per connection) — only line breaking and width fitting come after fonts
  D.fonts.ready.then(() => { fit(); reveal(); ScrollTrigger.refresh(); });
  const start = async () => {
    if (arrived) {
      loader?.remove();
      // New window: from 50% bottom center into a rounded card — y 1s · clip 1.2s fold, entering at .2
      gsap.timeline({ onComplete: () => { H.classList.remove("a-arrive"); gsap.set(win, { clearProps: "transform,clipPath" }); } })
        .fromTo(win, { y: () => innerHeight * 0.5 }, { y: 0, duration: 0.55, ease: E.fold }, 0)
        .fromTo(win, { clipPath: "inset(50% 50% 50% 50% round 20px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.62, ease: E.fold }, 0);
    } else await runLoader();
    arrive();
    ScrollTrigger.refresh();
  };
  D.readyState === "loading" ? D.addEventListener("DOMContentLoaded", start) : start();
})();
