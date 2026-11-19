// Build the screen cover with the same cells as the background grid — cells must switch on and off aligned to the page grid lines to read as tiles laid down then lifted away.
// Since it moves to the next page while covered, uncovering happens when the arrived page opens. Only the first visit (once per tab) shows the intro panel.
(() => {
  kfFx.register("tile-veil", (el, { options, reduce }) => {
    const ac = new AbortController(), signal = ac.signal;
    const timers = [];
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));
    const num = (k, d) => +(options[k] ?? d);
    const SM = num("sm", 767);
    const fade = num("fade", 0.1), out = num("out", 0.2), open = num("open", 0.5), each = num("each", 0.25);
    const wait = num("wait", 0.4), hold = num("hold", 2.5), cover = num("cover", 1), delay = num("delay", 0.1);
    el.style.setProperty("--fx-fade", fade + "s");
    el.style.setProperty("--fx-out", out + "s");
    const intro = el.querySelector('[data-fx-part="intro"]');
    const grid = document.createElement("div");
    grid.className = "fx-tv-grid";
    el.prepend(grid);
    const phase = (name) => el.dispatchEvent(new CustomEvent("fx:phase", { bubbles: true, detail: { phase: name } }));
    const small = () => innerWidth <= SM;
    // Cell size and first line height scale with screen width like the original — 275px at 1440 width (+1px line), phone 118px at 375 width
    const size = () => (small() ? (num("cell-sm", 118) * innerWidth) / num("base-sm", 375) : (num("cell", 275) * innerWidth) / num("base", 1440)) + 1;
    const top = () => (small() ? (num("y-sm", 50) * innerWidth) / num("base-sm", 375) : (num("y", 104) * innerWidth) / num("base", 1440));
    const place = (center) => {
      const c = size();
      grid.style.top = (center ? -(c - ((innerHeight / 2) % c)) : -((scrollY % c) + (c - top()))) + "px";
    };
    const build = (spread) => {
      const c = size();
      const cols = Math.ceil(innerWidth / c) + (Math.ceil(innerWidth / c) % 2 ? 0 : 1);
      const rows = Math.ceil(innerHeight / c) + 2;
      el.style.setProperty("--fx-cell", c + "px");
      grid.style.width = cols * c + "px";
      grid.innerHTML = "";
      for (let i = 0; i < cols * rows; i++) {
        const t = document.createElement("i");
        t.style.transitionDelay = (spread * Math.ceil(20 * Math.random())) / 20 + "s";
        grid.append(t);
      }
      place(false);
    };
    const reveal = () => {
      el.classList.add("is-hide");
      phase("hide");
      later(() => { document.documentElement.classList.add("fx-tv-open"); phase("open"); }, 0.6);
      later(() => (el.style.display = "none"), 0.7);
    };
    const ready = () => {
      el.classList.add("is-ready");
      phase("ready");
      if (el.classList.contains("is-intro")) {
        later(() => { place(true); el.classList.add("is-cover"); phase("cover"); }, hold);
        later(() => { place(false); reveal(); }, hold + cover);
      } else later(reveal, delay);
    };
    const KEY = "kf-fx-tile-veil-seen";
    const first = intro && !sessionStorage.getItem(KEY);
    // The blank screen the original shows while fetching fonts and images on first open is only for first visits — arriving pages already have them and open in .25s
    const least = first ? num("ready", 0.25) : 0.25;
    sessionStorage.setItem(KEY, "1");
    if (intro && !first) intro.remove();
    if (reduce) {
      el.style.display = "none";
      queueMicrotask(() => { document.documentElement.classList.add("fx-tv-open"); phase("open"); });
    } else {
      build(open);
      if (first) el.classList.add("is-intro");
      // The original opens only after fonts attach or 2s pass, the Hero images are all in, and at least .25s (ready) has passed
      Promise.all([Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2000))]), new Promise((r) => setTimeout(r, least * 1000))]).then(() => !signal.aborted && ready());
    }
    const leave = (href) => {
      timers.splice(0).forEach(clearTimeout);
      intro?.remove();
      el.removeAttribute("style");
      el.style.setProperty("--fx-fade", fade + "s");
      el.style.setProperty("--fx-out", out + "s");
      el.classList.remove("is-intro", "is-cover", "is-hide");
      el.classList.add("is-leave");
      build(each);
      requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add("is-cover"); phase("leave"); }));
      later(() => (location.href = href), wait);
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download") || a.closest("[data-veil-skip]")) return;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/.test(raw)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
      e.preventDefault();
      leave(url.href);
    }, { signal });
    // When returning from cache via Back it stays covered, so clear it
    addEventListener("pageshow", (e) => { if (e.persisted) { el.classList.remove("is-leave", "is-cover"); el.style.display = "none"; } }, { signal });
    return () => {
      ac.abort();
      timers.forEach(clearTimeout);
      grid.remove();
      el.classList.remove("is-intro", "is-cover", "is-hide", "is-leave", "is-ready");
      el.removeAttribute("style");
    };
  });
})();
