// While held, swap the cursor-ball verb so it flows from ‹Insert → Release› — only when this element has data-fx-cursor-ball.
(() => {
  kfFx.register("drag-lift", (n, { options, reduce, hover }) => {
    // Don’t drag on phone — if touch is intercepted, swiping over the photo won’t scroll the page
    if (!hover) return;
    const ac = new AbortController(), d = reduce ? 0 : 1;
    const scale = +(options.scale ?? 1.06), upDur = +(options.up ?? 0.2), downDur = +(options.down ?? 0.3), tilt = +(options.tilt ?? 0);
    const upEase = kfFx.ease(options["up-ease"] || "power2.out", "power2.out"), downEase = kfFx.ease(options["down-ease"] || "back.out(2)", "back.out(2)");
    const verb = (v) => {
      const s = n.getAttribute("data-fx-cursor-ball");
      if (s != null) n.setAttribute("data-fx-cursor-ball", /verb\s*:/.test(s) ? s.replace(/verb\s*:[^;]*/, `verb: ${v}`) : `verb: ${v}; ${s}`);
    };
    n.addEventListener("pointerdown", (e) => {
      const sx = e.clientX, sy = e.clientY, ox = gsap.getProperty(n, "x"), oy = gsap.getProperty(n, "y");
      n.setPointerCapture(e.pointerId);
      n.style.zIndex = 5;
      verb(options["verb-drag"] || "Insert");
      n.classList.add("fx-lifted");
      gsap.to(n, tilt ? { scale, rotation: gsap.utils.random(-tilt, tilt), duration: upDur * d, ease: upEase } : { scale, duration: upDur * d, ease: upEase });
      const move = (ev) => gsap.set(n, { x: ox + ev.clientX - sx, y: oy + ev.clientY - sy });
      const up = () => {
        n.removeEventListener("pointermove", move);
        n.style.zIndex = "";
        verb(options["verb-drop"] || "Detaching");
        n.classList.remove("fx-lifted");
        gsap.to(n, tilt ? { scale: 1, rotation: 0, duration: downDur * d, ease: downEase } : { scale: 1, duration: downDur * d, ease: downEase });
      };
      n.addEventListener("pointermove", move, { signal: ac.signal });
      n.addEventListener("pointerup", up, { once: true, signal: ac.signal });
    }, { signal: ac.signal });
    // Elements removed from the document don’t get their transform cleared — if GSAP briefly attaches and detaches one to measure it, fx-core sees it as a newly added element and keeps attaching and detaching endlessly, freezing the page
    return () => { ac.abort(); gsap.killTweensOf(n); n.classList.remove("fx-lifted"); if (n.isConnected) gsap.set(n, { clearProps: "transform,zIndex" }); };
  });
})();
