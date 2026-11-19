// Home page — carries over the order and values of the original _introOnce · _dragHand · _hideOnInteract · _initGridDrag exactly as they are.
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wrap = $(".js-wrap"), grid = $(".js-grid"), overlay = $(".js-overlay");
  const loading = $(".js-loading"), drag = $(".js-drag"), zoom = $(".js-zoom"), header = $(".fc-header");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => matchMedia("(max-width: 767px)").matches;
  $(".js-emblem").outerHTML = window.fcEmblem;

  // ───── Article block cell filling — re-lays the original’s per-block cell layouts onto a 12×8.5 cell grid with the same kinds of cells ─────
  const PHOTO = ["Collage of an old study bookshelf and a black cat · warm light · landscape 3:2", "Hand holding a flower on a blue background · soft clear light · portrait 2:3", "Single toothbrush still life · lime green background · vertical 3:4", "Person walking on a line with stacked chairs · black and white · square", "Old photo of people making a toast · Yellow indoor light · Landscape 3:2", "Students reaching toward a chalkboard · black and white · portrait 2:3", "Old world map · faded paper · landscape 3:2", "Close-up of a face getting traditional stage makeup · dark interior · landscape 3:2", "Anatomy diagram of an arm with blood vessels · White background · Landscape 2:1", "Underwater school of fish · blue light · square", "Collage with one large cut-out eye · black and white · square"];
  const TXT = "Your article excerpt here, about five lines. Text set on the page shows only as much as the box height allows.";
  const LEAD = ["Your key sentence of the article here, large, in two or three lines.", "Your one question goes here in bold italic serif.", "One quote line here, set large."];
  const SHAPES = [[2, 2, "photo"], [1, 2, "text"], [2, 1, "lead"], [1, 2, "photo"], [2, 2, "video"], [1, 1, "text"], [2, 1, "text"], [1, 1, "photo"]];
  const u = (n) => `calc(var(--u) * ${n})`;
  let pi = 0, li = 0;
  $$(".fc-block").forEach((b, bi) => {
    const cols = Math.round(+b.dataset.w / 12), rows = Math.round(+b.dataset.h / 8.5);
    b.style.width = u(b.dataset.w); b.style.height = u(b.dataset.h);
    const [tt, tl] = b.dataset.ttl.split(",").map(Number);
    const tr = Math.round(tt / 8.5), tc = Math.round(tl / 12);
    const used = Array.from({ length: rows }, () => Array(cols).fill(false));
    for (let c = tc; c < Math.min(cols, tc + 4); c++) used[tr][c] = true;
    const fits = (r, c, w, h) => { if (r + h > rows || c + w > cols) return false; for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (used[y][x]) return false; return true; };
    const html = [];
    const put = (r, c, w, h, kind) => {
      for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) used[y][x] = true;
      const pos = `left:${u(c * 12)};top:${u(r * 8.5)};width:calc(${u(w * 12)} - 1px);height:calc(${u(h * 8.5)} - 1px)`;
      let inner = "";
      if (kind === "photo") inner = `<div class="wf-img" data-label="${PHOTO[pi++ % PHOTO.length]}"></div>`;
      else if (kind === "video") inner = `<div class="wf-img" data-label="${PHOTO[pi++ % PHOTO.length]} · Looping video"></div><video muted loop playsinline data-src="media/placeholder.mp4"></video>`;
      else if (kind === "lead") inner = `<p class="fc-lead">${LEAD[li++ % LEAD.length]}</p>`;
      else if (kind === "persons") inner = `<div class="fc-persons">${Array.from({ length: 8 }, (_, i) => `<p>Name ${i + 1}<small>Your affiliation here</small></p>`).join("")}</div>`;
      else inner = `<p class="fc-txt">${TXT}</p>`;
      html.push(`<div class="fc-box ${kind === "photo" || kind === "video" || kind === "persons" ? "" : "is-paper"} is-${kind}" style="${pos}">${inner}</div>`);
    };
    if (b.dataset.persons && fits(tr === 0 ? 1 : 0, 0, 2, 2)) put(tr === 0 ? 1 : 0, 0, 2, 2, "persons");
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (used[r][c]) continue;
      for (let k = 0; k < SHAPES.length; k++) {
        const [w, h, kind] = SHAPES[(bi * 3 + r * 5 + c * 3 + k) % SHAPES.length];
        if (fits(r, c, w, h)) { put(r, c, w, h, kind); break; }
      }
      if (!used[r][c]) put(r, c, 1, 1, "text");
    }
    const tag = b.dataset.new ? '<span class="fc-ttl__new">NEW</span>' : "";
    html.push(`<a class="fc-ttl" href="${b.dataset.href}" draggable="false" style="top:${u(tt)};left:${u(tl)}"><span class="fc-ttl__num">${tag}focal: ${b.dataset.n}</span><span class="fc-ttl__txt">${b.dataset.title}</span><i class="fc-arrow"></i></a>`);
    b.innerHTML = html.join("");
  });

  // ───── Drag · wheel · zoom (original _initGridDrag) ─────
  let isDragging = false, isLocked = true, sx = 0, sy = 0, tx = 0, ty = 0, level = 2, steps = [], raf = null;
  let cw = 0, ch = 0, gw0 = 0, gh0 = 0, gw = 0, gh = 0, minX = 0, minY = 0;
  const calcSteps = () => {
    const minScale = Math.max(wrap.clientWidth / grid.offsetWidth, wrap.clientHeight / grid.offsetHeight);
    if (minScale >= 1) return [1, 1.5, 2, 2.5];
    const st = (1 - minScale) / 2;
    return [+minScale.toFixed(4), +(minScale + st).toFixed(4), 1, 1.5, 2, 2.5];
  };
  const readBase = () => { gw0 = grid.offsetWidth; gh0 = grid.offsetHeight; };
  const bounds = () => { cw = wrap.clientWidth; ch = wrap.clientHeight; const s = steps[level]; gw = gw0 * s; gh = gh0 * s; minX = Math.min(0, cw - gw); minY = Math.min(0, ch - gh); };
  const clampX = (x) => (gw <= cw ? (cw - gw) / 2 : Math.max(minX, Math.min(0, x)));
  const clampY = (y) => (gh <= ch ? (ch - gh) / 2 : Math.max(minY, Math.min(0, y)));
  const paint = () => { grid.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${steps[level]})`; overlay.style.transform = `scale(${steps[level]})`; };
  const apply = (withTransition) => {
    if (withTransition && !reduce) {
      grid.style.transition = "transform 0.3s ease";
      grid.addEventListener("transitionend", function h() { grid.style.transition = ""; grid.removeEventListener("transitionend", h); videos(); });
    }
    paint();
    if (!withTransition) videos();
  };
  const zoomButtons = () => { $(".js-zoom-out").classList.toggle("is-none", level === 0); $(".js-zoom-in").classList.toggle("is-none", level === steps.length - 1); };
  const zoomAt = (next) => {
    const prev = steps[level], ns = steps[next];
    level = next; bounds();
    const cx = cw / 2, cy = ch / 2;
    if (gw <= cw && gh <= ch) { tx = (cw - gw) / 2; ty = (ch - gh) / 2; }
    else { tx = clampX(cx - (cx - tx) * (ns / prev)); ty = clampY(cy - (cy - ty) * (ns / prev)); }
    apply(true); zoomButtons();
  };
  const point = (e) => { const t = e.touches?.[0]; return t ? [t.clientX, t.clientY] : [e.clientX, e.clientY]; };
  const start = (e) => { isDragging = true; const [x, y] = point(e); sx = x - tx; sy = y - ty; };
  const move = (e) => {
    if (!isDragging) return;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const [x, y] = point(e);
      grid.classList.add("dragging");
      tx = clampX(x - sx); ty = clampY(y - sy);
      paint(); videos();
    });
  };
  const end = () => { isDragging = false; grid.classList.remove("dragging"); setTimeout(videos, 316); };
  const wheel = (e) => {
    e.preventDefault();
    if (gh <= ch) return;
    ty = Math.max(minY, Math.min(0, ty - e.deltaY * 50 * .01));
    paint(); videos();
  };

  // ───── Video — only cells more than half visible, all on PC and one at a time in turn on phone ─────
  const ratio = (el, root) => { const r = el.getBoundingClientRect(); const iw = Math.max(0, Math.min(r.right, root.right) - Math.max(r.left, root.left)), ih = Math.max(0, Math.min(r.bottom, root.bottom) - Math.max(r.top, root.top)); return (iw * ih) / (r.width * r.height || 1); };
  const playV = (v) => { if (v.getAttribute("src") !== v.dataset.src) { v.src = v.dataset.src; } v.muted = true; v.play().then(() => v.classList.add("is-play")).catch(() => {}); };
  const stopV = (v) => { if (!v.paused) v.pause(); v.classList.remove("is-play"); };
  let serial = -1;
  function videos() {
    const vs = $$("video", grid);
    if (isLocked || reduce) { vs.forEach(stopV); return; }
    const root = wrap.getBoundingClientRect();
    const seen = vs.filter((v) => ratio(v, root) >= .5);
    if (!isMobile()) { vs.forEach((v) => (seen.includes(v) ? playV(v) : ratio(v, root) <= .45 && stopV(v))); return; }
    vs.forEach((v) => { v.loop = false; if (!seen.includes(v)) stopV(v); });
    if (!seen.length) { serial = -1; return; }
    if (serial < 0 || !seen[serial] || seen[serial].paused) serial = Math.max(0, serial) % seen.length;
    seen.forEach((v, i) => (i === serial ? playV(v) : stopV(v)));
    seen[serial].onended = () => { serial = (serial + 1) % seen.length; videos(); };
  }

  const mount = () => {
    steps = calcSteps();
    let idx = steps.findIndex((s) => s === 1);
    if (idx === -1) idx = steps.reduce((b, s, i) => (Math.abs(s - 1) < Math.abs(steps[b] - 1) ? i : b), 0);
    level = idx;
    readBase(); bounds();
    wrap.addEventListener("mousedown", start);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
    wrap.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", end);
    wrap.addEventListener("wheel", wheel, { passive: false });
    $(".js-zoom-in").addEventListener("click", () => { if (level < steps.length - 1) zoomAt(level + 1); });
    $(".js-zoom-out").addEventListener("click", () => { if (level > 0) zoomAt(level - 1); });
    grid.style.willChange = "transform";
    tx = (cw - gw) / 2; ty = (ch - gh) / 2;
    apply(false); zoomButtons();
    grid.classList.add("is-visible");
  };
  addEventListener("resize", () => {
    const prev = steps[level];
    requestAnimationFrame(() => {
      readBase(); steps = calcSteps();
      level = steps.reduce((b, s, i) => (Math.abs(s - prev) < Math.abs(steps[b] - prev) ? i : b), 0);
      bounds(); tx = clampX(tx); ty = clampY(ty); apply(false); zoomButtons();
    });
  });

  // ───── First-visit loader → guide board → hand demo (original introOnceAndRunDrag·runDragHandAnimation) ─────
  const KEY = "fc_intro_shown_once";
  const first = !sessionStorage.getItem(KEY);
  const showChrome = () => { header?.classList.add("is-shown"); zoom.classList.add("is-shown"); };
  const handAnim = () => {
    const tl = gsap.timeline({ defaults: { duration: .6, ease: "power2.inOut" }, delay: 1 });
    const arrows = $$(".js-drag-arrow"), hand = $(".js-drag-hand");
    tl.to(arrows, { autoAlpha: 0, duration: .3, ease: "power1.out" })
      .to(hand, { y: "-40%", x: "-50%" }).to(hand, { y: "10%", x: "-50%" }).to(hand, { y: "10%", x: "50%" }).to(hand, { y: "-40%", x: "50%" }).to(hand, { y: 0, x: 0 })
      .to(arrows, { autoAlpha: 1, duration: .3, ease: "power1.out" });
  };
  let clicks = 0;
  drag.addEventListener("click", () => {
    const cards = $$(".js-drag-card", drag);
    const target = clicks + 1;
    cards.forEach((c) => c.classList.remove("is-active"));
    if (clicks === 1) {
      gsap.to(drag, { autoAlpha: 0, duration: reduce ? 0 : .35, ease: "power2.out", onComplete: () => { drag.style.display = "none"; } });
      isLocked = false;
      requestAnimationFrame(() => { videos(); requestAnimationFrame(videos); });
    }
    clicks = target;
    cards[target]?.classList.add("is-active");
  });

  const onLoad = () => { mount(); showChrome(); };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });
  if (!first) {
    gsap.set(loading, { autoAlpha: 0, display: "none" });
    isLocked = false;
    return;
  }
  loading.style.display = "flex";
  let minDone = false, loadDone = document.readyState === "complete";
  const run = () => {
    if (!minDone || !loadDone || run.done) return;
    run.done = true;
    gsap.to(loading, {
      autoAlpha: 0, duration: reduce ? 0 : 1, ease: "power2.out",
      onComplete: () => {
        loading.style.display = "none";
        gsap.set(drag, { display: "block", autoAlpha: 0 });
        gsap.to(drag, { autoAlpha: 1, duration: reduce ? 0 : .4, ease: "power2.out" });
        sessionStorage.setItem(KEY, "1");
        if (!reduce) handAnim();
      }
    });
  };
  setTimeout(() => { minDone = true; run(); }, reduce ? 0 : 3300);
  if (!loadDone) addEventListener("load", () => { loadDone = true; run(); }, { once: true });
})();
