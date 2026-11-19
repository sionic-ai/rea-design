// Instead of the system cursor, several pixel arrows follow the cursor in a line, each with a different delay (default 0 · .2 · .3 · .4 · .5 · .6s).
// The first arrow (delay 0) always sits at the cursor, the rest gather to the center of a link or button on hover within .5s and tremble every .7s, and vanish over hidden spots (list rows)
(() => {
  const ARROW = '<svg viewBox="0 0 19 31" aria-hidden="true"><path d="M2 0h3v2h2v2h2v2h2v2h2v2h2v2h2v2h2v4h-6v2h2v3h2v4h-2v2h-3v-2h-2v-3h-2v-3h-2v2h-2v2H2Z"/></svg>';
  kfFx.register("lag-arrow-cursors", (el, { options, hover, reduce }) => {
    if (!hover) return;
    const lags = String(options.lags || "0,.2,.3,.4,.5,.6").split(",").map(Number);
    const snapSel = options.snap || "a, button, [data-fx-part=\"magnet\"]";
    const hideSel = options.hide || "[data-fx-part=\"hide\"]";
    const hold = document.createElement("div");
    hold.className = "fx-lac";
    hold.innerHTML = lags.map((lag, i) => `<i class="fx-lac__dot" style="--fx-i:${i};--fx-lag:${reduce ? 0 : lag}s">${ARROW}</i>`).join("");
    // When attached in the document head, body does not exist yet — then it attaches to html (a fixed position, so what is seen is the same)
    (document.body || document.documentElement).append(hold);
    const dots = [...hold.children];
    document.documentElement.classList.add("fx-lac-on");
    let stuck = null;
    const put = (d, x, y) => { d.style.transform = `translate(${x}px, ${y}px)`; };
    const move = (e) => dots.forEach((d, i) => (i === 0 || !stuck) && put(d, e.clientX, e.clientY));
    const over = (e) => {
      const hit = e.target.closest?.(snapSel);
      const hid = e.target.closest?.(hideSel);
      dots.forEach((d, i) => i && d.classList.toggle("is-hidden", !!hid));
      if (hit && hit !== stuck && !hid) {
        stuck = hit;
        const r = hit.getBoundingClientRect();
        dots.forEach((d, i) => { if (!i) return; d.classList.add("is-stuck"); put(d, r.left + r.width / 2, r.top + r.height / 2); });
      } else if (!hit && stuck) {
        stuck = null;
        dots.forEach((d) => d.classList.remove("is-stuck"));
      }
    };
    addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over, { passive: true });
    return () => {
      removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.documentElement.classList.remove("fx-lac-on");
      hold.remove();
    };
  });
})();
