// Timetable (original Brand site loader): .4s first character peeks from the top left (.4s) · hides at 1.7s · 1.8s second from the bottom right · hides at 3.1s ·
// 3.3s a small circle (radius 80px) spreads to the screen edge over 2s · 0.5s later fx:open (when the Hero video plays) · 4.6s the curtain lifts over .4s → fx:done
(() => {
  const KEY = "fx-peek-circle-loader";
  const FROM = { tl: "-50% -50%", tr: "50% -50%", bl: "-50% 50%", br: "50% 50%" };
  kfFx.register("peek-circle-loader", (el, { options, reduce }) => {
    const n = (k, d) => +(options[k] ?? d);
    const disc = el.querySelector('[data-fx-part="disc"]');
    const peeks = [...el.querySelectorAll('[data-fx-part="peek"]')];
    const start = n("start", 0.4), up = n("up", 0.4), stay = n("stay", 0.9), down = n("down", 0.4), gap = n("gap", 0.1);
    const each = up + stay + gap;
    const lastDown = peeks.length ? start + (peeks.length - 1) * each + up + stay : start;
    const growAt = n("grow-at", lastDown + 0.2), grow = n("grow", 2), radius = n("radius", 80) || 80;
    const openAt = n("open-at", growAt + 0.5), fadeAt = n("fade-at", growAt + 1.3), fade = n("fade", 0.4), once = n("once", 0);
    const root = document.documentElement;
    const timers = [], anims = [];
    let locked = false;
    const later = (s, fn) => timers.push(setTimeout(fn, Math.max(0, s) * 1000));
    const emit = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    const lock = (on) => { locked = on; root.style.overflow = on ? "hidden" : ""; };
    const play = (node, frames, at, dur, easing) => anims.push(node.animate(frames, { delay: at * 1000, duration: Math.max(0, dur) * 1000, easing, fill: "both" }));
    el.style.setProperty("--fx-radius", `${radius}px`);

    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; if (once) sessionStorage.setItem(KEY, "1"); } catch (e) { seen = false; }
    if (reduce || (once && seen)) {
      el.hidden = true;
      emit("fx:open");
      emit("fx:done");
    } else {
      lock(true);
      peeks.forEach((p, i) => {
        const from = FROM[p.dataset.key] || FROM.tl;
        const at = start + i * each;
        play(p, [{ translate: from }, { translate: "0 0" }], at, up, "cubic-bezier(.33,1,.68,1)");
        play(p, [{ translate: "0 0" }, { translate: from }], at + up + stay, down, "cubic-bezier(.4,0,1,1)");
      });
      if (disc) play(disc, [{ clipPath: `circle(${radius}px)` }, { clipPath: "circle(200%)" }], growAt, grow, "cubic-bezier(.4,0,.2,1)");
      later(openAt, () => emit("fx:open"));
      later(fadeAt, () => { lock(false); el.style.pointerEvents = "none"; });
      play(el, [{ opacity: 1 }, { opacity: 0 }], fadeAt, fade, "linear");
      later(fadeAt + fade, () => { el.hidden = true; emit("fx:done"); });
    }
    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      if (locked) lock(false);
      el.hidden = false;
      el.style.removeProperty("pointer-events");
      el.style.removeProperty("--fx-radius");
    };
  });
})();
