// Card turn: outgoing cards drop away downward one by one, then incoming cards descend from above one by one — brand home page product paging, three at a time
(() => {
  kfFx.register("card-cascade-swap", (el, { options, reduce }) => {
    const pages = [...el.querySelectorAll('[data-fx-part="page"]')];
    if (pages.length < 1) return;
    const dur = +(options.dur ?? 0.42), each = +(options.each ?? 0.09);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-each", `${each * 1000}ms`);
    if (options.shift != null) el.style.setProperty("--fx-shift", `${+options.shift}px`);
    pages.forEach((p) => p.querySelectorAll('[data-fx-part="card"]').forEach((c, i) => c.style.setProperty("--fx-i", i)));
    let at = Math.max(0, pages.findIndex((p) => p.classList.contains("is-active")));
    pages.forEach((p, i) => p.classList.toggle("is-active", i === at));
    const btns = [...el.querySelectorAll('[data-fx-part="prev"], [data-fx-part="next"]')];
    const len = (p) => (dur + Math.max(0, p.querySelectorAll('[data-fx-part="card"]').length - 1) * each) * 1000;
    let busy = false;
    const timers = [];
    const lock = (on) => btns.forEach((b) => (b.disabled = on));
    const go = (to) => {
      if (busy || pages.length < 2 || to === at) return;
      const out = pages[at], inc = pages[to];
      if (reduce) { out.classList.remove("is-active", "is-leaving"); inc.classList.add("is-active"); at = to; return; }
      busy = true; lock(true);
      out.classList.add("is-leaving");
      timers.push(setTimeout(() => {
        out.classList.remove("is-active", "is-leaving");
        inc.classList.add("is-active");
        timers.push(setTimeout(() => { at = to; busy = false; lock(false); }, len(inc)));
      }, len(out)));
    };
    const onClick = (e) => {
      const b = e.target.closest('[data-fx-part="prev"], [data-fx-part="next"]');
      if (!b || !el.contains(b)) return;
      const n = pages.length;
      go(b.dataset.fxPart === "prev" ? (at - 1 + n) % n : (at + 1) % n);
    };
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("click", onClick);
      timers.forEach(clearTimeout);
      lock(false);
      ["--fx-dur", "--fx-each", "--fx-shift"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
