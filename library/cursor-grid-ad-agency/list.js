/* List (Work · News) — card fill, card tilt (Y13° · X15° · move 20/15px, .4s interpolation, starting .2s after entering), blur on the other cards,
   Year drawer and category buttons, numbered circles rolling beside Section titles */
(() => {
  const TB = window.TB;
  if (!TB) return;
  const { unit, reduce } = TB;
  const WORKS = [
    ["Client Name 01", "PROJECT TITLE IS BACK", "Car ad video · white minivan in a sunset desert · 3442:1934", "Creative"],
    ["Client Name 02", "Your work title two", "Food ad · close-up of a person holding a spoon · 3442:1934", "Creative"],
    ["Client Name 03", "Your work title three", "Anime still · two figures in uniforms · primary colors · 3442:1934", "Creative"],
    ["Client Name 04", "RADIO TITLE", "Product photo · wooden radio on a table · brown · 3442:1934", "Creative, Innovation"],
    ["Client Name 05", "Your work title five here", "Site photo · Cheering crowd · Overcast daytime · 3442:1934", "Creative, Innovation"],
    ["Client Name 06", "Your work title six here", "Festival photo · people holding rainbow flags · 3442:1934", "Creative"],
    ["Client Name 07", "SMART TITLE CAMERA", "Product photo · black device front view · 3442:1934", "Creative, Brand Strategy"],
    ["Client Name 08", "PRIDE TITLE", "Person photo · Close-up of two faces · 3442:1934", "Creative"],
    ["Client Name 09", "PRIDE VISION", "Graphic · pink and blue large-type poster · 3442:1934", "Innovation, Creative"],
  ];
  const NEWS = [
    ["Your news title here, two lines. The announcement of a new music project and its name.", "Concert photo · singer on stage · pink lighting · 16:9", "00 Month 0000, NEWS"],
    ["Your award news headline here in two lines. News of winning three awards at an ad festival.", "Award graphic · characters and primary colors · 16:9", "00 Month 0000, AWARDS, NEWS"],
    ["Your two-line event news title goes here. Lecture topic, date and speaker name.", "Event poster · yellow background illustration · 16:9", "00 Month 0000, NEWS"],
    ["Your award news title goes here in two lines. Ad festival name and the award received", "Ad scene · radio and hand · 16:9", "00 Month 0000, AWARDS"],
    ["Your news title goes here in two lines. Announce a new project launch and its name", "Graphic · lines of light over a city · 16:9", "00 Month 0000, NEWS"],
    ["Your news headline here in two lines. News of the third collaboration project in a row", "Graphic · blue neon letters · 16:9", "00 Month 0000, NEWS"],
    ["Your two-line interview news title here. Who you talked with and about what", "Poster · white background with red text · 16:9", "00 Month 0000, NEWS, KNOWLEDGE"],
    ["Your two-line people news title goes here. The name of the new member and their role", "Portrait photo · Black and white · 16:9", "00 Month 0000, STORIES"],
    ["Your news headline here in two lines. A story of a product made in collaboration with a brand we built together", "Product photo · pink stick-shaped object · 16:9", "00 Month 0000, NEWS"],
  ];

  // Original tilt3d — tilts away from the cursor, with exponential interpolation over .4s at 60fps (1 − .001^(1/(.4·60)))
  const tilt = (host, target, o = {}) => {
    const mY = o.maxRotateY ?? 13, mX = o.maxRotateX ?? 15, tX = o.maxTranslateX ?? 20, tY = o.maxTranslateY ?? 15, delay = o.enterDelay ?? 0.2;
    const k = 1 - Math.pow(0.001, 1 / ((o.duration ?? 0.4) * 60));
    gsap.set(target, { transformPerspective: o.perspective ?? 800, transformOrigin: "center center" });
    let ok = false, timer = 0, run = false;
    const g = { ry: 0, rx: 0, x: 0, y: 0 }, c = { ry: 0, rx: 0, x: 0, y: 0 };
    const tick = () => {
      let done = true;
      for (const key in g) { c[key] += (g[key] - c[key]) * k; if (Math.abs(g[key] - c[key]) > 0.01) done = false; }
      gsap.set(target, { rotateY: c.ry, rotateX: c.rx, x: c.x, y: c.y });
      if (done) { gsap.ticker.remove(tick); run = false; }
    };
    const go = () => { if (!run) { run = true; gsap.ticker.add(tick); } };
    const enter = () => { go(); timer = setTimeout(() => { ok = true; }, delay * 1000); };
    const move = (e) => {
      if (!ok) return;
      const r = host.getBoundingClientRect();
      const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2), ny = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      g.ry = nx * -mY; g.x = nx * -tX; g.rx = ny * -mX; g.y = ny * -tY;
      go();
    };
    const leave = () => { clearTimeout(timer); ok = false; Object.assign(g, { ry: 0, rx: 0, x: 0, y: 0 }); go(); };
    host.addEventListener("mouseenter", enter); host.addEventListener("mousemove", move); host.addEventListener("mouseleave", leave);
    return () => { clearTimeout(timer); gsap.ticker.remove(tick); host.removeEventListener("mouseenter", enter); host.removeEventListener("mousemove", move); host.removeEventListener("mouseleave", leave); };
  };
  TB.tilt = tilt;

  const cards = (ul) => {
    const kind = ul.dataset.kind;
    // Original page size — Work and News both 12 cards (4 rows of 3)
    const W = Array.from({ length: 12 },(_, i) => { const w = WORKS[i % WORKS.length]; return [`Client Name ${String(i + 1).padStart(2, "0")}`, w[1], w[2], w[3]]; });
    const N = Array.from({ length: 12 }, (_, i) => NEWS[i % NEWS.length]);
    if (ul.dataset.count) W.length = Math.min(W.length, +ul.dataset.count);
    if (kind === "work") ul.innerHTML = W.map(([c, t, l, tags], i) => `<li><a class="ls-card tb-in-slash-wrap" href="detail.html" style="--index:${i % 3}" data-cursor-text="View"><div class="ls-card__thumb"><div class="ls-card__persp"><span class="ls-card__clip"><span class="ls-card__img tb-ph" data-label="${l}"></span></span><span class="ls-card__frame" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div></div><p class="ls-card__client">${c}</p><h2 class="ls-card__ttl">${t}</h2><p class="ls-card__txt">Your project description goes here, three lines. Briefly say what it was made for, how it was made, which medium it ran in, and what reaction viewers had. Overflowing text is cut off at three lines.</p><p class="ls-card__tags">${tags}</p></a></li>`).join("");
    else ul.innerHTML = N.map(([t, l, d], i) => `<li><a class="ls-card tb-in-slash-wrap" href="detail.html" style="--index:${i % 3}" data-cursor-text="Read"><div class="ls-card__thumb"><div class="ls-card__persp"><span class="ls-card__clip"><span class="ls-card__img tb-ph" data-label="${l}"></span></span><span class="ls-card__frame" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div></div><h2 class="ls-card__ttl">${t}</h2><p class="ls-card__txt">Your news summary goes here in two lines. Say who did what and when, plus the single most important point from the body, briefly.</p><p class="ls-card__date">${d}</p></a></li>`).join("");
    const offs = [];
    const links = [...ul.querySelectorAll(".ls-card")];
    links.forEach((a) => {
      if (TB.hoverMQ.matches && !reduce) offs.push(tilt(a, a.querySelector(".ls-card__persp")));
    });
    offs.push(TB.inview ? TB.inview(links) : () => {});
    return () => offs.forEach((f) => f());
  };

  // Number circle — rolls a 0~9 strip and stops on its digit
  const counters = (scope) => {
    scope.querySelectorAll(".ls-count__c").forEach((c, k) => {
      c.innerHTML = `<span>${Array.from({ length: 10 }, (_, i) => `<b>${i}</b>`).join("")}</span>`;
      const n = Number(c.dataset.n) || 0;
      gsap.fromTo(c.firstChild, { yPercent: 0 }, { yPercent: -n * 10, duration: reduce ? 0 : 1.2, delay: 0.6 + k * 0.1, ease: "easeInOut4" });
    });
  };

  const filters = (scope) => {
    const offs = [];
    scope.querySelectorAll(".ls-year").forEach((y) => {
      const t = y.querySelector(".ls-year__toggle");
      const on = () => { const o = !y.classList.contains("is-open"); y.classList.toggle("is-open", o); t.setAttribute("aria-expanded", o); };
      t.addEventListener("click", on);
      y.querySelectorAll(".ls-year__panel a").forEach((a) => a.addEventListener("click", (e) => {
        e.preventDefault();
        y.querySelectorAll(".ls-year__panel a").forEach((x) => x.removeAttribute("aria-current"));
        a.setAttribute("aria-current", "true");
        TB.scrambleIn(y.querySelector(".ls-year__label"), a.textContent.trim(), { duration: 0.4 });
        on();
      }));
    });
    scope.querySelectorAll(".ls-cats button").forEach((b, _, all) => b.addEventListener("click", () => {
      all.forEach((x) => x.setAttribute("aria-checked", x === b));
      const ul = scope.querySelector(".ls-grid");
      gsap.fromTo(ul.children, { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: 0.04, ease: "easeInOut4" });
    }));
    // While stuck, lay the category buttons out vertically — original news filter
    scope.querySelectorAll(".ls-filter--cat").forEach((f) => {
      const top = parseFloat(getComputedStyle(f).top) || 0;
      const io = new IntersectionObserver(([e]) => f.classList.toggle("is-stuck", e.boundingClientRect.top <= top + 1 && !e.isIntersecting), { rootMargin: `${-(top + 1)}px 0px 0px 0px`, threshold: 1 });
      const s0 = document.createElement("i"); s0.setAttribute("aria-hidden", "true"); s0.style.cssText = "display:block;height:1px";
      f.before(s0); io.observe(s0);
      offs.push(() => { io.disconnect(); s0.remove(); });
    });
    return () => offs.forEach((f) => f());
  };

  const page = ({ scope }) => {
    const offs = [];
    scope.querySelectorAll(".ls-grid").forEach((ul) => offs.push(cards(ul)));
    counters(scope);
    offs.push(filters(scope));
    return () => offs.forEach((f) => f());
  };
  TB.listCards = cards;
  TB.pages.works = page;
  TB.pages.news = page;
})();
