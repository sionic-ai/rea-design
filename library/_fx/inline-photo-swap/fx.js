(() => {
  // Alternately unfolds and folds two sets of small photo cells, ”branch a·b” — the unfold and fold shape is a transition in fx.css, and here we only decide when to switch.
  // The original changes every 8.5s only while visible (10% or more), and on button press changes immediately, then blocks pressing again for 1s while the button spins.
  kfFx.register("inline-photo-swap", (el, { options, reduce }) => {
    if (!el.querySelector("[data-fx-part=a], [data-fx-part=b]")) return;
    const buttons = [...el.querySelectorAll("[data-fx-part=button]")];
    const every = +(options.every ?? 8.5), lock = +(options.lock ?? 1);
    let seen = false, inView = false, busy = false, timer = 0, tick = 0;
    const flip = () => {
      if (busy) return;
      busy = true;
      el.classList.toggle("is-b");
      buttons.forEach((b) => b.classList.add("is-on"));
      timer = setTimeout(() => { busy = false; buttons.forEach((b) => b.classList.remove("is-on")); }, lock * 1000);
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView && !seen) { seen = true; el.classList.add("is-in"); }
    }, { threshold: 0.1 });
    io.observe(el);
    if (!reduce && every > 0) tick = setInterval(() => inView && flip(), every * 1000);
    const ac = new AbortController();
    buttons.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); flip(); }, { signal: ac.signal }));
    return () => {
      ac.abort(); io.disconnect(); clearInterval(tick); clearTimeout(timer);
      el.classList.remove("is-in", "is-b");
      buttons.forEach((b) => b.classList.remove("is-on"));
    };
  });
})();
