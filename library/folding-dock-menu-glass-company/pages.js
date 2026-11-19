/* folding-dock-menu-glass-company section motion — shared.js calls it inside gsap.context each time a section opens, and reverts it when moving on */
window.fgPage = (root, { reduce, touch, mobile, setCursor }) => {
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const scrub = (trigger, start, end) => ({ scrollTrigger: { trigger, start, end, scrub: true }, defaults: { ease: "none" }, paused: true });
  const rem = innerWidth / (mobile ? 37.5 : 160);

  // Line characters: when visible, yPercent 200 → 0 (.1 stagger, 1.5s power3.out)
  $$(".fg-lines").forEach((el) => {
    const lines = el.querySelectorAll(".ln > span");
    if (reduce) return;
    gsap.set(lines, { yPercent: 200 });
    gsap.to(lines, { yPercent: 0, stagger: 0.1, duration: 1.5, delay: +(el.dataset.delay || 0), ease: "power3.out", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top" } });
  });
  if (reduce) return;

  // Hero top: text disappears (.1) and the background drops 50%
  const hh = $(".fg-home-head");
  if (hh) gsap.timeline(scrub(hh, "top top", "bottom top")).fromTo(hh.querySelector(".row1 .fg-h1"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0).fromTo(hh.querySelector(".bgv .asset"), { yPercent: 0 }, { yPercent: 50 }, 0);

  // Product collection: second 50 → 0, third −50 → 0 · hover scales 1.1x over 1s / release takes 2s
  const pc = $(".fg-products");
  if (pc) {
    const b = pc.querySelectorAll(".block");
    gsap.timeline(scrub(pc, "top bottom", "bottom top")).fromTo(b[1], { yPercent: 50 }, { yPercent: 0 }, 0).fromTo(b[2], { yPercent: -50 }, { yPercent: 0 }, 0);
    b.forEach((blk) => {
      const im = blk.querySelector(".wf-img");
      blk.addEventListener("mouseenter", () => { if (touch) return; setCursor(1, blk.dataset.cursor || "View"); gsap.to(im, { scale: 1.1, duration: 1, ease: "power3.out" }); });
      blk.addEventListener("mouseleave", () => { if (touch) return; setCursor(0); gsap.to(im, { scale: 1, duration: 2, ease: "power3.out" }); });
    });
  }

  // Showroom: while pinned, the side text moves from ±6.5rem to 0, the line from 0 to 1, and the photo from .55x/.7 to 1x/.3
  const sr = $(".fg-showroom");
  if (sr) {
    const U = innerWidth / 1600;
    gsap.timeline(scrub(sr, "top top", "bottom bottom"))
      .fromTo(sr.querySelector(".col1"), { x: U * 65 }, { x: 0 }, 0)
      .fromTo(sr.querySelector(".col2"), { x: -U * 65 }, { x: 0 }, 0)
      .fromTo(sr.querySelector(".border"), { scaleX: 0 }, { scaleX: 1 }, 0)
      .fromTo(sr.querySelector(".media"), { opacity: 0.7, scale: 0.55 }, { opacity: 0.3, scale: 1 }, 0);
  }

  // Featured Work row: preview photo at the row’s vertical center
  $$(".fg-featured .project").forEach((p) => {
    const peek = p.querySelector(".peek");
    // Preview photo scales 1.1 → 1 over 1s power3.out when it turns on (measured original curve: 1.1 on the first frame, then shrinking)
    p.addEventListener("mouseenter", () => { if (!touch) gsap.fromTo(peek.querySelector(".wf-img"), { scale: 1.1 }, { scale: 1, duration: 1, ease: "power3.out" }); });
  });

  // Two photos: the shorter one drops down by the cell height difference
  $$(".fg-duo").forEach((d) => {
    const blocks = [...d.querySelectorAll(".block")];
    const box = d.querySelector(".container");
    const fit = () => blocks.forEach((b) => {
      const gap = box.clientHeight - b.clientHeight;
      if (gap > 1) gsap.fromTo(b.firstElementChild, { y: 0 }, { y: gap, ease: "none", overwrite: true, scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
    requestAnimationFrame(fit);
  });

  // Two review rows: slide count × 6s (min 18), left row −50 → 0, right row 0 → −50, the hovered row pauses.
  $$(".fg-reviews .row").forEach((row, i) => {
    const track = row.querySelector(".track");
    const n = row.querySelectorAll(".set:first-child .item").length;
    const tw = gsap.fromTo(track, { xPercent: i ? 0 : -50 }, { xPercent: i ? -50 : 0, duration: Math.max(18, n * 6), ease: "none", repeat: -1 });
    row.addEventListener("mouseenter", () => tw.pause());
    row.addEventListener("mouseleave", () => tw.resume());
  });

  // Line drawing: drawn while entering, erased while leaving (scrub)
  $$("[data-draw]").forEach((svg) => {
    const paths = svg.querySelectorAll("path, line, polyline, rect, circle");
    if (svg.dataset.draw === "head") gsap.timeline(scrub(svg.closest("section"), "top top", "bottom top")).fromTo(paths, { drawSVG: "25%" }, { drawSVG: "100%" });
    else gsap.timeline(scrub(svg.closest("section"), "top bottom", "bottom top")).fromTo(paths, { drawSVG: "0%" }, { drawSVG: "-100%" }).fromTo(paths, { drawSVG: "100%" }, { drawSVG: "-0%" });
  });

  // Drag strip (Embla): team and product carousel
  $$("[data-embla]").forEach((sec) => {
    const vp = sec.querySelector(".viewport");
    if (!vp || !window.EmblaCarousel) return;
    const api = EmblaCarousel(vp, { align: "start", dragFree: sec.dataset.embla === "free", containScroll: "trimSnaps" });
    const [prev, next] = sec.querySelectorAll(".fg-arrows button");
    prev?.addEventListener("click", () => api.scrollPrev());
    next?.addEventListener("click", () => api.scrollNext());
    vp.addEventListener("mouseenter", () => setCursor(1, "Drag"));
    vp.addEventListener("mouseleave", () => setCursor(0));
    return () => api.destroy();
  });

  // Arrow button (team · carousel): the arrow exits to the right (.5 power3.in) then re-enters from the left (.5 power3.out). Not re-triggered while running — the original has none on slider buttons
  $$(".fg-arrows button").forEach((b) => {
    const svg = b.querySelector("svg");
    let busy = false;
    b.addEventListener("mouseenter", () => {
      if (touch || busy || !svg) return;
      busy = true;
      gsap.set(svg, { xPercent: 0, overwrite: true });
      gsap.to(svg, { xPercent: 200, duration: 0.5, ease: "power3.in", onComplete: () => { gsap.set(svg, { xPercent: -200 }); gsap.to(svg, { xPercent: 0, duration: 0.5, ease: "power3.out", onComplete: () => (busy = false) }); } });
    });
  });

  // Award strip: moves left at 80px per second, finished cells wrap back to the end
  $$(".fg-awards .blocks").forEach((wrap) => {
    const blocks = [...wrap.querySelectorAll(".block")];
    if (!blocks.length) return;
    const w = blocks[0].offsetWidth;
    const total = w * blocks.length;
    blocks.forEach((b, i) => gsap.set(b, { x: i * w }));
    gsap.timeline({ repeat: -1, defaults: { ease: "none" } }).to(blocks, { x: `-=${total}`, duration: total / 80, modifiers: { x: (x) => `${gsap.utils.wrap(-w, total - w, parseFloat(x))}px` } });
  });

  // Slider: next when the 5s bar fills, photos change overlapping each other by .5, text shifts ±50%, background scrolls 50%
  $$(".fg-slider").forEach((sl) => {
    const slides = [...sl.querySelectorAll(".slide")], shots = [...sl.querySelectorAll(".shot")];
    const bar = sl.querySelector(".progress i"), count = sl.querySelector(".count b");
    const N = slides.length;
    let i = 0, lock = false, run;
    gsap.set(slides[0], { autoAlpha: 1 }); gsap.set(shots, { autoAlpha: 0 }); gsap.set(shots[0], { autoAlpha: 1 });
    const tick = () => { run?.kill(); run = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 5, ease: "linear", onComplete: () => go(1) }); };
    const go = (dir) => {
      if (lock) return;
      lock = true;
      const from = i, to = (i + dir + N) % N;
      i = to;
      count.textContent = String(to + 1).padStart(2, "0");
      const r = { duration: 1, ease: "power3.inOut" };
      gsap.fromTo(shots[from], { autoAlpha: 1 }, { autoAlpha: 0, ...r });
      gsap.fromTo(shots[to], { autoAlpha: 0 }, { delay: 0.5, autoAlpha: 1, ...r });
      gsap.fromTo(slides[from], { autoAlpha: 1, xPercent: 0 }, { autoAlpha: 0, xPercent: dir === -1 ? 50 : -50, ...r });
      gsap.fromTo(slides[to], { autoAlpha: 1, xPercent: dir === -1 ? -100 : 100 }, { xPercent: 0, ...r, onComplete: () => { lock = false; } });
      tick();
    };
    const [prev, next] = sl.querySelectorAll(".nav button");
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    sl.querySelector(".bgw").addEventListener("mouseenter", () => setCursor(1, "View"));
    sl.querySelector(".bgw").addEventListener("mouseleave", () => setCursor(0));
    gsap.timeline(scrub(sl, "top top", "bottom top")).fromTo(sl.querySelector(".bgw"), { yPercent: 0 }, { yPercent: 50 });
    tick();
  });

  // Filter buttons · work list entrance (.1 stagger 1s power3.out)
  $$(".fg-projects, .fg-overview").forEach((sec) => {
    const tabs = sec.querySelectorAll(".fg-tab[data-filter]");
    const items = [...sec.querySelectorAll("[data-cat]")];
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => x.classList.toggle("is-active", x === t));
      const f = t.dataset.filter;
      const show = items.filter((it) => f === "all" || it.dataset.cat === f);
      items.forEach((it) => (it.style.display = show.includes(it) ? "" : "none"));
      if (sec.classList.contains("fg-projects")) gsap.fromTo(show, { yPercent: 10, autoAlpha: 0 }, { yPercent: 0, duration: 1, autoAlpha: 1, stagger: 0.1, overwrite: true, ease: "power3.out" });
      else { const tgt = sec.querySelector(`.cat[data-cat="${f}"]`); if (tgt) window.fgLenis ? fgLenis.scrollTo(tgt, { offset: -120 }) : tgt.scrollIntoView(); }
      ScrollTrigger.refresh();
    }));
  });

  // Collection list: the button for the category now passing is lit
  $$(".fg-overview").forEach((sec) => {
    const tabs = [...sec.querySelectorAll(".fg-tab[data-filter]")];
    sec.querySelectorAll(".cat").forEach((cat) => {
      const on = () => tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.filter === cat.dataset.cat));
      ScrollTrigger.create({ trigger: cat, start: "top 50%", end: "bottom 50%", onEnter: on, onEnterBack: on });
    });
  });

  // Detail tabs · question expand (.5s ease-in-out)
  $$(".fg-tabs").forEach((tb) => {
    const btns = tb.querySelectorAll(".list button"), blocks = tb.querySelectorAll(".block");
    btns.forEach((b, k) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("is-active", x === b));
      blocks.forEach((x, j) => x.classList.toggle("is-visible", j === k));
      ScrollTrigger.refresh();
    }));
  });
  $$(".fg-faq .block").forEach((bl) => {
    const a = bl.querySelector(".a");
    bl.querySelector("button").addEventListener("click", () => {
      const open = bl.classList.toggle("is-expanded");
      gsap.to(a, { height: open ? "auto" : 0, duration: 0.5, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
  });
  $$(".fg-video").forEach((v) => {
    v.querySelector(".play").addEventListener("click", () => { v.classList.add("is-playing"); v.querySelector("video").play().catch(() => {}); });
  });
};
