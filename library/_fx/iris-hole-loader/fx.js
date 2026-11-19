// Timetable (original opening.js): 0s image turns on (.3s) · hold 2s accent circle spreads (grow 1.4s) · 2.3s saves the view time · hole-at 2.8s the hole goes 0 → 100% over .6s (linear)
// On open, unlock scroll and fire fx:open, at end 5s remove the curtain and fire fx:done. If revisited within the once window, lift the curtain in .3s and remove it after .5s (original 8 hours)
(() => {
  const KEY = "fx-iris-hole-loader";
  kfFx.register("iris-hole-loader", (el, { options, reduce }) => {
    const n = (k, d) => +(options[k] ?? d);
    const hold = n("hold", 2), grow = n("grow", 1.4), holeAt = n("hole-at", 2.8), hole = n("hole", 0.6), end = n("end", 5), once = n("once", 0);
    const timers = [];
    const later = (s, fn) => timers.push(setTimeout(fn, s * 1000));
    const root = document.documentElement;
    const emit = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));
    let raf = 0, locked = false;
    const lock = (on) => { locked = on; root.style.overflow = on ? "hidden" : ""; };
    const finish = () => { el.hidden = true; emit("fx:done"); };
    let seen = 0;
    try { seen = +localStorage.getItem(KEY) || 0; } catch (e) { seen = 0; }
    if (reduce || (once && Date.now() - seen < once * 3600 * 1000)) {
      el.classList.add("fx-iris-hidden");
      emit("fx:open");
      later(0.5, finish);
    } else {
      el.style.setProperty("--fx-grow", `${grow}s`);
      scrollTo(0, 0);
      lock(true);
      el.classList.add("fx-iris-in");
      later(hold, () => el.classList.add("fx-iris-open"));
      later(hold + 0.3, () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { /* If it can’t be saved, it pops up every time */ } });
      later(holeAt, () => {
        let t0 = null;
        const step = (now) => {
          if (t0 === null) t0 = now;
          const p = hole > 0 ? Math.min(Math.max(0, now - t0) / (hole * 1000), 1) : 1;
          el.style.setProperty("--fx-hole", `${p * 100}%`);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        // Once the hole opens the curtain doesn’t intercept the hand — so the revealed page can be pressed right away
        el.classList.add("fx-iris-through");
        lock(false);
        emit("fx:open");
      });
      later(Math.max(end, holeAt + hole), finish);
    }
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      if (locked) lock(false);
      el.classList.remove("fx-iris-in", "fx-iris-open", "fx-iris-hidden", "fx-iris-through");
      el.style.removeProperty("--fx-hole");
      el.style.removeProperty("--fx-grow");
    };
  });
})();
