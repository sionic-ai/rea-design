// Cross-page: header (hides by scroll direction, tag chip, swappable right panel), bottom pill menu and contact panel,
// Head-turning Lottie logo, big photo curtain, page transition. The original is a one-page Next.js app, so the header and menu stay as they are and only the body is swapped —
// So here too we fetch only the main body (main) and stack it over the current page for the transition, and page scripts register via DT.page(name, on) to be switched on and off at each transition.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pages = {};
  let current = null;
  const DT = (window.DT = {
    reduce,
    page(name, init) { pages[name] = init; },
    css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); },
    rgb(name) {
      const probe = document.createElement("i");
      probe.style.color = `var(${name})`;
      document.body.append(probe);
      const m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
      probe.remove();
      return [m[0] / 255, m[1] / 255, m[2] / 255, 1];
    },
  });

  // ── Large photo curtain: a white curtain holding an Embla panel. Open order is curtain .46s → panel .92→1 (after .36s) → prev/next buttons (after .52s) ──
  DT.modal = (root, { onOpen, onClose } = {}) => {
    const closeBtn = root.querySelector("[data-modal-close]");
    const open = (...a) => { root.classList.add("is-on"); root.setAttribute("aria-hidden", "false"); document.documentElement.style.overflow = "hidden"; onOpen && onOpen(...a); };
    const close = () => { root.classList.remove("is-on"); root.setAttribute("aria-hidden", "true"); document.documentElement.style.overflow = ""; onClose && onClose(); };
    const key = (e) => { if (e.key === "Escape" && root.classList.contains("is-on")) close(); };
    closeBtn && closeBtn.addEventListener("click", close);
    addEventListener("keydown", key);
    return { open, close, destroy() { removeEventListener("keydown", key); document.documentElement.style.overflow = ""; } };
  };

  // Masonry pile — card i goes to column i % column-count (same split as the original react-masonry-css). ”4,768:2,680:1” — 4 columns by default, 2 when the window is 768 or less, 1 at 680 or less
  DT.masonry = (grid) => {
    const items = [...grid.children];
    const rules = grid.dataset.cols.split(",");
    const base = +rules[0];
    const steps = rules.slice(1).map((r) => r.split(":").map(Number)).sort((a, b) => b[0] - a[0]);
    let n = 0;
    const lay = () => {
      let cols = base;
      steps.forEach(([w, c]) => { if (innerWidth <= w) cols = c; });
      if (cols === n) return;
      n = cols;
      const shown = items.filter((el) => !el.hidden);
      const columns = Array.from({ length: cols }, () => { const c = document.createElement("div"); c.className = "dt-col"; return c; });
      shown.forEach((el, i) => columns[i % cols].append(el));
      grid.replaceChildren(...columns);
      grid.classList.add("is-laid");
    };
    lay();
    addEventListener("resize", lay);
    return { relayout() { n = 0; lay(); }, items, destroy() { removeEventListener("resize", lay); } };
  };

  // ── Rotating head logo: same 24fps · 70 frames as the original, a hand-drawn two-turn rotation swapping the image every two frames. Plays on hover, stops in place on release ──
  const headData = () => {
    const ink = DT.rgb("--kf-ink"), bg = DT.rgb("--kf-bg");
    const val = (k) => ({ a: 0, k });
    const tr = () => ({ ty: "tr", p: val([0, 0]), a: val([0, 0]), s: val([100, 100]), r: val(0), o: val(100), sk: val(0), sa: val(0) });
    const el = (x, y, w, h, fill, stroke) => ({
      ty: "gr",
      it: [
        { ty: "el", p: val([x, y]), s: val([w, h]), d: 1 },
        ...(stroke ? [{ ty: "st", c: val(ink), o: val(100), w: val(8), lc: 2, lj: 2 }] : []),
        { ty: "fl", c: val(fill), o: val(100), r: 1 },
        tr(),
      ],
    });
    const pose = (deg) => {
      const t = (deg * Math.PI) / 180, back = (1 - Math.cos(t)) / 2;
      const shapes = [];
      [-0.42, 0.42].forEach((phi) => {
        if (Math.cos(t + phi) > 0.2) shapes.push(el(56 * Math.sin(t + phi), 6, 11, 15, ink));
      });
      shapes.push(el(-34 * Math.sin(t), -38 + 30 * back, 126 - 26 * Math.abs(Math.sin(t)) + 14 * back, 74 + 84 * back, ink));
      shapes.push(el(0, 0, 122, 152, bg, true));
      return shapes;
    };
    const layers = [];
    const add = (deg, ip, op) => layers.push({
      ddd: 0, ind: layers.length + 1, ty: 4, nm: `head-${layers.length}`, sr: 1, ao: 0, st: 0, bm: 0, ip, op,
      ks: { o: val(100), r: val(0), p: val([125, 130, 0]), a: val([0, 0, 0]), s: val([100, 100, 100]) },
      shapes: pose(deg),
    });
    add(0, 0, 8);
    for (let k = 0; k < 14; k++) add(((k + 1) * 360) / 14, 8 + k * 2, 10 + k * 2);
    add(0, 36, 43);
    for (let k = 0; k < 14; k++) add(((k + 1) * 360) / 14, 43 + k * 2, Math.min(70, 45 + k * 2));
    // lottie appends the first layer at the very end of the DOM — like the original precomp, reverse it so the front frame’s image comes first in the DOM (only one is shown at a time so stacking order doesn’t matter)
    layers.reverse().forEach((l, i) => { l.ind = i + 1; });
    return { v: "5.9.1", fr: 24, ip: 0, op: 70, w: 250, h: 250, nm: "head", ddd: 0, assets: [], layers };
  };
  const initLogo = () => {
    const box = document.querySelector("[data-logo]");
    if (!box || !window.lottie) return;
    const anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: false, animationData: headData() });
    const link = box.closest("a");
    link.addEventListener("mouseenter", () => { if (innerWidth > 1025 && !reduce) anim.play(); });
    link.addEventListener("mouseleave", () => anim.pause());
  };

  // ── Header: hides while scrolling down past 60px, shows again with even a little scroll up ──
  const head = document.querySelector(".dt-head");
  const nav = document.querySelector(".dt-nav");
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y >= 60 && y > lastY) head.classList.add("is-hidden");
    else if (y < lastY) head.classList.remove("is-hidden");
    lastY = y;
  }, { passive: true });

  // ── Tag chips: when entering a list section they rise from 30px below at .05s stagger (after .75s), and on leaving they pull out 30px upward (after .45s) — .6s circ.out ──
  const tags = head.querySelector(".dt-tags");
  let tagTl = null;
  const setTags = (on, first) => {
    if (!tags) return;
    const items = tags.querySelectorAll("li");
    tags.classList.toggle("is-on", on);
    if (tagTl) tagTl.kill();
    // On first opening the document the chips stand as is like the original — staggered rise only on arrival
    if (reduce || first) { gsap.set(items, { autoAlpha: on ? 1 : 0, y: 0 }); return; }
    tagTl = gsap.timeline();
    if (on) tagTl.fromTo(items, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.6, ease: "circ.out" }, 0.75);
    else tagTl.to(items, { autoAlpha: 0, y: -30, stagger: 0.05, duration: 0.6, ease: "circ.out" }, 0.45);
  };

  const setChrome = (name, first) => {
    // On first open, the right panel (switch · close) also stays in place without moving over
    if (first) head.classList.add("is-instant");
    head.dataset.at = name;
    nav.dataset.at = name === "about" ? "about" : "home";
    head.classList.toggle("is-close", name === "about" || name === "detail");
    setTags(name === "list", first);
    if (first) requestAnimationFrame(() => requestAnimationFrame(() => head.classList.remove("is-instant")));
  };

  // ── Contact: on press the handle goes to the third cell (204px), and two plates rise 8px, the lower one first, .1s·.2s late. Pressing anywhere closes ──
  const contactBtn = nav.querySelector("[data-contact]");
  const setContact = (on) => nav.classList.toggle("is-contact", on);
  contactBtn.addEventListener("click", (e) => { e.stopPropagation(); setContact(true); });
  nav.querySelector(".dt-contact").addEventListener("click", (e) => e.stopPropagation());
  document.body.addEventListener("click", () => setContact(false));
  nav.querySelectorAll("a.dt-nav__link").forEach((a) => a.addEventListener("click", () => setContact(false)));

  // ── Page Turn ──
  const stage = document.querySelector(".dt-stage");
  const here = (href) => new URL(href, location.href);
  const sameSite = (url) => url.origin === location.origin && url.pathname.replace(/[^/]*$/, "") === location.pathname.replace(/[^/]*$/, "") && /\.html$/.test(url.pathname);
  let busy = false;
  const loadAssets = async (doc) => {
    const have = new Set([...document.querySelectorAll("link[rel=stylesheet], script[src]")].map((n) => (n.href || n.src)));
    const waits = [];
    doc.querySelectorAll("link[rel=stylesheet]").forEach((l) => {
      const href = here(l.getAttribute("href")).href;
      if (have.has(href)) return;
      const n = document.createElement("link");
      n.rel = "stylesheet"; n.href = href;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    await Promise.all(waits);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = here(s.getAttribute("src")).href;
      if (have.has(src)) continue;
      await new Promise((r) => { const n = document.createElement("script"); n.src = src; n.onload = n.onerror = r; document.body.append(n); });
    }
  };
  const run = (main, first) => {
    const name = main.dataset.page;
    setChrome(name, first);
    const off = pages[name] ? pages[name](main) : null;
    current = { main, off };
  };
  // The original (Next.js) prefetches the next page of visible links — we fetch on hover so the transition happens right after the press
  const cache = new Map();
  const fetchDoc = (href) => {
    if (!cache.has(href)) cache.set(href, fetch(href).then((r) => r.text()).then((h) => h, () => { cache.delete(href); return null; }));
    return cache.get(href);
  };
  document.addEventListener("pointerover", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || location.protocol === "file:") return;
    const url = here(a.getAttribute("href"));
    if (sameSite(url)) fetchDoc(url.href);
  });
  const go = async (url, push) => {
    if (busy) return;
    // A page opened as a file can’t fetch the body — pass the whole document instead
    if (location.protocol === "file:") { location.href = url.href; return; }
    busy = true;
    const html = await fetchDoc(url.href);
    if (!html) { location.href = url.href; return; }
    const doc = new DOMParser().parseFromString(html, "text/html");
    const next = doc.querySelector(".dt-main");
    if (!next) { location.href = url.href; return; }
    await loadAssets(doc);
    const old = current;
    const y = scrollY;
    if (push) history.pushState({ dt: 1 }, "", url.href);
    document.title = doc.title;
    document.body.dataset.page = doc.body.dataset.page;
    const fresh = document.importNode(next, true);
    if (reduce) {
      old.off && old.off();
      old.main.replaceWith(fresh);
      scrollTo(0, 0);
      run(fresh);
      busy = false;
      return;
    }
    stage.classList.add("is-moving");
    old.main.style.setProperty("--dt-y", `${-y}px`);
    old.main.classList.add("is-exit");
    fresh.classList.add("is-enter");
    stage.append(fresh);
    scrollTo(0, 0);
    head.classList.remove("is-hidden");
    run(fresh);
    setTimeout(() => {
      old.off && old.off();
      old.main.remove();
      fresh.classList.remove("is-enter");
      stage.classList.remove("is-moving");
      busy = false;
    }, 1200);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = here(a.getAttribute("href"));
    if (!sameSite(url)) return;
    e.preventDefault();
    if (url.pathname === location.pathname) { scrollTo({ top: 0, behavior: "smooth" }); return; }
    go(url, true);
  });
  addEventListener("popstate", () => go(here(location.href), false));
  // The original close is browser back (router.back) — if the visitor didn’t come from within this site, it goes to the first page
  head.querySelector("[data-back]").addEventListener("click", () => {
    if (history.state && history.state.dt) history.back();
    else go(here("index.html"), true);
  });

  // The original (Next.js Link) prefetches the next page of visible links during idle time — it preloads the document, css and js of the header and menu pages so pressing switches instantly
  const warm = () => {
    if (location.protocol === "file:") return;
    const hrefs = new Set([...document.querySelectorAll(".dt-nav a[href], .dt-head a[href]")].map((a) => here(a.getAttribute("href"))).filter((u) => sameSite(u) && u.pathname !== location.pathname).map((u) => u.href));
    hrefs.forEach((h) => fetchDoc(h).then((html) => html && loadAssets(new DOMParser().parseFromString(html, "text/html"))));
  };
  const start = () => {
    initLogo();
    (window.requestIdleCallback || setTimeout)(warm, { timeout: 1200 });
    history.replaceState({ dt: history.state ? history.state.dt : 0 }, "");
    run(document.querySelector(".dt-main"), true);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else queueMicrotask(start);
})();
