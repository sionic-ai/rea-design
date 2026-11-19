(() => {
  // When the art inside the veil covering the hero finishes (hold seconds or fx:art-done), the veil lifts over fade seconds, and white bands grow from the four screen edges after delay seconds over dur seconds
  // Panel (root) to [data-fx-part=frame] slot’s frame closes in. Meanwhile page scroll is locked, and when fully closed (ready seconds) .fx-intro-done is added to html and fx:done is fired.
  kfFx.register("frame-bars-intro", (el, { options, reduce }) => {
    const root = document.documentElement;
    const veil = el.querySelector('[data-fx-part="veil"]'), frame = el.querySelector('[data-fx-part="frame"]');
    const done = () => {
      root.classList.add("fx-intro-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce || root.classList.contains("fx-intro-done")) {
      if (veil) veil.style.display = "none";
      done();
      return () => { if (veil) veil.style.display = ""; };
    }
    const hold = options.hold === "event" ? null : +(options.hold ?? 2.34);
    const fade = +(options.fade ?? 0.15), dur = +(options.dur ?? 0.7), delay = +(options.delay ?? 0.3);
    const ready = +(options.ready ?? 1), clear = +(options.clear ?? 1.2), wait = +(options.wait ?? 12);
    const ease = kfFx.ease(options.ease || "0.4,0,0.2,1", "power2.inOut");
    const lock = () => { root.classList.add("is-fx-intro"); el.dispatchEvent(new CustomEvent("fx:lock", { bubbles: true })); scrollTo(0, 0); };
    const unlock = () => { root.classList.remove("is-fx-intro"); el.dispatchEvent(new CustomEvent("fx:unlock", { bubbles: true })); };
    lock();

    const bars = ["top", "right", "bottom", "left"].map((side) => {
      const b = document.createElement("i");
      b.className = "fx-frame-bar";
      b.dataset.side = side;
      el.append(b);
      return b;
    });
    const timers = [];
    let tl = null, closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      const r = el.getBoundingClientRect(), f = (frame || el).getBoundingClientRect();
      const size = { top: Math.max(0, f.top - r.top), bottom: Math.max(0, r.bottom - f.bottom), left: Math.max(0, f.left - r.left), right: Math.max(0, r.right - f.right) };
      bars.forEach((b) => b.style.setProperty("--fx-size", `${size[b.dataset.side]}px`));
      tl = gsap.timeline();
      if (veil) tl.to(veil, { opacity: 0, duration: fade, ease: "none" }, 0);
      tl.fromTo(bars.filter((b) => /top|bottom/.test(b.dataset.side)), { scaleY: 0 }, { scaleY: 1, duration: dur, ease }, delay);
      tl.fromTo(bars.filter((b) => /left|right/.test(b.dataset.side)), { scaleX: 0 }, { scaleX: 1, duration: dur, ease }, delay);
      timers.push(setTimeout(() => { unlock(); done(); }, ready * 1000));
      timers.push(setTimeout(() => { bars.forEach((b) => b.remove()); if (veil) veil.style.display = "none"; }, clear * 1000));
    };
    const onArt = () => close();
    el.addEventListener("fx:art-done", onArt);
    timers.push(setTimeout(close, (hold ?? wait) * 1000));

    return () => {
      el.removeEventListener("fx:art-done", onArt);
      timers.forEach(clearTimeout);
      tl?.kill();
      bars.forEach((b) => b.remove());
      if (veil) { veil.style.display = ""; gsap.set(veil, { clearProps: "opacity" }); }
      unlock();
    };
  });
})();
