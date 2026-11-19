// First page: bean-shaped photo strip (pauses 2.4s at center → moves 1.5s cubic-bezier(.65,0,.35,1), first pause .8s),
// Photo window band (half the loop width in 120s + Lenis speed × 60 × .3, capped at ±200px/s), parallax.
(() => {
  const { reduced } = window.TK;

  // With a seed random, the photo with the same number always has the same shape — so shapes don’t jump on rewind
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const blobMask = (seed, w, h) => {
    const r = rng(seed * 7919 + 13);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
    const amp = [0.05 + r() * 0.04, 0.03 + r() * 0.03, 0.015 + r() * 0.015];
    const pts = [];
    const N = 220;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      // Three large undulations + edge fuzz (±.6%)
      const k = 0.94 + amp[0] * Math.sin(a * 2 + ph[0]) + amp[1] * Math.sin(a * 3 + ph[1]) + amp[2] * Math.sin(a * 5 + ph[2]) + (r() - 0.5) * 0.012;
      pts.push(`${(w / 2 + Math.cos(a) * (w / 2) * k).toFixed(1)},${(h / 2 + Math.sin(a) * (h / 2) * k).toFixed(1)}`);
    }
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'><path d='M${pts.join("L")}Z'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };
  document.querySelectorAll("[data-shape]").forEach((el) => {
    const img = el.querySelector(".wf-img");
    const m = blobMask(+el.dataset.shape + 1, 620, 570);
    img.style.webkitMaskImage = m;
    img.style.maskImage = m;
  });

  // ---------- Hero photo strip ----------
  const slider = document.querySelector(".hm-fv__slider");
  const track = slider.querySelector(".hm-fv__track");
  const items = [...track.children];
  const PREPEND = 1;
  const REAL = (items.length - PREPEND) / 2;
  const PAUSE = 2400, FIRST = 800, SLIDE = 1500;
  let index = PREPEND;
  let timer = null;
  const offset = (i) => slider.offsetWidth / 2 - (items[i].offsetLeft + items[i].offsetWidth / 2);
  const goTo = (i, ms = SLIDE) => {
    track.style.transition = ms > 0 ? `transform ${ms}ms cubic-bezier(.65,0,.35,1)` : "none";
    track.style.transform = `translateX(${offset(i)}px)`;
  };
  const next = () => {
    index++;
    goTo(index);
    if (index >= PREPEND + REAL) setTimeout(() => goTo((index = PREPEND), 0), SLIDE);
  };
  goTo(index, 0);
  const reveal = () => {
    requestAnimationFrame(() => slider.classList.add("is-init"));
    if (reduced) return;
    setTimeout(() => {
      next();
      timer = setInterval(next, PAUSE + SLIDE);
    }, FIRST + SLIDE);
  };
  TK.loaderActive() ? document.addEventListener("tk:loaderHidden", reveal, { once: true }) : reveal();
  addEventListener("load", () => goTo(index, 0));
  let raf = null;
  addEventListener("resize", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { goTo(index, 300); raf = null; });
  });

  // ---------- Photo window band ----------
  const mid = document.querySelector(".hm-mid__track");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    let half = mid.scrollWidth / 2;
    let pos = 0;
    const measure = () => (half = mid.scrollWidth / 2);
    addEventListener("resize", measure);
    addEventListener("load", measure);
    const tick = (time, dt) => {
      if (half <= 0) return;
      const v = TK.lenis ? TK.lenis.velocity : 0;
      const extra = Math.max(-200, Math.min(200, v * 60 * 0.3));
      pos = ((pos + (half / 120 + extra) * (dt / 1000)) % half + half) % half;
      mid.style.transform = `translateX(${-pos}px)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("resize", measure);
      mid.style.transform = "";
    };
  });

  TK.parallax();
})();
