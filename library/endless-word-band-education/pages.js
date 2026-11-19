// Runs once per page. Even when the Brand panel changes, shared.js calls it by namespace from init(panel).
// Card content repeats the same type, so it is stamped out here (notes what to put in the photo slot label).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = ["--site-green", "--site-pink", "--site-orange", "--site-navy", "--site-mint", "--site-red", "--site-blue", "--site-gold"];
  const KIND = ["Feature", "Interview", "Research and Report", "Study"];
  const SHOTS = ["Album photo of four band members standing · blue evening light · square", "Textbook cover logo and illustration · white background · square", "Band album with fluorescent cover · yellow · square", "Students looking at the front classroom screen · fluorescent light · square", "Student dancing on stage · auditorium lighting · square", "Word over a globe image · bright image · square"];
  const viewMore = (c) => $$(".um-sec-head > .a--ty:empty", c).forEach((d) => (d.innerHTML = window.umBtn("View More", "journal.html", d.closest(".um-dark") ? "um-btn--w" : "")));

  const card = (i) => `
    <a class="um-card" href="journal.html" data-um-mag>
      <span class="um-tag um-tag--fill">${KIND[i % 4]}</span>
      <span class="um-card__mag"><span class="um-card__pvt -pvt"></span><span class="um-card__fig -mag"><span class="wf-img um-ph" data-label="${SHOTS[i % SHOTS.length]}"></span></span></span>
      <span class="um-card__ttl">【Your series name】 Write the article title in about two lines. This is the second line</span>
      <span class="um-card__tags"><span class="um-tag">#Tag One</span><span class="um-tag">#Tag Two</span></span>
      <span class="um-date">Published : 0000.00.${String(28 - i).padStart(2, "0")}</span>
    </a>`;
  window.umCard = card;
  // Ad cell — in the original new-post grid, a yellow textbook promo cell sits at the eighth slot after seven cells (end of the second row). Hovering anywhere on the cell triggers the magnet, pill fill and arrow together
  const adCard = () => `
    <a class="um-card um-card--ad" href="about.html" data-um-mag>
      <span class="um-tag um-tag--dot">Release</span>
      <span class="um-card__mag"><span class="um-card__pvt -pvt"></span><span class="um-card__fig -mag"><span class="wf-img um-ph" data-label="Teacher supplementary textbook cover · Vertical 666:876"></span></span></span>
      <span class="um-card__go"><span class="um-btn um-btn--in"><span class="um-btn__hit"><span class="um-btn__bg"></span></span><span class="um-btn__tx"><span>Supplementary materials View More</span>${window.umArr}</span></span></span>
    </a>`;

  // Cover card flip — original js-ifs (not endless): buttons and drag set the target slot, and the current position follows .08 of the remaining distance each frame (.15 while dragging). On release it settles on the nearest slot.
  const slider = (root) => {
    const win = $(".um-feat__win", root), list = $(".um-feat__list", root);
    if (!win || !list || list.dataset.umBound) return;
    list.dataset.umBound = "1";
    const items = [...list.children];
    // The original stops at the second cell, with half of the previous cell visible on the left
    let one = 0, cur = Math.min(1, items.length - 1), target = 0, now = 0, drag = null;
    const measure = () => { one = items[0].getBoundingClientRect().width + 1; target = cur * one; if (!now) now = target; };
    const clamp = (i) => Math.max(0, Math.min(items.length - 1, i));
    const tick = () => {
      now += (target - now) * (drag ? 0.15 : 0.08);
      if (Math.abs(target - now) < 0.05) now = target;
      list.style.transform = `translate3d(${(-now).toFixed(2)}px,0,0)`;
      requestAnimationFrame(tick);
    };
    $$(".um-feat__btn", root).forEach((b) => b.addEventListener("click", () => { cur = clamp(cur + (b.dataset.dir === "prev" ? -1 : 1)); target = cur * one; }));
    win.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, m: target }; });
    addEventListener("pointermove", (e) => { if (drag) target = drag.m + (drag.x - e.clientX) * 1.4; });
    addEventListener("pointerup", () => { if (!drag) return; drag = null; cur = clamp(Math.round(now / one)); target = cur * one; });
    new ResizeObserver(measure).observe(win);
    measure();
    if (reduce) list.style.transform = `translate3d(${-target}px,0,0)`; else requestAnimationFrame(tick);
  };

  // Half-circle piece art — when in view, the upper piece folds 90° around its upper right and the lower piece around its lower right, then returns in place in 1.5s power2.inOut (back pieces first, .18s stagger)
  const art = (root) => $$("[data-um-art]", root).forEach((el) => {
    if (el.dataset.umBound || reduce) return;
    el.dataset.umBound = "1";
    const t = $$(".-blk-t", el), b = $$(".-blk-b", el);
    gsap.set(t, { transformOrigin: "100% 0%", rotate: 90 });
    gsap.set(b, { transformOrigin: "100% 100%", rotate: -90 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      t.slice().reverse().forEach((n, i) => gsap.to(n, { rotate: 0, duration: 1.5, delay: 0.18 * i, ease: "power2.inOut" }));
      b.slice().reverse().forEach((n, i) => gsap.to(n, { rotate: 0, duration: 1.5, delay: 0.18 * i, ease: "power2.inOut" }));
    });
    io.observe(el);
  });

  window.umPage = {
    home(c) {
      viewMore(c);
      const feat = $(".um-feat__list", c);
      if (feat && !feat.children.length) {
        feat.innerHTML = Array.from({ length: 6 }, (_, i) => `
          <a class="um-feat__card" href="journal.html" style="--mainBgColor: var(${C[(i + 3) % 8]}); --mainRingColor: var(${C[(i + 7) % 8]}); --bandColor: var(${C[i % 8]})">
            <span class="um-feat__main"><span class="um-feat__ring"><span class="wf-img um-ph" data-label="Textbook cover · illustrated logo · cropped to a circle"></span></span></span>
            <span class="um-feat__band">
              <span class="um-feat__kind">${KIND[i % 4]}</span>
              <span class="um-feat__vt">Your two-line vertical title here<br>Introducing our teaching materials</span>
              <span class="um-feat__foot"><span class="um-tag">#Tag</span><span class="um-date">0000.00.00</span></span>
            </span>
            <span class="um-feat__more"><span class="um-btn__hit"><span class="um-btn__bg"></span></span><span class="um-feat__more-tx">Read Article</span></span>
          </a>`).join("");
      }
      const grid = $(".um-grid", c);
      if (grid && !grid.children.length) grid.innerHTML = Array.from({ length: 7 }, (_, i) => card(i)).join("") + adCard();
      const info = $(".um-info__track", c);
      if (info && !info.children.length) info.innerHTML = Array.from({ length: 6 }, (_, i) => `
        <a class="um-icard h--info" href="information.html"><span class="um-icard__rule"><span class="um-date">0000.00.${String(20 - i).padStart(2, "0")}</span><i></i></span><span class="um-icard__fig h--info__thumb"><span class="wf-img um-ph h--info__img" data-label="Event poster · white background · square"></span></span><span class="um-icard__ttl">Your notification title here in about three lines. News about events and performers.</span><span class="um-icard__rule"><span>Media</span><i></i></span></a>`).join("");
      slider(c);
      art(c);
    },
    about(c) { art(c); },
    journal(c) {
      const grid = $(".um-grid", c);
      if (grid && !grid.children.length) grid.innerHTML = Array.from({ length: 12 }, (_, i) => card(i)).join("");
    },
    information(c) {
      const list = $(".um-ilist", c);
      if (list && !list.children.length) list.innerHTML = Array.from({ length: 8 }, (_, i) => `
        <a class="um-icard um-icard--light h--mag" href="information.html"><span class="um-date">0000.00.${String(20 - i).padStart(2, "0")}</span><span class="um-icard__fig h--mag__tgt"><span class="wf-img um-ph" data-label="Event poster · white background · square"></span></span><span class="um-icard__ttl">Your notification title here in about three lines. News about events and performers.</span><span class="um-tag">${i % 2 ? "News" : "Media"}</span></a>`).join("");
    },
  };
})();
