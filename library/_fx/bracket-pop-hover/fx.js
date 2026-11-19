(() => {
  // Small image frame before a word: on hover the four corner brackets spread out by the pop amount and appear, the frame grows zoom times (anchored top left), and the following word is pushed along by the growth
  // An ink band lays under the word from the left. All three are springs integrated 1ms at a time (tension 170, friction 26) — even fast back-and-forth carries on smoothly
  class Spring {
    constructor(v, tension, friction) { this.value = this.target = v; this.v = 0; this.k = tension; this.c = friction; }
    advance(ms) {
      for (let i = 0; i < Math.ceil(ms); i++) {
        if (Math.abs(this.v) < 1e-4 && Math.abs(this.target - this.value) < 1e-3) { this.value = this.target; this.v = 0; return false; }
        this.v += -this.k * 1e-6 * (this.value - this.target) - this.c * 1e-3 * this.v;
        this.value += this.v;
      }
      return true;
    }
  }
  kfFx.register("bracket-pop-hover", (el, { options, reduce, hover }) => {
    const frame = el.querySelector('[data-fx-part="frame"]'), label = el.querySelector('[data-fx-part="label"]');
    if (!frame || !label) return;
    const pop = +(options.pop ?? 6), zoom = +(options.zoom ?? 1.2);
    const tension = +(options.tension ?? 170), friction = +(options.friction ?? 26);
    const made = [];
    const add = (host, part, html = "") => {
      let n = host.querySelector(`:scope > [data-fx-part="${part}"]`);
      if (!n) { n = document.createElement("span"); n.dataset.fxPart = part; n.setAttribute("aria-hidden", "true"); n.innerHTML = html; host.prepend(n); made.push(n); }
      return n;
    };
    const box = add(frame, "box");
    add(box, "corners", "<i></i><i></i><i></i><i></i>");
    const bar = add(label, "bar");
    bar.dataset.label = label.textContent.trim();
    label.append(bar);
    const p = new Spring(0, tension, friction), z = new Spring(1, tension, friction), t = new Spring(1, tension, friction);
    let from = 100, to = 100, lit = false, raf = 0, last = 0, touched = false;
    const wipe = () => from + (to - from) * t.value;
    const apply = () => {
      el.style.setProperty("--fx-pop", p.value.toFixed(4));
      el.style.setProperty("--fx-zoom", z.value.toFixed(4));
      el.style.setProperty("--fx-wipe", wipe().toFixed(2));
      el.style.zIndex = z.value > 1.001 ? "2" : "";
    };
    const tick = (now) => {
      const dt = Math.min(64, Math.max(0, now - (last || now)));
      last = now;
      const busy = p.advance(dt) | z.advance(dt) | t.advance(dt);
      apply();
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) last = 0;
    };
    const set = (on) => {
      if (on === lit) return;
      lit = on;
      el.toggleAttribute("data-lit", on);
      p.target = on ? pop : 0;
      z.target = on ? zoom : 1;
      from = wipe(); to = on ? 0 : 100;
      t.value = 0; t.v = 0; t.target = 1;
      if (reduce) { for (const s of [p, z, t]) { s.value = s.target; s.v = 0; } apply(); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const enter = (e) => e.pointerType === "mouse" && set(true);
    const leave = (e) => e.pointerType === "mouse" && set(false);
    const down = (e) => (touched = e.pointerType !== "mouse");
    // The finger turns on at the first press and follows on the second — tapping outside turns it off
    const click = (e) => { if (touched && !lit) { e.preventDefault(); set(true); } };
    const outside = (e) => { if (lit && e.pointerType !== "mouse" && !el.contains(e.target)) set(false); };
    const focus = () => el.matches(":focus-visible") && set(true);
    const blur = () => set(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    el.addEventListener("click", click);
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    addEventListener("pointerdown", outside);
    apply();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("click", click);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", blur);
      removeEventListener("pointerdown", outside);
      for (const n of made) n.remove();
      el.removeAttribute("data-lit");
      for (const k of ["--fx-pop", "--fx-zoom", "--fx-wipe", "z-index"]) el.style.removeProperty(k);
    };
  });
})();
