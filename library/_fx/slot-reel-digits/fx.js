// Stats number slot — one cell per character (a two-cell strip, top and bottom), and when visible it flips one cell at a time with random characters. The first 60% is 40ms per cell,
// After that it slows toward the end down to 320ms (slot flips run steps(10) for .85 of that length), and when the remaining time is shorter than one and a half slots it stops on its own letter.
// Each slot starts min(50ms, length × 5%) late so the right-hand slots stop slightly later.
(() => {
  kfFx.register("slot-reel-digits", (el, { options, reduce }) => {
    const text = (el.dataset.value || el.textContent || "").trim();
    if (!text) return;
    const total = +(options.dur ?? 2000) || 2000;
    const glyphs = options.glyphs || "0123456789#%&@$*+?";
    const on = options.on || "view";
    const rnd = () => glyphs[(Math.random() * glyphs.length) | 0];
    el.setAttribute("aria-label", text);
    const keep = el.innerHTML;
    el.textContent = "";
    el.classList.add("fx-srd");
    const slots = [...text].map((ch) => {
      const slot = document.createElement("span");
      slot.className = "fx-srd__slot";
      slot.setAttribute("aria-hidden", "true");
      const track = document.createElement("span");
      track.className = "fx-srd__track";
      const top = document.createElement("span"), bottom = document.createElement("span");
      top.className = bottom.className = "fx-srd__cell";
      top.textContent = reduce ? ch : rnd();
      bottom.textContent = ch;
      track.append(top, bottom);
      slot.appendChild(track);
      el.appendChild(slot);
      return { track, top, bottom, ch };
    });
    const timers = [];
    const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); };
    const roll = () => {
      const lag = Math.min(50, total * 0.05);
      slots.forEach((s, n) => {
        const dur = total - n * lag;
        let t0 = 0;
        const speed = (t) => { const k = Math.min(t / dur, 1); return k < 0.6 ? 40 : 40 + 280 * ((k - 0.6) / 0.4); };
        const tick = () => {
          const t = performance.now() - t0;
          if (t >= dur) { s.top.textContent = s.ch; s.track.style.transition = "none"; s.track.style.transform = "none"; return; }
          const sp = speed(t), last = dur - t <= sp * 1.5;
          s.bottom.textContent = last ? s.ch : rnd();
          s.track.style.transition = `transform ${sp * 0.85}ms steps(10)`;
          s.track.style.transform = "translateY(-50%)";
          later(() => {
            s.top.textContent = s.bottom.textContent;
            s.track.style.transition = "none";
            s.track.style.transform = "none";
            if (!last) later(tick, sp * 0.15);
          }, sp * 0.85);
        };
        later(() => { t0 = performance.now(); tick(); }, n * lag);
      });
    };
    let io = null;
    const onRoll = () => roll();
    if (!reduce) {
      if (on === "view") {
        io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); io = null; roll(); } }, { rootMargin: "0px 0px -10% 0px" });
        io.observe(el);
      }
      el.addEventListener("fx:roll", onRoll);
    }
    return () => {
      io?.disconnect();
      timers.forEach(clearTimeout);
      el.removeEventListener("fx:roll", onRoll);
      el.classList.remove("fx-srd");
      el.innerHTML = keep;
    };
  });
})();
