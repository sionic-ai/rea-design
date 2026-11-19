// About scene: the pinned title group blurs as the letter’s top edge covers it and rises (original (letter top − title top) ÷ title height),
// The manifesto appears as the letter’s top edge passes 23.75%→15% of the screen, and the 2px blur clears as the bottom edge passes 75%→34.5% (word lighting by word-dim-scrub).
// The letter signature draws all strokes in 1.6s in proportion to their length once 90% visible, and the photo pile flips by the original pose table with a .6s spring
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const head = document.querySelector(".ab-head");
  const letter = document.querySelector(".ab-letter");
  const mani = document.querySelector(".ab-mani__in");
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const fade = () => {
      const g = head.getBoundingClientRect(), l = letter.getBoundingClientRect();
      head.style.opacity = g.height ? Math.min(Math.max((l.top - g.top) / g.height, 0), 1).toFixed(4) : 1;
    };
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: fade, onRefresh: fade });
    fade();
    gsap.fromTo(mani, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: letter, start: "top 23.75%", end: "top 15%", scrub: true } });
    gsap.fromTo(mani, { filter: "blur(2px)" }, { filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: letter, start: "bottom 75%", end: "bottom 34.5%", scrub: true } });

    const strokes = [...document.querySelectorAll("[data-sign]")];
    const lens = strokes.map((p) => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0);
    strokes.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i], opacity: 0 }));
    const draw = gsap.timeline({ paused: true });
    let at = 0;
    strokes.forEach((p, i) => {
      const d = (lens[i] / total) * 1.6;
      draw.set(p, { opacity: 1 }, at).to(p, { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, at);
      at += d;
    });
    const sign = ScrollTrigger.create({ trigger: ".ab-sign", start: "bottom bottom", once: true, onEnter: () => draw.play() });
    return () => { st.kill(); sign.kill(); head.style.opacity = ""; };
  });

  // ── Signature tooltip — original Base UI tooltip: ~.52s after hover, a screen-fixed panel changes position and opacity at once to sit centered above the link,
  //    the box grows .05s late. When the pointer leaves, the panel stays as is and only the box folds (transparent, size) ──
  const tip = document.createElement("div");
  tip.className = "ab-tip";
  tip.innerHTML = '<div class="ab-tip__box"></div>';
  document.body.append(tip);
  let tipT = 0;
  document.querySelectorAll(".ab-sigs a").forEach((a) => {
    a.addEventListener("pointerenter", () => {
      clearTimeout(tipT);
      // Like the original, attach the board as ”opening” one frame ahead (value unchanged), then change position and opacity all at once on the next frame.
      tipT = setTimeout(() => {
        const box = tip.firstElementChild;
        box.style.transition = "none";
        tip.className = "ab-tip is-prep";
        box.textContent = `${a.getAttribute("aria-label")} · Social`;
        void tip.offsetWidth;
        box.style.transition = "";
        requestAnimationFrame(() => {
          if (!tip.classList.contains("is-prep")) return;
          const r = a.getBoundingClientRect();
          tip.style.translate = `${r.left + r.width / 2 - tip.offsetWidth / 2}px ${r.top - 36}px`;
          tip.className = "ab-tip is-on";
        });
      }, 500);
    });
    a.addEventListener("pointerleave", () => {
      clearTimeout(tipT);
      tip.classList.remove("is-prep");
      if (tip.classList.contains("is-on")) tip.classList.replace("is-on", "is-out");
    });
  });

  // ── Photo Pile ──
  const POSE = [
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, blur: 0, z: 5 },
    { x: 10, y: 12, rotate: 1, scale: 0.97, opacity: 1, blur: 0, z: 4 },
    { x: -12, y: 25, rotate: -1, scale: 0.94, opacity: 1, blur: 0, z: 3 },
    { x: 8, y: 37, rotate: 1.2, scale: 0.91, opacity: 1, blur: 0, z: 2 },
    { x: -6, y: 50, rotate: -0.8, scale: 0.88, opacity: 1, blur: 0, z: 1 },
  ];
  const GONE = { x: 8, y: 88, rotate: 3, scale: 1.02, opacity: 0, blur: 8, z: 6 };
  const BACK = { x: -6, y: 62, rotate: -1, scale: 0.85, opacity: 0, blur: 0, z: 0 };
  const CAPS = [["One-line photo caption here", "2025-00-00"], ["Your second photo caption here", "2025-00-00"], ["Your third photo caption here", "2025-00-00"], ["Your fourth photo caption here", "2025-00-00"], ["Your fifth photo caption here", "2025-00-00"]];
  // Original motion spring (.6s, no bounce) is critically damped so it takes the form 1-(1+ωt)e^(-ωt) — plot that curve as points and use it as a CustomEase
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const springPath = Array.from({ length: 41 }, (_, i) => { const t = i / 40, u = t * 7.2; return `${t.toFixed(3)},${(1 - (1 + u) * Math.exp(-u)).toFixed(4)}`; });
  const spring = window.CustomEase ? CustomEase.create("if-spring", `M0,0 L${springPath.join(" L")} L1,1`) : "power3.out";
  const photos = [...document.querySelectorAll(".ab-photo")];
  const n = document.querySelector("[data-stack-n]"), title = document.querySelector("[data-stack-title]"), date = document.querySelector("[data-stack-date]");
  let cur = 0;
  const poseOf = (i) => (i < cur ? GONE : POSE[i - cur] || BACK);
  const place = (now) => {
    photos.forEach((p, i) => {
      const o = poseOf(i);
      p.style.zIndex = o.z;
      gsap.to(p, { x: o.x, y: o.y, rotate: o.rotate, scale: o.scale, opacity: o.opacity, filter: `blur(${o.blur}px)`, duration: now ? 0 : 0.6, ease: spring, overwrite: true });
    });
    n.textContent = String(cur + 1).padStart(2, "0");
    [title.textContent, date.textContent] = CAPS[cur];
    // Like the original, at the end that button becomes a gray unpressable panel
    btns.forEach((b) => {
      const off = b.dataset.stack === "next" ? cur === photos.length - 1 : cur === 0;
      b.classList.toggle("is-raised", !off);
      b.disabled = off;
    });
  };
  const btns = [...document.querySelectorAll("[data-stack]")];
  btns.forEach((b) => b.addEventListener("click", () => {
    cur = Math.min(Math.max(cur + (b.dataset.stack === "next" ? 1 : -1), 0), photos.length - 1);
    place(matchMedia("(prefers-reduced-motion: reduce)").matches);
  }));
  place(true);
})();
