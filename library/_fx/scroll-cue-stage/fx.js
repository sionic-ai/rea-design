// Original (bank exploration page) compared ten covers from the top on every scroll, adding and removing the actor’s class.
// Here we replay past markers in document order to set the state in one go — scrolling back up retraces the same path in reverse.
(() => {
  const STATES = ["on", "off", "center", "left", "right"];
  kfFx.register("scroll-cue-stage", (el, { scroller }) => {
    const box = scroller || null;
    const view = () => (box ? box.getBoundingClientRect().bottom : innerHeight);
    const parse = (s) => (s || "").trim().split(/\s+/).filter(Boolean).map((p) => p.split("=")).filter((p) => p[0]);
    let raf = 0;
    const apply = () => {
      raf = 0;
      const actors = [...el.querySelectorAll('[data-fx-part="actor"]')];
      if (!actors.length) return;
      const state = {};
      const edge = view();
      for (const cue of el.querySelectorAll('[data-fx-part="cue"]')) {
        if (cue.getBoundingClientRect().top >= edge) continue;
        for (const [key, to = ""] of parse(cue.dataset.cue)) state[key] = STATES.includes(to) ? to : "";
      }
      for (const a of actors) {
        const want = state[a.dataset.key] || "";
        for (const s of STATES) a.classList.toggle(`is-fx-${s}`, s === want);
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const target = box || window;
    target.addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    // Let late-arriving actors·covers also receive the current state — remeasure even if fonts·images push the cover slot
    const mo = new MutationObserver(queue);
    mo.observe(el, { childList: true, subtree: true });
    const ro = new ResizeObserver(queue);
    ro.observe(el);
    apply();
    return () => {
      target.removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      mo.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      for (const a of el.querySelectorAll('[data-fx-part="actor"]')) for (const s of STATES) a.classList.remove(`is-fx-${s}`);
    };
  });
})();
