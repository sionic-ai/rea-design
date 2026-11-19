// Home page: card row (swiper), endless photo strip flow, hashtag circle strip (keeps flowing and is draggable), FAQ accordion, guide steps, notice filter.
// Original values: circle band 0.7px per frame (0.5px on phone), accordion + rotation .3s ease-out, guide step advance 1s expo.out.
(() => {
  const { reduced, small } = window.EZ;

  // ── Card row: like the original, swiper 12.0.2 — the gap is px proportional to screen width (PC 23/1440 · phone 18/375), so it is rebuilt whenever the size changes.
  //    The recommended row loops with 4s auto-advance (.5s) only on PC, on phone it’s a vertical list, so swiper isn’t attached ──
  const opts = (pick) => {
    const gap = small.matches ? (18 / 375) * innerWidth : (23 / 1440) * innerWidth;
    return pick
      ? { speed: 500, slidesPerView: "auto", spaceBetween: gap, loop: true, autoplay: reduced ? false : { delay: 4000, disableOnInteraction: false } }
      : { slidesPerView: "auto", spaceBetween: gap, watchOverflow: true };
  };
  const swipers = new Map();
  const build = () => {
    document.querySelectorAll("[data-swiper]").forEach((el) => {
      swipers.get(el)?.destroy(true, true);
      swipers.delete(el);
      const pick = el.dataset.swiper === "pickup";
      if (pick && small.matches) return;
      swipers.set(el, new Swiper(el, opts(pick)));
    });
  };
  build();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 100); });

  // ── Hero video: like the original video embed, loops by itself silently, PC·phone use different videos — when the width changes (after 200ms) swap in the video for that width ──
  const kvVideo = document.querySelector(".ez-kv__video");
  if (kvVideo) {
    const pickVideo = () => {
      const src = small.matches ? kvVideo.dataset.sp : kvVideo.dataset.pc;
      if (kvVideo.getAttribute("src") !== src) { kvVideo.src = src; kvVideo.play().catch(() => {}); }
    };
    pickVideo();
    let vt;
    addEventListener("resize", () => { clearTimeout(vt); vt = setTimeout(pickVideo, 200); });
    if (reduced) kvVideo.pause();
  }

  // ── Photo strip: one set is duplicated into two, and a CSS animation flows by one set’s length ──
  document.querySelectorAll(".ez-marq__track").forEach((track) => {
    const items = [...track.children];
    track.closest(".ez-marq").style.setProperty("--count", items.length);
    items.forEach((el) => track.append(Object.assign(el.cloneNode(true), { ariaHidden: "true" })));
  });

  // ── Hashtag circle band: the original formula as is — three copies joined, flowing 0.7px per frame (phone 0.5px, second row reversed),
  //    While dragging it follows the hand, and on release a velocity of drag distance/(0.1×drag time ms) is applied, decaying 10% per frame. A press after a fast throw does not count as a link click ──
  let flung = 0;
  document.querySelectorAll("[data-film]").forEach((film) => {
    const list = film.querySelector(".ez-film__list");
    const items = [...list.children];
    for (let n = 0; n < 2; n++) items.forEach((li) => list.append(Object.assign(li.cloneNode(true), { ariaHidden: "true" })));
    const rev = film.dataset.direction === "reverse" ? -1 : 1;
    let posX = 0, drag = false, grab = 0, off = 0, from = 0, t0 = 0, vel = 0, sx = 0, sy = 0, swiping = null;
    const frame = () => {
      const third = list.scrollWidth / 3;
      vel += 0.1 * (0 - vel);
      if (Math.abs(vel) < 0.01) vel = 0;
      if (drag) posX = from + off;
      else if (!reduced) posX += (small.matches ? -0.5 : -0.7) * rev + vel;
      list.style.transform = `translateX(${(posX % third) - third}px)`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    const begin = (x) => { drag = true; grab = x; off = 0; from = posX; t0 = Date.now(); };
    const end = () => { drag = false; vel = off / (0.1 * Math.max(1, Date.now() - t0)); flung = vel; };
    const mm = (e) => (off = e.clientX - grab);
    const mu = () => { removeEventListener("mousemove", mm); removeEventListener("mouseup", mu); end(); };
    film.addEventListener("mousedown", (e) => { addEventListener("mousemove", mm); addEventListener("mouseup", mu); begin(e.clientX); });
    // A finger is taken by the strip only when horizontal movement exceeds 2.5 times vertical, otherwise the page scrolls down
    const tm = (e) => {
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (swiping === null) {
        swiping = !(Math.abs(dy) > Math.abs(dx) * 2.5);
        if (!swiping) { removeEventListener("touchmove", tm); removeEventListener("touchend", te); return; }
        e.preventDefault();
        begin(sx);
      }
      if (swiping) { e.preventDefault(); off = e.touches[0].clientX - grab; }
    };
    const te = () => { removeEventListener("touchmove", tm); removeEventListener("touchend", te); if (swiping) end(); };
    film.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiping = null; addEventListener("touchmove", tm, { passive: false }); addEventListener("touchend", te); }, { passive: false });
    film.addEventListener("dragstart", (e) => e.preventDefault());
    film.addEventListener("click", (e) => {
      if (!e.target.closest("a")) return;
      if (Math.abs(flung) > 1) { e.preventDefault(); flung = 0; }
    });
  });

  // ── FAQ accordion: as in the original, height css transition .4s ease — on open, grow to the content height then release to auto, on close pin the current height then set 0 on the next frame ──
  document.querySelectorAll(".ez-acc").forEach((acc) => {
    const head = acc.querySelector(".ez-acc__head");
    const body = acc.querySelector(".ez-acc__body");
    body.hidden = false;
    Object.assign(body.style, { height: "0px", overflow: "hidden", transition: reduced ? "none" : "height 0.4s ease" });
    head.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      body.style.height = `${body.scrollHeight}px`;
      if (open) {
        const done = () => { if (acc.classList.contains("is-open")) body.style.height = "auto"; body.removeEventListener("transitionend", done); };
        body.addEventListener("transitionend", done);
        if (reduced) done();
      } else requestAnimationFrame(() => (body.style.height = "0px"));
    });
  });

  // ── Guide booklet: choosing one circle gives a dark outline, ‹Next step› comes alive and the next step slides in from the right ──
  const steps = [...document.querySelectorAll(".ez-annai__step")];
  // Original: the second and third steps sit stacked outside the panel’s right edge (left 100%), then slide in over it by their own width in 1s expo.out, and go back out the same way. The first step does not move
  let at = 0;
  const go = (dir) => {
    if (dir > 0 && steps[at + 1]) { at++; gsap.to(steps[at], { x: -steps[at].offsetWidth, duration: reduced ? 0 : 1, ease: "expo.out" }); }
    if (dir < 0 && at > 0) gsap.to(steps[at--], { x: 0, duration: reduced ? 0 : 1, ease: "expo.out" });
  };
  steps.forEach((step, i) => {
    const next = step.querySelector(".is-next");
    step.querySelectorAll(".ez-annai__item").forEach((item) =>
      item.addEventListener("click", () => {
        step.querySelectorAll(".ez-annai__item").forEach((o) => o.classList.toggle("is-selected", o === item));
        next.removeAttribute("aria-disabled");
      }),
    );
    if (next && steps[i + 1]) next.addEventListener("click", (e) => { e.preventDefault(); go(1); });
    step.querySelector(".ez-annai__back")?.addEventListener("click", () => go(-1));
  });

  // ── Notice filter: only the chosen categories, up to five rows ──
  const rows = [...document.querySelectorAll(".ez-news__list li")];
  document.querySelectorAll(".ez-news__filter button").forEach((btn, _, all) =>
    btn.addEventListener("click", () => {
      all.forEach((b) => {
        b.classList.toggle("is-selected", b === btn);
        b.setAttribute("aria-selected", String(b === btn));
      });
      let shown = 0;
      rows.forEach((li) => {
        const ok = btn.dataset.filter === "all" || li.dataset.cat === btn.dataset.filter;
        li.hidden = !(ok && shown < 5);
        if (!li.hidden) shown++;
      });
    }),
  );
})();
