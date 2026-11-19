// Used by every page — number loader → curtain walk · inertial scroll · black header-line plate · switch on when entering · notice modal · about plate · category filtering
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const wipe = document.querySelector('[data-fx~="quad-wipe-page"]');
  const loader = document.querySelector(".ot-loader");
  const head = document.querySelector(".ot-head");
  const ready = () => document.dispatchEvent(new CustomEvent("ot:ready"));

  // Inertial scroll — the same follow-through as the original Scroll.sliding (speed .1, friction .1), done with lenis lerp .1
  let lenis = null;
  if (!reduce && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  window.otLenis = lenis;

  // Number loader — a two-digit number counts 00 → 99 (1.2s), the number recedes and vanishes, then the curtain lifts upward.
  // The curtain part (fx-core) attaches after DOMContentLoaded, so start on the frame after that
  const start = () => {
    const finish = () => {
      if (loader) loader.classList.add("is-gone");
      if (wipe && wipe.fxReveal && !reduce) {
        wipe.fxCover && wipe.classList.add("is-fx-on");
        wipe.fxReveal("top");
        setTimeout(ready, 120);
      } else ready();
    };
    if (loader && !reduce && !sessionStorage.getItem("ot-loaded")) {
      sessionStorage.setItem("ot-loaded", "1");
      const d = [...loader.querySelectorAll("[data-ot-digit]")];
      requestAnimationFrame(() => loader.classList.add("is-drawn"));
      const t0 = performance.now(), dur = 2400;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), n = Math.floor(99 * p * p * (3 - 2 * p));
        d[0].textContent = String(Math.floor(n / 10)); d[1].textContent = String(n % 10);
        if (p < 1) requestAnimationFrame(step);
        else { loader.classList.add("is-end"); setTimeout(finish, 600); }
      };
      requestAnimationFrame(step);
    } else {
      if (loader) loader.classList.add("is-gone");
      if (wipe && wipe.fxReveal && !reduce) { wipe.fxReveal("top"); setTimeout(ready, 120); } else ready();
    }

  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start));
  else setTimeout(start);

  // Header line — past the first screen (100vh), a black plate comes down and settles at .6s
  const foot = document.querySelector(".ot-foot");
  const paint = () => { if (head) head.classList.toggle("is-solid", scrollY > innerHeight * 0.6); if (foot) foot.classList.toggle("is-hidden", scrollY > 40); };
  addEventListener("scroll", paint, { passive: true });
  paint();

  // Turn on when entering — original stageIn: .is-in when above 15% from the screen bottom, removed when leaving back down
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("is-in");
    else if (e.boundingClientRect.top > 0) e.target.classList.remove("is-in");
  }), { rootMargin: "0px 0px -15% 0px" });
  const watch = () => document.querySelectorAll("[data-ot-in]").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));
  document.addEventListener("ot:ready", watch, { once: true });

  // Notice modal — shows once when the loader finishes
  const modal = document.querySelector(".ot-modal");
  if (modal) {
    const close = () => { modal.classList.remove("is-open"); lenis && lenis.start(); };
    modal.querySelectorAll("[data-ot-modal-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    if (document.body.contains(modal) && modal.dataset.otAuto !== "off") document.addEventListener("ot:ready", () => { modal.classList.add("is-open"); lenis && lenis.stop(); }, { once: true });
  }

  // About panel (ABOUT US) — the veil covers from the right then lifts to the left with the panel left open (original transitionIn/Out right)
  const about = document.querySelector(".ot-about");
  if (about) {
    const open = (on) => {
      const swap = () => { about.classList.toggle("is-open", on); about.setAttribute("aria-hidden", on ? "false" : "true"); if (on) { about.scrollTop = 0; lenis && lenis.stop(); } else lenis && lenis.start(); };
      if (wipe && wipe.fxCover && !reduce) wipe.fxCover(on ? "right" : "left", () => { swap(); wipe.fxReveal(on ? "right" : "left"); });
      else swap();
    };
    document.querySelectorAll("[data-ot-about]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); open(true); }));
    about.querySelectorAll("[data-ot-about-close]").forEach((b) => b.addEventListener("click", () => open(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && about.classList.contains("is-open")) open(false); });
  }
  // Category filter — the pressed category gets a red underline, and only that category’s cards show (the original changes data-sort per category and redraws the same list)
  document.querySelectorAll("[data-ot-sort]").forEach((ul) => {
    const btns = [...ul.querySelectorAll("button")];
    const cards = [...document.querySelectorAll("[data-ot-cat]")];
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach((x) => (x === b ? x.setAttribute("aria-current", "true") : x.removeAttribute("aria-current")));
      cards.forEach((c) => { c.hidden = i !== 0 && c.dataset.otCat !== String(i); });
    }));
  });
  root.classList.add("ot-js");
})();
