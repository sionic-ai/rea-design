(() => {
  // Hero veil: on the white plate, in the logo cell, the horizontal guide line is drawn from the left and the vertical from the top in .95s, and the logo interior and outline settle in .6s,
  // While the dot flashes and disappears, the logo interior fills with the text color. As the panel lifts at .4s the center circle grows 8x over 1s, and the curtain vanishes at .6s
  // reveal (hero text) rises in from 24px below, head (header row) drops in from above over .6s. With once: session it runs only once per session, afterwards only the text enters
  kfFx.register("gridline-logo-opening", (el, { options, reduce }) => {
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const box = q("box"), circle = q("circle"), gh = q("grid-h"), gv = q("grid-v"), fill = q("fill"), stroke = q("stroke"), dot = q("dot");
    const reveal = options.reveal ? [...document.querySelectorAll(options.reveal)] : [];
    const head = options.head ? document.querySelector(options.head) : null;
    if (!window.gsap || !box) return;
    const key = "kf-fx-opening:" + location.pathname;
    let seen = false;
    try { seen = options.once === "session" && sessionStorage.getItem(key) === "1"; } catch { seen = false; }
    const all = [el, box, circle, gh, gv, fill, stroke, dot, ...reveal, head].filter(Boolean);
    const done = () => { document.documentElement.classList.remove("fx-opening-lock"); window.ScrollTrigger && ScrollTrigger.refresh(); };
    if (reduce) { gsap.set(el, { autoAlpha: 0, pointerEvents: "none" }); return () => gsap.set(all, { clearProps: "all" }); }
    if (reveal.length) gsap.set(reveal, { autoAlpha: 0, y: 24 });
    if (head) gsap.set(head, { autoAlpha: 0, yPercent: -100 });
    let tl;
    if (seen) {
      gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
      tl = gsap.timeline({ onComplete: done });
      if (reveal.length) tl.to(reveal, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" });
      if (head) tl.to(head, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power2.out" }, 0);
    } else {
      try { options.once === "session" && sessionStorage.setItem(key, "1"); } catch { /* In windows where storage is blocked, it runs every time */ }
      document.documentElement.classList.add("fx-opening-lock");
      gsap.set(el, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(box, { autoAlpha: 1 });
      if (circle) gsap.set(circle, { autoAlpha: 0, scale: 1, transformOrigin: "center center" });
      if (gh) gsap.set(gh, { scaleX: 0, transformOrigin: "left center", transformBox: "fill-box" });
      if (gv) gsap.set(gv, { scaleY: 0, transformOrigin: "center top", transformBox: "fill-box" });
      const marks = [fill, stroke, dot].filter(Boolean);
      if (marks.length) gsap.set(marks, { autoAlpha: 0 });
      const ink = getComputedStyle(el).getPropertyValue("--fx-ink").trim() || getComputedStyle(el).color;
      tl = gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: done });
      if (gh) tl.to(gh, { scaleX: 1, duration: 0.95 });
      if (gv) tl.to(gv, { scaleY: 1, duration: 0.95 }, "<");
      if (fill || stroke) tl.to([fill, stroke].filter(Boolean), { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" }, "-=0.1");
      if (dot) tl.to(dot, { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" }, "<").to(dot, { autoAlpha: 0, duration: 0.6, ease: "sine.inOut", delay: 0.1 });
      if (fill) tl.to(fill, { fill: ink, duration: 0.6, ease: "sine.inOut" }, "<");
      tl.to(box, { autoAlpha: 0, duration: 0.4, delay: 0.3 }, ">");
      if (circle) tl.to(circle, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, "<").to(circle, { scale: 8, duration: 1, ease: "sine.inOut" }, "<");
      tl.to(el, { autoAlpha: 0, duration: 0.6, pointerEvents: "none" }, "<+=0.3");
      if (reveal.length) tl.to(reveal, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2");
      if (head) tl.to(head, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power2.out" }, "<");
    }
    return () => { tl && tl.kill(); document.documentElement.classList.remove("fx-opening-lock"); gsap.set(all.filter((n) => n.isConnected), { clearProps: "all" }); };
  });
})();
