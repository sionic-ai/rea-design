// Home page: Work card screen overlap swap (every 2.5s for .7s, pauses on hover), review slider (every 4s, dots and pause button).
// Original sets the timer after React wakes up (after the page is fully loaded). When a transition becomes another page (ex:leave), timers and listeners are cleared.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ac = new AbortController();
  const timers = [];
  const every = (ms, fn) => {
    let id = 0;
    const on = () => { if (!id && !reduce) id = setInterval(fn, ms); };
    const off = () => { clearInterval(id); id = 0; };
    timers.push([on, off]);
  };
  const startAll = () => timers.forEach(([on]) => on());
  document.addEventListener("visibilitychange", () => timers.forEach(([on, off]) => (document.hidden ? off() : on())), { signal: ac.signal });
  document.addEventListener("ex:leave", () => { timers.forEach(([, off]) => off()); timers.length = 0; ac.abort(); }, { once: true });

  document.querySelectorAll("[data-cycle]").forEach((box) => {
    const imgs = [...box.children];
    if (imgs.length < 2) return;
    let at = 0, held = false;
    const hold = (v) => () => { held = v; };
    box.addEventListener("mouseenter", hold(true));
    box.addEventListener("mouseleave", hold(false));
    box.addEventListener("focusin", hold(true));
    box.addEventListener("focusout", hold(false));
    every(2500, () => {
      if (held) return;
      imgs[at].classList.remove("is-on");
      at = (at + 1) % imgs.length;
      imgs[at].classList.add("is-on");
    });
  });

  const quote = document.getElementById("ex-quote");
  if (quote) {
    const data = [...quote.querySelectorAll("template[data-quote]")].map((t) => t.content);
    const text = quote.querySelector(".ex-quote__box .ex-quote__text");
    const name = quote.querySelector(".ex-quote__name");
    const role = quote.querySelector(".ex-quote__role");
    const dots = [...document.querySelectorAll(".ex-dot")];
    const pause = document.querySelector(".ex-pause");
    let at = -1, paused = false;
    const show = (i) => {
      // The original doesn’t redraw if the same review is picked again — draws anew only on change so the .5s float-up runs
      if (i === at) return;
      at = i;
      const d = data[i];
      text.textContent = d.querySelector(".ex-quote__text").textContent;
      name.textContent = d.querySelector("[data-name]").textContent;
      role.textContent = d.querySelector("[data-role]").textContent;
      dots.forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-selected", String(k === i)); });
      quote.classList.remove("is-in");
      void quote.offsetWidth;
      quote.classList.add("is-in");
    };
    const setPaused = (v) => {
      paused = v;
      pause.setAttribute("aria-pressed", String(v));
      pause.setAttribute("aria-label", v ? "Flip through reviews again" : "Pause reviews");
    };
    dots.forEach((b, k) => b.addEventListener("click", () => { setPaused(true); show(k); }));
    pause.addEventListener("click", () => setPaused(!paused));
    show(0);
    every(4000, () => { if (!paused) show((at + 1) % data.length); });
  }

  if (document.readyState === "complete") startAll();
  else addEventListener("load", startAll, { once: true, signal: ac.signal });
})();
