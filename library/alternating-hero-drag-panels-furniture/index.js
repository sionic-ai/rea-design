// First page — hero slide advance (starts when loader ends, 2s crossfade every 6s, back photo scales 1.1x over 7s), prev·next·page numbers for three horizontal panels
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Hero */
  const slides = [...document.querySelectorAll(".sg-kv__slide")];
  const zoom = (slide, on) => {
    // Like the original, only photo sections move closer — video sections (wf-video) stay as they are
    const img = slide?.querySelector(".sg-kv__rear .wf-img:not(.wf-video)");
    if (!img) return;
    img.style.transition = "none";
    img.style.transform = "scale(1)";
    if (on && !reduce) requestAnimationFrame(() => requestAnimationFrame(() => { img.style.transition = "transform 7s linear"; img.style.transform = "scale(1.1)"; }));
  };
  let cur = 0;
  const next = () => {
    const prev = cur;
    cur = (cur + 1) % slides.length;
    zoom(slides[cur], true);
    slides[cur].style.zIndex = "2";
    slides[prev].style.zIndex = "1";
    slides[prev].classList.remove("is-active");
    slides[cur].classList.add("is-active");
    setTimeout(() => zoom(slides[prev], false), 2100);
    setTimeout(next, 6000);
  };
  const start = () => {
    if (!slides.length) return;
    zoom(slides[0], true);
    slides[0].style.zIndex = "2";
    slides[0].classList.add("is-active");
    if (!reduce) setTimeout(next, 6000);
  };
  if (window.sgLoaded) start();
  else {
    let ran = false;
    const once = () => { if (!ran) { ran = true; start(); } };
    document.addEventListener("loading:finished", once, { once: true });
    setTimeout(once, 10000);
  }

  /* ── Horizontal panel: finds the nearest slot and writes its number, prev and next scrollTo that slot smoothly. End padding is extended so the last slot also sticks to the left */
  const strip = ({ track, items, now, prev, nextBtn, offset = 0, endVar, lastRight = false }) => {
    if (!track || !items.length) return;
    const closest = () => {
      const base = track.getBoundingClientRect().left + offset;
      let best = 0, d = Infinity;
      items.forEach((it, i) => { const r = it.getBoundingClientRect(); const dd = lastRight && i === items.length - 1 ? Math.abs(r.right - track.getBoundingClientRect().right) : Math.abs(r.left - base); if (dd < d) { d = dd; best = i; } });
      return best;
    };
    const leftOf = (it) => track.scrollLeft + it.getBoundingClientRect().left - track.getBoundingClientRect().left - offset;
    const ensure = (it) => {
      if (!endVar || !it) return;
      const max = track.scrollWidth - track.clientWidth, miss = Math.max(0, leftOf(it) - max);
      if (miss > 0) track.style.setProperty(endVar, `${Math.ceil((parseFloat(getComputedStyle(track).getPropertyValue(endVar)) || 0) + miss)}px`);
    };
    const update = () => {
      const i = closest();
      if (now) now.textContent = String(i + 1).padStart(2, "0");
      const max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = max <= 0 || track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = max <= 0 || track.scrollLeft >= max - 2;
    };
    const go = (d) => {
      const i = Math.min(Math.max(closest() + d, 0), items.length - 1);
      ensure(items[i]);
      const max = track.scrollWidth - track.clientWidth;
      track.scrollTo({ left: Math.min(Math.max(leftOf(items[i]), 0), max), behavior: reduce ? "auto" : "smooth" });
    };
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    prev?.addEventListener("click", () => go(-1));
    nextBtn?.addEventListener("click", () => go(1));
    addEventListener("resize", () => { ensure(items[items.length - 1]); requestAnimationFrame(update); });
    addEventListener("load", () => { ensure(items[items.length - 1]); update(); });
    ensure(items[items.length - 1]);
    update();
  };

  const feat = document.querySelector(".sg-feat");
  if (feat) strip({
    track: feat.querySelector(".sg-feat__track"), items: [...feat.querySelectorAll(".sg-feat__slide")],
    now: feat.querySelector(".sg-count .now"), prev: feat.querySelector(".is-prev"), nextBtn: feat.querySelector(".is-next"), offset: 4, endVar: "--features-end-space",
  });
  const arr = document.querySelector(".sg-arrival");
  if (arr) {
    const sp = matchMedia("(max-width: 780px)");
    const pick = () => sp.matches
      ? { track: arr.querySelector(".sg-arrival__items"), items: [...arr.querySelectorAll(".sg-arrival__item")] }
      : { track: arr.querySelector(".sg-arrival__track"), items: [arr.querySelector(".sg-arrival__cover"), ...arr.querySelectorAll(".sg-arrival__item")] };
    strip({ ...pick(), prev: arr.querySelector(".is-prev"), nextBtn: arr.querySelector(".is-next"), offset: 0, lastRight: true });
  }
  const cs = document.querySelector(".sg-case");
  if (cs) strip({
    track: cs.querySelector(".sg-case__track"), items: [...cs.querySelectorAll(".sg-case__slide")],
    now: cs.querySelector(".sg-count .now"), prev: cs.querySelector(".is-prev"), nextBtn: cs.querySelector(".is-next"), endVar: "--case-end-space",
  });
})();
