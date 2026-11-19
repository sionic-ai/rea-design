(() => {
  // On interaction the underline draws from the left, on release it retracts to the right — if released while drawing (hold) it retracts only after finishing, so it never turns back halfway
  kfFx.register("underline-draw-through", (el, { options, reduce, hover }) => {
    if (!hover) return;
    let line = el.querySelector('[data-fx-part="line"]');
    const made = !line;
    if (made) {
      line = document.createElement("span");
      line.setAttribute("data-fx-part", "line");
      line.setAttribute("aria-hidden", "true");
      el.append(line);
    }
    if (reduce) return () => { if (made) line.remove(); };
    const holdMs = +(options.hold ?? 1) * 1000, outMs = +(options.out ?? 1) * 1000;
    let state = "idle", queued = false, timer = null;
    const done = () => {
      clearTimeout(timer);
      if (state === "entering") { state = "entered"; if (queued) leave(); }
      else if (state === "leaving") state = "idle";
    };
    const leave = () => {
      state = "leaving";
      queued = false;
      el.classList.remove("is-drawn");
      clearTimeout(timer);
      timer = setTimeout(done, outMs + 100);
    };
    const onEnter = () => {
      if (state === "entering" || state === "entered") return;
      state = "entering";
      queued = false;
      el.classList.add("is-drawn");
      clearTimeout(timer);
      timer = setTimeout(done, holdMs + 50);
    };
    const onLeave = () => { if (state === "entering") queued = true; else if (state === "entered") leave(); };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.classList.remove("is-drawn");
      if (made) line.remove();
    };
  });
})();
