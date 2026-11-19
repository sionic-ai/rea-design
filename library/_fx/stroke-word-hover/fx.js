// Writes several words with a per-letter brush-stroke mask — fully written on open, and hovering over one word leaves only that word while the rest are erased in reverse. On leave they are all written again
(() => {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  // Only the [a, b] share of line length L is visible — the same as drawSVG but with dasharray (growing from the center or from one end)
  const dash = (p, a, b) => { const L = p._len; p.setAttribute("stroke-dasharray", `${Math.max(0, (b - a) * L)} ${L * 2}`); p.setAttribute("stroke-dashoffset", `${-a * L}`); };
  const FROM = [[0.5, 0.5], [0, 0], [1, 1]];
  kfFx.register("stroke-word-hover", (el, { options, reduce }) => {
    const words = Array.from(el.querySelectorAll('[data-fx-part="word"]'));
    if (!words.length || !window.gsap) return;
    const inDur = +(options.in ?? 0.85), outDur = +(options.out ?? 0.65), firstDur = +(options.first ?? 0.8), back = +(options.back ?? 0.45), delay = +(options.delay ?? 0.4);
    const ease = kfFx.ease(options.ease || "0.23,1,0.32,1", "quint.out");
    const kept = words.map((w) => w.innerHTML);
    const items = words.map((w) => {
      const text = w.textContent.trim();
      w.innerHTML = "";
      w.setAttribute("aria-label", text);
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "fx-swh-svg");
      svg.setAttribute("aria-hidden", "true");
      const ghost = document.createElementNS(NS, "text"), meas = document.createElementNS(NS, "text"), defs = document.createElementNS(NS, "defs"), g = document.createElementNS(NS, "g");
      [ghost, meas].forEach((t) => { t.textContent = text; t.setAttribute("x", "0"); t.setAttribute("y", "62"); });
      ghost.setAttribute("class", "fx-swh-ghost"); meas.setAttribute("class", "fx-swh-measure");
      svg.append(defs, ghost, g, meas);
      w.appendChild(svg);
      return { w, svg, meas, defs, g, text, strokes: [] };
    });
    const build = (it) => {
      it.defs.innerHTML = ""; it.g.innerHTML = ""; it.strokes = [];
      let bb;
      try { bb = it.meas.getBBox(); } catch (e) { return; }
      if (!bb.width) return;
      it.svg.setAttribute("viewBox", `${bb.x - 4} 0 ${bb.width + 8} 80`);
      const id = `fxswh${++uid}`;
      for (let i = 0; i < it.text.length; i++) {
        if (/\s/.test(it.text[i])) continue;
        let b;
        try { b = it.meas.getExtentOfChar(i); } catch (e) { continue; }
        const m = document.createElementNS(NS, "mask");
        m.setAttribute("id", `${id}-${i}`); m.setAttribute("maskUnits", "userSpaceOnUse");
        m.setAttribute("x", b.x - 20); m.setAttribute("y", b.y - 20); m.setAttribute("width", b.width + 40); m.setAttribute("height", b.height + 40);
        const cx = b.x + b.width / 2;
        [[`M${cx},${b.y - 2}L${cx},${b.y + b.height + 2}`, b.width * 0.66, i % 2 ? 0 : 1], [`M${b.x - 2},${b.y + b.height}L${b.x + b.width + 2},${b.y}`, b.width * 0.7, i % 3 ? 2 : 0]].forEach(([d, sw, f], j) => {
          const p = document.createElementNS(NS, "path");
          p.setAttribute("d", d); p.setAttribute("class", "fx-swh-stroke"); p.setAttribute("stroke-width", sw);
          m.appendChild(p);
          p._len = p.getTotalLength() || 1; p._from = FROM[f]; p._order = i * 0.07 + j * 0.05; p._s = { a: FROM[f][0], b: FROM[f][1] };
          dash(p, p._s.a, p._s.b);
          it.strokes.push(p);
        });
        it.defs.appendChild(m);
        const t = document.createElementNS(NS, "text");
        t.textContent = it.text[i]; t.setAttribute("x", b.x); t.setAttribute("y", "62"); t.setAttribute("class", "fx-swh-ink"); t.setAttribute("mask", `url(#${id}-${i})`);
        it.g.appendChild(t);
      }
    };
    const tw = (p, a, b, dur, dl) => gsap.to(p._s, { a, b, duration: reduce ? 0 : dur, delay: reduce ? 0 : dl, ease, onUpdate: () => dash(p, p._s.a, p._s.b) });
    const drawIn = (it, dur, base = 0) => it.strokes.forEach((p) => tw(p, 0, 1, dur, base + (p._order % 0.45)));
    const erase = (it, dur) => it.strokes.forEach((p, j) => tw(p, p._from[0], p._from[1], dur, ((it.strokes.length - j) * 0.05) % 0.2));
    const kill = () => items.forEach((it) => it.strokes.forEach((p) => gsap.killTweensOf(p._s)));
    let built = false;
    const ensure = () => { if (built) return true; items.forEach(build); built = items.some((it) => it.strokes.length); return built; };
    const play = () => { if (!ensure()) return; kill(); items.forEach((it, k) => drawIn(it, firstDur, delay + k * 0.05)); };
    const over = (it) => { if (!built) return; kill(); items.forEach((o) => (o === it ? drawIn(o, inDur) : erase(o, outDur))); };
    const leave = (it) => { if (!built) return; kill(); items.forEach((o) => drawIn(o, o === it ? back : inDur)); };
    const ac = new AbortController(), sig = { signal: ac.signal };
    items.forEach((it) => { it.w.addEventListener("pointerenter", () => over(it), sig); it.w.addEventListener("pointerleave", () => leave(it), sig); it.w.addEventListener("focus", () => over(it), sig); it.w.addEventListener("blur", () => leave(it), sig); });
    el.addEventListener("fx:play", () => { built = false; play(); }, sig);
    el.addEventListener("fx:reset", () => { kill(); items.forEach((it) => it.strokes.forEach((p) => { p._s.a = p._from[0]; p._s.b = p._from[1]; dash(p, p._s.a, p._s.b); })); }, sig);
    let io = null;
    if (options.on !== "manual") {
      // Measure the text boxes right away only once all fonts have loaded
      const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        fontsReady.then(() => { if (io && ensure()) { io.disconnect(); io = null; play(); } });
      });
      io.observe(el);
    }
    return () => { ac.abort(); io && io.disconnect(); kill(); words.forEach((w, i) => { w.innerHTML = kept[i]; w.removeAttribute("aria-label"); }); };
  });
})();
