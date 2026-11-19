// Shared by all pages: local time, CONNECT fan menu, back-to-top button, disc transition into a case study and the curtain that splits apart on return.
// The original hangs scenes on native scroll with ScrollTrigger scrub:true — no smooth scroll library is used.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original pinDistance: stretches and shrinks the length based on a 900px screen only 0.85–1.15× to fit the screen height
  window.iPin = (px) => Math.round(px * Math.min(1.15, Math.max(0.85, innerHeight / 900)));

  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => (clock.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 1000);
  }

  const connect = document.querySelector(".i-connect");
  if (connect) {
    const btn = connect.querySelector("button");
    const set = (open) => {
      connect.dataset.open = open ? "true" : "false";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const hoverable = matchMedia("(hover: hover)").matches;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      set(hoverable || connect.dataset.open !== "true");
    });
    // On screens with a mouse, hovering alone expands it (same as the original). On touch screens only on press
    if (hoverable) {
      connect.addEventListener("pointerenter", () => set(true));
      connect.addEventListener("pointerleave", () => set(false));
    }
    addEventListener("click", (e) => !connect.contains(e.target) && set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  const top = document.querySelector(".i-top");
  if (top) {
    const show = () => (top.dataset.visible = scrollY > innerHeight * 0.9 ? "true" : "false");
    addEventListener("scroll", show, { passive: true });
    show();
    top.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  }

  // Case study link (original figures): a blue line is drawn along the route on the map (if all of it is visible on screen, otherwise along the tab’s arrow route) over .3s (phone .18) power1.inOut, and
  // At the end the disc grows to cover the screen over .38s (.28 on phone) power3.in, then moves on. Meanwhile the text of the Work section fades to .2 in .16s.
  const warp = document.querySelector(".i-warp");
  const narrow = () => matchMedia("(max-width: 1023px)").matches;
  const coverScale = () => (2.5 * Math.hypot(Math.max(screen.width, innerWidth), Math.max(screen.height, innerHeight))) / 32;
  const sample = (p) => {
    const m = p?.getScreenCTM?.();
    if (!p || !m) return [];
    const n = p.getTotalLength();
    return Array.from({ length: 41 }, (_, i) => p.getPointAtLength((n * i) / 40).matrixTransform(m));
  };
  const inView = (q) => q && q.x > 24 && q.x < innerWidth - 24 && q.y > 24 && q.y < innerHeight - 24;
  document.querySelectorAll("[data-warp]").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (reduce || !warp || e.metaKey || e.ctrlKey || !link.hasAttribute("data-warp")) return;
      e.preventDefault();
      let pts = sample(document.querySelector(".w-gino__route path"));
      if (!(inView(pts[0]) && inView(pts.at(-1)))) pts = sample(link.querySelector("path"));
      const r = link.getBoundingClientRect();
      const end = pts.at(-1) ?? { x: r.right - 12, y: r.top + r.height / 2 };
      const x = Math.max(0, Math.min(innerWidth, end.x)), y = Math.max(0, Math.min(innerHeight, end.y));
      const disc = warp.querySelector(".i-warp__disc");
      const path = warp.querySelector(".i-warp__route path");
      const puck = warp.querySelector(".i-warp__route circle");
      const field = warp.querySelector(".i-warp__field");
      const draw = narrow() ? 0.18 : 0.3;
      path.setAttribute("pathLength", "1");
      path.setAttribute("d", pts.map((q, i) => `${i ? "L" : "M"}${q.x} ${q.y}`).join(" "));
      puck.setAttribute("cx", pts[0]?.x ?? x);
      puck.setAttribute("cy", pts[0]?.y ?? y);
      gsap.set(warp, { visibility: "visible" });
      gsap.set(field, { opacity: 0 });
      gsap.set(disc, { left: x, top: y, scale: 0, opacity: 1 });
      gsap.set([path, puck], { opacity: 1 });
      gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
      sessionStorage.setItem("i-warp", "in");
      const o = { p: 0 };
      const fade = document.querySelectorAll(".w-gino__desc, .w-gino__meta, .w-tech, .w-gino__problem, .w-gino__tagline");
      const tl = gsap.timeline();
      if (fade.length) tl.to(fade, { opacity: 0.2, duration: 0.16 }, 0);
      tl.to(path, { strokeDashoffset: 0, duration: draw, ease: "power1.inOut" }, 0)
        .to(o, { p: 1, duration: draw, ease: "power1.inOut", onUpdate: () => {
          const q = pts[Math.min(pts.length - 1, Math.round(o.p * (pts.length - 1)))];
          if (q) { puck.setAttribute("cx", q.x); puck.setAttribute("cy", q.y); }
        } }, 0)
        .to(disc, { scale: coverScale(), duration: narrow() ? 0.28 : 0.38, ease: "power3.in" }, draw)
        .set(field, { opacity: 1 })
        .set([path, puck], { opacity: 0 })
        .call(() => requestAnimationFrame(() => requestAnimationFrame(() => (location.href = link.getAttribute("href")))));
    });
  });

  // Cover removal on entry (original values): if arriving from the disc, the covering disc shrinks to the Here marker of the case study in .4s (phone .3) power3.inOut,
  // Returning from a case study, the top and bottom sheets fold after .08s over .5s power4.inOut (.03 apart)
  const arrived = sessionStorage.getItem("i-warp");
  sessionStorage.removeItem("i-warp");
  if (arrived === "in" && warp && !reduce) {
    const disc = warp.querySelector(".i-warp__disc");
    gsap.set(warp, { visibility: "visible" });
    gsap.set(warp.querySelector(".i-warp__route"), { opacity: 0 });
    gsap.set(disc, { left: innerWidth * 0.75, top: innerHeight * 0.6, scale: coverScale(), opacity: 1 });
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      const here = document.querySelector(".g-aerial__route path");
      const end = sample(here).at(-1);
      const mark = inView(end) ? end : (() => { const b = document.querySelector(".g-here")?.getBoundingClientRect(); return b && { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })();
      const x = Math.max(24, Math.min(innerWidth - 24, mark ? mark.x : innerWidth * 0.75));
      const y = Math.max(24, Math.min(innerHeight - 24, mark ? mark.y : innerHeight * 0.6));
      gsap.set(disc, { left: x, top: y });
      gsap.to(disc, { scale: 0, duration: narrow() ? 0.3 : 0.4, ease: "power3.inOut", onComplete: () => gsap.set(warp, { visibility: "hidden" }) });
    }));
  }
  const shut = document.querySelector(".i-shut");
  if (shut) {
    if (arrived === "out" && !reduce) {
      // As in the original, open on the frame after the position-restoring cover (html[data-restore]) lifts — opening earlier passes unseen along with the hidden body and the content pops in all at once later
      const html = document.documentElement;
      const open = () => gsap.timeline({ onComplete: () => shut.remove() })
        .to(shut.children, { height: 0, duration: 0.5, ease: "power4.inOut", stagger: 0.03, delay: 0.08 });
      requestAnimationFrame(() => {
        if (!html.hasAttribute("data-restore")) return open();
        const mo = new MutationObserver(() => { if (!html.hasAttribute("data-restore")) { mo.disconnect(); open(); } });
        mo.observe(html, { attributes: true, attributeFilter: ["data-restore"] });
      });
    } else shut.remove();
  }

  document.querySelectorAll("[data-warp-out]").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (reduce || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      const veil = document.createElement("div");
      veil.className = "i-shut is-live";
      veil.innerHTML = '<div class="i-shut__panel i-shut__panel--top"></div><div class="i-shut__panel i-shut__panel--bottom"></div>';
      document.body.append(veil);
      sessionStorage.setItem("i-warp", "out");
      sessionStorage.setItem("i-skip-intro", "1");
      // The top and bottom plates close to half the screen (+1px) in .8s power4.inOut, .04 apart (original values)
      gsap.timeline({ onComplete: () => (location.href = link.getAttribute("href")) })
        .fromTo(veil.children, { height: 0 }, { height: `${Math.ceil(innerHeight / 2) + 1}px`, duration: 0.8, ease: "power4.inOut", stagger: 0.04 });
    });
  });
})();
