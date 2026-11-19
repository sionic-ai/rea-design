// Like the original, it runs right after the loader markup — 0% shows from the first frame, rises linearly to 100% over at least 3 seconds, then lifts (once per session)
(() => {
  const el = document.querySelector(".sh-loader"), body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.SHLoader = new Promise((resolve) => {
    if (!el || sessionStorage.getItem("sh-loaded") === "1" || reduced) {
      if (el) el.remove();
      document.documentElement.classList.add("sh-loaded");
      return resolve();
    }
    body.classList.add("sh-loader-active");
    const mark = el.querySelector(".sh-loader__mark"), val = el.querySelector(".sh-loader__val");
    const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let travel = 0, shown = -1, prog = 0, last = null;
    const measure = () => (travel = Math.max(0, innerWidth / 2 - mark.getBoundingClientRect().width / 2 - 32));
    const paint = () => {
      const v = Math.floor(prog);
      if (v !== shown) { shown = v; val.innerHTML = String(v).split("").map((c) => `<i>${c}</i>`).join(""); }
      mark.style.transform = `translateX(${travel * (1 - inOutCubic(Math.min(1, prog / 100)))}px)`;
    };
    measure();
    paint();
    addEventListener("resize", () => { measure(); paint(); });
    const t0 = Date.now();
    const tick = (now) => {
      const dt = last == null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      // A placeholder panel with no image to load, so it rises linearly for at least 3 seconds, and can’t climb faster than 45 per second.
      const target = Math.min(100, ((Date.now() - t0) / 3000) * 100);
      prog = Math.min(target, prog + 45 * dt);
      paint();
      if (prog >= 100) return finish();
      requestAnimationFrame(tick);
    };
    const finish = () => {
      prog = 100;
      paint();
      setTimeout(() => {
        mark.classList.add("is-revealed");
        setTimeout(() => {
          sessionStorage.setItem("sh-loaded", "1");
          body.classList.remove("sh-loader-active");
          resolve();
          setTimeout(() => {
            el.classList.add("is-hidden");
            setTimeout(() => { el.remove(); document.documentElement.classList.add("sh-loaded"); }, 1050);
          }, 650);
        }, 850);
      }, 500);
    };
    requestAnimationFrame(tick);
  });
})();
