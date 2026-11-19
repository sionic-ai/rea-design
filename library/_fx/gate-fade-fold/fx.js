(() => {
  // Entrance door → title rises from the screen center → title panel folds and the body is pushed up. The original (a manifesto site) waits until the door is pressed
  // Lock scrolling, and even after the press keep it locked until the fold is almost done (4.5s) — the lock exists so people see the whole title, so the lock option releases it
  kfFx.register("gate-fade-fold", (el, { options, reduce }) => {
    const gate = el.querySelector('[data-fx-part="gate"]');
    const go = el.querySelector('[data-fx-part="go"]');
    if (!gate || !go) return;
    const head = el.querySelector('[data-fx-part="head"]');
    const sub = el.querySelector('[data-fx-part="sub"]');
    const rest = el.querySelector('[data-fx-part="rest"]');

    const wait = +(options.wait ?? 1);
    const fade = +(options.fade ?? 1);
    const show = +(options.show ?? 1);
    const subAt = +(options.sub ?? 1);
    const fold = +(options.fold ?? 2.2);
    const foldDur = +(options["fold-dur"] ?? 2);
    const unlock = +(options.unlock ?? 4.5);
    const lock = options.lock !== "false";
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const tweens = [];
    const timers = [];
    let entered = false;

    // Original measures window height in px (innerHeight, not 100vh) — so the title plate stays one screen even when a phone address bar shrinks
    const fit = () => { if (head && !entered) head.style.minHeight = `${innerHeight}px`; };
    fit();
    addEventListener("resize", fit);
    if (lock) body.style.overflow = "hidden";
    const hidden = [head, sub, rest].filter(Boolean);
    if (hidden.length) gsap.set(hidden, { opacity: 0 });
    if (reduce) gsap.set(gate, { opacity: 1 });
    else tweens.push(gsap.fromTo(gate, { opacity: 0 }, { opacity: 1, duration: fade, delay: wait, ease }));

    const done = () => {
      if (lock) body.style.overflow = prevOverflow || "auto";
      el.classList.add("fx-gate-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    // The original (react) pulls a turned-off door out of the document — if it is only hidden, the button loses hover and its color changes once more, and the size is read as auto
    const spot = document.createComment("gate-fade-fold");
    const open = () => {
      if (options.remove === "false") gate.style.display = "none";
      else if (gate.isConnected) gate.replaceWith(spot);
      el.classList.add("fx-gate-open");
      if (rest) gsap.set(rest, { opacity: 1 });
      if (reduce) {
        if (hidden.length) gsap.set(hidden, { opacity: 1 });
        if (head) head.style.minHeight = "0px";
        return;
      }
      if (head) {
        tweens.push(gsap.to(head, { opacity: 1, duration: show, ease }));
        tweens.push(gsap.to(head, { minHeight: 0, duration: foldDur, delay: fold, ease }));
      }
      if (sub) tweens.push(gsap.to(sub, { opacity: 1, duration: show, delay: subAt, ease }));
    };
    const enter = (e) => {
      e?.preventDefault?.();
      if (entered) return;
      entered = true;
      scrollTo(0, 0);
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
      tweens.forEach((t) => t.kill());
      if (reduce) { open(); done(); return; }
      tweens.push(gsap.to(gate, { opacity: 0, duration: fade, ease }));
      timers.push(setTimeout(open, fade * 1000), setTimeout(done, unlock * 1000));
    };
    go.addEventListener("click", enter);

    return () => {
      go.removeEventListener("click", enter);
      removeEventListener("resize", fit);
      timers.forEach(clearTimeout);
      tweens.forEach((t) => t.kill());
      if (spot.isConnected) spot.replaceWith(gate);
      gsap.set([gate, ...hidden], { clearProps: "opacity" });
      gate.style.display = "";
      if (head) head.style.minHeight = "";
      if (lock) body.style.overflow = prevOverflow;
      el.classList.remove("fx-gate-open", "fx-gate-done");
    };
  });
})();
