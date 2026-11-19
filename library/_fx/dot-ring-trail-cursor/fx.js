// Dot, ring and tail cursor: the dot and ring follow the cursor by 22% per frame, and the tail dot follows that dot by 10%.
// Over links and buttons the dot turns off and the ring turns on (.25s). Over a [data-cursor-theme] panel the dot color is the opposite of that panel’s background — Brand cursor values
(() => {
  kfFx.register("dot-ring-trail-cursor", (root, { options, reduce, hover }) => {
    if (!hover) return;
    const mk = (part) => {
      let n = root.querySelector(`[data-fx-part="${part}"]`);
      if (!n) { n = document.createElement("i"); n.setAttribute("data-fx-part", part); n.dataset.made = ""; root.append(n); }
      return n;
    };
    const dot = mk("dot"), ring = mk("ring"), tail = mk("tail");
    const lead = +(options.lead ?? 0.22), trail = +(options.trail ?? 0.1);
    const sel = options.hover || 'a, button, [role="button"], [data-cursor-hover]';
    let mx = 0, my = 0, ax = 0, ay = 0, tx = 0, ty = 0, on = false, raf = 0, theme = null;
    const move = (e) => {
      mx = e.clientX; my = e.clientY;
      if (!on) { ax = tx = mx; ay = ty = my; on = true; root.classList.add("is-on"); }
      const t = document.elementFromPoint(mx, my)?.closest("[data-cursor-theme]")?.getAttribute("data-cursor-theme") || null;
      if (t !== theme) { theme = t; root.classList.toggle("is-dark", t === "dark"); root.classList.toggle("is-light", t === "light"); }
    };
    const over = (e) => { if (e.target.closest?.(sel)) root.classList.add("is-hover"); };
    const out = (e) => { if (e.target.closest?.(sel)) root.classList.remove("is-hover"); };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!on) return;
      const k = reduce ? 1 : lead, q = reduce ? 1 : trail;
      ax += (mx - ax) * k; ay += (my - ay) * k;
      tx += (ax - tx) * q; ty += (ay - ty) * q;
      const m = `translate3d(${ax}px,${ay}px,0) translate(-50%,-50%)`;
      dot.style.transform = m; ring.style.transform = m;
      tail.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
    };
    addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.documentElement.classList.add("fx-cursor-none");
    tick();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.documentElement.classList.remove("fx-cursor-none");
      root.querySelectorAll("[data-made]").forEach((n) => n.remove());
      root.classList.remove("is-on", "is-hover", "is-dark", "is-light");
    };
  });
})();
