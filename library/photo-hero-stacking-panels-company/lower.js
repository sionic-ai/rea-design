// Subpage only: timeline line drawing, featured work rows, photo strip, detail photos (all splide 4.1.4 like the original), recruitment guidelines expand.
// Original values: line 1.3s cubic-bezier(.87,0,.13,1) · expand .5s cubic-bezier(.55,.05,.22,.99)
(() => {
  window.BA.ready.then(() => {
    document.querySelectorAll(".ab-tl li").forEach((li) =>
      ScrollTrigger.create({ trigger: li, start: "top 85%", once: true, onEnter: () => li.classList.add("is-in") })
    );
  });

  // Recruiting header photos: each one drifts upward at a different speed
  window.BA.mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-speed]").forEach((el) =>
      gsap.to(el, { y: () => +el.dataset.speed * innerHeight, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
    );
  });

  const S = window.Splide;
  const pc = matchMedia("(min-width: 1024px)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  // Featured results row (original CaseCarousel) — splide slide · 1s cubic-bezier(.16,1,.3,1) · two 43rem cards · 4rem gap · the empty space on both sides ((100vw - 90rem)/2) is where the arrows go.
  //   Hovering an arrow attaches a PREV·NEXT pill 20px to the lower right of the pointer, trailing 18% of the remaining distance each frame
  document.querySelectorAll("[data-case-carousel]").forEach((el) => {
    if (!S) return;
    const sp = new S(el, {
      type: "slide", speed: 1000, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fixedWidth: "43rem", perPage: 2, perMove: 1, gap: "4rem",
      arrows: true, pagination: false, padding: "calc((100vw - 90rem) / 2)",
      breakpoints: { 1023: { fixedWidth: "31.5rem", perPage: 1, gap: "1.5rem", padding: { left: "1.5rem", right: "1.5rem" } } },
    });
    const bar = document.createElement("div");
    bar.className = "pick__bar";
    bar.innerHTML = "<i></i>";
    el.after(bar);
    const sync = () => {
      const end = sp.Components.Controller.getEnd();
      bar.style.setProperty("--current", sp.index);
      bar.style.setProperty("--total", end + 1);
      el.classList.toggle("is-prev-available", sp.index > 0);
      el.classList.toggle("is-next-available", sp.index < end);
    };
    sp.on("mounted move", sync);
    sp.mount();
    if (!fine.matches) return;
    const cur = document.createElement("div");
    cur.className = "pick__cursor";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<span class="pick__cursor-in"><span class="pick__cursor-clip"><span class="pick__cursor-text"></span></span></span>';
    document.body.append(cur);
    const label = cur.querySelector(".pick__cursor-text");
    const to = { x: 0, y: 0 }, at = { x: 0, y: 0 };
    let has = false, raf = 0, last = null;
    const put = (x, y) => (cur.style.transform = `translate3d(${x + 20}px, ${y + 20}px, 0) translate(-50%, -50%)`);
    const follow = (t) => {
      const k = 1 - Math.pow(1 - 0.18, last === null ? 1 : Math.min((t - last) / (1000 / 60), 4));
      const dx = to.x - at.x, dy = to.y - at.y;
      at.x += dx * k; at.y += dy * k; last = t;
      put(at.x, at.y);
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) raf = requestAnimationFrame(follow);
      else { at.x = to.x; at.y = to.y; put(at.x, at.y); raf = 0; last = null; }
    };
    addEventListener("mousemove", (e) => {
      to.x = e.clientX; to.y = e.clientY;
      if (!has) { at.x = to.x; at.y = to.y; put(at.x, at.y); has = true; return; }
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    [[".splide__arrow--prev", "PREV"], [".splide__arrow--next", "NEXT"]].forEach(([q, t]) => {
      const a = el.querySelector(q);
      if (!a) return;
      a.addEventListener("mouseenter", () => { if (a.disabled) return; label.textContent = t; cur.classList.add("is-active"); });
      a.addEventListener("mouseleave", () => cur.classList.remove("is-active", "is-pressed"));
      a.addEventListener("pointerdown", () => { cur.classList.remove("is-pressed"); void cur.offsetWidth; cur.classList.add("is-pressed"); });
    });
    sp.on("moved", () => el.querySelectorAll(".splide__arrow").forEach((a) => a.disabled && a.matches(":hover") && cur.classList.remove("is-active", "is-pressed")));
  });

  // Photo strip (original LoopGallery) — splide loop · free drag (flickPower 200) · photo-width slides · 8rem (phone 2.5rem) gap.
  //   Without interaction it flows left at 20px per second (gaps over 50ms between frames are not counted), and on wide screens the strip is pushed another 160px while passing (scrub .6).
  //   The photo is wider than the cell, so it flows in the opposite direction by as much as the cell crosses the screen
  const timeScroll = (speed) => (splide, C) => {
    let raf = 0, last = null, hold = false;
    const tick = (t) => {
      if (last === null) last = t;
      const dt = Math.min(t - last, 50);
      last = t;
      if (!hold && !document.hidden) {
        C.Move.translate(C.Move.getPosition() + C.Direction.orient((speed * dt) / 1000));
        const i = (C.Move.toIndex(C.Move.getPosition()) + splide.length) % splide.length;
        if (i !== C.Controller.getIndex()) { C.Controller.setIndex(i); C.Slides.update(); }
      }
      raf = requestAnimationFrame(tick);
    };
    return {
      mount() {
        splide.on("drag move", () => (hold = true));
        splide.on("dragged moved", () => { hold = false; last = null; });
        splide.on("destroy", () => cancelAnimationFrame(raf));
        if (!reduced) raf = requestAnimationFrame(tick);
      },
    };
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-loop-gallery]").forEach((el) => {
    if (!S) return;
    const sp = new S(el, { type: "loop", drag: "free", flickPower: 200, arrows: false, pagination: false, autoWidth: true, gap: "8rem", breakpoints: { 1023: { gap: "2.5rem" } } });
    sp.mount({ TimeScroll: timeScroll(20) });
    const track = el.querySelector(".splide__track");
    window.BA.mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const tw = gsap.fromTo(track, { x: 0 }, { x: -160, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
      return () => tw.revert();
    });
    if (reduced) return;
    let vis = false, raf = 0;
    const par = () => {
      const vw = document.documentElement.clientWidth;
      el.querySelectorAll(".splide__slide").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.right <= 0 || r.left >= vw) return;
        const img = s.querySelector(".ba-gal__img");
        const n = Math.max(0, (img.offsetWidth - r.width) / 2), h = Math.min(Math.max((vw - r.left) / (vw + r.width), 0), 1);
        img.style.setProperty("--gal-x", `${Math.round((-n + h * n * 2) * 1000) / 1000}px`);
      });
      raf = vis ? requestAnimationFrame(par) : 0;
    };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(par); }).observe(el);
  });

  // Detail photos (original CasePage) — the large photo is splide fade (drag · rewind), the small photo row splits one line into five when there are five photos, and when it overflows uses 11rem (phone 7rem) · drag free,
  //   gap 2.5rem (phone 1rem) · chosen item centered. Pressing a small photo changes the big photo and the bar below shows progress
  document.querySelectorAll(".dt-gal").forEach((g) => {
    if (!S) return;
    const mainEl = g.querySelector(".dt-gal__main"), thumbEl = g.querySelector(".dt-gal__thumbs");
    const btns = [...thumbEl.querySelectorAll("button")];
    const sp = () => matchMedia("(max-width: 1023px)").matches;
    const layout = () => {
      const gap = sp() ? 1 : 2.5;
      return { fixedWidth: btns.length <= 5 ? `calc((100% - ${gap * 4}rem) / 5)` : `${sp() ? 7 : 11}rem`, gap: `${gap}rem` };
    };
    const main = new S(mainEl, { type: "fade", rewind: true, drag: true, rewindByDrag: true, pagination: false, arrows: false });
    const thumbs = new S(thumbEl, { ...layout(), focus: "center", trimSpace: true, rewind: true, drag: btns.length > 5 ? "free" : false, wheel: false, arrows: false, pagination: false });
    const bar = document.createElement("div");
    bar.className = "dt-gal__bar";
    bar.innerHTML = "<i></i>";
    thumbEl.after(bar);
    btns.forEach((b, i) => b.addEventListener("click", () => main.go(i)));
    main.on("mounted moved", () => {
      btns.forEach((b, i) => b.classList.toggle("is-current", i === main.index));
      bar.style.setProperty("--current", main.index);
      bar.style.setProperty("--total", main.length);
      thumbs.go(main.index);
    });
    thumbs.mount();
    main.mount();
    matchMedia("(max-width: 1023px)").addEventListener("change", () => (thumbs.options = layout()));
  });

  // Recruitment guidelines: click a row and + rotates into × while the content opens
  document.querySelectorAll(".rc-job__head").forEach((h) => {
    h.addEventListener("click", () => {
      const item = h.parentElement;
      const body = item.querySelector(".rc-job__body");
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      h.setAttribute("aria-expanded", open);
      gsap.to(body, { height: open ? "auto" : 0, duration: 0.5, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
  });

})();
