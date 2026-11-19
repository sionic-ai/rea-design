// Each letter of the big title jumps up from 120% below the mask, tilted 6~12° (spreading sideways .08em more the farther from center), overshoots −6%·−1.2°, then settles.
// Delay is tighter for earlier letters and bunches up toward the end — within a total of min(38ms×letter count, 360ms), total·(1−(1−i/(N−1))²)
(() => {
  kfFx.register("tilt-rise-chars", (el, { options, reduce, scroller }) => {
    if (reduce || !el.textContent.trim()) return;
    const orig = el.innerHTML, gs = [], vis = document.createElement("span"), sr = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    sr.className = "fx-trc-sr"; sr.textContent = el.textContent.replace(/\s+/g, " ").trim();
    const walk = (from, into) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        let w = null;
        for (const ch of n.textContent) {
          if (/\s/.test(ch)) { w = null; into.append(" "); continue; }
          if (!w) { w = document.createElement("span"); w.className = "fx-trc-w"; into.append(w); }
          const m = document.createElement("span"), g = document.createElement("span");
          m.className = "fx-trc-m"; g.className = "fx-trc-g"; g.textContent = ch; m.append(g); w.append(m); gs.push(g);
        }
      } else if (n.nodeName === "BR") into.append(document.createElement("br"));
      else if (n.nodeType === 1) { const c = n.cloneNode(false); into.append(c); walk(n, c); }
    });
    walk(el, vis);
    el.textContent = "";
    el.append(sr, vis);
    el.classList.add("is-fx-armed");
    const anims = [], dur = +(options.dur ?? 0.9) * 1000, each = +(options.each ?? 0.038) * 1000, cap = +(options.max ?? 0.36) * 1000;
    const ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(.19, 1, .22, 1)";
    const play = () => {
      el.classList.remove("is-fx-armed");
      const n = gs.length, all = Math.min(each * n, cap), at = +(options.delay ?? 0) * 1000;
      gs.forEach((g, i) => {
        const dx = ((i - (n - 1) / 2) * 0.08).toFixed(3), lag = n < 2 ? 0 : all * (1 - (1 - i / (n - 1)) ** 2);
        anims.push(g.animate([{ transform: `translate(${dx}em, 120%) rotate(${6 + (i % 3) * 3}deg)`, easing: ease }, { transform: "translate(0, -6%) rotate(-1.2deg)", offset: 0.6, easing: "cubic-bezier(.5, 0, .25, 1)" }, { transform: "none" }], { duration: dur, delay: at + lag, fill: "backwards" }));
      });
    };
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); play(); }, { root: scroller || null, rootMargin: options.margin || "0px 0px -2% 0px" });
    io.observe(el);
    return () => { io.disconnect(); anims.forEach((a) => a.cancel()); el.innerHTML = orig; el.classList.remove("is-fx-armed"); };
  });
})();
