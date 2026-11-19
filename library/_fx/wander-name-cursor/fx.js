(() => {
  // Like a co-viewer’s cursor — an arrow and name tag glide ease-in-out to random spots in the panel. Rest a random 1~3 seconds before the next departure, and
  // The travel time is also random within that rest (.25s to the rest), so it alternates between slow and fast. First step 1 second after attaching
  kfFx.register("wander-name-cursor", (el, { options, reduce }) => {
    const walker = el.querySelector('[data-fx-part="walker"]');
    if (!walker) return;
    const min = +(options.min ?? 1000), max = +(options.max ?? 3000), fast = +(options.fast ?? 250), start = +(options.start ?? 1000), size = +(options.size ?? 20);
    const rand = (a, b) => Math.floor(Math.random() * (Math.floor(b) - Math.ceil(a) + 1)) + Math.ceil(a);
    let wait = 1000, timer = 0;
    const step = () => {
      const r = el.getBoundingClientRect();
      const x = Math.random() * Math.max(0, r.width - size), y = Math.random() * Math.max(0, r.height - size);
      timer = setTimeout(step, wait);
      const next = rand(min, max);
      walker.style.transitionDuration = `${rand(fast, next)}ms`;
      walker.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      wait = next;
    };
    if (reduce) { walker.style.transform = "translate3d(40%, 30%, 0)"; return () => { walker.style.transform = ""; }; }
    timer = setTimeout(step, start);
    return () => { clearTimeout(timer); walker.style.transform = ""; walker.style.transitionDuration = ""; };
  });
})();
