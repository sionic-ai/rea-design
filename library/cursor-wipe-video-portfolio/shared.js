// The site’s outer shell — three curves (inQuint · outQuint · inOutQuint), smooth scroll, placeholder video (canvas), passing the source to the blurred video behind the screen,
// Film grain, contact board, headline entrance after the loader, page transition (text exits upward and the next page’s text enters from below).
(() => {
  gsap.registerPlugin(CustomEase, ...(window.SplitText ? [SplitText] : []));
  CustomEase.create("inQuint", "0.64, 0, 0.78, 0");
  CustomEase.create("outQuint", "0.22, 1, 0.36, 1");
  CustomEase.create("inOutQuint", "0.83, 0, 0.17, 1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const D = { duration: 0.85, ease: "outQuint" };
  const site = (window.gbSite = { reduce, touch, D, lenis: null, ready: null });
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Line/word splitting — the order is line count / word count × .1 (original _i)
  site.split = (els) => (window.SplitText ? SplitText.create(els, { type: "lines, words", linesClass: "st-line", wordsClass: "st-word", aria: "none", autoSplit: false }) : null);
  site.stagger = (lines, words) => (words.length ? (lines.length / words.length) * 0.1 : 0);
  site.hide = (v = { yPercent: 160 }) => (reduce ? { opacity: 0 } : v);
  site.show = (v = { yPercent: 0 }) => (reduce ? { opacity: 1 } : v);
  // Line splitting waits for the font — splitting early with a fallback font locks lines to that width. If the font doesn’t arrive in over 3 seconds, just go on
  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]) : Promise.resolve();
  site.boot = (fn) => fonts.then(fn);

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, syncTouch: true });
    site.lenis = window.lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Placeholder video: a canvas where a different scene per work slowly flows. If a real video goes in <video> Just swap it for ---------- */
  // Scene colors are video content, not skin — they imitate the tones of the five original videos (underwater teal · red track · gray cloth · vineyard green · skin-tone hand)
  const PAL = [
    ["#0d1a1f", "#1f3b44", "#6f8f94", "#c9b8a3"], /* not Skin: placeholder video scene color — underwater */
    ["#7a3a2c", "#b5604a", "#d9d2c5", "#3b5a3a"], /* Not skin: placeholder video scene color — red track */
    ["#8e9196", "#c2c5c9", "#e6e7e8", "#4a4c50"], /* Not Skin: placeholder video scene color — gray cloth */
    ["#2f3a24", "#55663d", "#9aa77a", "#c7c2b0"], /* not a skin: placeholder video scene color — vineyard */
    ["#2a1f1a", "#6b4a3a", "#b08670", "#e3c9b4"], /* Not Skin: placeholder video scene color — flesh-toned hands */
  ];
  const films = new Set();
  const scene = (ctx, w, h, k, t) => {
    const p = PAL[k % PAL.length], g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, p[0]); g.addColorStop(1, p[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const s = t * 0.25;
    if (k % 5 === 0) {
      for (let i = 0; i < 6; i++) { ctx.fillStyle = p[2]; ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(w * ((i * 0.23 + s * 0.05) % 1.2 - 0.1), h * (0.2 + 0.1 * Math.sin(s + i)), h * 0.08, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = p[3]; ctx.beginPath(); ctx.ellipse(w * (0.45 + 0.08 * Math.sin(s)), h * 0.6, w * 0.16, h * 0.12, 0.4 + 0.2 * Math.sin(s * 0.7), 0, 7); ctx.fill();
    } else if (k % 5 === 1) {
      ctx.fillStyle = p[2]; ctx.fillRect(0, 0, w, h * 0.38);
      ctx.strokeStyle = p[2]; ctx.lineWidth = 3;
      for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(w / 2 + i * 18, h * 0.38); ctx.lineTo(w / 2 + i * w * 0.22, h); ctx.stroke(); }
      ctx.fillStyle = p[3]; ctx.fillRect(w * 0.48 + Math.sin(s * 2) * 4, h * (0.42 + ((s * 0.05) % 0.3)), w * 0.03, h * 0.16);
    } else if (k % 5 === 2) {
      for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? p[2] : p[3]; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(w * (0.2 + i * 0.18), h * (0.5 + 0.2 * Math.sin(s + i * 1.3)), w * 0.3, h * 0.12, -0.6, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.strokeStyle = p[3]; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w * (0.3 + 0.1 * Math.sin(s)), h * 0.2); ctx.lineTo(w * 0.62, h * 0.55); ctx.stroke();
    } else if (k % 5 === 3) {
      ctx.fillStyle = p[3]; ctx.fillRect(0, 0, w, h * 0.3);
      for (let i = 0; i < 14; i++) { ctx.strokeStyle = i % 2 ? p[2] : p[0]; ctx.lineWidth = 6; ctx.beginPath(); const y = h * 0.32 + i * h * 0.05 + ((s * 6) % (h * 0.05)); ctx.moveTo(0, y); ctx.bezierCurveTo(w * 0.3, y - 20, w * 0.7, y + 20, w, y - 10); ctx.stroke(); }
    } else {
      ctx.fillStyle = p[3]; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.55, w * (0.28 + 0.03 * Math.sin(s)), h * 0.2, -0.3 + 0.15 * Math.sin(s * 0.8), 0, 7); ctx.fill();
      ctx.fillStyle = p[2]; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(w * (0.66 + i * 0.05), h * (0.42 + i * 0.03), w * 0.05, h * 0.03, -0.9, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  };
  // Single canvas = One video. The number in data-film is the scene, and changing it swaps in a circle from the center in .85s (2D fallback — visible only when there is no WebGL version)
  site.film = (canvas) => {
    const ctx = canvas.getContext("2d"), f = { canvas, k: +canvas.dataset.film || 0, from: null, mix: 1 };
    f.set = (k) => { if (k === f.k) return; f.from = f.k; f.k = k; f.mix = 0; gsap.to(f, { mix: 1, duration: reduce ? 0 : 0.85, ease: "power1.inOut", overwrite: true }); };
    films.add(f);
    return f;
  };
  let filmT = 0;
  gsap.ticker.add((t) => {
    if (t - filmT < 1 / 30) return;
    filmT = t;
    films.forEach((f) => {
      if (!f.canvas.isConnected) return films.delete(f);
      const c = f.canvas, ctx = c.getContext("2d"), w = c.width, h = c.height;
      if (f.mix < 1 && f.from != null) {
        scene(ctx, w, h, f.from, t);
        ctx.save(); ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.hypot(w, h) * 0.6 * f.mix, 0, 7); ctx.clip();
        scene(ctx, w, h, f.k, t); ctx.restore();
      } else scene(ctx, w, h, f.k, t);
    });
  });
  $$("canvas[data-film]").forEach((c) => { c._film = site.film(c); });

  // Pass the source to the blurred video behind the screen
  const bg = document.querySelector(".gb-bg");
  // Parts attach after DOMContentLoaded, so calls made before then are deferred to the frame after attachment
  site.setBg = (canvas, instant) => {
    if (!bg || !canvas) return;
    const fire = () => bg.dispatchEvent(new CustomEvent("fx:source", { detail: { el: canvas, instant } }));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(fire), { once: true });
    else requestAnimationFrame(fire);
  };

  /* ---------- Film grain: overlay gray .5 ± .04 dots, 24 frames per second ---------- */
  const noise = document.querySelector(".gb-noise");
  if (noise && !reduce) {
    const tiles = [];
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const x = c.getContext("2d");
    for (let n = 0; n < 8; n++) {
      const img = x.createImageData(256, 256), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 0.08 * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      x.putImageData(img, 0, 0);
      tiles.push(`url(${c.toDataURL()})`);
    }
    let f = 0, nt = 0;
    gsap.ticker.add((t) => { if (t - nt < 1 / 24) return; nt = t; noise.style.backgroundImage = tiles[(f = (f + 1) % tiles.length)]; });
  }

  /* ---------- Contact panel: drops from above, header row is pushed and background darkens by .4 (.85 inOutQuint), closes 1.25× faster ---------- */
  const modal = document.getElementById("contact"), btn = document.querySelector(".js-contact"), header = document.querySelector(".gb-header"), veil = document.querySelector(".gb-veil");
  if (modal && btn) site.boot(() => {
    const sp = site.split($$(".js-modal-text, .gb-modal__title", modal));
    const words = sp ? sp.words : $$(".js-modal-text, .gb-modal__title", modal);
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.85, ease: "inOutQuint" } })
      .set(modal, { visibility: "visible" }, 0)
      .from(modal, { y: () => -modal.offsetHeight }, 0)
      .to(header, { y: () => modal.offsetHeight }, 0)
      .fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 0.4 }, 0)
      .from(words, { yPercent: 200, stagger: sp ? site.stagger(sp.lines, sp.words) : 0.05 }, 0)
      .from($$(".gb-modal__name", modal), { yPercent: 200, stagger: 0.1 }, 0)
      .from($$(".gb-modal__line", modal), { xPercent: -150, stagger: 0.1 }, 0);
    let open = false;
    const set = (v) => {
      if (v === open) return;
      open = v;
      btn.setAttribute("aria-expanded", String(v));
      modal.inert = !v;
      btn.classList.toggle("is-current", v);
      gsap.set(veil, { pointerEvents: v ? "auto" : "none" });
      if (v) { tl.timeScale(1).play(); site.lenis?.stop(); } else { tl.timeScale(1.25).reverse(); site.lenis?.start(); }
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); set(!open); });
    addEventListener("click", (e) => { if (open && !modal.contains(e.target)) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    const off = (e) => { if (open && !modal.contains(e.target)) set(false); };
    addEventListener("wheel", off, { passive: true });
    addEventListener("touchmove", off, { passive: true });
    site.modalOpen = () => open;
  });

  /* ---------- Entrance: on first visit after the loader, when arriving from within the site it goes straight in without the loader ---------- */
  const loader = document.querySelector(".gb-loader");
  const via = sessionStorage.getItem("gb-nav") === "1";
  sessionStorage.removeItem("gb-nav");
  site.ready = new Promise((res) => {
    if (!loader || via || reduce) { if (loader) gsap.set(loader, { autoAlpha: 0, pointerEvents: "none" }); res(); return; }
    loader.addEventListener("fx:done", () => res(), { once: true });
  });
  site.boot(() => {
    const sp = site.split($$(".js-nav-title, .js-nav-sub"));
    const navWords = sp ? [...sp.words, ...$$(".gb-header__link")] : $$(".gb-header__id span, .gb-header__link");
    gsap.set(navWords, site.hide());
    document.documentElement.classList.add("gb-on");
    site.ready.then(() => gsap.to(navWords, { ...D, ...site.show(), stagger: 0.05 }));
  });

  /* ---------- Transition: for internal links, the current text slides up and out (.85 inQuint), the cover is laid down, then navigation ---------- */
  site.leave = null;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || /^https?:/.test(href) || a.closest(".wf-ui")) return;
    e.preventDefault();
    sessionStorage.setItem("gb-nav", "1");
    const out = $$(".js-leave .st-word, .js-leave:not(:has(.st-word))");
    const go = () => { location.href = href; };
    if (reduce) return go();
    gsap.timeline({ onComplete: go })
      .to(out, { yPercent: -150, duration: 0.85, ease: "inQuint", stagger: 0.02 }, 0)
      .to(veil, { autoAlpha: 1, duration: 0.6, ease: "inOutQuint" }, 0.35);
  });
})();
