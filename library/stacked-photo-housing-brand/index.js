// First page — opening (a shorter version from the second visit via cookie), Hero blur after the square grows, parallax photos, line splitting, About photo swapping
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 768px)").matches;
  const fine = matchMedia("(min-width: 768px) and (pointer: fine)").matches;
  const root = document.documentElement;
  const fv = document.querySelector(".fv");
  const op = (n) => fv.querySelectorAll(`[data-op="${n}"]`);
  const header = document.querySelector("[data-header]");
  const main = document.querySelector("[data-main]");
  const skip = fv.querySelector("[data-skip]");
  const startCycle = () => fv.dispatchEvent(new CustomEvent("fx:cycle"));
  // During the opening, lock html to block scrolling
  const lock = (on) => {
    const s = { position: "fixed", top: "0", left: "0", width: "100%", height: "100%", overflow: "hidden scroll" };
    for (const k in s) root.style[k] = on ? s[k] : "";
    if (on) window.ai.lenis?.stop(); else window.ai.lenis?.start();
  };
  const seen = document.cookie.split("; ").some((c) => c === "opening=yes") && !new URLSearchParams(location.search).has("opening");

  if (reduce) {
    gsap.set([main, header, ...op(1), ...op(9), ...op(10), ...op(11)], { opacity: 1, y: 0 });
    gsap.set(op(8), { opacity: 0 });
    window.ai.headerReady();
  } else if (seen) {
    root.classList.add("is-opening-skip");
    gsap.timeline()
      .to(main, { opacity: 1, duration: 0.7, ease: "power3.out" })
      .to(header, { opacity: 1, duration: 0.7, ease: "power3.out" }, "<")
      .to(op(9), { opacity: 1, y: 0, duration: 1.35, ease: "sine.out" }, "<")
      .to(op(1), { opacity: 1, y: 0, duration: 1, ease: "sine.out" }, "<")
      .to(op(8), { opacity: 0, y: 0, duration: 0.7, ease: "sine.out" })
      .to(op(10), { opacity: 1, y: 0, duration: 0.8, ease: "sine.out" }, "-=0.2")
      .to(op(11), { opacity: 1, y: 0, duration: 0.2, ease: "sine.out" }, "<")
      .add(() => window.ai.headerReady(), "<+1")
      .add(startCycle, "+=1");
  } else {
    lock(true);
    root.classList.add("is-opening");
    const tl = gsap.timeline();
    let skipped = false;
    skip.addEventListener("click", () => { if (skipped) return; skipped = true; skip.classList.add("is-hidden"); tl.seek("skipPoint"); });
    tl.to(main, { opacity: 1, duration: 0.7, ease: "sine.out" })
      .to(op(1), { opacity: 1, y: 0, duration: 0.6, ease: "sine.out" })
      .to(skip, { opacity: 1, y: 0, duration: 0.6, ease: "sine.out" }, "<")
      .add(() => op(2).forEach((el) => el.classList.add("is-active")))
      .to(op(3), { opacity: 1, duration: 0.8, ease: "sine.out" }, "+=1.4")
      .to(op(4), { opacity: 1, duration: 0.8, ease: "sine.out" }, "-=0.1")
      .to(op(5), { opacity: 1, duration: 0.8, ease: "sine.out" }, "-=0.1")
      .to(op(6), { opacity: 1, duration: 0.8, ease: "sine.out" }, "-=0.1")
      .to(op(7), { opacity: 1, duration: 0.8, ease: "sine.out" }, "+=0.5")
      .to(op(7), { scale: wide ? 1.188 : 1.25, duration: 1, ease: "sine.out" }, "+=0.1")
      .add("skipPoint")
      .to(op(8), { opacity: 0, duration: 0.6, ease: "sine.out" }, "-=0.4")
      .to(op(9), { opacity: 1, y: 0, duration: 1, ease: "sine.out" }, "-=0.55")
      .to(op(10), { opacity: 1, y: 0, duration: 0.6, ease: "sine.out" }, "-=0.5")
      .to(header, { opacity: 1, duration: 1, ease: "sine.out" }, "<")
      .to(op(11), { opacity: 1, y: 0, duration: 0.2, ease: "sine.out" }, "<")
      .to(skip, { opacity: 0, duration: 0.2, ease: "sine.out" }, "<")
      .add(() => lock(false))
      .add(() => { root.classList.add("is-opening-end"); window.ai.headerReady(); skip.classList.add("is-hidden"); setTimeout(() => ScrollTrigger.refresh(), 50); })
      .add(startCycle, "+=1");
    document.cookie = "opening=yes; path=/";
  }

  // While the big photo rises, the hero (square · text) blurs
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to("[data-fv-content]", { opacity: 0, ease: "none", scrollTrigger: { trigger: "[data-fade-trigger]", start: "top top", end: "bottom bottom", scrub: 0.2 } });
    // Parallax — each speed pushes down by 1000px × speed and rises later
    document.querySelectorAll(".lead [data-speed]").forEach((el) => {
      gsap.to(el, { y: 1000 * (parseFloat(el.dataset.speed) || 0.5), ease: "none", scrollTrigger: { trigger: "[data-parallax-trigger]", start: "top top", end: "bottom top", scrub: 0.8 } });
    });
  });
  if (!fine) fv.querySelector('[data-fx-part="track"]')?.removeAttribute("data-fx-part");

  // Once it crosses the screen line it gets is-active — same line position as the original
  window.ai.watch(".lead .ai-change", "-70%");
  window.ai.watch(".lead [data-line]", "-40%");
  ["-50%", "-40%", "-20%"].forEach((m) => window.ai.watch(`[data-watch="${m}"]`, m));

  // Work section — when the section enters the screen, the boxes start swapping skins
  const wsq = document.querySelector("[data-works-square]");
  const wio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { wsq.dispatchEvent(new CustomEvent("fx:cycle")); wio.disconnect(); } }), { rootMargin: "0px 0px -10px 0px" });
  wio.observe(document.querySelector("[data-works]"));

  // Hovering an About menu item swaps the side photo to that row’s photo (.4s), and back to the first photo when leaving the section
  document.querySelectorAll("[data-hover-area]").forEach((area) => {
    const img = area.querySelector("[data-hover-image]");
    area.querySelectorAll("[data-hover-item]").forEach((it) => it.addEventListener("mouseenter", () => img.setAttribute("data-about", it.dataset.about)));
    area.addEventListener("mouseleave", () => img.setAttribute("data-about", "main"));
  });

  // Text line splitting — a mask per line, from 20% below at the 60% screen line in .6s sine.out
  addEventListener("load", () => document.fonts.ready.then(() => {
    document.querySelectorAll("[data-split]").forEach((el) => {
      if (reduce) return;
      gsap.set(el, { opacity: 0 });
      const st = new SplitText(el, { type: "lines", linesClass: "line" });
      st.lines.forEach((l) => { const w = document.createElement("div"); w.style.overflow = "hidden"; l.parentNode.insertBefore(w, l); w.appendChild(l); });
      gsap.set(el, { opacity: 1 });
      gsap.set(st.lines, { opacity: 0, yPercent: 20 });
      st.lines.forEach((l) => gsap.to(l, { opacity: 1, yPercent: 0, duration: 0.6, ease: "sine.out", scrollTrigger: { trigger: l, start: "top 60%", once: true } }));
    });
  }));
})();
