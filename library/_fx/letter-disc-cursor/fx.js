(() => {
  // Original Brand Cursor: a 10rem circle follows the mouse by .1 of the remaining distance each frame (rounded to one decimal place), and only over the label spot (data-cursor)
  // Turns on in .6s and the text inside rises one character at a time (.03s apart) from below in .3s. Not applied on touch screens.
  kfFx.register("letter-disc-cursor", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    if (!text) return;
    if (!hover) {
      el.hidden = true;
      return () => { el.hidden = false; };
    }
    const word = text.textContent;
    text.textContent = "";
    [...word].forEach((c, i) => {
      const s = document.createElement("span");
      s.textContent = c;
      s.style.transitionDelay = `${((i + 1) * +(options.each ?? 0.03)).toFixed(3)}s`;
      text.append(s);
    });
    const lerp = reduce ? 1 : +(options.lerp ?? 0.1);
    const pick = options.pick || "[data-cursor]";
    const w = document.documentElement.clientWidth / 2, h = document.documentElement.clientHeight / 2;
    let mx = w, my = h, x = w, y = h, raf = 0, started = false;
    const tick = () => {
      x += lerp * (mx - x);
      y += lerp * (my - y);
      el.style.transform = `translate3d(${Math.round(x * 10) / 10}px, ${Math.round(y * 10) / 10}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!started) {
        started = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const over = (e) => {
      const t = e.target instanceof Element ? e.target.closest(pick) : null;
      el.classList.toggle("is-active", !!t);
      el.classList.toggle("is-dark", t?.dataset.cursor === "dark");
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      el.classList.remove("is-active", "is-dark");
      el.style.transform = "";
      text.textContent = word;
    };
  });
})();
