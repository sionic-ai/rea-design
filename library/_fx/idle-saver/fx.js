(() => {
  // Exactly the original screenSaver — while waiting, input rewinds the clock, and after the panel appears, input clears the panel
  kfFx.register("idle-saver", (el, { options, reduce }) => {
    const events = ["keydown", "mousemove", "click", "touchmove", "scroll"];
    const idle = (+options.idle || 30) * 1000;
    const dur = reduce ? 0 : +(options.dur ?? 0.5);
    const ease = "power2.inOut";
    const hideDelay = () => (options["hide-delay"] != null ? +options["hide-delay"] : innerWidth > 800 ? 300 : 0);
    const guard = () => (options.guard != null ? +options.guard : innerWidth > 450 ? 1100 : 100);
    const cards = () => [...el.children].filter((n) => n.matches('[data-fx-part="card"]'));
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    let clock = 0, shown = false, current = null;

    const listen = (fn, on) => events.forEach((t) => (on ? addEventListener : removeEventListener)(t, fn, t === "scroll" ? { capture: true, passive: true } : false));
    const show = () => {
      const list = cards();
      current = list.length ? list[Math.floor(Math.random() * list.length)] : null;
      if (current) gsap.to(current, { autoAlpha: 1, duration: dur, ease });
      gsap.to(el, { autoAlpha: 1, duration: dur, ease });
      el.dispatchEvent(new CustomEvent("fx:open", { detail: { card: current } }));
    };
    const hide = () => {
      const list = cards();
      if (list.length) gsap.to(list, { autoAlpha: 0, duration: dur, ease });
      gsap.to(el, { autoAlpha: 0, duration: dur, ease });
      el.dispatchEvent(new CustomEvent("fx:close", { detail: { card: current } }));
      current = null;
    };
    const rewind = () => { clearTimeout(clock); timers.delete(clock); clock = later(onIdle, idle); };
    const onWake = () => {
      if (!shown) return;
      shown = false;
      later(() => { listen(onWake, false); hide(); rewind(); listen(rewind, true); }, hideDelay());
    };
    function onIdle() {
      listen(rewind, false);
      show();
      shown = true;
      listen(onWake, true);
    }
    const openNow = () => {
      if (shown) return;
      listen(rewind, false);
      clearTimeout(clock);
      later(show, 50);
      later(() => { shown = true; listen(onWake, true); }, guard());
    };
    const onClick = (e) => { if (options.open && e.target.closest?.(options.open)) openNow(); };

    rewind();
    listen(rewind, true);
    document.addEventListener("click", onClick);
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      listen(rewind, false);
      listen(onWake, false);
      document.removeEventListener("click", onClick);
      gsap.killTweensOf([el, ...cards()]);
      gsap.set([el, ...cards()], { clearProps: "opacity,visibility" });
    };
  });
})();
