// First-time visitors only — on a white veil a character sequence (one-row sprite) steps through cells and stays during hold, and the veil background·greeting text clear on fade.
// When the reveal ends, fx:open fires. Wheel and touch scrolling are blocked until the curtain lifts. The looping graphic keeps running after the curtain lifts, and fx:sprite can play a different sequence once.
(() => {
  kfFx.register("sprite-curtain-opening", (el, { options, reduce }) => {
    const strip = el.querySelector('[data-fx-part="strip"]');
    const frames = Math.max(1, +options.frames || 15);
    const parse = (s) => String(s).trim().split(/\s+/).map(Number).filter((n) => Number.isFinite(n));
    const idle = parse(options.seq ?? "4 5");
    const beat = +(options.beat ?? 0.48);
    const hold = +(options.hold ?? 3), fade = +(options.fade ?? 0.9);
    const key = options.key || "fx-sprite-curtain-opening";
    if (strip) strip.style.width = `${frames * 100}%`;
    const show = (n) => { if (strip) strip.style.translate = `${-(100 / frames) * n}% 0`; };
    let timer = 0;
    const loop = (seq, step, after) => {
      clearInterval(timer);
      if (!seq.length) return;
      let i = 0;
      show(seq[0]);
      if (reduce || seq.length < 2) return;
      timer = setInterval(() => {
        i += 1;
        if (after && i >= seq.length) { clearInterval(timer); after(); return; }
        show(seq[i % seq.length]);
      }, Math.max(16, step * 1000));
    };
    loop(idle, beat);
    // The consumer runs a different order once when the scene changes — detail: { seq: "0 1 2 3", beat: .21, then: "idle" | "hold" }
    const onSprite = (e) => {
      const d = e.detail || {};
      const seq = parse(d.seq || "");
      if (!seq.length) return;
      loop(seq, +(d.beat ?? beat), () => (d.then === "hold" ? show(seq[seq.length - 1]) : loop(idle, beat)));
    };
    el.addEventListener("fx:sprite", onSprite);

    const open = () => el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    let seen = false;
    try { seen = sessionStorage.getItem(key) === "1"; } catch (e) { seen = false; }
    const block = (e) => e.preventDefault();
    const unlock = () => { removeEventListener("wheel", block); removeEventListener("touchmove", block); };
    let raf = 0, t = 0;
    if (seen || reduce) {
      raf = requestAnimationFrame(open);
    } else {
      el.style.setProperty("--fx-hold", `${hold}s`);
      el.style.setProperty("--fx-fade", `${fade}s`);
      el.classList.add("is-armed");
      if (options.lock !== "off") {
        addEventListener("wheel", block, { passive: false });
        addEventListener("touchmove", block, { passive: false });
      }
      raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => el.classList.add("is-open")); });
      t = setTimeout(() => {
        unlock();
        try { sessionStorage.setItem(key, "1"); } catch (e) { /* Privacy mode */ }
        open();
      }, (hold + fade) * 1000);
    }
    return () => {
      clearInterval(timer); clearTimeout(t); cancelAnimationFrame(raf); unlock();
      el.removeEventListener("fx:sprite", onSprite);
      el.classList.remove("is-armed", "is-open");
      el.style.removeProperty("--fx-hold"); el.style.removeProperty("--fx-fade");
      if (strip) { strip.style.translate = ""; strip.style.width = ""; }
    };
  });
})();
