(() => {
  // Entry curtain covering the Hero — a car enters from off left, stops at the left end of the button (go) and idles, and when the button is pressed it leaves off to the right and then the curtain lifts.
  // When lifted, it fires fx:gate-open on the element (to start the hero sequence then). Locks document scroll while the curtain is up.
  kfFx.register("drive-in-gate", (el, { options, reduce }) => {
    const card = el.querySelector('[data-fx-part="card"]'), car = el.querySelector('[data-fx-part="car"]');
    const go = el.querySelector('[data-fx-part="go"]'), lane = el.querySelector('[data-fx-part="lane"]');
    if (!go) return;
    const inDur = +(options.in ?? 1.5), outDur = +(options.out ?? 0.7), fade = +(options.fade ?? 0.55);
    const inEase = options["in-ease"] || "cubic-bezier(0.23, 1, 0.32, 1)", outEase = options["out-ease"] || "cubic-bezier(0.55, 0, 1, 0.45)";
    const narrowAt = +(options.narrow ?? 666), hold = +(options.hold ?? 1);
    el.style.setProperty("--fx-fade", `${fade}s`);
    const root = document.documentElement;
    const bar = innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (bar > 0) root.style.paddingRight = `${bar}px`;
    const unlock = () => { root.style.overflow = ""; root.style.paddingRight = ""; };
    const timers = [];
    let stopX = 0, done = false, raf = 0;
    const narrow = innerWidth <= narrowAt;

    const idle = () => { if (!car || reduce) return; car.style.setProperty("--fx-stop-x", `${stopX}px`); car.style.transition = "none"; car.classList.add("is-fx-idle"); };
    if (car && !reduce) {
      if (narrow) {
        raf = requestAnimationFrame(() => (raf = requestAnimationFrame(idle)));
      } else {
        raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => {
          const b = go.getBoundingClientRect(), h = car.offsetHeight;
          let top = b.top - h - 8;
          if (lane) { lane.style.minHeight = `${h}px`; const r = lane.getBoundingClientRect(); if (r.height > 0) top = r.top + (r.height - h) / 2; }
          stopX = b.left;
          Object.assign(car.style, { position: "fixed", top: `${top}px`, left: "0", transform: "translateX(-100%)", transition: "none", zIndex: "1" });
          void car.offsetWidth;
          raf = requestAnimationFrame(() => (raf = requestAnimationFrame(() => {
            car.style.transition = `transform ${inDur}s ${inEase}`;
            car.style.transform = `translateX(${stopX}px)`;
            const onIn = (e) => { if (e.target !== car) return; car.removeEventListener("transitionend", onIn); idle(); };
            car.addEventListener("transitionend", onIn);
          })));
        })));
      }
    }

    const hide = () => {
      if (done) return;
      done = true;
      el.classList.add("is-fx-hidden");
      let ended = false;
      const after = (e) => {
        if (e && (e.target !== el || e.propertyName !== "opacity")) return;
        if (ended) return;
        ended = true;
        el.style.display = "none";
        el.dispatchEvent(new CustomEvent("fx:gate-open", { bubbles: true }));
      };
      el.addEventListener("transitionend", after);
      timers.push(setTimeout(after, reduce ? 0 : fade * 1000 + 350));
    };
    const onGo = () => {
      unlock();
      if (!car || reduce) return hide();
      car.classList.remove("is-fx-idle");
      car.style.transform = `translateX(${stopX}px)`;
      void car.offsetWidth;
      requestAnimationFrame(() => {
        car.style.transition = `transform ${outDur}s ${outEase}`;
        car.style.transform = `translateX(${innerWidth + (narrow ? 200 : 300)}px)`;
      });
      // The original was built to wait for the element’s transitionend, but in practice a 1s fallback timer lifts the curtain (confirmed by measuring) — that 1s is set as hold
      timers.push(setTimeout(hide, Math.max(hold, 0) * 1000));
    };
    go.addEventListener("click", onGo);
    if (card) card.classList.add("is-fx-ready");

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      go.removeEventListener("click", onGo);
      unlock();
      el.classList.remove("is-fx-hidden");
      el.style.display = "";
      el.style.removeProperty("--fx-fade");
      if (car) { car.classList.remove("is-fx-idle"); car.removeAttribute("style"); }
      if (lane) lane.style.minHeight = "";
    };
  });
})();
