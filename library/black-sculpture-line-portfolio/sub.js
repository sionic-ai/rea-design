(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = "gzEase";
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Work first slide (original capture): the line art fades in instead of being drawn, the name rises inside a mask in .85s, and the intro text on the right appears late — sequenced to the original hero timing (.95s starting .43s after the first image)
    // Time counts from the first frame after fonts are ready — so the tween doesn’t pass off-screen while fonts block painting
    const cheroArt = gsap.utils.toArray(".gz-chero__art path"), h1 = document.querySelectorAll(".gz-chero h1 .gz-line > span"), lead = document.querySelector(".gz-chero__lead");
    const cheroIn = () => requestAnimationFrame(() => {
      if (cheroArt.length) gsap.fromTo(cheroArt, { visibility: "visible", opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" });
      if (h1.length) gsap.fromTo(h1, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.85, ease: "power2.inOut", delay: 0.05 });
      if (lead) gsap.fromTo(lead, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out", delay: 0.55 });
    });
    if (cheroArt.length || h1.length) (document.fonts?.ready || Promise.resolve()).then(cheroIn);
    // White line drawing — drawn from start to end while the image passes the screen center (scrub .48)
    gsap.utils.toArray(".gz-case__art, .gz-steps__art, .gz-prog__aside svg, .gz-tree svg, .gz-next svg").forEach((svg) => {
      const lines = svg.querySelectorAll("path, rect");
      lines.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });
      const sticky = svg.closest(".gz-steps, .gz-prog");
      gsap.to(lines, { strokeDashoffset: 0, ease: "none", stagger: 0.1, scrollTrigger: { trigger: sticky || svg, start: sticky ? "top 60%" : "top 85%", end: sticky ? "bottom bottom" : "bottom 40%", scrub: 0.48 } });
    });
    // Obstacles section title: letters turn on one by one with scroll (the original is a typewriter that shows and hides one letter at a time) — words are wrapped as chunks to keep line breaks
    const startTitle = document.querySelector(".gz-start .gz-title");
    if (startTitle) {
      startTitle.querySelectorAll(".gz-line > span").forEach((line) => {
        const words = line.textContent.split(" ");
        line.innerHTML = words.map((w) => `<span class="gz-word" style="display:inline-block;white-space:nowrap">${[...w].map((ch) => `<span class="gz-ch">${ch}</span>`).join("")}</span>`).join(" ");
      });
      const chars = startTitle.querySelectorAll(".gz-ch");
      gsap.fromTo(chars, { opacity: 0 }, { opacity: 1, ease: "none", stagger: { each: 0.05 }, duration: 0.01, scrollTrigger: { trigger: ".gz-start", start: "top 75%", end: "top 15%", scrub: 0.48 } });
    }
    // Cropped giant title: rises from below as it passes through the section and stands half cropped
    const other = document.querySelector(".gz-other__title");
    if (other) gsap.fromTo(other, { yPercent: 60 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".gz-other", start: "top bottom", end: "bottom bottom", scrub: 0.48 } });
  });

  // Light strip: an uppercase sentence flows left one set every 22s
  const band = document.querySelector(".gz-band__track");
  if (band && !reduce) gsap.to(band, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });

  // Handle drag to open — dragging down it follows (max 160px), and releasing after dragging past 120px moves on to the next section. Otherwise it returns in .6s
  const hand = document.querySelector(".gz-pull__hand");
  if (hand) {
    let start = null;
    const next = document.querySelector("#in-plain-terms");
    const go = () => next?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    hand.addEventListener("pointerdown", (e) => { start = e.clientY; hand.setPointerCapture(e.pointerId); });
    hand.addEventListener("pointermove", (e) => { if (start == null) return; gsap.set(hand, { y: Math.max(0, Math.min(160, e.clientY - start)) }); });
    const up = (e) => {
      if (start == null) return;
      const d = e.clientY - start; start = null;
      gsap.to(hand, { y: 0, duration: reduce ? 0 : 0.6, ease: "elastic.out(1, .5)" });
      if (d > 120) go();
    };
    hand.addEventListener("pointerup", up); hand.addEventListener("pointercancel", up);
    hand.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  }

  // Work strip — over the section height the strip flows left (scrub .48), and the number counts the work that reaches the left slot.
  const reel = document.querySelector(".gz-reel"), reelTrack = document.querySelector(".gz-reel__track");
  const count = document.querySelector("[data-reel-count]");
  if (reel && reelTrack) {
    const items = reelTrack.querySelectorAll(".gz-reel__item");
    const dist = () => reelTrack.scrollWidth - innerWidth * 0.35;
    gsap.to(reelTrack, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: reel, start: "top top", end: "bottom bottom", scrub: reduce ? false : 0.48, invalidateOnRefresh: true,
      onUpdate: (s) => { if (count) count.textContent = String(Math.min(items.length, 1 + Math.floor(s.progress * items.length * 0.999))).padStart(2, "0"); } } });
  }

  // Dot cluster strip — dots scattered in a long horizontal strip drift slowly left and breathe up and down
  const cv = document.querySelector("[data-dots]");
  if (cv) {
    const g = cv.getContext("2d");
    const probe = document.createElement("span"); probe.style.cssText = "display:none;color:var(--kf-ink-soft)"; cv.parentNode.appendChild(probe);
    const ink = getComputedStyle(probe).color; probe.remove();
    let W = 0, H = 0, dots = [], raf = 0, visible = false;
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // A cluster of dots crowded in the panel’s center band and thinning out above and below
      dots = Array.from({ length: Math.round(W / 2.5) }, () => { const v = (Math.random() + Math.random() + Math.random()) / 3; return { x: Math.random() * W, y: H * (0.2 + v * 0.6), r: Math.random() * 1.2 + 0.4, s: 6 + Math.random() * 18, p: Math.random() * 6.28 }; });
    };
    const draw = (t) => {
      g.clearRect(0, 0, W, H); g.fillStyle = ink;
      dots.forEach((d) => { const x = ((d.x - t * d.s) % W + W) % W, y = d.y + Math.sin(t * 0.8 + d.p) * 6; g.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(d.p + t * 0.5)); g.fillRect(x, y, d.r, d.r); });
    };
    const loop = (now) => { raf = visible ? requestAnimationFrame(loop) : 0; draw(now / 1000); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(loop); }).observe(cv);
    new ResizeObserver(() => { size(); draw(0); }).observe(cv);
  }
})();
