// All pages: window height variable (--vh) · header menu · horizontal scroll (smooth-scrollbar, wheel turned horizontal) · bottom neighborhood strip (cars, patterns) · barba panel transition.
// Page-specific things (city canvas, vehicle buttons) register init and off in window.tkPages[namespace].
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  root.classList.add(touch ? "tk-touch" : "tk-hover");
  window.tkPages = window.tkPages || {};

  const setVh = () => root.style.setProperty("--vh", `${innerHeight / 100}px`);
  setVh();
  addEventListener("resize", setVh);

  // Plugin that converts vertical wheel movement into horizontal (original invertDelta, events: wheel)
  if (window.Scrollbar && !window.tkInvertDelta) {
    class InvertDelta extends Scrollbar.ScrollbarPlugin {
      transformDelta(delta, e) { return this.options.events.some((t) => e.type.match(t)) ? { x: delta.y, y: delta.x } : delta; }
    }
    InvertDelta.pluginName = "invertDelta";
    InvertDelta.defaultOptions = { events: [] };
    Scrollbar.use(InvertDelta, window.OverscrollPlugin && (OverscrollPlugin.default || OverscrollPlugin));
    window.tkInvertDelta = true;
  }

  let bar = null;
  const spy = { el: null, before: 0, now: 0, limit: 0, angle: 0, leftEnd: false, rightEnd: false, off: null };
  const THRESHOLD = 150;
  const cls = (k, on) => spy.el.classList.toggle(k, on);

  function spyUpdate() {
    if (!spy.el) return;
    if (bar) { bar.update(); spy.limit = bar.limit.x; spy.now = bar.offset.x; }
    else { const sc = spy.scroller; spy.limit = sc.scrollWidth - innerWidth; spy.now = sc.scrollLeft; }
    if (spy.limit < THRESHOLD) return noscroll();
    cls("is-noscroll", false); cls("is-scrollable", true);
    checkLimit();
  }
  function noscroll() {
    ["is-limit", "is-start", "is-scrolling", "is-scrollable", "is-right", "is-left"].forEach((k) => cls(k, false));
    cls("is-noscroll", true);
    if (spy.content) spy.content.style.transform = "";
    if (spy.bg) spy.bg.style.backgroundPosition = "";
  }
  function checkLimit() {
    if (spy.now >= spy.limit - 5) { cls("is-limit", true); cls("is-scrolling", false); spy.rightEnd = true; }
    else { spy.rightEnd = false; cls("is-limit", false); }
    if (spy.now < 5) { cls("is-start", true); cls("is-scrolling", false); spy.leftEnd = true; }
    else { cls("is-start", false); spy.leftEnd = false; }
  }
  // The car runs across the screen width by the scroll ratio, and the pattern slides back by the same amount
  function carMove() {
    if (spy.leftEnd || spy.rightEnd || !spy.content) return;
    const w = innerWidth, ratio = (w - spy.content.offsetWidth) / w;
    const p = Math.min(w, Math.max(0, (spy.now / spy.limit) * w));
    const x = p * ratio;
    spy.content.style.transform = `translateX(${x}px)`;
    if (spy.bg) spy.bg.style.backgroundPosition = `-${x}px 0`;
  }
  function onScroll() {
    if (spy.limit < THRESHOLD) return noscroll();
    carMove();
    if (Math.abs(spy.now - spy.before) > 3) {
      cls("is-scrolling", true);
      const right = spy.now > spy.before;
      cls("is-right", right); cls("is-left", !right);
    } else cls("is-scrolling", false);
    checkLimit();
  }

  function initPage(container) {
    const ns = container.dataset.barbaNamespace;
    const event = container.querySelector(".tk-contents");
    const target = container.querySelector(".tk-scroll");
    spy.el = container.querySelector(".tk-spy");
    spy.content = spy.el?.querySelector(".tk-spy__wrap");
    spy.bg = spy.el?.querySelector(".tk-spy__bg");
    spy.scroller = target;
    if (target && window.Scrollbar && !touch) {
      bar = Scrollbar.init(target, { plugins: { invertDelta: { events: ["wheel"] }, overscroll: {} }, delegateTo: event });
      bar.addListener((s) => { spy.limit = s.limit.x; spy.now = s.offset.x; onScroll(); spy.before = spy.now; });
    } else if (target) {
      const h = () => { spy.now = target.scrollLeft; onScroll(); spy.before = spy.now; };
      target.addEventListener("scroll", h, { passive: true });
      spy.off = () => target.removeEventListener("scroll", h);
    }
    spyUpdate();
    // Strip car (when it reaches the end) and wheel button: pressing returns to the start
    container.querySelectorAll("[data-tk-start]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      if (bar) bar.scrollTo(0, 0, reduce ? 0 : 600);
      else target?.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
    }));
    initHeader(container);
    window.tkPages[ns]?.init?.(container, bar);
  }
  function offPage(container) {
    const ns = container.dataset.barbaNamespace;
    window.tkPages[ns]?.off?.(container);
    bar?.destroy(); bar = null;
    spy.off?.(); spy.off = null; spy.el = null;
  }
  let resizeT = 0;
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(spyUpdate, 300); });

  // Header — the circle opens and closes, and if the window is tall and narrow the text size shrinks in vh
  function initHeader(container) {
    const head = container.querySelector(".tk-header");
    if (!head) return;
    const fit = () => {
      const r = innerWidth / innerHeight;
      if (r < 0.75) head.style.fontSize = `calc(var(--vh, 1vh) * ${1 - (0.75 - r)})`;
      else head.style.fontSize = "";
    };
    fit();
    addEventListener("resize", fit);
    head.querySelector(".tk-menubtn")?.addEventListener("click", () => head.classList.toggle("is-menu-open"));
  }

  const loader = document.querySelector(".tk-page-loader");
  const first = document.querySelector('[data-barba="container"]');
  const start = () => initPage(first);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  if (!window.barba) return;
  const waitAnim = (el) => new Promise((res) => {
    if (reduce) return res();
    const h = (e) => { if (e.target !== el) return; el.removeEventListener("animationend", h); res(); };
    el.addEventListener("animationend", h);
  });
  barba.init({
    preventRunning: true,
    timeout: 300000,
    prevent: ({ el }) => !!el && (el.target === "_blank" || el.hasAttribute("data-barba-prevent") || (el.getAttribute("href") || "").startsWith("#")),
    transitions: [{
      leave({ current, next, trigger }) {
        const box = current.container.querySelector(".tk-container");
        box.classList.add("is-busy", "is-leave");
        // On the close button, back, or going to the first page, it shrinks away
        const back = trigger === "back" || (trigger?.classList && trigger.classList.contains("tk-close")) || /\/index\.html$|\/$/.test(next?.url?.path || "");
        if (back) box.classList.add("is-back");
        offPage(current.container);
        return waitAnim(box).then(() => { loader.classList.remove("is-complete"); loader.classList.add("is-loading"); });
      },
      enter({ next }) {
        loader.classList.remove("is-loading");
        loader.classList.add("is-complete");
        const box = next.container.querySelector(".tk-container");
        box.classList.add("is-busy", "is-enter");
        initPage(next.container);
        return waitAnim(box);
      },
      after({ next }) {
        const box = next.container.querySelector(".tk-container");
        box.classList.remove("is-busy", "is-enter");
      },
    }],
  });
})();
