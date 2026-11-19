// Scrambles letters into random (default) digit glyphs, then returns each letter to its place in turn — the shuffle-text library as is (airport departure board, menu names)
(() => {
  kfFx.register("shuffle-text", (el, { options, reduce, scroller }) => {
    const Shuffle = window.ShuffleText;
    const parts = [...el.querySelectorAll('[data-fx-part="text"]')];
    const targets = (parts.length ? parts : [el]).filter((t) => t.textContent.trim());
    if (!Shuffle || !targets.length) return;
    const original = targets.map((t) => t.textContent);
    const dur = +(options.dur ?? 0.8), delay = +(options.delay ?? 0), each = +(options.each ?? 0);
    const chars = options.chars || "1234567890", empty = options.empty ?? "";
    const on = options.on || "view";
    const runs = [];
    let st, timer, played = false;
    const run = () => {
      if (on !== "hover" && played) return;
      played = true;
      targets.forEach((t, i) => {
        const go = () => {
          const s = new Shuffle(t);
          s.sourceRandomCharacter = chars;
          s.emptyCharacter = empty;
          s.duration = Math.max(1, dur * 1000);
          s.start();
          runs.push(s);
        };
        each ? setTimeout(go, each * 1000 * i) : go();
      });
    };
    if (reduce) return;
    if (on === "load") timer = setTimeout(run, delay * 1000);
    else if (on === "hover") el.addEventListener("pointerenter", run);
    else {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 70%", once: true, onEnter: () => { timer = setTimeout(run, delay * 1000); } });
    }
    return () => {
      st?.kill();
      clearTimeout(timer);
      el.removeEventListener("pointerenter", run);
      runs.forEach((s) => s.stop());
      targets.forEach((t, i) => { t.textContent = original[i]; });
    };
  });
})();
