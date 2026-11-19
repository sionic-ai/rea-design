// Spans several pages — the loader (the black curtain shrinks by the loaded share of 9 cells, original max_load_count 9) and opening/closing the menu curtain.
// Each time a page script makes one scene asset, it calls mpLoader.step()
(() => {
  const loading = document.querySelector(".mp-loading");
  const slider = document.querySelector(".mp-loading__slider");
  const TOTAL = 9;
  // The original first page peeled the curtain back one step at a time, like stairs, for each video, 3D model and 9 textures received (from 3.3s to 1.8s, the front step large and smaller toward the back — measured length 5.4s).
  // Placeholders arrive quickly so that tempo is set as a value — the original detail page also appears immediately in about 1 second without a loader (body data-loader-hold · run)
  const quick = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HOLD = quick ? 0 : +(document.body.dataset.loaderHold ?? 3100);
  const RUN = quick ? 1 : +(document.body.dataset.loaderRun ?? 1800);
  const t0 = performance.now();
  let count = 0, shown = 100;
  const tick = () => {
    const due = Math.min(1, Math.max(0, (performance.now() - t0 - HOLD) / Math.max(1, RUN)));
    const k = Math.floor(due * TOTAL) / TOTAL;
    shown = 100 - (1 - (1 - k) * (1 - k)) * 100;
    if (slider) slider.style.maxHeight = `${Math.max(0, shown)}%`;
    if (due >= 1 && (count >= TOTAL || performance.now() - t0 > HOLD + RUN + 2000)) {
      loading?.classList.add("is-anim");
      setTimeout(() => { loading?.classList.add("is-done"); document.body.classList.remove("is-locked"); document.dispatchEvent(new CustomEvent("mp:ready")); }, quick ? 0 : +(document.body.dataset.loaderOut ?? 600));
      return;
    }
    requestAnimationFrame(tick);
  };
  document.body.classList.add("is-locked");
  requestAnimationFrame(tick);
  window.mpLoader = { step: (n = 1) => { count = Math.min(TOTAL, count + n); } };
  document.fonts?.ready.then(() => window.mpLoader.step());
  addEventListener("load", () => window.mpLoader.step());

  const side = document.getElementById("mp-side");
  const strip = document.querySelector(".mp-strip");
  if (side && strip) {
    const setSide = (on) => {
      side.hidden = false;
      side.classList.toggle("is-open", on);
      strip.setAttribute("aria-expanded", String(on));
      document.body.classList.toggle("is-side", on);
      if (!on) setTimeout(() => { if (!side.classList.contains("is-open")) side.hidden = true; }, 200);
    };
    strip.addEventListener("click", () => setSide(!side.classList.contains("is-open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setSide(false); });
  }

  const menu = document.getElementById("mp-menu");
  const btn = document.querySelector(".mp-menu-btn");
  if (!menu || !btn) return;
  const open = () => {
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    btn.style.visibility = "hidden";
    document.body.classList.add("is-menu");
    setTimeout(() => menu.classList.add("is-open"), 100);
  };
  const close = () => {
    menu.classList.remove("is-open");
    menu.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    btn.style.visibility = "";
    document.body.classList.remove("is-menu");
  };
  btn.addEventListener("click", open);
  menu.querySelector(".mp-menu__close").addEventListener("click", close);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) close(); });
})();
