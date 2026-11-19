// Case page: smooth scroll (Lenis 1.3.25) · hero glass text · scroll-down button · gallery plate tilt and scene change · header hidden on phone
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = reduce ? null : new Lenis({ lerp: 0.1, smoothWheel: true });
  if (lenis) { gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }

  // Glass text: uses the Hero video as the backdrop, and the glass forms over 1.4s once the font arrives
  const host = document.querySelector("[data-glass-word]");
  const video = document.querySelector("[data-hero-video]");
  if (host && video && window.alGlassWord) {
    const font = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-script").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display").trim();
    const g = window.alGlassWord(host, { word: host.dataset.word, back: video, font });
    // Original sequence (loader record out 1.7s · hold .87s · in 1.9s): when the hero video arrives it brightens evenly over 1.6s, holds for .9s, then glass letters form over 1.9s
    const box = video.parentElement;
    let started = false;
    const start = () => { if (started) return; started = true; box.classList.add("is-ready"); g?.show(1.6); document.fonts.ready.then(() => setTimeout(() => g?.reveal(1.9), reduce ? 0 : 2500)); };
    if (video.readyState >= 2) start(); else { video.addEventListener("loadeddata", start, { once: true }); setTimeout(start, 3000); }
  }

  document.querySelector("[data-cue]")?.addEventListener("click", () => {
    const to = document.querySelector(".al-case__main");
    if (lenis) lenis.scrollTo(to, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else to.scrollIntoView();
  });

  // Gallery panel: tilts up to ±4° depending on the interaction position and a light smudge follows (.08 each step)
  const stage = document.querySelector("[data-stage-tilt]");
  if (stage && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const t = { x: 0, y: 0, tx: 0, ty: 0, sx: 50, sy: 38, tsx: 50, tsy: 38 };
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      t.tx = (u - 0.5) * 8; t.ty = -(v - 0.5) * 8; t.tsx = u * 100; t.tsy = v * 100;
    });
    stage.addEventListener("pointerleave", () => { t.tx = t.ty = 0; t.tsx = 50; t.tsy = 38; });
    gsap.ticker.add(() => {
      t.x += (t.tx - t.x) * 0.08; t.y += (t.ty - t.y) * 0.08; t.sx += (t.tsx - t.sx) * 0.08; t.sy += (t.tsy - t.sy) * 0.08;
      stage.style.setProperty("--ry", `${t.x.toFixed(2)}deg`); stage.style.setProperty("--rx", `${t.y.toFixed(2)}deg`);
      stage.style.setProperty("--sx", `${t.sx.toFixed(1)}%`); stage.style.setProperty("--sy", `${t.sy.toFixed(1)}%`);
    });
  }
  // Tapping a thumbnail covers the screen with a new scene over .48s and the previous scene disappears
  const thumbs = [...document.querySelectorAll("[data-thumb]")];
  thumbs.forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active") || !stage) return;
    const was = thumbs.find((x) => x.classList.contains("is-active"));
    thumbs.forEach((x) => x.classList.toggle("is-active", x === b));
    // If the small image points to the same video, the panel stays and only the selected mark moves (the original’s two Watch)
    if (was && b.dataset.media && was.dataset.media === b.dataset.media) return;
    const old = stage.querySelector("[data-layer].is-in");
    const layer = document.createElement("div");
    layer.className = "al-gallery__layer is-in";
    layer.dataset.layer = "";
    layer.innerHTML = `<div class="wf-img al-gallery__img" data-label="${b.querySelector(".wf-img").dataset.label} · 16:9"></div>`;
    old?.classList.replace("is-in", "is-out");
    stage.prepend(layer);
    setTimeout(() => old?.remove(), 480);
  }));

  // Clicking a card on another Work board jumps straight to that case instead of flying in (original onSelect)
  document.querySelector(".al-related__lattice")?.addEventListener("fx:open", (e) => e.detail.href && window.alVeilTo?.(e.detail.href));

  // Phone: header hides upward on scroll down and shows again on scroll up (.35s)
  const hud = document.querySelector(".al-hud");
  let lastY = 0;
  addEventListener("scroll", () => {
    if (!matchMedia("(width <= 768px)").matches) return;
    const y = scrollY;
    hud.classList.toggle("is-hidden", y > lastY && y > 80);
    lastY = y;
  }, { passive: true });
})();
