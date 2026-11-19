// First page: the column reel (wrap-column-reel) arranges the inside of the column when expanding and collapsing — growing the photo panel (Flip) · thumbnails coming in · swapping number and close ·
// Lower body lines rising · vertical scroll inside the pillar (lenis), and when the loader lifts the on-screen pillar turns on and the photo opens from the center
(() => {
  const reel = document.querySelector(".ag-reel");
  if (!reel) return;
  const { reduce } = window.ag;
  const wide = () => innerWidth >= 1000;
  const cols = [...reel.querySelectorAll(".ag-col")];
  const state = new Map();
  const D = (t) => (reduce ? 0 : t);

  cols.forEach((col) => {
    const media = [col.querySelector(".ag-col__media")];
    const thumbs = [...col.querySelectorAll(".ag-col__thumb")];
    const gallery = col.querySelector(".ag-col__gallery");
    const s = { media, thumbs, gallery, active: 0, lenis: null, split: null, tick: null, dragged: false, added: [] };
    state.set(col, s);
    gsap.set(media[0], { opacity: 1, scale: 1 });
    thumbs.forEach((t, i) => t.addEventListener("click", (e) => { e.stopPropagation(); if (!s.dragged) pick(col, i); }));
    // On phone the thumbnail row drags itself along, since the panel intercepts touches
    const ends = () => {
      gallery.classList.toggle("has-start", gallery.scrollLeft > 1);
      gallery.classList.toggle("has-end", gallery.scrollLeft + gallery.clientWidth < gallery.scrollWidth - 1);
    };
    gallery.addEventListener("scroll", ends);
    gallery.addEventListener("wheel", (e) => { if (innerWidth < 768) e.stopPropagation(); });
    gallery.addEventListener("pointerdown", (e) => {
      if (!col.classList.contains("is-open") || innerWidth >= 768 || gallery.scrollWidth <= gallery.clientWidth) return;
      e.stopPropagation();
      const x0 = e.clientX, left = gallery.scrollLeft;
      s.dragged = false;
      const move = (m) => { const d = m.clientX - x0; gallery.scrollLeft = left - d; ends(); if (Math.abs(d) > 5) s.dragged = true; };
      const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); setTimeout(() => (s.dragged = false)); };
      addEventListener("pointermove", move);
      addEventListener("pointerup", up);
      addEventListener("pointercancel", up);
    });
    new ResizeObserver(ends).observe(gallery);
  });

  // Pressing a thumbnail opens the large photo from 20% inset at 1.15x (1.25s expo.out) while color returns from black-and-white (1s, .1s later)
  function pick(col, i) {
    const s = state.get(col);
    if (i === s.active || !col.classList.contains("is-open")) return;
    const from = s.media[s.active], to = s.media[i];
    s.active = i;
    s.thumbs.forEach((t, k) => t.classList.toggle("is-active", k === i));
    const el = s.thumbs[i];
    if (s.gallery.scrollWidth > s.gallery.clientWidth) s.gallery.scrollTo({ left: el.offsetLeft + el.offsetWidth / 2 - s.gallery.clientWidth / 2, behavior: "smooth" });
    gsap.killTweensOf(s.media);
    gsap.set(from, { opacity: 0 });
    gsap.set(to, { willChange: "clip-path" });
    gsap.fromTo(to, { filter: "saturate(0)" }, { filter: "saturate(1)", duration: D(1), ease: "ag-smooth", delay: D(0.1), clearProps: "filter" });
    gsap.fromTo(to, { clipPath: "inset(20%)", opacity: 0, scale: 1.15 }, { clipPath: "inset(0%)", opacity: 1, scale: 1, duration: D(1.25), ease: "expo.out" });
  }

  // Like the original, attach the remaining large photos and the body below only when expanded, and detach after collapsing
  const attach = (col, s) => {
    const wrap = col.querySelector(".ag-col__wrap");
    const extra = [...col.querySelector(".ag-col__extra").content.cloneNode(true).children];
    const content = col.querySelector(".ag-col__more").content.firstElementChild.cloneNode(true);
    wrap.append(...extra);
    col.querySelector(".ag-col__inner").append(content);
    gsap.set(extra, { opacity: 0, scale: 1 });
    s.media = [s.media[0], ...extra];
    s.added = [...extra, content];
    return content;
  };
  const detach = (s) => { s.added.forEach((n) => n.remove()); s.added = []; s.media = [s.media[0]]; };

  reel.addEventListener("fx:open", (e) => {
    const col = e.detail.item, s = state.get(col);
    const wrap = col.querySelector(".ag-col__wrap");
    const flip = Flip.getState(wrap);
    col.classList.add("is-open");
    document.dispatchEvent(new CustomEvent("ag:open", { detail: { open: true } }));
    Flip.from(flip, { duration: D(0.75), ease: "expo.out" });

    clearTimeout(s.later);
    s.split?.revert();
    s.split = null;
    detach(s);
    const content = attach(col, s);
    s.split = window.ag.splitLines(content.querySelector(".ag-col__reveal"), 105);
    if (!reduce) gsap.to(s.split.lines, { yPercent: 0, duration: 0.85, ease: "expo", stagger: 0.085 });

    const close = col.querySelector(".ag-col__close"), cta = col.querySelector(".ag-col__cta"), index = col.querySelector(".ag-col__index");
    gsap.killTweensOf([s.thumbs, close, index]);
    gsap.set([close, cta], { yPercent: 100 });
    gsap.set(s.thumbs, { visibility: "visible", xPercent: wide() ? 150 : 0, yPercent: wide() ? 0 : -150 });
    gsap.to(s.thumbs, { duration: D(0.75), stagger: D(0.045), xPercent: 0, yPercent: 0, ease: "ag-smooth", force3D: true });
    gsap.to(close, { opacity: 1, duration: D(0.5), yPercent: 0, delay: D(0.25), ease: "ag-smooth" });
    gsap.to(cta, { opacity: 1, duration: D(0.5), yPercent: 0, delay: D(0.5), ease: "ag-smooth" });
    if (wide()) gsap.to(index, { opacity: 0, duration: D(0.5), yPercent: -100, delay: D(0.25), ease: "ag-smooth" });

    // Inside an expanded pillar, scrolling goes vertically down to the body below. Like the original, lenis is attached separately to the pillar. The ”Scroll” text fades as it scrolls
    const ctaText = cta.querySelector("span");
    s.lenis = new Lenis({ wrapper: col, content: col.querySelector(".ag-col__inner"), smoothWheel: true, syncTouch: true, lerp: reduce ? 1 : 0.1 });
    s.lenis.on("scroll", ({ scroll }) => { ctaText.style.opacity = String(1 - Math.min(1, scroll / (innerHeight * 0.8))); });
    s.tick = (t) => s.lenis?.raf(t * 1000);
    gsap.ticker.add(s.tick);
  });

  reel.addEventListener("fx:close", (e) => {
    const col = e.detail.item, s = state.get(col);
    const wrap = col.querySelector(".ag-col__wrap");
    const flip = Flip.getState(wrap);
    col.classList.remove("is-open");
    document.dispatchEvent(new CustomEvent("ag:open", { detail: { open: false } }));
    Flip.from(flip, { duration: D(0.75), ease: "expo.out" });

    s.active = 0;
    s.thumbs.forEach((t, k) => t.classList.toggle("is-active", k === 0));
    gsap.killTweensOf(s.media);
    gsap.set(s.media.slice(1), { opacity: 0, clipPath: "none" });
    gsap.to(s.media[0], { opacity: 1, scale: 1, clipPath: "none", duration: D(0.5) });

    const close = col.querySelector(".ag-col__close"), cta = col.querySelector(".ag-col__cta"), index = col.querySelector(".ag-col__index");
    const content = col.querySelector(".ag-col__content");
    gsap.killTweensOf([s.thumbs, close, index]);
    if (wide()) gsap.set(index, { yPercent: 100 });
    if (content) gsap.to(content, { opacity: 0, duration: D(0.35), ease: "ag-smooth" });
    if (wide()) gsap.to(index, { opacity: 1, duration: D(0.5), yPercent: 0, ease: "ag-smooth" });
    gsap.to(s.thumbs, { duration: D(0.75), stagger: D(0.045), xPercent: wide() ? 200 : 0, yPercent: wide() ? 0 : -200, ease: "ag-smooth", force3D: true });
    gsap.to(close, { opacity: 0, duration: D(0.5), yPercent: -100, ease: "ag-smooth" });
    gsap.to(cta, { opacity: 0, duration: D(0.2), ease: "ag-smooth" });

    const lenis = s.lenis;
    s.lenis = null;
    lenis?.scrollTo(0, { duration: D(0.35), lock: true });
    const tick = s.tick;
    s.later = setTimeout(() => {
      lenis?.destroy();
      gsap.ticker.remove(tick);
      col.scrollTop = 0;
      if (!col.classList.contains("is-open")) { s.split?.revert(); s.split = null; detach(s); }
    }, reduce ? 0 : 350);
  });

  // When the loader lifts, the pillars on screen switch on at .1s intervals (.75s) and the photo board opens from the center point (1.25s)
  document.addEventListener("fx:lift", () => {
    if (reduce) return;
    const seen = cols.filter((c) => c.classList.contains("is-fx-inview"));
    const wraps = seen.map((c) => c.querySelector(".ag-col__wrap"));
    gsap.set(seen, { opacity: 0 });
    gsap.set(wraps, { clipPath: "inset(50%)", willChange: "clip-path" });
    gsap.to(seen, { opacity: 1, stagger: 0.1, duration: 0.75, ease: "ag-smooth" });
    gsap.to(wraps, { clipPath: "inset(0%)", stagger: 0.1, duration: 1.25, ease: "ag-smooth", clearProps: "clipPath,willChange" });
  });
})();
