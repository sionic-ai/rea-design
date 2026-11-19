(() => {
  // Loading — the target rises as photo sheets arrive, and the number follows by 10% of the remaining gap each frame. At 100
  // Numbers vanish at .25s over .5s while the panel lines come in (fx:start), the curtain lifts over .5s after .75s, then the header turns on
  const loader = document.querySelector(".uv-loader");
  const num = document.querySelector(".uv-loader__num");
  const stage = document.querySelector(".uv-stage");
  const cover = document.querySelector(".uv-cover");
  if (!loader || !stage) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tiles = stage.querySelectorAll('[data-fx-part="tile"]').length || 1;
  const p = { current: 0, previous: 0 };
  let done = false;
  // Per plate received, 100 / plate count — placeholder plates are baked straight to canvas with no loading time, so one is drawn every .15s, the average the original takes to receive one photo.
  // When a real photo is added, replace this spot with that photo’s load event
  let got = 0;
  const t0 = performance.now(), each = reduce ? 0 : 150;
  const tick = () => {
    const due = each ? Math.min(tiles, Math.floor((performance.now() - t0) / each) + 1) : tiles;
    if (got < due) { got = due; p.current = (got / tiles) * 100; }
    p.previous += (p.current - p.previous) * 0.1;
    num.textContent = `${Math.round(p.previous)}%`;
    if (!done && Math.round(p.previous) === 100) finish();
  };
  function finish() {
    done = true;
    try { sessionStorage.setItem("uv-loaded", "1"); } catch (e) {}
    gsap.ticker.remove(tick);
    const d = reduce ? 0 : 1;
    gsap.to(num, { opacity: 0, duration: 0.5 * d, delay: 0.25 * d, ease: "power1.inOut", onComplete: () => {
      stage.dispatchEvent(new CustomEvent("fx:start"));
      if (cover) { gsap.set(cover, { opacity: 1 }); gsap.to(cover, { opacity: 0, ease: "power1.inOut", duration: 0.75 * d, delay: 0.25 * d }); }
    } });
    gsap.to(loader, { opacity: 0, duration: 0.5 * d, delay: 0.75 * d, ease: "power1.inOut", onComplete: () => {
      loader.remove();
      document.dispatchEvent(new CustomEvent("uv:ready"));
    } });
  }
  // The loading number runs only once — when coming again in the same window (subpage → Hero) only the curtain lifts over .75s after .25s and the panel rows flow in right away
  let seen = false;
  try { seen = sessionStorage.getItem("uv-loaded") === "1"; } catch (e) {}
  if (seen) {
    done = true;
    loader.remove();
    const d = reduce ? 0 : 1;
    // Panel line parts attach after the document is fully read — delay the start signal until then
    const go = () => {
      stage.dispatchEvent(new CustomEvent("fx:start", { detail: { grow: false } }));
      // The original counts .25s from when the transition starts (when pressed on the subpage) — time spent loading this document is subtracted
      let wait = 0.25;
      try {
        const at = Number(sessionStorage.getItem("uv-nav-at")), since = (Date.now() - at) / 1000;
        sessionStorage.removeItem("uv-nav-at");
        if (at && since >= 0 && since < 2) wait = Math.max(0, wait - since);
      } catch (e) {}
      if (cover) { gsap.set(cover, { opacity: 1 }); gsap.to(cover, { opacity: 0, ease: "power1.inOut", duration: 0.75 * d, delay: wait * d }); }
      document.dispatchEvent(new CustomEvent("uv:ready"));
    };
    // If it is a pre-drawn panel (interaction pre-draw), open it after it has actually come over
    const ready = () => (document.prerendering ? document.addEventListener("prerenderingchange", go, { once: true }) : setTimeout(go));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
    else ready();
  } else if (document.prerendering) document.addEventListener("prerenderingchange", () => gsap.ticker.add(tick), { once: true });
  else gsap.ticker.add(tick);

  // Opening the panel (after it turns to face front) covers with a curtain and moves on to the detail
  stage.addEventListener("fx:open", (e) => {
    if (!e.detail.href) return;
    e.preventDefault();
    (window.uvGo || ((h) => { location.href = h; }))(e.detail.href);
  });
  // While the contact panel is open, the panel row does not respond to the pointer
  document.addEventListener("uv:contact", (e) => { stage.style.pointerEvents = e.detail.open ? "none" : ""; });
})();
