// Shared by all pages: page mounting (barba swaps only main, so hook up and release per section), bottom bar clock · mail button, film grain,
// Loader on entry (number 2330ms → text slides right → red torn sheet), page transition (white torn sheet — tear-sheet-page part).
// Like the original, every page loads every page script and picks one by the current main’s data-page.
(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.CustomEase) { gsap.registerPlugin(CustomEase); CustomEase.create("osmo", "0.625, 0.05, 0, 1"); }

  const pages = {};
  let live = null;
  const mount = (container) => {
    const name = container.dataset.page;
    body.dataset.page = name;
    document.querySelectorAll(".bar__btn").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === name));
    const fn = pages[name];
    live = fn ? fn(container) || null : null;
  };
  const unmount = () => { try { live?.(); } catch (e) { console.error(e); } live = null; };
  window.UC = { page: (name, fn) => (pages[name] = fn), reduce, gated: () => html.classList.contains("is-gated") };

  // ---------- Bottom bar: GMT+2 clock, mail button (turns red for 1.6s when pressed) ----------
  const clock = document.querySelector("[data-clock]");
  const tick = () => {
    if (!clock) return;
    const d = new Date(Date.now() + new Date().getTimezoneOffset() * 60000 + 2 * 3600000);
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
  };
  tick();
  setInterval(tick, 1000);
  // ---------- Text decode: each letter resolves somewhere in frames 0~12, cycles block glyphs for 6~20 frames (changes with .28 probability each frame), then settles on its own letter. Blanks stay as they are ----------
  const GLYPHS = "▘▙▚▛▜▝▞▟▖▗▄▀█▌▐▓▒░";
  const scrambler = (el) => {
    let raf = 0, frame = 0, q = [], after = null;
    const step = () => {
      let out = "", done = 0;
      for (const c of q) {
        if (c.to === " ") { out += " "; done++; continue; }
        if (frame >= c.end) { out += c.to; done++; }
        else if (frame >= c.start) { if (!c.ch || Math.random() < 0.28) c.ch = GLYPHS[(Math.random() * GLYPHS.length) | 0]; out += c.ch; }
        else out += c.from;
      }
      el.textContent = out;
      if (done === q.length) { const fn = after; after = null; fn?.(); return; }
      frame++;
      raf = requestAnimationFrame(step);
    };
    return (next, done) => {
      if (reduce) { el.textContent = next; done?.(); return; }
      const prev = el.textContent, len = Math.max(prev.length, next.length);
      q = [];
      for (let i = 0; i < len; i++) { const start = Math.floor(Math.random() * 12); q.push({ from: prev[i] || " ", to: next[i] || "", start, end: start + Math.floor(Math.random() * 14 + 6), ch: "" }); }
      cancelAnimationFrame(raf);
      frame = 0; after = done || null;
      step();
    };
  };
  // Re-decode on hover (nav letters) — hooked once on the whole document so it also listens to links in the main swapped by barba
  const labelOf = (el) => el.querySelector("[data-label]") || el;
  const sc = new WeakMap();
  const scOf = (lab) => { if (!sc.has(lab)) sc.set(lab, { run: scrambler(lab), home: lab.textContent }); return sc.get(lab); };
  document.addEventListener("pointerover", (e) => {
    const el = e.target.closest("[data-scramble], [data-copy]");
    if (!el || el.contains(e.relatedTarget)) return;
    const s = scOf(labelOf(el));
    if (el.hasAttribute("data-copy") && el.dataset.stage) return;
    // Nav text locks its width while decoding, so neighboring links aren’t pushed even if block glyphs are wider than the letters
    const lab = labelOf(el);
    if (el.hasAttribute("data-scramble")) { lab.style.width = `${lab.getBoundingClientRect().width}px`; lab.style.overflow = "hidden"; }
    s.run(s.home, () => { if (el.hasAttribute("data-scramble")) lab.style.width = lab.style.overflow = ""; });
  });
  // The mail button gives only on the third press — question → promise → surrender (copies only then), and the last line returns to the first words after 2.4s
  const SAY = ["Are you sure?", "I mean it", "Fine. Copied."];
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-copy]");
    if (!el) return;
    const lab = labelOf(el), s = scOf(lab);
    if (!lab.style.minWidth) lab.style.minWidth = `${Math.ceil(lab.getBoundingClientRect().width * 1.15)}px`;
    const stage = +(el.dataset.stage || 0);
    clearTimeout(el._hold);
    s.run(SAY[Math.min(stage, 2)]);
    el.dataset.stage = String(Math.min(stage + 1, 3));
    if (stage >= 2) {
      el.classList.add("is-copied");
      el._hold = setTimeout(() => { el.classList.remove("is-copied"); delete el.dataset.stage; s.run(s.home); }, 2400);
    }
  });

  // ---------- Film grain: make one sheet of gray noise and lay it down (not color — brightness noise) ----------
  const g = document.createElement("canvas");
  g.width = g.height = 128;
  const gx = g.getContext("2d");
  const img = gx.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) { const v = (Math.random() * 255) | 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  gx.putImageData(img, 0, 0);
  html.style.setProperty("--site-grain", `url(${g.toDataURL()})`);

  // ---------- Page turn ----------
  const tear = (phase) => new Promise((done) => body.dispatchEvent(new CustomEvent("fx:tear", { detail: { phase, done } })));
  const http = /^https?:$/.test(location.protocol) && window.barba;
  // When barba is present, parts don’t grab links and only receive events — set options before fx-core scans
  if (http) body.setAttribute("data-fx-tear-sheet-page", "nav: off");

  // ---------- Loader ----------
  const loader = document.querySelector("[data-loader]");
  const runLoader = () => new Promise((resolve) => {
    if (!html.classList.contains("is-loading") || !loader) { loader?.remove(); html.classList.remove("is-loading"); return resolve(); }
    const MIN = 2330, MAX = 2650, EXIT_AT = 1390;
    const pct = loader.querySelector("[data-loader-pct]"), line = loader.querySelector("[data-loader-line]");
    const t0 = performance.now();
    let exited = false;
    const step = (now) => {
      const el = now - t0;
      const p = Math.min(1, Math.min(el / MIN, Math.max(1, el / MAX)));
      pct.textContent = String(Math.round(p * 100));
      line.style.width = `${p * 100}%`;
      if (!exited && el >= EXIT_AT) { exited = true; loader.classList.add("is-exiting"); }
      if (p < 1) return requestAnimationFrame(step);
      // When the number fills, a red panel tears in from below to cover, the loader is removed while covered, then the panel lifts upward
      html.classList.add("is-loader-exit");
      tear("cover").then(() => {
        loader.remove();
        html.classList.remove("is-loading");
        resolve();
        return tear("clear");
      }).then(() => html.classList.remove("is-loader-exit"));
    };
    requestAnimationFrame(step);
  });

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (html.classList.contains("is-gated")) { body.dataset.page = first.dataset.page; return; }
    runLoader();
    mount(first);
    if (!http) return;
    history.scrollRestoration = "manual";
    barba.init({
      preventRunning: true,
      prevent: ({ el }) => {
        const a = el?.closest?.("a");
        const raw = a?.getAttribute("href") || "";
        return !a || !raw || raw.startsWith("#") || a.target === "_blank";
      },
      transitions: [{
        name: "tear",
        leave: () => tear("cover"),
        afterLeave: () => unmount(),
        enter: ({ next }) => { mount(next.container); return tear("clear"); },
      }],
    });
  };
  // fx-core attaches parts after DOMContentLoaded, so the loader’s panel event is sent after that too
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", () => setTimeout(start, 0));
  else setTimeout(start, 0);
})();
