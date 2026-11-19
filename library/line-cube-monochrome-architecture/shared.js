// Shared by the whole set — loader (three words slide in · number on the 4s preloader curve), lenis, header line attached from under the wordmark to the top, menu letter cloud·
// Text rise (word y 20 · 3° → 1.6s Out · .03s stagger) · color flip · cookie. Original curves Out .25,1,.5,1 · In .5,0,.75,0 · InOut .215,.61,.355,1
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("Out", "0.25,1,0.5,1");
  CustomEase.create("In", "0.5,0,0.75,0");
  CustomEase.create("InOut", "0.215,0.61,0.355,1");
  CustomEase.create("easeOutQuint", "0.22,1,0.36,1");
  CustomEase.create("Snap", "0.25,0,0.35,1");
  CustomEase.create("preloader", "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SA = (window.SA = Object.assign(window.SA || {}, { reduce }));
  SA.pages = SA.pages || {};
  const q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.toggle("reduce", reduce);
  history.scrollRestoration = "manual";

  // Resolves the skin color to paint on canvas into the actual color
  const probe = document.createElement("i");
  probe.style.display = "none";
  SA.color = (v, el) => { (el || document.body).append(probe); probe.style.color = `var(${v})`; const c = getComputedStyle(probe).color; probe.remove(); return c; };

  // Word rise (original stage text: opacity 0 · y 20 · rotate 3 → 1.6s Out, .03s stagger, .2s delay) · hide .25s Out
  SA.words = (el) => el._sp || (el._sp = new SplitText(el, { type: "words", wordsClass: "sw" }));
  SA.show = (els, delay = 0.2) => {
    const list = gsap.utils.toArray(els);
    list.forEach((el) => (el.style.visibility = "visible"));
    const w = list.flatMap((el) => SA.words(el).words);
    gsap.set(list, { opacity: 1 });
    return gsap.fromTo(w, { opacity: 0, y: 20, rotate: 3 }, { opacity: 1, y: 0, rotate: 0, duration: 1.6, stagger: 0.03, ease: "Out", delay, overwrite: true });
  };
  SA.hide = (els) => gsap.to(gsap.utils.toArray(els), { opacity: 0, duration: 0.25, ease: "Out", overwrite: true });
  const reveal = () => {
    if (reduce) return qa("[data-reveal]").forEach((e) => (e.style.visibility = "visible"));
    qa("[data-reveal]").forEach((el) => {
      if (el.closest("[data-pinned]")) return;
      SA.words(el); gsap.set(SA.words(el).words, { opacity: 0, y: 20, rotate: 3 }); el.style.visibility = "visible";
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => SA.show(el) });
    });
  };

  // lenis
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  SA.lenis = lenis;

  // Header row — starts on the line below the wordmark, then sticks to the top once scrolled that far
  const nav = () => {
    const n = q(".nav"), mark = q(".wordmark");
    if (!n || !mark) return;
    const top = () => mark.offsetTop + mark.offsetHeight + parseFloat(getComputedStyle(mark).marginBottom || 0);
    const set = () => gsap.set(n, { y: Math.max(0, top() - (lenis ? lenis.scroll : scrollY)) });
    set();
    (lenis ? lenis.on("scroll", set) : addEventListener("scroll", set, { passive: true }));
    addEventListener("resize", set);
    // Current section’s menu underline — drawn with .5s Out when entering the section
    qa(".nav-link").forEach((a) => {
      const sec = q(a.getAttribute("href")), bar = q(".bar", a);
      if (!sec || !bar) return;
      ScrollTrigger.create({ trigger: sec, start: "top 10%", end: "bottom 10%", onToggle: (s) => gsap.to(bar, { scaleX: s.isActive ? 1 : 0, duration: 0.5, ease: "Out" }) });
      a.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(sec, { duration: 1.6 }) : sec.scrollIntoView(); });
    });
  };
  // Phone menu
  const menu = () => {
    const b = q(".menu-button"), m = q(".m-menu");
    if (!b || !m) return;
    let open = false;
    const set = (o) => { open = o; b.setAttribute("aria-expanded", o); if (o) { gsap.set(m, { display: "block" }); gsap.fromTo(m, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "InOut" }); gsap.fromTo(qa("a", m), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "Out", delay: 0.2 }); lenis?.stop(); } else { gsap.to(m, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.5, ease: "In", onComplete: () => gsap.set(m, { display: "none" }) }); lenis?.start(); } };
    b.addEventListener("click", () => set(!open));
    qa("a", m).forEach((a) => a.addEventListener("click", () => set(false)));
  };
  // Color invert · cookie
  const invert = () => {
    const b = q("[data-invert]");
    if (!b) return;
    const orbit = q("[data-orbit]", b);
    // While the dot rotates, lock it against being pressed again (original transitionstart → disabled, transitionend → released)
    orbit?.addEventListener("transitionstart", () => (b.disabled = true));
    orbit?.addEventListener("transitionend", () => (b.disabled = false));
    b.addEventListener("click", () => { if (b.disabled) return; document.documentElement.classList.toggle("is-inverted"); dispatchEvent(new Event("sa:invert")); });
  };
  const cookies = () => {
    const c = q("[data-cookies]");
    if (!c) return;
    let seen = null;
    try { seen = localStorage.getItem("sa-cookies"); } catch (e) {}
    if (seen) return c.remove();
    qa("button", c).forEach((b) => b.addEventListener("click", () => { try { localStorage.setItem("sa-cookies", b.dataset.v); } catch (e) {} c.style.pointerEvents = "none"; gsap.to(c, { y: 12, opacity: 0, duration: 0.3, ease: "Out", onComplete: () => c.remove() }); }));
  };

  // Loader — the curtain stands at .4s, the number goes 00→100 over 4s (preloader curve), and three words enter from the right at .1s intervals over 1.2s Out, then leave to the left with In
  const loader = (done) => {
    const ld = q("[data-loader]");
    if (!ld || reduce) { if (ld) ld.hidden = true; return done(); }
    lenis?.stop();
    const words = qa(".ld-words .w", ld), num = q("[data-count]", ld), bar = q(".ld-bar", ld), cap = q(".ld-cap", ld), val = { v: 0 };
    gsap.set(words, { xPercent: 110 });
    gsap.timeline({ onComplete: () => { ld.hidden = true; lenis?.start(); done(); } })
      .fromTo(ld, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "Out" })
      .to(val, { v: 100, ease: "preloader", duration: 4, roundProps: "v", onUpdate: () => { num.textContent = String(val.v).padStart(2, "0"); gsap.set(bar, { scaleX: val.v / 100 }); } })
      .to([...words].reverse(), { xPercent: 0, delay: 0.2, stagger: 0.1, duration: 1.2, ease: "Out" }, "<")
      .to([...words].reverse(), { ease: "In", duration: 1.2, xPercent: -110, stagger: 0.1 }, ">")
      .to(cap, { opacity: 0, duration: 1.2, ease: "In" }, "<")
      .to(ld, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "InOut" }, ">-0.4");
  };

  const start = () => {
    nav(); menu(); invert(); cookies();
    const page = q("main");
    const off = SA.pages[page?.dataset.page]?.(page);
    let visited = null;
    try { visited = sessionStorage.getItem("sa-visited"); } catch (e) {}
    if (/[?&]loader=1/.test(location.search)) visited = null;
    const go = () => { try { sessionStorage.setItem("sa-visited", "1"); } catch (e) {} reveal(); SA.afterLoad?.(); ScrollTrigger.refresh(); };
    visited || /[?&]loader=0/.test(location.search) ? ((q("[data-loader]") || {}).hidden = true, go()) : loader(go);
    return off;
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
