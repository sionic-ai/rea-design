// First page — original values: dialect swap .33s cubic (word −110% · new word −100%) + three images .33s icons (.165 later), revert image .5s iconsBack ·
// The image sequence runs 120 frames on scrub while the panel passes the screen · each Work row gets is-active per video at ‹top 60%› (1x at 1.5s expo.out) · title row 1.25s expo.inOut.
RW.page("home", (root) => {
  const { $, $$, reduce } = RW;
  const kill = [];
  const st = (o) => { const s = ScrollTrigger.create(o); kill.push(() => s.kill()); return s; };

  // Hero video layer — hidden once the black panel covers the whole screen
  const layer = $(".hero-layer", root);
  st({ trigger: $(".hero", root), start: "top top", end: "bottom top", onLeave: () => layer.classList.add("is-off"), onEnterBack: () => layer.classList.remove("is-off") });

  // Dialect switcher
  const wrap = $(".intro-title", root);
  let on = false, tl = null;
  const fwd = () => { on = true; tl?.kill(); tl = gsap.timeline().to($(".w-a > span", wrap), { yPercent: -110, duration: 0.33, ease: "cubic" }).to($(".w-b > span", wrap), { yPercent: -100, duration: 0.33, ease: "cubic" }, 0).to($$(".ic", wrap), { scale: 1, duration: 0.33, ease: "icons" }, 0.165); };
  const back = () => { on = false; tl?.kill(); tl = gsap.timeline().to($$(".ic", wrap), { scale: 0, duration: 0.5, ease: "iconsBack" }).to($(".w-a > span", wrap), { yPercent: 0, duration: 0.33, ease: "cubic" }, 0).to($(".w-b > span", wrap), { yPercent: 0, duration: 0.33, ease: "cubic" }, 0); };
  gsap.set($(".w-b > span", wrap), { yPercent: 0, y: () => $(".w-b > span", wrap).getBoundingClientRect().height });
  // On every press the cursor’s swap icon makes a half turn in .2s (original switch curve .4,0,.2,1)
  const click = () => { const ic = document.querySelector(".mf-cursor-text .mf-svgsprite"); if (ic) gsap.to(ic, { rotate: "+=180", duration: 0.2, ease: window.CustomEase ? "switch" : "power1.inOut" }); on ? back() : fwd(); };
  wrap.addEventListener("click", click);
  kill.push(() => wrap.removeEventListener("click", click));
  if (matchMedia("(any-pointer: coarse) and (prefers-reduced-motion: no-preference)").matches) st({ trigger: $(".intro-title__h", wrap), start: "center 65%", once: true, onEnter: () => !on && fwd() });

  // Title that brightens with scroll (original data-highlight-text): letters go .2 to 1, gap .1, scrub, start top 90% · end center 40%
  const h2 = $(".intro-title__h", root);
  const parts = [...h2.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => { const s = document.createElement("span"); s.textContent = n.textContent; n.replaceWith(s); return s; });
  const targets = [...parts, ...$$(".w-a > span, .w-b > span", h2)];
  if (window.SplitText && !reduce) {
    const sp = new SplitText(targets, { type: "words, chars" });
    const tw = gsap.from(sp.chars, { autoAlpha: 0.2, stagger: 0.1, ease: "linear", scrollTrigger: { scrub: true, trigger: h2, start: "top 90%", end: "center 40%" } });
    kill.push(() => { tw.scrollTrigger?.kill(); tw.kill(); sp.revert(); });
  }

  // Image sequence: swap the placeholder image for 120 frames (a person silhouette circles holding a camera)
  const cv = $(".seq__canvas", root), ctx = cv.getContext("2d");
  const css = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; root.append(p); const c = getComputedStyle(p).color; p.remove(); return c; };
  const C = { bg: css("--kf-raised"), wall: css("--kf-ink-soft"), fig: css("--kf-bg"), acc: css("--kf-accent"), line: css("--kf-line") };
  let frame = -1, W = 0, H = 0;
  const size = () => { const r = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0); draw(Math.max(0, frame), true); };
  function draw(f, force) {
    if (f === frame && !force) return;
    frame = f;
    const t = f / 119, a = t * Math.PI * 1.2 - 0.6;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.6);
    g.addColorStop(0, C.wall); g.addColorStop(1, C.bg);
    ctx.globalAlpha = 0.35; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
    const cx = W / 2 + Math.sin(a) * W * 0.04, s = H / 600;
    ctx.fillStyle = C.fig;
    ctx.beginPath(); ctx.ellipse(cx, H * 0.3, 46 * s, 58 * s, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 150 * s, H); ctx.quadraticCurveTo(cx - 140 * s, H * 0.48, cx, H * 0.44); ctx.quadraticCurveTo(cx + 140 * s, H * 0.48, cx + 150 * s, H); ctx.fill();
    ctx.save(); ctx.translate(cx + Math.cos(a) * 30 * s, H * 0.55); ctx.rotate(Math.sin(a) * 0.25);
    ctx.fillStyle = C.acc; ctx.fillRect(-60 * s, -34 * s, 120 * s, 68 * s);
    ctx.fillStyle = C.fig; ctx.beginPath(); ctx.arc(Math.cos(a) * 18 * s, 0, 22 * s, 0, 6.283); ctx.fill();
    ctx.restore();
  }
  size();
  const ro = new ResizeObserver(size); ro.observe(cv); kill.push(() => ro.disconnect());
  st({ trigger: $(".seq", root), start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => draw(Math.round(s.progress * 119)) });

  // Work row
  const vids = $$(".feed__video", root), titles = $$(".feed__titles p", root), feed = $(".feed", root);
  vids.forEach((v, i) => {
    const next = vids[i + 1];
    st({
      trigger: v, endTrigger: next || feed, start: i === 0 ? "top bottom" : "top 60%", end: next ? "top 60%" : "bottom -100%",
      toggleClass: { targets: v, className: "is-active" },
      onLeave: () => v.classList.add("is-above"), onEnterBack: () => v.classList.remove("is-above"),
      onToggle: (s) => { if (s.isActive && titles.length) gsap.to(titles, { yPercent: -100 * i, ease: "expo.inOut", duration: reduce ? 0 : 1.25, overwrite: true }); },
    });
  });
  return () => { kill.forEach((f) => f()); tl?.kill(); };
});
