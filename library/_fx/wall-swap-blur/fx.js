// Each cell of the testimonial cards changes to a different testimonial after 4~8 seconds — the leaving text blurs and exits 6px upward, and the new text rises from 6px below as the blur clears.
// Lift the leaving text inside the cell (absolute) so the two texts overlap in the same spot as they pass. The hovered cell does not change and the other cells pull back to .7
(() => {
  kfFx.register("wall-swap-blur", (el, { options, reduce }) => {
    const slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (!slots.length) return;
    const pool = el.querySelector('template[data-fx-part="pool"]');
    const items = [...slots.map((s) => s.firstElementChild).filter(Boolean), ...(pool ? [...pool.content.children] : [])].map((n) => n.cloneNode(true));
    const shown = slots.map((s, i) => (s.firstElementChild ? i : -1));
    const btn = el.querySelector('[data-fx-part="pause"]');
    const min = +(options.min ?? 4) * 1000, span = +(options.max ?? 8) * 1000 - min;
    const dur = +(options.dur ?? 0.45) * 1000, blur = +(options.blur ?? 4), lift = +(options.y ?? 6);
    const ease = `cubic-bezier(${options.ease || "0.22,1,0.36,1"})`;
    const dim = options.dim ?? "0.7";
    const ac = new AbortController();
    let seen = false, paused = false, over = -1;
    const timers = [];

    slots.forEach((s, i) => {
      s.style.setProperty("--fx-wsb-dim", dim);
      const on = () => { over = i; slots.forEach((o, j) => o.classList.toggle("fx-wsb-dim", j !== i)); };
      const off = () => { if (over === i) over = -1; slots.forEach((o) => o.classList.remove("fx-wsb-dim")); };
      s.addEventListener("pointerenter", on, { signal: ac.signal });
      s.addEventListener("pointerleave", off, { signal: ac.signal });
      s.addEventListener("focusin", on, { signal: ac.signal });
      s.addEventListener("focusout", off, { signal: ac.signal });
    });

    const pick = () => {
      const taken = new Set(shown);
      let k = Math.floor(Math.random() * items.length);
      for (let n = 0; n < items.length && taken.has(k); n++) k = (k + 1) % items.length;
      return k;
    };
    const swap = (i) => {
      const s = slots[i], old = s.firstElementChild, k = pick();
      if (items.length <= slots.length && shown.includes(k)) return;
      shown[i] = k;
      const fresh = items[k].cloneNode(true);
      if (old) {
        const r = old.getBoundingClientRect(), p = s.getBoundingClientRect();
        // Width is not written but held by both side offsets — the same width stays as is
        Object.assign(old.style, { position: "absolute", left: `${r.left - p.left}px`, right: `${p.right - r.right}px`, top: `${r.top - p.top}px`, margin: 0 });
        old.animate([{ opacity: 1, filter: "blur(0px)", transform: "translateY(0)" }, { opacity: 0, filter: `blur(${blur}px)`, transform: `translateY(${-lift}px)` }], { duration: dur, easing: ease, fill: "forwards" }).finished.then(() => old.remove(), () => old.remove());
      }
      s.append(fresh);
      fresh.animate([{ opacity: 0, filter: `blur(${blur}px)`, transform: `translateY(${lift}px)` }, { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" }], { duration: dur, easing: ease });
    };
    const arm = (i) => {
      timers[i] = setTimeout(() => {
        if (seen && !paused && over !== i && items.length > slots.length) swap(i);
        arm(i);
      }, min + span * Math.random());
    };

    let io = null;
    if (!reduce) {
      slots.forEach((_, i) => arm(i));
      io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; }, { threshold: 0.1 });
      io.observe(el);
      if (btn) {
        const label = () => { btn.textContent = paused ? btn.dataset.off || "Resume" : btn.dataset.on || "Pause"; btn.setAttribute("aria-pressed", String(paused)); };
        btn.addEventListener("click", () => { paused = !paused; label(); }, { signal: ac.signal });
        label();
      }
    } else if (btn) btn.hidden = true;
    return () => { ac.abort(); io?.disconnect(); timers.forEach(clearTimeout); slots.forEach((s) => { s.classList.remove("fx-wsb-dim"); s.style.removeProperty("--fx-wsb-dim"); }); };
  });
})();
