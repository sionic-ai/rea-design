// Base for the single-screen experience — sends progress to the loader curtain (ring-iris-loader) and waits for its end, and keeps turning performance notices, header buttons and radio strips on and off in one place
(() => {
  const loader = document.querySelector(".tp-loader");
  const notice = document.querySelector(".tp-notice");
  const header = document.querySelector(".tp-header");
  const ticker = document.querySelector(".tp-ticker");
  const send = (type, detail) => loader?.dispatchEvent(new CustomEvent(type, { detail }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  window.tpShared = {
    progress: (p) => send("fx:progress", p),
    status: (t) => send("fx:status", t),
    // Call after all shaders are baked — released once the hole opens fully and the curtain hides
    finish: () => new Promise((resolve) => {
      if (!loader || loader.hidden) { resolve(); return; }
      loader.addEventListener("fx:done", () => resolve(), { once: true });
      send("fx:finish");
    }),
    notice: {
      show() { if (!notice) return; notice.hidden = false; requestAnimationFrame(() => notice.classList.add("is-visible")); },
      async hide(delay = 420) { notice?.classList.remove("is-visible"); await wait(delay); if (notice) notice.hidden = true; },
    },
    header: (on) => header?.classList.toggle("is-show", on),
    ticker: (on) => ticker?.classList.toggle("is-visible", on),
    wait,
  };
})();
