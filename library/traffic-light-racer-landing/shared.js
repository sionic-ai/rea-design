// Page-wide motion — smooth scroll, line·word appearance, rolling-swap buttons, yellow panel menu, pill cursor that follows, slowly trailing vertical line, growing background text, odometer
(() => {
  const NH = (window.NH = window.NH || {});
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  NH.reduce = reduce;
  NH.fine = fine;
  if (reduce) root.classList.add("nh-noanim");

  const lenis = reduce ? null : new Lenis({ autoRaf: false });
  NH.lenis = lenis;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const locks = new Set();
  NH.lock = (k) => { locks.add(k); lenis ? lenis.stop() : root.classList.add("nh-lock"); };
  NH.unlock = (k) => { locks.delete(k); if (locks.size) return; lenis ? lenis.start() : root.classList.remove("nh-lock"); };

  // Odometer — a 0 to 9 strip is stood at each digit and rolled to fit (original initNumberOdometer)
  NH.odometer = (el, to, { duration = 2, ease = "expo.out" } = {}) => {
    const digits = String(to).split("");
    el.textContent = "";
    el.setAttribute("aria-label", String(to));
    const rolls = digits.map((d, i) => {
      const mask = document.createElement("span");
      mask.className = "nh-odo";
      const roll = document.createElement("span");
      roll.className = "nh-odo__roll";
      const loops = 1 + (digits.length - 1 - i);
      for (let k = 0; k <= 10 * loops + +d; k++) { const s = document.createElement("span"); s.textContent = k % 10; roll.append(s); }
      mask.append(roll);
      el.append(mask);
      return { roll, steps: 10 * loops + +d };
    });
    const tl = gsap.timeline();
    rolls.forEach(({ roll, steps }) => tl.fromTo(roll, { yPercent: 0 }, { yPercent: -(steps / (steps + 1)) * 100, duration, ease }, 0));
    if (reduce) tl.progress(1);
    return tl;
  };

  // Line·word entrance — from 110px below over .6s expo.out, .04s between lines·.06s between words, at the 85% line. Scrolling back up hides them again so they rise next time
  function reveal(scope) {
    scope.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.dataset.revDone) return;
      el.dataset.revDone = "1";
      const kind = el.dataset.reveal;
      const start = el.dataset.revealStart || "top 85%";
      if (reduce) { gsap.set(el, { visibility: "visible" }); return; }
      if (kind === "fade") {
        gsap.set(el, { visibility: "visible" });
        gsap.fromTo(el, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: el, start, toggleActions: "play none none reverse" } });
        return;
      }
      const s = SplitText.create(el, { type: kind === "words" ? "words" : "lines", mask: kind === "words" ? "words" : "lines" });
      const parts = kind === "words" ? s.words : s.lines;
      gsap.set(el, { visibility: "visible" });
      gsap.set(parts, { y: 110 });
      ScrollTrigger.create({
        trigger: el, start,
        onEnter: () => gsap.to(parts, { y: 0, duration: 0.6, ease: "expo.out", stagger: kind === "words" ? 0.06 : 0.04, overwrite: true }),
        onLeaveBack: () => gsap.set(parts, { y: 110, overwrite: true }),
      });
    });
  }
  NH.reveal = reveal;

  // Button text splitting — both lines share the same sequence numbers
  document.querySelectorAll("[data-btn-roll]").forEach((b) => {
    b.querySelectorAll(".nh-btn__t").forEach((t) => {
      const txt = t.textContent;
      t.textContent = "";
      [...txt].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.style.setProperty("--c", i);
        s.textContent = ch === " " ? " " : ch;
        t.append(s);
      });
      t.closest(".nh-btn__row").querySelector(".nh-btn__ico")?.style.setProperty("--c", txt.length);
    });
  });

  // Menu — can’t be pressed again within .3s of opening (original LOCK_DURATION)
  const nav = document.querySelector(".nh-nav");
  const toggle = document.querySelector("[data-nav-toggle]");
  let navLock = false;
  const setNav = (open) => {
    nav.dataset.navStatus = open ? "active" : "not-active";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    open ? NH.lock("nav") : NH.unlock("nav");
  };
  toggle?.addEventListener("click", () => {
    if (navLock) return;
    navLock = true;
    setTimeout(() => (navLock = false), 300);
    setNav(nav.dataset.navStatus !== "active");
  });
  nav?.querySelectorAll(".nh-nav__link").forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").split("#")[1];
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    setNav(false);
    setTimeout(() => (lenis ? lenis.scrollTo(t, { duration: 1.4 }) : t.scrollIntoView()), 350);
  }));
  addEventListener("keydown", (e) => e.key === "Escape" && nav?.dataset.navStatus === "active" && setNav(false));

  // Following pill cursor — enabled only in drag and sound areas
  const cur = document.querySelector(".nh-cursor");
  if (cur && fine && !reduce) {
    const label = cur.querySelector(".nh-cursor__t");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.4, ease: "power3.out" });
    let mx = 0, my = 0;
    const check = () => {
      const el = document.elementFromPoint(mx, my);
      const area = el && el.closest("[data-cursor-label], [data-sound-area]");
      if (area) {
        const t = area.hasAttribute("data-sound-area") ? (area.dataset.muted === "false" ? "Sound off" : "Sound on") : area.dataset.cursorLabel;
        if (label.textContent !== t) label.textContent = t;
      }
      cur.classList.toggle("is-on", !!area);
    };
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; xTo(mx); yTo(my); check(); }, { passive: true });
    lenis ? lenis.on("scroll", check) : addEventListener("scroll", check, { passive: true });
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Vertical lines — each line trails behind the scroll with a lag between 1.75 and 5 (original initLineScroll)
    document.querySelectorAll(".nh-lines:not(.nh-lines--hero)").forEach((w) => {
      [...w.children].forEach((ln) => {
        const lag = gsap.utils.random(1.75, 5);
        gsap.fromTo(ln, { yPercent: -lag * 4 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: w.parentElement, start: "top bottom", end: "bottom bottom", scrub: lag } });
      });
    });
  });
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    // Giant background letters — grow from .2× to 1× and, while passing, are pushed up 80% (original initSvgScroll)
    document.querySelectorAll("[data-bg-text]").forEach((w) => {
      const sec = w.closest("section");
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } })
        .fromTo(w, { scale: 0.2 }, { scale: 1, ease: "none", duration: 0.5 })
        .to(w, { yPercent: -80, ease: "none", duration: 0.5 });
    });
    // Parallax — data-parallax goes from -10% to 10%
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      gsap.fromTo(el, { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  reveal(document);
  root.classList.add("nh-ready");
})();
