(() => {
  // Pressing the left half (prev) or right half (next) of the photo panel unfolds the next image from that edge with a clip-path polygon (power1.out) while it slides into place from 50% of the panel width to the side (power2.out).
  // The page number turns off in .25s and turns back on with the new number in .25s, and if there is a side panel (sub-media) the same section follows along the same way. The cursor position follows --x · --y .25s late so the Prev · Next text sticks to the cursor height.
  kfFx.register("tap-wipe-slider", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    const media = slides.map((s) => s.querySelector('[data-fx-part="media"]') || s);
    const subs = [...el.querySelectorAll('[data-fx-part="sub-slide"]')];
    const subMedia = subs.map((s) => s.querySelector('[data-fx-part="sub-media"]') || s);
    const num = el.querySelector('[data-fx-part="num"]'), total = el.querySelector('[data-fx-part="total"]');
    const prevBtn = el.querySelector('[data-fx-part="prev"]'), nextBtn = el.querySelector('[data-fx-part="next"]');
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    if (slides.length < 2 || !window.gsap) { el.classList.add("is-disabled"); return () => el.classList.remove("is-disabled"); }
    const dur = +(options.dur ?? 0.75), shift = options.shift || "50%", count = +(options.count ?? 0.25);
    let i = 1, busy = false, sx = 0, sy = 0;
    if (total) total.textContent = String(slides.length);
    el.classList.add("is-enabled");
    const show = (k) => {
      el.setAttribute("data-index", k);
      el.style.setProperty("--slide-index", k);
      media.forEach((m, n) => gsap.set(m, { autoAlpha: n === k - 1 ? 1 : 0 }));
      gsap.set(slides[k - 1], { zIndex: 1 });
      subMedia.forEach((m, n) => gsap.set(m, { autoAlpha: n === k - 1 ? 1 : 0 }));
      if (subs[k - 1]) gsap.set(subs[k - 1], { zIndex: 1 });
    };
    const go = (dir) => {
      if (busy) return;
      let t = i + (dir === "next" ? 1 : -1);
      if (t <= 0) t = slides.length;
      if (t > slides.length) t = 1;
      busy = true;
      gsap.set(slides[i - 1], { zIndex: 0 }); gsap.set(slides[t - 1], { zIndex: 1 });
      if (subs.length) { gsap.set(subs[i - 1], { zIndex: 0 }); gsap.set(subs[t - 1], { zIndex: 1 }); }
      const from = dir === "next" ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
      const full = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
      const x = dir === "next" ? shift : "-" + shift.replace(/^-/, "");
      const d = reduce ? 0 : dur;
      const wipe = (m, main) => {
        if (!m) return;
        gsap.fromTo(m, { autoAlpha: 1, clipPath: from }, { duration: d, clipPath: full, ease: "power1.out" });
        gsap.fromTo(m, { x }, { x: 0, duration: d, ease: "power2.out", clearProps: "all", ...(main && {
          onStart: () => {
            i = t;
            el.setAttribute("data-index", t);
            el.style.setProperty("--slide-index", t);
            if (num) gsap.to(num, { duration: count, alpha: 0, onComplete: () => { num.textContent = String(t); gsap.to(num, { duration: count, alpha: 1 }); } });
          },
          onComplete: () => { show(i); busy = false; },
        }) });
      };
      wipe(media[t - 1], true);
      wipe(subMedia[t - 1], false);
    };
    const onPrev = () => go("prev"), onNext = () => go("next");
    // Prev·Next that follow the cursor height — the original follows pointermove offsetX·offsetY in .25s
    const size = () => el.style.setProperty("--h", stage.clientHeight + "px");
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      gsap.to(el, { duration: 0.25, "--x": `${e.clientX - r.left}px`, "--y": `${e.clientY - r.top}px` });
    };
    // Swiping sideways with a finger advances — vertical scroll isn’t blocked
    const down = (e) => { if (e.pointerType !== "mouse") { sx = e.clientX; sy = e.clientY; } };
    const up = (e) => {
      if (e.pointerType === "mouse") return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? "next" : "prev");
    };
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointerup", up);
    el.addEventListener("fx:next", onNext);
    el.addEventListener("fx:prev", onPrev);
    const ro = new ResizeObserver(size);
    ro.observe(stage);
    show(1); size();
    return () => {
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointerup", up);
      el.removeEventListener("fx:next", onNext);
      el.removeEventListener("fx:prev", onPrev);
      ro.disconnect();
      gsap.killTweensOf([...media, ...subMedia, num, el].filter(Boolean));
      gsap.set([...media, ...subMedia, ...slides, ...subs], { clearProps: "all" });
      ["--x", "--y", "--h", "--slide-index"].forEach((k) => el.style.removeProperty(k));
      el.removeAttribute("data-index");
      el.classList.remove("is-enabled");
    };
  });
})();
