(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  // News and detail pages (light frame) have no cursor or transition cover in the original — with data-plain they go straight through without a cover
  const plain = body.hasAttribute("data-plain");

  // Decorative curtains (cursor, page-turn curtain, recording clock) are the same on every page, so mount them here
  const make = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  const ring = make('<div class="ik-cur is-ring" aria-hidden="true"></div>');
  const dot = make('<div class="ik-cur" aria-hidden="true"></div>');
  const pgt = make('<div class="ik-pgt" aria-hidden="true"><span class="ik-pgt__slats"><i></i><i></i><i></i><i></i><i></i></span><span class="ik-pgt__c"><span class="ik-pgt__mark"><b>N</b><b>A</b><b>M</b><b>E</b></span><span class="ik-pgt__l"></span><span class="ik-pgt__bar"><em></em></span></span><span class="ik-pgt__num">000</span></div>');
  body.prepend(ring, dot, pgt);
  if (!body.hasAttribute("data-no-rec")) body.append(make('<div class="ik-rec"><i></i><span>CITY 00:00:00</span></div>'));

  // Recording clock — City time updated every 1s
  const rec = document.querySelector(".ik-rec span");
  const clock = () => {
    if (rec) { try { rec.textContent = (body.dataset.rec || "CITY") + " " + new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Tokyo", hour12: false }); } catch (e) { /* Timezone unsupported */ } }
    setTimeout(clock, 1000);
  };
  clock();

  // Cursor — the ring follows at .14, the dot at .35 each. Over data-m the ring grows
  let mx = innerWidth / 2, my = innerHeight / 2, bx = mx, by = my, cx = mx, cy = my;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  document.addEventListener("pointerover", (e) => { if (e.target.closest && e.target.closest("[data-m]")) ring.classList.add("on"); });
  document.addEventListener("pointerout", (e) => {
    const from = e.target.closest && e.target.closest("[data-m]");
    const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("[data-m]");
    if (from && from !== to) ring.classList.remove("on");
  });
  // The original offsets only by the initial radius even when the ring grows (the grown ring expands toward the bottom right) — sizes differ per page, so read it from css
  const half = (el, d) => parseFloat(getComputedStyle(el).getPropertyValue("--site-cur-half")) || d;
  const rh = half(ring, 22), dh = half(dot, 4);
  // The trailing rain differs per page (About .16 · .34)
  const kr = +body.dataset.curRing || 0.14, kd = +body.dataset.curDot || 0.35;
  const follow = () => {
    bx += (mx - bx) * kr; by += (my - by) * kr; cx += (mx - cx) * kd; cy += (my - cy) * kd;
    ring.style.transform = `translate(${bx - rh}px,${by - rh}px)`;
    dot.style.transform = `translate(${cx - dh}px,${cy - dh}px)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);

  // Current page menu
  const page = body.dataset.page;
  document.querySelectorAll(".ik-hd nav a[data-nav]").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === page));

  // Text scramble — at 60% visible, over 26 steps every 34ms it settles into the proper letters from the left
  const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/<>";
  const scramble = (el) => {
    const f0 = el.textContent, n = f0.length;
    let k = 0;
    const iv = setInterval(() => {
      k++;
      let o = "";
      for (let i = 0; i < n; i++) { const c = f0[i]; o += c === " " ? " " : i < (k / 26) * n ? c : CH[(Math.random() * CH.length) | 0]; }
      el.textContent = o;
      if (k >= 26) { clearInterval(iv); el.textContent = f0; }
    }, 34);
  };
  const ioS = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { if (!reduce) scramble(e.target); ioS.unobserve(e.target); } }), { threshold: 0.6 });
  document.querySelectorAll("[data-scramble]").forEach((el) => ioS.observe(el));

  // Page transition — starts covered on entry and lifts after 60ms, pressing an inner link covers then goes at 780ms (number 000→100 takes 580ms)
  const lab = pgt.querySelector(".ik-pgt__l"), num = pgt.querySelector(".ik-pgt__num");
  addEventListener("pageshow", (e) => { if (e.persisted) pgt.className = "ik-pgt"; });
  if (!reduce && !plain) {
    pgt.classList.add("is-shown");
    setTimeout(() => {
      pgt.classList.remove("is-shown");
      pgt.classList.add("is-reveal");
      setTimeout(() => pgt.classList.remove("is-reveal"), 950);
    }, 60);
  }
  const inside = (a) => {
    const h = a.getAttribute("href") || "";
    if (!h || h.charAt(0) === "#" || /^(mailto:|tel:)/i.test(h) || a.target === "_blank") return false;
    const u = new URL(h, location.href);
    return u.origin === location.origin;
  };
  const go = (href, label) => {
    if (reduce || plain) { location.href = href; return; }
    lab.textContent = "→ " + (label || "NAME").slice(0, 18);
    pgt.classList.remove("is-reveal");
    pgt.classList.add("is-cover");
    const s = performance.now();
    const count = () => { const p = Math.min(1, (performance.now() - s) / 580); num.textContent = ("00" + Math.round(p * 100)).slice(-3); if (p < 1) requestAnimationFrame(count); };
    count();
    setTimeout(() => { location.href = href; }, 780);
  };
  window.ikGo = go;
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || !inside(a) || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    go(a.getAttribute("href"), (a.getAttribute("data-t") || a.textContent || "NAME").trim());
  }, true);

  // Drawer footer — pressing the bar opens and closes it. It opens by itself on reaching the bottom and folds by itself when leaving upward
  const dock = document.querySelector("[data-ik-dock]");
  if (dock) {
    const tg = dock.querySelector(".ik-dock__bar"), panel = dock.querySelector(".ik-dock__panel"), spacer = document.querySelector(".ik-dock-spacer");
    let auto = false, closedByHand = false;
    const D = document.documentElement;
    const size = () => { if (spacer && panel.offsetHeight) spacer.style.height = panel.offsetHeight + "px"; };
    size();
    addEventListener("load", size);
    const isOpen = () => dock.classList.contains("open");
    const set = (v) => { dock.classList.toggle("open", v); tg.setAttribute("aria-expanded", v ? "true" : "false"); };
    tg.addEventListener("click", (e) => { e.stopPropagation(); const n = !isOpen(); set(n); auto = false; closedByHand = !n; });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { set(false); auto = false; closedByHand = true; } });
    document.addEventListener("click", (e) => { if (isOpen() && !dock.contains(e.target)) { set(false); auto = false; } });
    const nearBottom = () => D.scrollHeight > innerHeight + 40 && innerHeight + (scrollY || D.scrollTop) >= D.scrollHeight - 4;
    const onScroll = () => {
      if (nearBottom()) { if (!isOpen() && !closedByHand) { set(true); auto = true; } }
      else { closedByHand = false; if (isOpen() && auto) { set(false); auto = false; } }
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { size(); onScroll(); }, { passive: true });
    onScroll();
  }
})();
