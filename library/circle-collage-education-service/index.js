// Home — shuffles hero piece positions, tilts and colors on every load (the original is random too), chains loader → hero → header order, and hooks up the color-card row (embla)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector(".nk-hero__main");
  const loader = document.querySelector(".nk-loader");
  const header = document.querySelector(".nk-header");
  const ticker = document.querySelector(".nk-hero__ticker");

  // Ranges exactly as the original functions — around(center, width) is within center±width, tilt(small, large) is ±(small to large) degrees
  const around = (c, w) => c - w + Math.random() * 2 * w;
  const tilt = (lo, hi) => (Math.random() < 0.5 ? -1 : 1) * (lo + Math.random() * (hi - lo));
  const pct = (v) => `${v.toFixed(2)}%`;
  const spSpot = (n) => (n === 0 ? { top: around(10, 2), left: around(10, 6) } : n === 1 ? { top: around(30, 2), left: around(10, 6) } : { bottom: around(20, 2), right: around(20, 10) });
  const put = (el, pc, sp, angle) => {
    if (!el) return;
    el.style.setProperty("--a", `${angle.toFixed(2)}deg`);
    for (const k of ["top", "bottom", "left", "right"]) {
      if (pc && pc[k] != null) el.style.setProperty(`--${k}`, pct(pc[k]));
      if (sp && sp[k] != null) el.style.setProperty(`--sp-${k}`, pct(sp[k]));
    }
    el.querySelector(".nk-hero__rot")?.style.setProperty("--a", `${angle.toFixed(2)}deg`);
  };
  // Five circle colors, five oval tags, five triangle tags — each section mixes the same numbers
  const DISC = ["--site-aqua", "--site-pink", "--site-yellow", "--site-green-lt", "--kf-raised"];
  const OVAL = ["--site-sun", "--site-mint", "--site-sky", "--site-lilac", "--site-orange"];
  const TRI = ["--site-orange", "--site-lilac", "--site-mint", "--site-sun", "--site-sky"];
  const order = [0, 1, 2, 3, 4];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  document.querySelectorAll(".nk-hero__slide").forEach((s, i) => {
    const n = order[i % 5];
    s.style.setProperty("--fx-disc", `var(${DISC[n]})`);
    s.style.setProperty("--kw1", `var(${OVAL[n]})`);
    s.style.setProperty("--kw2", `var(${TRI[n]})`);
    const left = Math.random() < 0.5, kw2Left = Math.random() < 0.5;
    const first = Math.random() < 0.5 ? 0 : 1, other = first === 0 ? 1 : 0;
    const sp = Math.random() < 0.5 ? [first, 2, other] : [2, first, other];
    const q = (k) => s.querySelector(`.nk-hero__${k}`);
    const thumbA = tilt(5, 15);
    put(q("thumb"), null, null, thumbA);
    put(q("title"), { top: around(20, 10), right: around(2, 3) }, { top: around(12, 4), right: around(7, 2) }, tilt(5, 15));
    put(q("sub"), { bottom: around(40, 4), left: around(8, 1) }, { bottom: around(15, 4), left: around(8, 2) }, thumbA);
    put(q("cat"), { bottom: around(25, 5), left: around(10, 5) }, { bottom: around(7, 4), left: around(8, 6) }, tilt(5, 15));
    put(q("kw1"), { top: around(15, 5), ...(left ? { left: around(22, 8) } : { right: around(22, 8) }) }, spSpot(sp[0]), tilt(5, 15));
    put(q("kw2"), { bottom: around(15, 5), ...(kw2Left ? { left: around(25, 5) } : { right: around(30, 5) }) }, spSpot(sp[1]), tilt(5, 15));
    put(q("emoji"), { top: around(10, 5), ...(left ? { right: around(22, 8) } : { left: around(22, 8) }) }, spSpot(sp[2]), tilt(5, 15));
  });

  // When the loader starts opening (after .4s) the hero bursts out, and after 1.2s the header and news lines come down and up over .9s
  const showChrome = () => {
    if (reduce) { header?.classList.remove("is-pending"); hero?.classList.remove("is-pending"); return; }
    if (header) { gsap.set(header, { y: "-100%", opacity: 0 }); header.classList.remove("is-pending"); gsap.to(header, { y: 0, opacity: 1, duration: 0.9, ease: "power2.out", clearProps: "transform,opacity" }); }
    if (ticker) { gsap.set(ticker, { y: "100%", opacity: 0 }); hero?.classList.remove("is-pending"); gsap.to(ticker, { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" }); }
  };
  hero?.classList.add("is-pending");
  hero?.addEventListener("fx:reveal", showChrome, { once: true });
  // On a second visit in a day it goes straight in without the loader (quick) — the part brings pieces in .4s earlier and grows the circle from .8x
  document.addEventListener("fx:play", (e) => {
    if (e.target !== loader || !hero) return;
    hero.dispatchEvent(new CustomEvent("fx:play", { detail: { quick: !!e.detail?.quick } }));
  });

  // Swatch card row — embla (start-aligned, drag to flip)
  document.querySelectorAll("[data-embla]").forEach((root) => {
    const box = root.closest(".nk-panel__slider");
    const prev = box.querySelector("[data-embla-prev]"), next = box.querySelector("[data-embla-next]");
    const api = EmblaCarousel(root, { align: "start", dragFree: false, containScroll: "trimSnaps", container: root.querySelector(".nk-embla__track") });
    // The original doesn’t disable the arrow buttons at the end (pressing does nothing)
    prev.addEventListener("click", () => api.scrollPrev());
    next.addEventListener("click", () => api.scrollNext());
  });
})();
