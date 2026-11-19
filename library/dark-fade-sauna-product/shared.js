// Motion shared by all sections: Lenis (1.1s exponential curve, own rAF), text splitting (stand-up stagger delay), button text in two copies (rolling),
// Phone full menu, adding inview when visible, reporting light/dark per section and footer visibility (ScrollMagic — same tool as the original), three photo parallaxes.
// First-page loading is handled by index.js, and sections without loading lift the curtain after .5s.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => matchMedia("(max-width: 900px)").matches;
  const ku = (window.ku = { reduce, isMobile, lenis: null });
  // Call this after the first paint — the original script runs around first paint, but in this copy the first paint is delayed by the font @import in theme.css,
  // Counting from the script’s start time makes loading and the curtain lift end that much too early
  ku.afterPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  if (!reduce) {
    const lenis = new Lenis({
      duration: 1.1,
      smoothTouch: false,
      smoothWheel: true,
      touchMultiplier: 2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      easing: (t) => 1 - Math.pow(2, -10 * t),
    });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
    ku.lenis = lenis;
  }
  ku.lock = (on) => body.classList.toggle("is-lock", on);

  // Splitting text — words aren’t grouped, each character gets an em (spaces get .empty). Delay is data-delay + character order × .03s (data-skip on days when loading is skipped).
  const skipped = () => root.classList.contains("is-skip");
  document.querySelectorAll(".ku-flip").forEach((el) => {
    const chars = [...el.textContent];
    el.innerHTML = chars.map((c) => (c === " " ? '<em class="ch empty"> </em>' : `<em class="ch">${c}</em>`)).join("");
    el.setAttribute("aria-label", chars.join(""));
  });
  ku.flipDelays = () => {
    document.querySelectorAll(".ku-flip").forEach((el) => {
      const base = parseFloat((skipped() && el.dataset.skip) || el.dataset.delay || "0.1");
      el.querySelectorAll("em.ch").forEach((c, i) => { c.style.transitionDelay = `${(base + i * 0.03).toFixed(2)}s`; });
    });
  };
  ku.flipDelays();

  // Button text — a second copy of the same text is attached so it rises from below on hover
  document.querySelectorAll(".ku-roll").forEach((r) => {
    if (r.children.length > 1) return;
    const twin = document.createElement("span");
    twin.textContent = r.dataset.text || r.textContent;
    twin.setAttribute("aria-hidden", "true");
    r.append(twin);
  });

  // Phone full menu
  const trigger = document.querySelector(".ku-trigger");
  trigger?.addEventListener("click", (e) => {
    e.preventDefault();
    const open = body.dataset.show !== "global";
    body.dataset.show = open ? "global" : "";
    trigger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  });

  // In-section jump button (rel="#…") — 1.2s power3.inOut, up by the header height (70 on phone · 60px on PC)
  document.querySelectorAll('a[rel^="#"], a[rel^="."], button[rel^="#"], button[rel^="."]').forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      const sel = b.getAttribute("rel"), el = document.querySelector(sel);
      const y = sel === ".top" || !el ? 0 : el.getBoundingClientRect().top + scrollY - (isMobile() ? 70 : 60);
      gsap.to(window, { duration: reduce ? 0 : 1.2, ease: "power3.inOut", scrollTo: { y, x: 0, autoKill: false } });
    });
  });

  // Section without a loading board — the curtain lifts after .5s and notes that this window has been visited (going to the first page later skips loading)
  if (!document.querySelector(".ku-opening")) {
    try { sessionStorage.setItem("ku-opening", "1"); } catch {}
    ku.afterPaint(() => setTimeout(() => root.setAttribute("data-load", "1"), 500));
  }

  // On view, inview — once when the top edge reaches below the screen’s center 20%
  ku.inview = () => {
    document.querySelectorAll("[data-inview]").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: "top center+=20%", end: "bottom+=10% top", onEnter: () => el.classList.add("inview") });
    });
  };

  // Each section’s light/dark mode and name — the head text color follows, and in Hero the contact bar is hidden. When the footer is visible, the head and contact bar are removed.
  const controller = new ScrollMagic.Controller();
  ku.current = () => {
    document.querySelectorAll("[data-section]").forEach((sec) => {
      const scene = new ScrollMagic.Scene({ triggerElement: sec, triggerHook: 0, duration: sec.clientHeight, offset: 0 }).addTo(controller);
      scene.on("enter", () => {
        body.dataset.currentTheme = sec.hasAttribute("data-theme") ? "light" : "dark";
        body.dataset.currentSection = sec.dataset.section;
      });
    });
    const footer = document.querySelector(".ku-footer");
    if (footer) {
      const scene = new ScrollMagic.Scene({ triggerElement: footer, triggerHook: 1, duration: footer.clientHeight + 200, offset: 0 }).addTo(controller);
      scene.on("enter", () => { body.dataset.showFooter = "1"; });
      scene.on("leave", () => { body.dataset.showFooter = "0"; });
    }
  };

  // Photo parallax — zoom (−10→10%, 1.08→1x), vertical (−20→20%), background (−20→20%, 1.2→1x), all tied to scroll
  ku.parallax = () => {
    if (reduce) return;
    gsap.utils.toArray(".ku-parallax-zoom").forEach((box) => {
      const pic = box.querySelector("[data-pic]");
      if (pic) gsap.timeline({ scrollTrigger: { trigger: box, scrub: true } }).fromTo(pic, { yPercent: -10, scale: 1.08, ease: "none" }, { yPercent: 10, scale: 1, ease: "none" });
    });
    gsap.utils.toArray(".ku-parallax-y").forEach((box) => {
      const pic = box.querySelector("[data-pic]");
      if (pic) gsap.timeline({ scrollTrigger: { trigger: box, scrub: true } }).fromTo(pic, { yPercent: -20, ease: "none" }, { yPercent: 20, ease: "none" });
    });
    document.querySelectorAll("[data-parallax-background]").forEach((sec) => {
      const pic = sec.querySelector("[data-pic]");
      if (pic) gsap.timeline({ scrollTrigger: { trigger: sec, scrub: true } }).fromTo(pic, { yPercent: -20, scale: 1.2, ease: "none" }, { yPercent: 20, scale: 1, ease: "none" });
    });
  };

  // The original attaches everything at once after all section scripts are set up
  addEventListener("DOMContentLoaded", () => { ku.inview(); ku.current(); ku.parallax(); });
})();
