// Shared by all pages: draws in glass nav·footer, and sets up status button label slide·number wheel·page transition bar·drawer·video playback·collection header overlapping cover.
// Original values: label .6s bounce, background .45s circ-out, check .45s overshoot, wheel 1.2s bounce (.05s per slot), drawer .6s expo.out (overlapping panel .8s power2.out).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const WORKS = 39;
  const root = document.documentElement;
  // Pages arriving from within the site (having taken over the transition bar or being prerendered) appear with the first view already in place, like the original SPA
  const arrived = document.prerendering || sessionStorage.getItem("s-nav-bar") !== null;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Observer) gsap.registerPlugin(Observer);

  // The wheel curve swaps the bounce sample (--ease-bounce) into a CustomEase path, like the original
  let bounce = "back.out(1.4)";
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    const pts = (getComputedStyle(root).getPropertyValue("--ease-bounce").match(/-?\d*\.?\d+/g) || []).map(Number);
    if (pts.length > 2) bounce = CustomEase.create("counterBounce", pts.map((v, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)).toFixed(4)},${v}`).join(" "));
  }

  const counter = (n, style = "") => `<span class="s-counter" data-counter="${n}" style="opacity:0;${style}"><span class="s-counter__wheels">${String(n).split("").map((_, i, a) => `<span class="s-counter__wheel" data-divisor="${10 ** (a.length - 1 - i)}"><span class="s-counter__strip">${[...Array(10).keys()].map((d) => `<span>${d}</span>`).join("")}</span></span>`).join("")}</span><span class="sr-only">${n}</span></span>`;
  // Number wheel: each digit rolls its strip to that number (1.2s · each digit .05s later), and the panel appears in .4s. When hiding, it winds back to 0 in .3s
  const rollCounter = (el, hide = false, delay = 0, snap = false, instant = false) => {
    const n = Number(el.dataset.counter || 0);
    $$(".s-counter__wheel", el).forEach((w, i) => {
      const d = Math.floor(n / Number(w.dataset.divisor || 1)) % 10;
      gsap.to($(".s-counter__strip", w), { y: hide ? 0 : -d * w.offsetHeight, duration: reduced || instant ? 0 : 1.2, ease: bounce, delay: delay + i * 0.05, overwrite: true });
    });
    gsap.to(el, { opacity: hide ? 0 : 1, duration: reduced || snap || instant ? 0 : hide ? 0.3 : 0.4, ease: "power2.out", delay: instant ? 0 : delay, overwrite: true });
  };

  const head = $('[data-slot="header"]');
  head.classList.add("s-head");
  head.innerHTML = `
    <div class="s-bar">
      <div class="s-bar__head">
        <div class="s-bar__main"><p>NAME SURNAME</p><p>Your title line here</p></div>
        <button class="s-status" type="button" aria-label="Copy email address">
          <span class="s-slide" data-labels="status:Accepting new projects|copy:Copy email address|again:Copy once more|copied:Email address copied!"></span>
          <span class="s-status__ind"><span class="s-status__dot"></span><svg class="s-status__check" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2.5 6.5 5 9l4.5-6"/></svg></span>
        </button>
      </div>
      <nav class="s-bar__nav" aria-label="Main menu"><ul>
        <li><a class="s-navbtn${page === "home" ? " is-current" : ""}" href="index.html"><span class="s-navbtn__in"><span class="s-navbtn__label">Works</span><span class="s-navbtn__cnt">${counter(WORKS)}</span></span></a></li>
        <li><a class="s-navbtn${page === "about" ? " is-current" : ""}" href="about.html"><span class="s-navbtn__in"><span class="s-navbtn__label">About</span></span></a></li>
      </ul></nav>
    </div>`;
  head.insertAdjacentHTML("beforebegin", '<div class="s-progress" aria-hidden="true"><i></i></div>');
  // Works count wheel (original counter-trigger): if it is the current page it rolls in right away, otherwise it stays hidden and rolls in when interaction arrives, then rewinds to 0 on leaving
  {
    const cnt = $(".s-counter", head), btn = cnt.closest(".s-navbtn");
    // In the original the header stays as is across page turns, so on arrived pages the wheel is not spun again
    if (btn.classList.contains("is-current")) rollCounter(cnt, false, 0, false, arrived);
    else if (matchMedia("(hover: hover)").matches) {
      // Original: when the hand arrives the number plate stands up immediately (only the outer plate appears, in .45s), when it leaves, the outer plate fades first, then the plate winds up a beat later
      btn.addEventListener("mouseenter", () => rollCounter(cnt, false, 0, true));
      btn.addEventListener("mouseleave", () => requestAnimationFrame(() => !btn.matches(":hover") && rollCounter(cnt, true)));
    }
  }

  const foot = $('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("s-foot");
    foot.innerHTML = `
      <div class="s-foot__in">
        <div class="s-foot__col"><p>NAME SURNAME</p><div class="s-foot__icons" role="radiogroup" aria-label="Theme"><button type="button" data-theme-set="system" aria-label="System theme"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="8" rx="1"/><path d="M6 13.5h4"/></svg></button><button type="button" data-theme-set="light" aria-label="Light theme"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"/></svg></button><button type="button" data-theme-set="dark" aria-label="Dark theme"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5Z"/></svg></button></div></div>
        <div class="s-foot__col"><p>Your job title here</p><small>Your maker credit here</small></div>
        <div class="s-foot__cta">
          <header><p>One line inviting you to join us here?</p><span class="dot"></span></header>
          <div><p><button class="s-foot__copy" type="button"><span class="s-slide s-slide--start" data-labels="copy:Copy email address|again:Copy once more|copied:Copied!"></span></button></p><p><a href="#">Your contact channel link here</a></p></div>
        </div>
      </div>`;
  }

  // Theme: as in the original, the default is system, and the chosen value persists to the next page. At the moment of change all transitions are turned off (is-theme-switching)
  const THEME = "s-theme";
  const resolve = (v) => (v === "dark" || (v === "system" && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
  const setTheme = (v, save = true) => {
    if (save) v === "system" ? localStorage.removeItem(THEME) : localStorage.setItem(THEME, v);
    root.classList.add("is-theme-switching");
    root.dataset.theme = resolve(v);
    $$("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === v)));
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-theme-switching")));
  };
  $$("[data-theme-set]").forEach((b) => b.addEventListener("click", () => setTheme(b.dataset.themeSet)));
  setTheme(localStorage.getItem(THEME) || "system", false);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => !localStorage.getItem(THEME) && setTheme("system", false));

  /* Label slide (original slide-labels): measures each label’s width in advance, and on change grows or shrinks to the new label width (is-shrinking when shrinking) */
  const slideLabels = (box) => {
    const pairs = box.dataset.labels.split("|").map((p) => p.split(":"));
    box.innerHTML = pairs.map(([k, t]) => `<i data-k="${k}">${t}</i>`).join("");
    const items = Object.fromEntries($$("i", box).map((i) => [i.dataset.k, i]));
    let cur = pairs[0][0];
    items[cur].classList.add("is-current");
    const widths = {};
    const measure = () => { Object.entries(items).forEach(([k, i]) => (widths[k] = i.offsetWidth)); box.style.setProperty("--w", `${widths[cur]}px`); box.classList.add("is-measured"); };
    document.fonts.ready.then(measure);
    return (k) => {
      if (k === cur) return;
      const prev = cur;
      box.classList.toggle("is-shrinking", (widths[k] ?? 0) < (widths[prev] ?? 0));
      $$("i", box).forEach((i) => i.classList.remove("is-leaving"));
      items[prev].classList.remove("is-current"); items[prev].classList.add("is-leaving");
      items[k].classList.add("is-current");
      box.classList.add("is-animated");
      box.style.setProperty("--w", `${widths[k]}px`);
      cur = k;
    };
  };
  // Copy: header shows ‹Copied› for 2s, footer for 3s. After one copy, both buttons become ‹Copy again›
  let hasCopied = false;
  const copyButton = (btn, ms, label) => {
    const set = slideLabels($(".s-slide", btn));
    let copied = false, hover = false, focus = false, t = null;
    const sync = () => {
      const k = copied ? "copied" : label(hover || focus);
      set(k);
      btn.dataset.state = k;
      btn.classList.toggle("is-active", k !== "status");
    };
    btn.addEventListener("click", () => { navigator.clipboard?.writeText("hello@example.com").catch(() => {}); hasCopied = copied = true; clearTimeout(t); t = setTimeout(() => { copied = false; sync(); others(); }, ms); sync(); others(); });
    btn.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; sync(); } });
    btn.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hover = false; sync(); } });
    btn.addEventListener("focus", () => { focus = btn.matches(":focus-visible"); sync(); });
    btn.addEventListener("blur", () => { focus = false; sync(); });
    return sync;
  };
  const syncs = [];
  const others = () => syncs.forEach((f) => f());
  syncs.push(copyButton($(".s-status"), 2000, (on) => (on ? (hasCopied ? "again" : "copy") : "status")));
  if (foot) syncs.push(copyButton($(".s-foot__copy", foot), 3000, () => (hasCopied ? "again" : "copy")));

  /* Page transition bar: on press it runs to .9 over 8s (power2.out). When the new page is up it finishes in .2s → then lifts away over .3s (power2.in) pivoting on the right edge.
     The screen transition itself is done by CSS view transitions (@view-transition) — the old screen fades out in .25s, the new screen fades in for .35s after .25s */
  const bar = $(".s-progress i");
  const NAV = "s-nav-bar";
  let barTween = null;
  const barStart = () => {
    barTween && barTween.kill();
    gsap.set(bar, { visibility: "visible", transformOrigin: "0% 50%" });
    barTween = gsap.to(bar, { scaleX: 0.9, duration: 8, ease: "power2.out" });
  };
  const barDone = () => {
    barTween && barTween.kill();
    gsap.set(bar, { visibility: "visible", transformOrigin: "0% 50%" });
    barTween = gsap.to(bar, { scaleX: 1, duration: reduced ? 0 : 0.2, ease: "power2.out", onComplete: () => {
      gsap.set(bar, { transformOrigin: "100% 50%" });
      barTween = gsap.to(bar, { scaleX: 0, duration: reduced ? 0 : 0.3, ease: "power2.in", onComplete: () => gsap.set(bar, { visibility: "hidden" }) });
    } });
  };
  const keep = () => sessionStorage.setItem(NAV, String(gsap.getProperty(bar, "scaleX")));
  window.addEventListener("pageswap", keep);
  window.addEventListener("pagehide", keep);
  // A prerendered page picks up the bar when actually navigated to
  const arrive = () => {
    const carried = sessionStorage.getItem(NAV);
    if (carried !== null) { sessionStorage.removeItem(NAV); gsap.set(bar, { scaleX: Number(carried) || 0 }); barDone(); }
  };
  document.prerendering ? document.addEventListener("prerenderingchange", arrive, { once: true }) : arrive();

  /* ---------- Drawer: Work·Collection links don’t navigate, they load that page’s body into a plate rising from below ---------- */
  const DRAWER = /(^|\/)(collection|project)\.html$/;
  const cache = new Map();
  const layers = [];
  let dialog = null, backdrop = null, busy = false, dragged = false;
  const tw = (el, vars) => (el ? gsap.to(el, { duration: reduced ? 0 : 0.6, ease: "expo.out", overwrite: "auto", ...vars }).then() : Promise.resolve());
  const under = (layer, on) => Promise.all([
    tw(layer, { duration: reduced ? 0 : 0.8, ease: "power2.out", y: on ? "2rem" : 0, scale: on ? 0.94 : 1 }),
    tw($(".s-drawer__dim", layer), { duration: reduced ? 0 : 0.8, ease: "power2.out", opacity: on ? 0.15 : 0 }),
  ]);
  const load = async (url) => {
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((t) => $("main", new DOMParser().parseFromString(t, "text/html"))?.innerHTML || ""));
    return cache.get(url);
  };
  const ensureDialog = () => {
    if (dialog) return;
    document.body.insertAdjacentHTML("beforeend", '<dialog class="s-drawer" data-theme="light" tabindex="-1" aria-label="View work"><div class="s-drawer__backdrop" aria-hidden="true"></div></dialog>');
    dialog = $(".s-drawer"); backdrop = $(".s-drawer__backdrop", dialog);
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); history.back(); });
    let downOnBack = false;
    dialog.addEventListener("pointerdown", (e) => { downOnBack = e.target === dialog || e.target === backdrop || e.target.classList.contains("s-drawer__layer"); });
    dialog.addEventListener("click", (e) => { if (downOnBack && (e.target === dialog || e.target === backdrop || e.target.classList.contains("s-drawer__layer"))) history.back(); downOnBack = false; });
  };
  // Drag the handle (mouse) or push down from the very top (touch) and the sheet follows down. Upward only by a square root amount. At speed 500 or more, or past halfway, it closes
  const dragLayer = (layer) => {
    const scroller = $(".s-drawer__scroller", layer);
    let grab = null, dy = 0, h = 0;
    return Observer.create({
      target: layer, type: "touch,pointer", lockAxis: true, dragMinimum: 6, preventDefault: false,
      onPress: (o) => {
        const t = o.event.target, mouse = o.event.pointerType === "mouse";
        dy = 0; h = layer.offsetHeight;
        grab = layers.at(-1) !== layer ? false : t.closest(".s-drawer__handle") ? true : mouse || scroller.scrollTop > 0 ? false : null;
      },
      onDrag: (o) => {
        if (o.axis === "x") return;
        if (grab === null) grab = o.deltaY > 0;
        if (!grab) return;
        o.event.cancelable && o.event.preventDefault();
        dy = (o.y ?? 0) - (o.startY ?? 0);
        gsap.set(layer, { y: dy > 0 ? dy : -Math.sqrt(-dy) });
        if (layers.length === 1) gsap.set(backdrop, { opacity: 1 - gsap.utils.clamp(0, 1, dy / h) });
      },
      onRelease: (o) => {
        if (!grab || dy === 0) return;
        grab = null;
        if (dy > 0 && (o.velocityY > 500 || dy > h * 0.5)) {
          const left = layer.offsetHeight - Number(gsap.getProperty(layer, "y"));
          const d = gsap.utils.clamp(0.15, 0.45, left / Math.max(o.velocityY, 1));
          busy = true;
          Promise.all([tw(layer, { yPercent: 100, y: 0, duration: d, ease: "power2.out" }), layers.length === 1 ? tw(backdrop, { opacity: 0, duration: d }) : under(layers.at(-2), false)])
            .then(() => { busy = false; dragged = true; history.back(); });
        } else {
          tw(layer, { y: 0, duration: 0.4 });
          if (layers.length === 1) tw(backdrop, { opacity: 1, duration: 0.4 });
        }
      },
    });
  };
  const openDrawer = async (url, push = true) => {
    if (busy) return;
    busy = true;
    let html;
    try { html = await load(url); } catch { busy = false; location.href = url; return; }
    ensureDialog();
    dialog.insertAdjacentHTML("beforeend", `<section class="s-drawer__layer" aria-label="Work"><div class="s-drawer__frame"><div class="s-drawer__sheet"><div class="s-drawer__scroller" tabindex="-1"><div class="s-drawer__handle"><div><span></span></div></div><div class="s-drawer__bar"><button class="s-btn" type="button" aria-label="Close"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m2.5 2.5 7 7m0-7-7 7"/></svg><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m2.5 2.5 7 7m0-7-7 7"/></svg></button></div><div class="s-drawer__body">${html}</div></div><div class="s-drawer__dim" aria-hidden="true"></div></div></div></section>`);
    const layer = dialog.lastElementChild, prev = layers.at(-1);
    layer._obs = window.Observer ? dragLayer(layer) : null;
    $(".s-drawer__bar .s-btn", layer).addEventListener("click", () => history.back());
    layers.push(layer);
    if (push) history.pushState({ drawer: layers.length }, "", url);
    if (!prev) { root.classList.add("modal-open"); dialog.showModal(); }
    initContent($(".s-drawer__body", layer));
    gsap.set(layer, { yPercent: 100 });
    await Promise.all([tw(layer, { yPercent: 0 }), prev ? under(prev, true) : tw(backdrop, { opacity: 1 })]);
    $(".s-drawer__scroller", layer).focus({ preventScroll: true });
    busy = false;
  };
  const closeDrawer = async () => {
    const layer = layers.at(-1);
    if (!layer) return;
    busy = true;
    const prev = layers.at(-2);
    if (!dragged) await Promise.all([tw(layer, { yPercent: 100, y: 0 }), prev ? under(prev, false) : tw(backdrop, { opacity: 0 })]);
    dragged = false;
    layers.pop(); layer._obs && layer._obs.kill();
    $$("[data-carousel]", layer).forEach((el) => el._blossom?.destroy());
    layer.remove();
    if (!prev) { dialog.close(); root.classList.remove("modal-open"); }
    busy = false;
  };
  window.addEventListener("popstate", () => {
    const want = history.state?.drawer || 0;
    if (want < layers.length) closeDrawer();
    else if (want > layers.length) openDrawer(location.href, false);
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== "_self")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    if (DRAWER.test(url.pathname) && location.protocol !== "file:") { e.preventDefault(); openDrawer(url.href); return; }
    if (/\.html$/.test(url.pathname)) barStart();
  });

  /* ---------- Video: plays only while on screen (stops in blurred cards and hidden panels). Preview slots play only while hovered.
     Direct playback (data-video="manual") starts by itself when first seen, a round button pauses it and plays it again ---------- */
  const videos = new Set();
  const updateVideo = (v) => {
    const el = v.video;
    if (!el) return;
    const dim = !!v.box.closest(".is-dimmed, [inert]");
    if (v.manual) {
      if (!v.seen || dim || !v.should || reduced) { el.pause(); if (v.seen && !v.should) el.preload = "metadata"; return; }
      el.paused && el.play().catch(() => {});
      return;
    }
    if (reduced || dim) { el.pause(); return; }
    v.hover || (v.seen && !v.box.closest("[data-preview-item]")) ? el.play().catch(() => {}) : el.pause();
  };
  const seen = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target._video;
    if (!v) return;
    const first = e.isIntersecting && !v.seen;
    v.seen = e.isIntersecting;
    if (v.manual && first && !reduced && !v.box.closest(".is-dimmed, [inert]")) v.should = true;
    updateVideo(v);
  }));
  const initVideos = (scope) => $$("[data-video]", scope).forEach((box) => {
    if (box._video) return;
    const v = { box, video: $("video", box), manual: box.dataset.video === "manual", seen: false, hover: false, should: false };
    box._video = v; videos.add(v);
    v.video.muted = true;
    seen.observe(box);
    box.addEventListener("pointerenter", () => { v.hover = true; updateVideo(v); });
    box.addEventListener("pointerleave", () => { v.hover = false; updateVideo(v); });
    const btn = $(".s-play", box.parentElement);
    if (btn) {
      const sync = () => { btn.setAttribute("aria-pressed", String(!v.video.paused)); btn.setAttribute("aria-label", v.video.paused ? "Video playback" : "Video paused"); btn.classList.toggle("is-playing", !v.video.paused); };
      v.video.addEventListener("play", sync); v.video.addEventListener("pause", sync);
      btn.addEventListener("click", () => { if (!v.video.paused) { v.should = false; v.video.pause(); } else { v.should = true; v.video.play().catch(() => {}); } });
    }
  });
  const refreshVideos = () => videos.forEach((v) => (v.box.isConnected ? updateVideo(v) : (seen.unobserve(v.box), videos.delete(v))));

  /* ---------- Collection header stacked covers: the cover in the cell under the cursor stands upright at 1.1x, the others shift away by 30% / distance (.8s elastic.out(1, .75)) ---------- */
  const initStack = (scope) => $$("[data-hero-stack]", scope).forEach((stack) => {
    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const els = $$("[data-hero-stack-item]", stack), inners = els.map((el) => $("[data-hero-stack-inner]", el)).filter(Boolean);
      const E = { duration: 0.8, ease: "elastic.out(1, 0.75)", overwrite: true };
      let rest = [], on = -1, left = 0, width = 0;
      const off = (i) => els[i] && gsap.to(els[i], { rotation: rest[i], scale: 1, ...E });
      const pick = (i) => { gsap.to(els[i], { rotation: 0, scale: 1.1, ...E }); inners.forEach((el, j) => gsap.to(el, { xPercent: j === i ? 0 : 30 / (j - i), ...E })); };
      const enter = () => { const r = stack.getBoundingClientRect(); left = r.left; width = r.width; if (!rest.length) rest = els.map((el) => Number(gsap.getProperty(el, "rotation"))); };
      const move = (e) => { if (!width) return; const g = Math.ceil(((e.clientX - left) / width) * els.length); if (g < 1 || g > els.length || g - 1 === on) return; if (on !== -1) off(on); on = g - 1; pick(on); };
      const leave = () => { if (on !== -1) off(on); on = -1; gsap.to(inners, { xPercent: 0, ...E }); };
      stack.addEventListener("mouseenter", enter); stack.addEventListener("mousemove", move); stack.addEventListener("mouseleave", leave);
      return () => { stack.removeEventListener("mouseenter", enter); stack.removeEventListener("mousemove", move); stack.removeEventListener("mouseleave", leave); gsap.killTweensOf([...els, ...inners]); };
    });
  });

  // Preview deck (original values): hovered card B=0 means in place, at the very front, the card pointed to earlier (B>0) goes up 13B−B²px and back 100Bpx (up to two slides visible),
  // The next card (B<0) waits hidden 43px below. Position and backdrop use .5s expo.out, visibility .05s. The panel appears and disappears in .3s
  // Skin variables resolve to oklch and GSAP can’t read them — paint one point and convert to rgb
  const color = (() => {
    const el = document.createElement("i"), x = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    el.style.display = "none"; document.body.append(el);
    return (v) => { el.style.color = `var(${v})`; x.clearRect(0, 0, 1, 1); x.fillStyle = getComputedStyle(el).color; x.fillRect(0, 0, 1, 1); const [r, g, b] = x.getImageData(0, 0, 1, 1).data; return `rgb(${r}, ${g}, ${b})`; };
  })();
  $$("[data-preview-container]").forEach((box) => {
    const group = box.parentElement, triggers = $$("[data-preview-trigger]", group), cards = $$("[data-preview-item]", box);
    let k = -1, shown = false, raf = null, fade = null, wait = null, px = 0, py = 0;
    const stack = () => [color("--site-stack-1"), color("--site-stack-2"), color("--site-stack-3")];
    // The original card starts with no background (transparent) and is painted gray on first hover
    gsap.set(cards, { y: 0, z: 0, autoAlpha: 0, backgroundColor: "transparent" });
    const place = () => {
      const bg = stack();
      cards.forEach((card, a) => {
        const B = k - a;
        const v = B === 0 ? { y: 0, z: 0, o: 1, c: bg[0] } : B > 0 ? { y: -(13 * B - B * B), z: -100 * B, o: B > 2 ? 0 : 1, c: B < 2 ? bg[B] : bg[2] } : { y: 43, z: 0, o: 0, c: bg[0] };
        gsap.to(card, { y: v.y, z: v.z, backgroundColor: v.c, duration: reduced ? 0 : 0.5, ease: "expo.out", overwrite: true });
        gsap.to(card, { autoAlpha: v.o, duration: reduced ? 0 : 0.05, ease: "linear", overwrite: "auto" });
      });
    };
    const open = (i) => {
      cancelAnimationFrame(raf);
      if (!shown) { shown = true; fade && fade.kill(); fade = gsap.to(box, { opacity: 1, duration: 0.3, ease: "power2.out" }); }
      if (i !== k) { k = i; place(); }
    };
    const close = () => { if (!shown) return; shown = false; k = -1; fade && fade.kill(); fade = gsap.to(box, { opacity: 0, duration: 0.3, ease: "power2.out" }); };
    const enter = (e) => { px = e.clientX; py = e.clientY; open(triggers.indexOf(e.currentTarget)); };
    const leave = () => { raf = requestAnimationFrame(() => { k = -1; close(); }); };
    // On scroll it closes, then 150ms after scrolling stops it reopens at the row under the cursor
    const onScroll = () => {
      const was = wait !== null;
      clearTimeout(wait);
      if (!shown && !was) return;
      close();
      wait = setTimeout(() => { wait = null; const t = document.elementFromPoint(px, py)?.closest("[data-preview-trigger]"); const i = t ? triggers.indexOf(t) : -1; i !== -1 && open(i); }, 150);
    };
    gsap.matchMedia().add("(hover: hover)", () => {
      triggers.forEach((t) => { t.addEventListener("mouseenter", enter); t.addEventListener("mouseleave", leave); });
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => { triggers.forEach((t) => { t.removeEventListener("mouseenter", enter); t.removeEventListener("mouseleave", leave); }); window.removeEventListener("scroll", onScroll); close(); };
    });
  });

  // List row reveal (original listing reveal): each head and row rises once it comes 100px above the bottom of the screen. The head’s count wheel rolls out after .2s
  const reveal = $$("[data-reveal]");
  if (reveal.length && window.ScrollTrigger) gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(reveal, { opacity: 0, y: "10%", pointerEvents: "none" });
    const triggers = reveal.map((el) => ScrollTrigger.create({
      trigger: el, start: "top bottom-=100px", toggleClass: "is-inview",
      onEnter: () => { gsap.to(el, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.8, ease: "power2.out", overwrite: true }); $$("[data-counter]", el).forEach((c) => rollCounter(c, false, 0.2)); },
      onLeaveBack: () => { gsap.to(el, { opacity: 0, y: "10%", pointerEvents: "none", duration: 0.6, ease: "power4.out", overwrite: true }); $$("[data-counter]", el).forEach((c) => rollCounter(c, true)); },
    }));
    return () => { triggers.forEach((t) => t.kill()); gsap.set(reveal, { clearProps: "all" }); };
  });
  if (reduced) $$(".h-list [data-counter]").forEach((c) => rollCounter(c));

  /* ---------- Drag-through picture strip: the same blossom-carousel 0.2.0 embedded in the original, with default options like the original ---------- */
  const initCarousels = (scope) => window.BlossomCarousel && $$("[data-carousel]", scope).forEach((el) => {
    if (el._blossom) return;
    el._blossom = BlossomCarousel.Blossom(el, {});
    el._blossom.init();
  });

  /* ---------- Small window (original team modal): showModal on open. On close, is-closing is added and close is called once the panel-shrinking animation ends (250ms at the latest) —
     Close button · outside the window · Esc ---------- */
  const initModals = (scope) => $$("[data-modal-open]", scope).forEach((btn) => {
    const dlg = $(`[data-modal="${btn.dataset.modalOpen}"]`, btn.parentElement);
    if (!dlg || btn._modal) return;
    btn._modal = true;
    const box = $(".s-modal__box", dlg);
    let closing = false;
    const close = () => {
      if (closing || !dlg.open) return;
      closing = true;
      dlg.classList.add("is-closing");
      let done = false;
      const end = () => {
        if (done) return;
        done = true;
        box.removeEventListener("animationend", onEnd);
        dlg.close();
        dlg.classList.remove("is-closing");
        closing = false;
      };
      const onEnd = (e) => e.target === box && e.animationName === "s-zoom-out" && end();
      box.addEventListener("animationend", onEnd);
      setTimeout(end, reduced ? 0 : 250);
    };
    btn.addEventListener("click", () => dlg.showModal());
    $(".s-modal__close", dlg)?.addEventListener("click", close);
    dlg.addEventListener("click", (e) => e.target === dlg && close());
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  });

  // Numbers that roll out when visible (original data-inview + data-counter-trigger): when first entering the screen the wheels roll out and stay as they are.
  const inview = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    inview.unobserve(e.target);
    e.target.classList.add("is-inview");
    $$("[data-counter]", e.target).forEach((c) => rollCounter(c));
  }));
  $$("[data-inview-counter]").forEach((el) => inview.observe(el));

  const initContent = (scope) => { initVideos(scope); initStack(scope); initCarousels(scope); initModals(scope); };
  initContent(document);

  window.SH = { $, $$, reduced, page, arrived, rollCounter, refreshVideos };
})();
