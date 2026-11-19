// Shared base for motion parts — a part only describes how it attaches to one element, while scanning, re-hooking late-added elements, reading options, and detaching are all handled here once.
// The app screen refreshes the list in place, so it sweeps once at the start and finishes — newly arrived cards get no motion, and removed cards’ ScrollTrigger and listeners remain.
(() => {
  if (window.kfFx) return;
  const made = new Map();
  const live = new WeakMap();
  const tracked = new Set();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const hover = matchMedia("(hover: hover) and (pointer: fine)");

  // When one element has several parts the options get mixed, so split them by part name — data-fx-card-lift="tilt: -2; lift: 8"
  const optionsOf = (el, name) => {
    const o = {};
    for (const part of (el.getAttribute(`data-fx-${name}`) || "").split(";")) {
      const i = part.indexOf(":");
      if (i > 0) o[part.slice(0, i).trim()] = part.slice(i + 1).trim();
    }
    return o;
  };

  function attach(el) {
    let has = live.get(el);
    if (!has) live.set(el, (has = new Map()));
    const want = new Set((el.getAttribute("data-fx") || "").split(/\s+/).filter(Boolean));
    for (const [name, off] of has) if (!want.has(name)) { off?.(); has.delete(name); }
    for (const name of want) {
      const fn = made.get(name);
      if (!fn || has.has(name)) continue;
      const scroller = el.closest("[data-fx-scroller]");
      const off = fn(el, { options: optionsOf(el, name), reduce: reduce.matches, hover: hover.matches, scroller: scroller || undefined });
      has.set(name, typeof off === "function" ? off : null);
      tracked.add(el);
    }
  }

  function detach(el) {
    const has = live.get(el);
    if (!has) return;
    const gone = !el.isConnected;
    for (const off of has.values()) off?.();
    live.delete(el);
    tracked.delete(el);
    // Undoing the pin makes ScrollTrigger put the element back into the pin-spacer — the app had already taken it out, so take it out again
    if (gone && el.isConnected) el.remove();
  }

  function scan(root = document) {
    if (root.matches?.("[data-fx]")) attach(root);
    root.querySelectorAll?.("[data-fx]").forEach(attach);
  }

  // Run the first sweep after the page scripts have all finished — the defer bundle already has readyState interactive when it runs, so sweeping right away would leave the later ones in the same bundle
  // Attached before html.js is added, so it measures size as 0 in hidden panels like [data-js]. Meanwhile it is always interactive, so whether DOMContentLoaded fired is checked from navigation history
  let started = false, queued = false;
  const parsed = () => {
    const nav = performance.getEntriesByType?.("navigation")[0];
    return nav ? nav.domContentLoadedEventStart > 0 : document.readyState !== "loading";
  };
  function scanSoon() {
    if (queued) return;
    queued = true;
    const go = () => { queued = false; started = true; scan(); };
    if (parsed()) queueMicrotask(go);
    else document.addEventListener("DOMContentLoaded", go, { once: true });
  }

  window.kfFx = {
    register(name, fn) {
      made.set(name, fn);
      scanSoon();
    },
    scan,
    // Original curve, values kept as they are — "0.16,1,0.3,1" Uses CustomEase, with GSAP names (power3.out) kept as they are. Where CustomEase is not loaded, the nearest GSAP curve (fallback) is used.
    ease(curve, fallback) {
      if (!String(curve).includes(",")) return curve;
      if (!window.CustomEase) return fallback;
      const name = `fx-${curve}`;
      return CustomEase.get(name) || CustomEase.create(name, curve);
    },
  };
  scanSoon();
  // Skip nodes already removed — GSAP briefly attaches a detached element to the document to measure it then removes it, and treating that as a newly added element and re-attaching makes attach/detach loop endlessly
  new MutationObserver((ms) => {
    // Elements the parser inserts come here too. Attaching before the first scan wastes the deferral above
    if (!started) return;
    for (const m of ms) {
      if (m.type === "attributes" && m.target.isConnected) attach(m.target);
      m.addedNodes.forEach((n) => n.nodeType === 1 && n.isConnected && scan(n));
    }
    for (const el of tracked) if (!el.isConnected) detach(el);
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-fx"] });
})();
