// Types several sentences one character at a time in turn, holds, deletes one character at a time, then moves to the next sentence — loops endlessly
(() => {
  kfFx.register("type-cycle", (el, { options, reduce }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="line"]')];
    const lines = parts.map((p) => p.textContent.trim()).filter(Boolean);
    if (!lines.length) return;
    const was = [...el.childNodes];
    const out = document.createElement("span");
    out.className = "fx-type-cycle__out";
    out.setAttribute("aria-hidden", "true");
    const full = document.createElement("span");
    full.className = "fx-type-cycle__full";
    full.textContent = lines[0];
    el.replaceChildren(out, full);
    if (reduce) { out.textContent = lines[0]; return () => el.replaceChildren(...was); }
    const type = +(options.type ?? 0.045), hold = +(options.hold ?? 2.8), erase = +(options.erase ?? 0.02), gap = +(options.gap ?? 0.4);
    let alive = true, timer = 0;
    const wait = (s) => new Promise((r) => { timer = setTimeout(r, s * 1000); });
    (async () => {
      for (let i = 0; alive; i = (i + 1) % lines.length) {
        const s = lines[i];
        full.textContent = s;
        for (let k = 1; k <= s.length && alive; k++) { out.textContent = s.slice(0, k); await wait(type); }
        if (!alive) break;
        await wait(hold);
        for (let k = s.length - 1; k >= 0 && alive; k--) { out.textContent = s.slice(0, k); await wait(erase); }
        if (!alive) break;
        await wait(gap);
      }
    })();
    return () => { alive = false; clearTimeout(timer); el.replaceChildren(...was); };
  });
})();
