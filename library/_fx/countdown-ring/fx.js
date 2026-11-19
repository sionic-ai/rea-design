(() => {
  // A round ring fills over every seconds with no easing (.05s linear every 50ms) and the center number counts down from every to 1.
  // When full, emits fx:done after 100ms and stops — the consumer advances the slider and sends fx:reset to count from the start again
  kfFx.register("countdown-ring", (el, { options }) => {
    const every = +(options.every || 4);
    const ring = el.querySelector('[data-fx-part="ring"]') || (() => {
      el.insertAdjacentHTML("afterbegin", '<svg class="fx-cdr-ring" viewBox="0 0 56 56" aria-hidden="true"><circle data-fx-part="ring" cx="28" cy="28" r="25"/></svg>');
      return el.querySelector('[data-fx-part="ring"]');
    })();
    const num = el.querySelector('[data-fx-part="num"]');
    const len = 2 * Math.PI * (+ring.getAttribute("r") || 25);
    let tick = 0, wait = 0, start = 0, last = 0;
    const paint = (p) => { ring.style.strokeDashoffset = String(len - p * len); };
    const stop = () => { clearInterval(tick); clearTimeout(wait); tick = wait = 0; };
    const run = () => {
      stop();
      if (num) num.textContent = every;
      ring.style.strokeDasharray = String(len);
      ring.style.transition = "none";
      paint(0);
      void ring.getBoundingClientRect();
      ring.style.transition = "";
      start = Date.now(); last = 0;
      tick = setInterval(() => {
        const s = (Date.now() - start) / 1000, left = every - s, p = Math.min(s / every, 1);
        if (left <= 0) {
          stop();
          if (num) num.textContent = 1;
          paint(1);
          wait = setTimeout(() => el.dispatchEvent(new CustomEvent("fx:done")), 100);
          return;
        }
        if (num) num.textContent = Math.ceil(left);
        if (p > last) { paint(p); last = p; }
      }, 50);
    };
    el.addEventListener("fx:reset", run);
    run();
    return () => { stop(); el.removeEventListener("fx:reset", run); el.querySelector(".fx-cdr-ring")?.remove(); };
  });
})();
