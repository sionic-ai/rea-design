// Cut overlapping cells to the next one every few seconds, and the new cell pops out from .5x in .1s — applied to the STUDIO carousel (switch 1ms · auto 5s)
// The appear (scale .5 · .1s cubic-bezier(1,0,0,1)) of the image inside the cell overlaps for a layered feel. It pauses while hovered and counts from the start again when released (original mouseenter·focusout)
(() => {
  kfFx.register("pop-swap-cycle", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const every = (+options.every || 5) * 1000;
    let i = Math.max(0, items.findIndex((it) => it.classList.contains("is-on")));
    let timer = 0, seen = false, hovered = false;
    const show = (n, pop) => items.forEach((it, k) => {
      it.classList.toggle("is-on", k === n);
      if (k !== n) return;
      it.classList.remove("is-pop");
      if (pop && !reduce) { void it.offsetWidth; it.classList.add("is-pop"); }
    });
    show(i, false);
    if (items.length < 2) return () => items.forEach((it) => it.classList.remove("is-on", "is-pop"));
    const next = () => { i = (i + 1) % items.length; show(i, true); el.dispatchEvent(new CustomEvent("fx:swap", { detail: { index: i } })); };
    const run = () => { clearInterval(timer); timer = 0; if (seen && !hovered && !document.hidden && !reduce) timer = setInterval(next, every); };
    const io = new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; run(); });
    io.observe(el);
    const ac = new AbortController(), on = { signal: ac.signal };
    if (options.pause === "hover") {
      el.addEventListener("mouseenter", () => { hovered = true; run(); }, on);
      el.addEventListener("mouseleave", () => { hovered = false; run(); }, on);
    }
    document.addEventListener("visibilitychange", run, on);
    return () => { clearInterval(timer); io.disconnect(); ac.abort(); items.forEach((it) => it.classList.remove("is-on", "is-pop")); };
  });
})();
