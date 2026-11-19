/* Site frame — loading (progress bar, wordmark, piece logo) → hero, header row that shows and hides with scroll, orange menu panel, text blocks appearing, 
   Photo parallax, flowing photo strip. Values read from the original (_app·index chunk) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  gsap.registerPlugin(ScrollTrigger);

  /* Loading — the bar floats up from the 88% position, the piece logo and wordmark letters (.035s stagger) stand up, then the bar fills to .5 in 2s and to 1 in .2s (cubic.out). 
     When the logo clears, the Hero bursts open and the headline letters rise up */
  function loading() {
    const bar = document.querySelector("[data-progress]");
    const fill = bar?.querySelector("span");
    const over = document.querySelector("[data-over]");
    const loader = document.querySelector("[data-loader]");
    const marks = loader ? loader.querySelectorAll(".ps-loader__mark span, .ps-loader__sub span") : [];
    const done = () => {
      body.classList.remove("is-lock");
      document.querySelector("[data-indicator]")?.classList.add("is-shown");
      window.dispatchEvent(new Event("ps:fv"));
    };
    if (reduce) {
      over?.remove(); bar?.remove(); loader?.remove();
      window.PsMV?.showFv();
      done();
      return;
    }
    const st = { ratio: 0 };
    const setRatio = (r, d) => gsap.to(st, { ratio: r, duration: d, ease: "cubic.out", overwrite: true, onUpdate: () => { if (fill) fill.style.width = `${st.ratio * 100}%`; } });
    const tl = gsap.timeline();
    tl.to(over, { opacity: 0, duration: 0.5, ease: "sine.out" });
    tl.to(bar, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, 0);
    tl.add(() => window.PsMV?.showLogo(), 0.1);
    tl.to(marks, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.035 }, 0.1);
    tl.add(() => setRatio(0.5, 2), 0.6);
    tl.add(() => setRatio(1, 0.2), 2.6);
    tl.to(marks, { y: -15, opacity: 0, duration: 0.8, ease: "expo.inOut" }, 3);
    tl.to(bar, { y: 20, opacity: 0, duration: 0.8, ease: "expo.inOut" }, 3);
    tl.set([bar, loader], { display: "none" }, 3.8);
    tl.add(() => { window.PsMV?.showFv(); done(); }, 3.4);
  }

  /* Header bar — comes down after scrolling past 100px, hides at the very top and near the logo at the bottom */
  function header() {
    const head = document.querySelector("[data-head]");
    const foot = document.getElementById("footer-logo");
    if (!head) return;
    const sp = matchMedia("(max-width: 959px)");
    gsap.set(head, sp.matches ? { y: 140, yPercent: 0, opacity: 0 } : { y: 0, yPercent: -100, opacity: 1 });
    let shown = false, open = false;
    const set = (v) => {
      if (v === shown) return;
      shown = v;
      // On wide screens it comes down from the top, and on phones the floating button row at the bottom comes up from 140px below
      const vars = sp.matches ? { y: v ? 0 : 140, yPercent: 0, opacity: v ? 1 : 0 } : { y: 0, yPercent: v ? 0 : -100, opacity: 1 };
      gsap.to(head, { ...vars, duration: v ? 0.8 : 0.5, ease: v ? "expo.out" : "expo.in", overwrite: true });
    };
    const check = () => {
      if (open) return set(true);
      const limit = foot ? foot.getBoundingClientRect().top + scrollY - innerHeight : Infinity;
      set(scrollY > 100 && scrollY < limit);
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("ps:menu", (e) => { open = e.detail; check(); });
    check();
  }

  /* Menu panel — the orange panel turns on and items rise from 20px below in sequence */
  function menu() {
    const burger = document.querySelector("[data-burger]");
    const nav = document.querySelector("[data-nav]");
    if (!burger || !nav) return;
    const items = nav.querySelectorAll("[data-nav-item]");
    let open = false;
    const set = (v) => {
      open = v;
      body.classList.toggle("is-nav", v);
      burger.setAttribute("aria-expanded", v ? "true" : "false");
      dispatchEvent(new CustomEvent("ps:menu", { detail: v }));
      if (v) {
        gsap.set(nav, { display: "block" });
        gsap.to(nav, { opacity: 1, duration: 0.5, ease: "sine.out", overwrite: true });
        gsap.fromTo(items, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.035, delay: 0.1, overwrite: true });
      } else {
        gsap.to(nav, { opacity: 0, duration: 0.4, ease: "sine.in", overwrite: true, onComplete: () => gsap.set(nav, { display: "none" }) });
      }
    };
    burger.addEventListener("click", (e) => { e.preventDefault(); set(!open); });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); });
  }

  /* Text block — when it enters the screen it gets shown and css raises it from 80px below, tilted 2°, in 1.5s */
  function fades() {
    const els = document.querySelectorAll("[data-fade]");
    if (reduce) { els.forEach((el) => el.classList.add("is-shown")); return; }
    const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-shown"); io.unobserve(en.target); } }), { rootMargin: "0px" });
    els.forEach((el) => io.observe(el));
  }

  /* Photo parallax — the photo inside the frame is tied to scroll and pushed upward */
  function parallax() {
    if (reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        gsap.fromTo(el, { yPercent: 0 }, { yPercent: -25, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }

  /* Photo strip — each frame drifts by .00025 plus a bonus, and once visible, scrolling adds .0002 to the bonus (max .003), which then decays by a factor of .96 */
  function photos() {
    const el = document.querySelector("[data-photos]");
    if (!el || reduce) return;
    let extra = 0, pos = 0, raf = 0, live = false, armed = false;
    const loop = () => {
      if (!live) { raf = 0; return; }
      extra *= 0.96;
      pos += 0.00025 + extra;
      el.style.setProperty("--ps-scroll-pos", (pos % 1).toFixed(5));
      raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver((list) => list.forEach((en) => {
      live = en.isIntersecting;
      if (live) { armed = true; if (!raf) raf = requestAnimationFrame(loop); }
    }), { rootMargin: "0px 0px 100px 0px", threshold: 0 }).observe(el);
    addEventListener("scroll", () => { if (armed) extra = Math.min(0.003, extra + 0.0002); }, { passive: true });
  }

  /* Logo mark — cluster of fragments. On the menu panel (orange) the fragments are white */
  function marks() {
    if (!window.PsPieces) return;
    const probe = (name) => { const i = document.createElement("i"); i.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`; body.append(i); const c = getComputedStyle(i).color; i.remove(); return c; };
    const a = probe("--kf-accent"), b = probe("--site-accent-2"), w = probe("--kf-on-accent");
    const draw = () => document.querySelectorAll("[data-mark]").forEach((cv) => {
      if (!cv.getBoundingClientRect().width) return;
      const light = cv.classList.contains("is-light");
      PsPieces.cluster(cv, light ? w : a, light ? w : b);
    });
    draw();
    addEventListener("resize", draw);
    addEventListener("ps:menu", () => requestAnimationFrame(draw));
  }

  /* On the orange section, header buttons turn into white panels (original lightColor) — wide screens read at header height, phones at the bottom button row height */
  function lightHead() {
    const head = document.querySelector("[data-head]");
    if (!head) return;
    const mm = gsap.matchMedia();
    const make = (line) => () => {
      document.querySelectorAll("[data-dark]").forEach((sec) => {
        ScrollTrigger.create({ trigger: sec, start: `top ${line}`, end: `bottom ${line}`, toggleClass: { targets: head, className: "is-light" } });
      });
    };
    mm.add("(min-width: 960px)", make("top+=65"));
    mm.add("(max-width: 959px)", make("bottom-=70"));
  }

  function boot() {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    marks();
    loading();
    header();
    lightHead();
    menu();
    fades();
    parallax();
    photos();
    document.querySelector("[data-indicator]")?.addEventListener("click", (e) => {
      e.preventDefault();
      const t = document.getElementById("message");
      if (t) scrollTo({ top: t.getBoundingClientRect().top + scrollY, behavior: "smooth" });
    });
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
})();
