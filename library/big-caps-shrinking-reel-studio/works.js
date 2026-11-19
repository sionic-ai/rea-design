// Work list — original work grid: as each row enters the screen the cells rise from below in sequence (.9s power3.out .12 stagger), photo parallax is shared
// Filmstrip view (original Filmstrip): when the mouse moves over the strip, it flows left by cursor position ratio × one set width (.6s power2.out),
// A large preview follows the cursor x (.16s power2.out, stops 12px inside both ends · appears from .94x over .24s · disappears to .97x over .2s)
(() => {
  const TW = window.TW, { q, qa } = TW;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const film = (strip) => {
    const track = q(".tw-film-track", strip), scroller = q(".tw-film-scroller", strip), pre = q(".tw-film-pre", strip);
    const base = [...track.children];
    // As in the original, one set is joined past 4000px — so the strip never empties even when scrolled to the end
    const copies = Math.max(2, Math.ceil(4000 / (132 * base.length)));
    for (let i = 1; i < copies; i++) base.forEach((t) => { const c = t.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.tabIndex = -1; track.append(c); });
    let set = 0;
    const measure = () => { const a = base[0], b = base[base.length - 1]; set = b.offsetLeft + b.offsetWidth - a.offsetLeft; };
    strip.twMeasure = measure;
    addEventListener("resize", measure);

    if (matchMedia("(hover: none) and (pointer: coarse)").matches) {
      // Touch: the original is a strip you swipe with a finger — it starts at one set width and, on reaching the end, rewinds by one set to loop endlessly
      let busy = false;
      strip.twMeasure = () => { measure(); if (set > 0) scroller.scrollLeft = set; };
      scroller.addEventListener("scroll", () => {
        if (busy || set <= 0) return;
        const hi = Math.min(scroller.scrollWidth - scroller.clientWidth, 1.5 * set);
        const jump = scroller.scrollLeft >= hi ? -set : scroller.scrollLeft <= -0.5 * set ? set : 0;
        if (!jump) return;
        busy = true; scroller.scrollLeft += jump;
        requestAnimationFrame(() => { busy = false; });
      }, { passive: true });
      return;
    }
    if (TW.reduce) return;

    const toTrack = gsap.quickTo(track, "x", { duration: 0.6, ease: "power2.out" });
    const toPre = gsap.quickTo(pre, "x", { duration: 0.16, ease: "power2.out" });
    gsap.set(pre, { xPercent: -50, yPercent: -50 });
    let shown = false, tone = "";
    const show = (tile) => {
      const t = String(([...track.children].indexOf(tile) % base.length) % 4 + 1);
      if (t !== tone) { tone = t; pre.dataset.tone = t; pre.style.aspectRatio = getComputedStyle(tile).aspectRatio; }
      if (shown) return;
      shown = true;
      gsap.fromTo(pre, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.24, ease: "power2.out", overwrite: "auto" });
    };
    const hide = () => { if (!shown) return; shown = false; gsap.to(pre, { autoAlpha: 0, scale: 0.97, duration: 0.2, ease: "power2.out", overwrite: "auto" }); };
    strip.addEventListener("mousemove", (e) => {
      const r = strip.getBoundingClientRect(), x = e.clientX - r.left;
      const half = pre.offsetWidth / 2, lo = half + 12, hi = r.width - half - 12;
      const px = hi <= lo ? r.width / 2 : clamp(x, lo, hi);
      shown ? toPre(px) : gsap.set(pre, { x: px });
      // Since the mouse passes over cells flowing with the band, the cell is re-picked as the element under the cursor
      const tile = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-film-tile]");
      tile && strip.contains(tile) ? show(tile) : hide();
      if (set > 0) toTrack(-(set * clamp(x / r.width, 0, 1)));
    });
    strip.addEventListener("mouseleave", hide);
  };

  TW.start(() => {
    const cards = qa(".tw-work-card");
    if (!TW.reduce) cards.forEach((c, i) => gsap.from(c, { y: 60, autoAlpha: 0, duration: 0.9, delay: (i % 3) * 0.12, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 90%", once: true } }));

    const views = q(".tw-work-views"), grid = q(".tw-work-grid"), filmEl = q(".tw-film"), bar = q(".tw-view");
    if (!views || !filmEl || !bar) return;
    const strips = qa(".tw-film-strip", filmEl);
    strips.forEach(film);
    let view = "grid";
    const apply = (v) => {
      view = v;
      bar.dataset.view = v;
      qa(".tw-view-btn", bar).forEach((b) => { const on = b.dataset.view === v; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); });
      grid.hidden = v !== "grid";
      filmEl.hidden = v !== "film";
      strips.forEach((s) => s.twMeasure());
      // If the title is off screen, moves it to the head of the changed view (112px above)
      if (q(".tw-page-t").getBoundingClientRect().bottom <= 0) {
        const y = views.getBoundingClientRect().top + scrollY - 112;
        TW.lenis ? TW.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
      }
      ScrollTrigger.refresh();
    };
    bar.addEventListener("click", (e) => {
      const v = e.target.closest(".tw-view-btn")?.dataset.view;
      if (!v || v === view) return;
      if (TW.reduce) { apply(v); return; }
      gsap.to(views, { opacity: 0, duration: 0.2, ease: "power2.out", onComplete: () => { apply(v); gsap.fromTo(views, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }); } });
    });
  });
})();
