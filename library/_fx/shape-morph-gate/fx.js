(() => {
  // data-from / data-to — "w: 20.83; h: 26.04; r: 45; vb: 400 400" (Width and height in unit units, r in degrees, vb is the svg viewBox width and height)
  const read = (s) => {
    const o = {};
    for (const part of (s || "").split(";")) {
      const i = part.indexOf(":");
      if (i > 0) o[part.slice(0, i).trim()] = part.slice(i + 1).trim();
    }
    return { w: +(o.w ?? 0), h: +(o.h ?? 0), r: +(o.r ?? 0), vb: o.vb ? o.vb.split(/\s+/).map(Number) : null };
  };

  kfFx.register("shape-morph-gate", (el, { options, reduce, scroller }) => {
    const shapes = [...el.querySelectorAll('[data-fx-part="shape"]')];
    if (!shapes.length) return;
    const copy = el.querySelector('[data-fx-part="copy"]');
    const lines = copy ? (copy.children.length ? [...copy.children] : [copy]) : [];
    const trigger = el.querySelector('[data-fx-part="trigger"]');
    const unit = options.unit || "vw";
    const dur = +(options.dur ?? 0.7), delay = +(options.delay ?? 0.7), each = +(options.each ?? 0.15);
    const doLock = (options.lock ?? "1") !== "0" && !scroller;
    const states = shapes.map((s) => ({ from: read(s.dataset.from), to: read(s.dataset.to) }));
    const body = document.body;
    const timers = [];
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));

    const place = (s, st) => {
      gsap.set(s, { width: st.w + unit, height: st.h + unit, rotation: st.r });
      if (st.vb) setBox(s, st.vb[0], st.vb[1], 1);
    };
    const setBox = (s, w, h, k) => {
      s.setAttribute("viewBox", `0 0 ${w.toFixed(2)} ${h.toFixed(2)}`);
      const rect = s.querySelector("rect");
      if (rect && k) { rect.setAttribute("width", w); rect.setAttribute("height", h); }
    };

    if (reduce) {
      el.classList.add("is-open");
      shapes.forEach((s, i) => { place(s, states[i].to); gsap.set(s, { opacity: 1, scale: 1 }); });
      gsap.set(lines, { autoAlpha: 0 });
      if (trigger) trigger.hidden = true;
      return () => { el.classList.remove("is-open"); gsap.set([...shapes, ...lines], { clearProps: "all" }); if (trigger) trigger.hidden = false; };
    }

    let ready = false, open = false, busy = false, lockedY = 0, locked = false, touchY = null;
    const stop = (e) => e.preventDefault();
    const stopKeys = (e) => [32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode) && e.preventDefault();
    const lock = () => {
      if (!doLock || locked) return;
      locked = true;
      lockedY = scrollY;
      Object.assign(body.style, { position: "fixed", top: `-${lockedY}px`, left: "0", right: "0", overflow: "hidden" });
      addEventListener("wheel", stop, { passive: false });
      addEventListener("touchmove", stop, { passive: false });
      addEventListener("keydown", stopKeys);
    };
    const unlock = () => {
      if (!locked) return;
      locked = false;
      Object.assign(body.style, { position: "", top: "", left: "", right: "", overflow: "" });
      scrollTo(0, lockedY);
      removeEventListener("wheel", stop);
      removeEventListener("touchmove", stop);
      removeEventListener("keydown", stopKeys);
    };

    const revealLines = () => {
      if (!lines.length) return;
      gsap.fromTo(lines, { autoAlpha: 0, y: -40, clipPath: "inset(0 0 100% 0)" },
        { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power2.out", overwrite: true });
    };
    const showTrigger = () => trigger && gsap.fromTo(trigger, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" });

    const morph = (dir) => {
      shapes.forEach((s, i) => {
        const a = dir ? states[i].from : states[i].to, b = dir ? states[i].to : states[i].from;
        gsap.fromTo(s, { scale: 0.3, rotation: a.r, width: a.w + unit, height: a.h + unit },
          { scale: 1, rotation: b.r, width: b.w + unit, height: b.h + unit, duration: dur, ease: "back.out(1.7)", overwrite: true });
        if (a.vb && b.vb) {
          const box = { w: a.vb[0], h: a.vb[1] };
          const rect = s.querySelector("rect");
          if (rect) gsap.fromTo(rect, { attr: { width: a.vb[0] * 0.7, height: a.vb[1] * 0.7 } }, { attr: { width: b.vb[0], height: b.vb[1] }, duration: dur, ease: "power1.inOut" });
          gsap.to(box, { w: b.vb[0], h: b.vb[1], duration: dur, ease: "power1.inOut", onUpdate: () => setBox(s, box.w, box.h, 0) });
        }
      });
    };

    const openGate = () => {
      if (!ready || open || busy) return;
      busy = true;
      open = true;
      el.classList.add("is-open");
      lock();
      gsap.killTweensOf(lines);
      gsap.set(lines, { autoAlpha: 0 });
      morph(1);
      if (trigger) gsap.to(trigger, { autoAlpha: 0, y: -20, duration: 0.2, ease: "power1.inOut" });
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      later(() => { unlock(); busy = false; window.ScrollTrigger?.refresh(); }, 0.8);
    };
    const closeGate = () => {
      if (!open || busy) return;
      busy = true;
      open = false;
      lock();
      morph(0);
      el.classList.remove("is-open");
      el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true }));
      later(() => { revealLines(); showTrigger(); }, 0.6);
      later(() => (busy = false), 0.8);
    };

    // On first load, the text drops in from above and fades in. After the delay, the shapes pop out from .2 scale at each interval, and scrolling stays locked meanwhile
    lock();
    shapes.forEach((s, i) => { place(s, states[i].from); gsap.set(s, { opacity: 0, scale: 0.2 }); });
    if (trigger) gsap.set(trigger, { autoAlpha: 0, y: -20 });
    revealLines();
    gsap.to(shapes, {
      opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)", delay, stagger: each,
      onComplete: () => { ready = true; showTrigger(); },
    });

    const onWheel = (e) => {
      if (!ready || busy) return;
      if (!open && e.deltaY > 10) openGate();
      else if (open && scrollY <= 5 && e.deltaY < -10) closeGate();
    };
    const onStart = (e) => (touchY = e.touches[0].clientY);
    const onEnd = (e) => {
      if (!ready || busy || touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (!open && dy > 30) openGate();
      else if (open && scrollY <= 5 && dy < -30) closeGate();
      touchY = null;
    };
    const onClick = () => openGate();
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("touchstart", onStart, { passive: true });
    addEventListener("touchend", onEnd, { passive: true });
    trigger?.addEventListener("click", onClick);

    return () => {
      timers.forEach(clearTimeout);
      unlock();
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onStart);
      removeEventListener("touchend", onEnd);
      trigger?.removeEventListener("click", onClick);
      gsap.killTweensOf([...shapes, ...lines, trigger].filter(Boolean));
      gsap.set([...shapes, ...lines, trigger].filter(Boolean), { clearProps: "all" });
      el.classList.remove("is-open");
    };
  });
})();
