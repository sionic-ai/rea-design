// Pressing a card flips it on the Y axis 0→90→0 over .6s and swaps front↔back at the midpoint (.3s). Once on the back, a speech bubble pops up after .5s,
// Other back-side cards in the same group withdraw their speech bubbles and return to the front — only one card is on its back at a time
(() => {
  const BALLOON = ["fx-balloon-in", "fx-balloon-out", "fx-balloon-on"];
  kfFx.register("tap-flip-balloon", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    const dur = reduce ? 0 : +(options.dur ?? 600);
    const pop = reduce ? 0 : +(options.pop ?? 500);
    const timers = new Map();
    const stop = (c) => { clearTimeout(timers.get(c)); timers.delete(c); };
    const quiet = (c) => { stop(c); c.classList.remove(...BALLOON); };
    const later = (fn, ms) => setTimeout(fn, ms);
    const set = (c, on) => {
      c.toggleAttribute("data-flipped", on);
      c.setAttribute("aria-pressed", String(on));
      c.dispatchEvent(new CustomEvent("fx:flip", { bubbles: true, detail: { flipped: on } }));
    };
    const all = [];
    const others = (me) => cards.forEach((c) => {
      if (c === me) return;
      if (!c.hasAttribute("data-flipped")) { quiet(c); return; }
      quiet(c);
      c.classList.add("fx-flipping", "fx-balloon-out");
      all.push(later(() => set(c, false), dur / 2));
      all.push(later(() => c.classList.remove("fx-flipping", "fx-balloon-out"), dur));
    });
    const turn = (c) => {
      if (c.classList.contains("fx-flipping")) return;
      others(c);
      const on = c.hasAttribute("data-flipped");
      quiet(c);
      if (on) c.classList.add("fx-balloon-out");
      c.classList.add("fx-flipping");
      all.push(later(() => {
        set(c, !on);
        if (!on) timers.set(c, later(() => { timers.delete(c); if (c.hasAttribute("data-flipped")) c.classList.add("fx-balloon-on", "fx-balloon-in"); }, pop));
      }, dur / 2));
      all.push(later(() => c.classList.remove("fx-flipping", "fx-balloon-in", "fx-balloon-out"), dur));
    };
    const click = (e) => { const c = e.target.closest('[data-fx-part="card"]'); if (c && cards.includes(c)) turn(c); };
    const key = (e) => {
      const c = e.target.closest('[data-fx-part="card"]');
      if (!c || !cards.includes(c) || (e.key !== "Enter" && e.key !== " ")) return;
      e.preventDefault();
      turn(c);
    };
    cards.forEach((c) => { if (!c.hasAttribute("tabindex")) c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-pressed", "false"); });
    el.addEventListener("click", click);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("click", click);
      el.removeEventListener("keydown", key);
      all.forEach(clearTimeout);
      cards.forEach((c) => { quiet(c); c.classList.remove("fx-flipping"); c.removeAttribute("data-flipped"); });
    };
  });
})();
