// Interaction responses and header band shared by all pages — original values as is (curve relax 0.4,0.2,0.12,0.96 · text panel push .4s · gradient one loop in 4s).
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("renewal", "0.37, 0.11, 0, 0.99");
  CustomEase.create("relax", "0.4, 0.2, 0.12, 0.96");
  gsap.defaults({ overwrite: "auto" });
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = () => matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // Turn on when a hand hovers or keyboard focus arrives, turn off when both leave
  const hoverable = (el, { onEnter, onLeave }) => {
    let mouse = false, focus = false, on = false;
    const sync = () => { const v = mouse || focus; if (v === on) return; on = v; v ? onEnter() : onLeave?.(); };
    el.addEventListener("mouseenter", () => { if (!touch()) { mouse = true; sync(); } });
    el.addEventListener("mouseleave", () => { if (!touch()) { mouse = false; sync(); } });
    el.addEventListener("focus", () => { focus = el.matches(":focus-visible"); sync(); });
    el.addEventListener("blur", () => { focus = false; sync(); });
  };
  window.hzHoverable = hoverable;

  $$("[data-hover]").forEach((el) => hoverable(el, { onEnter: () => el.classList.add("is-hover"), onLeave: () => el.classList.remove("is-hover") }));
  $$("[data-clickable-hover]").forEach((el) => {
    if (touch()) el.addEventListener("click", () => el.classList.toggle("is-hover"));
    else { el.addEventListener("mouseenter", () => el.classList.add("is-hover")); el.addEventListener("mouseleave", () => el.classList.remove("is-hover")); }
  });

  // Records the nearest edge as the enter/exit side — the card grid flows in from that side
  const corner = (e, el) => {
    const r = el.getBoundingClientRect();
    return [["right-top", r.right, r.top], ["right-bottom", r.right, r.bottom], ["left-bottom", r.left, r.bottom], ["left-top", r.left, r.top]]
      .map(([c, x, y]) => [c, Math.hypot(e.clientX - x, e.clientY - y)]).sort((a, b) => a[1] - b[1])[0][0];
  };
  $$("[data-hover-corner]").forEach((el) => {
    el.addEventListener("mouseenter", (e) => { if (!touch()) el.dataset.from = corner(e, el); });
    el.addEventListener("mouseleave", (e) => { if (!touch()) el.dataset.to = corner(e, el); });
  });

  // Text plate push: the current text exits in the chosen direction and the same text enters from the opposite side (.4s relax)
  const dirs = { top: [[0, -100], [0, 100]], right: [[100, 0], [-100, 0]], bottom: [[0, 100], [0, -100]], left: [[-100, 0], [100, 0]] };
  $$("[data-hover-move]").forEach((box) => {
    const host = box.closest("[data-hover]"), child = box.querySelector("[data-hover-move-child]");
    if (!host || !child) return;
    const tpl = child.cloneNode(true);
    const [out, inn] = dirs[box.dataset.hoverMove] || dirs.top;
    hoverable(host, {
      onEnter: () => {
        if (reduce) return;
        const old = box.querySelectorAll("[data-hover-move-child]:not(.is-removed)"), next = tpl.cloneNode(true);
        gsap.set(next, { xPercent: inn[0], yPercent: inn[1], willChange: "transform" });
        box.append(next);
        old.forEach((o) => o.classList.add("is-removed"));
        gsap.to(old, { xPercent: out[0], yPercent: out[1], duration: 0.4, ease: "relax", onComplete: () => old.forEach((o) => o.remove()) });
        gsap.to(next, { xPercent: 0, yPercent: 0, duration: 0.4, ease: "relax" });
      },
    });
  });

  // Letter flip: the current letter exits 16px up, fading in .2s, and the new letter rises from 24px below
  $$("[data-hover-flip]").forEach((box) => {
    const host = box.closest("[data-hover]"), child = box.querySelector("[data-hover-flip-child]");
    if (!host || !child) return;
    const tpl = child.cloneNode(true);
    hoverable(host, {
      onEnter: () => {
        if (reduce) return;
        const old = box.querySelectorAll("[data-hover-flip-child]:not(.is-removed)"), next = tpl.cloneNode(true);
        gsap.set(next, { y: 24, opacity: 0, willChange: "transform" });
        box.append(next);
        old.forEach((o) => o.classList.add("is-removed"));
        gsap.to(old, { y: -16, duration: 0.4, ease: "relax" });
        gsap.to(old, { opacity: 0, duration: 0.2, ease: "none", onComplete: () => old.forEach((o) => o.remove()) });
        gsap.to(next, { opacity: 1, duration: 0.2, ease: "none" });
        gsap.to(next, { y: 0, duration: 0.4, ease: "relax" });
      },
    });
  });

  // Logo gradient: when a hand is over it, the board spins once every 4 sec and the pattern turns 60° more
  $$(".hz-gradient").forEach((g) => {
    const host = g.closest("[data-hover]"), child = g.firstElementChild;
    if (!host || !child) return;
    let spin = null;
    if (g.dataset.resize === "true") {
      const size = () => { const r = host.getBoundingClientRect(); g.style.setProperty("--width", `${r.width}px`); g.style.setProperty("--height", `${r.height}px`); };
      size();
      new ResizeObserver(size).observe(host);
    }
    hoverable(host, {
      onEnter: () => {
        g.classList.add("is-active");
        if (reduce) return;
        spin?.kill();
        spin = gsap.to(g, { rotate: "+=360", duration: 4, delay: 0.2, ease: "none", repeat: -1 });
        gsap.to(child, { rotate: "+=60", duration: 1.2, ease: "relax" });
      },
      onLeave: () => {
        g.classList.remove("is-active");
        spin?.kill(); spin = null;
        if (!reduce) gsap.to(child, { rotate: "+=60", duration: 1.2, ease: "relax" });
      },
    });
  });

  // When the big headband passes, the thin headband comes down
  const header = document.querySelector(".hz-header");
  const fixed = document.querySelector(".hz-header-fixed"), threshold = document.querySelector(".hz-threshold");
  if (fixed && threshold) ScrollTrigger.create({ trigger: threshold, start: "top top", onEnter: () => fixed.classList.add("is-visible"), onEnterBack: () => fixed.classList.remove("is-visible") });
  const burger = document.querySelector(".hz-burger");
  burger?.addEventListener("click", () => {
    const open = header.classList.toggle("is-active");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  });

  // Table of contents: when a section’s center crosses the screen center, its cell lights up, and the scroll direction is recorded
  const tocLinks = $$(".hz-toc-link").map((a) => ({ a, sec: a.hash.length > 1 && document.querySelector(a.hash) })).filter((t) => t.sec);
  const tocs = $$(".hz-toc");
  let current = -1;
  const pick = (i) => { if (i === current) return; current = i; tocLinks.forEach((t, k) => t.a.classList.toggle("is-active", k === i)); };
  tocLinks.forEach((t, i) => ScrollTrigger.create({
    trigger: t.sec, start: "top center", end: "bottom center",
    onEnter: () => { tocs.forEach((c) => (c.dataset.forward = "true")); pick(i); },
    onEnterBack: () => { tocs.forEach((c) => (c.dataset.forward = "false")); pick(i); },
  }));
})();
