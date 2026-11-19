(() => {
  // Original hero speech bubble: every 200ms beat types 1~(burst) characters at once. 8% chance to erase one character and retype it, 12% chance to rest a beat.
  // Randomness is seeded Park–Miller (16807) — it types with the same tempo each time it opens. For words like ‹final|reading›, type the reading first, then swap to the final form in one beat (IME conversion).
  const frames = (pairs, burst, seed, slips) => {
    let n = seed % 0x7fffffff || 1;
    const rnd = () => (n = (16807 * n) % 0x7fffffff) / 0x7fffffff;
    const out = [];
    let done = "";
    for (const [final, read] of pairs) {
      const ch = [...read];
      let k = 0;
      while (k < ch.length) {
        k = Math.min(ch.length, k + 1 + Math.floor(rnd() * burst));
        const s = done + ch.slice(0, k).join("");
        if (slips && k > 1 && k < ch.length && rnd() < 0.08) { out.push(s, s.slice(0, -1)); k -= 1; continue; }
        out.push(s);
        if (rnd() < 0.12) out.push(s);
      }
      done += final;
      if (final !== read) out.push(done);
    }
    return out;
  };

  kfFx.register("burst-type", (el, { options, reduce, scroller }) => {
    const src = el.getAttribute("data-text") ?? el.textContent;
    if (!src || !src.trim()) return;
    const pairs = el.hasAttribute("data-text")
      ? src.split(/(\s+)/).filter(Boolean).map((w) => (/^\s+$/.test(w) ? [w, w] : [w.split("|")[0], w.split("|")[1] ?? w.split("|")[0]]))
      : [[src, src]];
    const full = pairs.map((p) => p[0]).join("");
    const tick = +(options.tick ?? 0.2) * 1000;
    const list = frames(pairs, +(options.burst || 6), +(options.seed ?? 7), options.slips !== "false");
    const again = options.again != null ? +options.again * 1000 : -1;
    const write = (t) => { el.textContent = t; };
    if (reduce) { write(full); return () => write(full); }

    let timer = 0, i = 0, alive = true;
    const step = () => {
      if (!alive) return;
      write(list[i]);
      el.toggleAttribute("data-typing", i < list.length - 1);
      i += 1;
      if (i < list.length) timer = setTimeout(step, tick);
      else if (again >= 0) timer = setTimeout(() => { i = 0; write(""); timer = setTimeout(step, tick); }, again);
      else el.dispatchEvent(new CustomEvent("fx:typed", { bubbles: true }));
    };
    const play = () => { clearTimeout(timer); i = 0; write(""); timer = setTimeout(step, +(options.delay ?? 0) * 1000); };
    el.addEventListener("fx:play", play);

    let io = null;
    if ((options.on || "view") === "load") play();
    else if (options.on !== "manual") {
      write("");
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); io = null; play(); } }, { root: scroller || null, rootMargin: "0px 0px -15% 0px" });
      io.observe(el);
    }
    return () => { alive = false; clearTimeout(timer); io?.disconnect(); el.removeEventListener("fx:play", play); el.removeAttribute("data-typing"); write(full); };
  });
})();
