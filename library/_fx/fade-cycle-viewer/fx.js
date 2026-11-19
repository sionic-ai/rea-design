(() => {
  // Original (Brand hero): one render image floats, fades out over .7s (.4,0,.2,1) every 4 seconds, and after it’s off the next image swaps in and fades on with the same curve.
  // Click a picture to enter view mode — the display stops, click the left half of the plate for the previous picture and the right half for the next (switches instantly), same with the left/right arrow keys or a swipe over 50px.
  // Leaving via Esc·close returns to a 4-second display. Viewer-mode skin such as curtain·text color is chosen by the caller with [data-viewer]
  const num = (v, d) => (v === undefined || v === "" ? d : +v);

  kfFx.register("fade-cycle-viewer", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const every = num(options.every, 4) || 4;
    const fade = num(options.fade, 0.7);
    const ease = kfFx.ease(options.ease || "0.4,0,0.2,1", "power1.inOut");
    const titles = [...el.querySelectorAll('[data-fx-part="title"]')];
    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const closeBtns = [...el.querySelectorAll('[data-fx-part="close"]')];
    const stage = el.querySelector('[data-fx-part="stage"]') || el;

    let index = 0, viewer = false, timer = 0, swap = 0, sx = null, ex = null;
    const emit = (name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

    let dots = [];
    if (dotsBox) {
      dotsBox.textContent = "";
      dots = items.map((_, i) => {
        const d = document.createElement("button");
        d.type = "button";
        d.setAttribute("data-fx-part", "dot");
        d.setAttribute("aria-label", `${i + 1}Nth`);
        d.addEventListener("click", (e) => { e.stopPropagation(); show(i, true); });
        dotsBox.append(d);
        return d;
      });
    }

    const paint = () => {
      items.forEach((it, i) => { it.hidden = i !== index; });
      dots.forEach((d, i) => d.toggleAttribute("data-on", i === index));
      const title = items[index].getAttribute("data-title") || "";
      titles.forEach((t) => { t.textContent = title; });
    };
    // On immediate changes (view mode, keys) the new picture stands as is without fading out
    const show = (i, instant) => {
      index = ((i % items.length) + items.length) % items.length;
      clearTimeout(swap);
      gsap.killTweensOf(items);
      paint();
      gsap.set(items[index], { opacity: 1 });
      emit("fx:change", { index, item: items[index] });
      if (instant) restart();
    };
    const stop = () => { clearInterval(timer); clearTimeout(swap); timer = swap = 0; };
    const restart = () => {
      stop();
      if (viewer || reduce) return;
      timer = setInterval(() => {
        gsap.to(items[index], { opacity: 0, duration: fade, ease });
        swap = setTimeout(() => {
          index = (index + 1) % items.length;
          paint();
          gsap.fromTo(items[index], { opacity: 0 }, { opacity: 1, duration: fade, ease });
          emit("fx:change", { index, item: items[index] });
        }, fade * 1000);
      }, every * 1000);
    };
    // The view mode indicator is attached two frames later — the original reflects the press state, then on the next frame (rAF) reflects again the state that turns on the curtain
    let openFrame = 0;
    const open = () => {
      viewer = true; stop();
      gsap.killTweensOf(items);
      // If pressed while turning off, it turns back on with the same .7s curve (the original just removes the off marker, so it returns via a transition)
      gsap.to(items[index], { opacity: 1, duration: reduce ? 0 : fade, ease });
      cancelAnimationFrame(openFrame);
      openFrame = requestAnimationFrame(() => { openFrame = requestAnimationFrame(() => {
        if (!viewer) return;
        el.setAttribute("data-viewer", "");
        emit("fx:viewer", { open: true, index });
      }); });
    };
    const close = () => {
      if (!viewer) return;
      viewer = false;
      el.removeAttribute("data-viewer");
      emit("fx:viewer", { open: false, index });
      restart();
    };

    paint();
    items.forEach((it, i) => gsap.set(it, { opacity: i === index ? 0 : 1 }));
    // On first open the first image turns on in .7s (the original removes the off state after attaching)
    if (reduce) gsap.set(items[index], { opacity: 1 });
    else gsap.to(items[index], { opacity: 1, duration: fade, ease });
    restart();

    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    on(stage, "click", (e) => {
      if (e.target.closest('[data-fx-part="dot"], [data-fx-part="close"]')) return;
      if (!viewer) { open(); return; }
      const r = stage.getBoundingClientRect();
      show(index + (e.clientX - r.left < r.width / 2 ? -1 : 1), true);
    });
    closeBtns.forEach((b) => on(b, "click", (e) => { e.stopPropagation(); close(); }));
    on(window, "keydown", (e) => {
      if (e.key === "Escape" && viewer) close();
      else if (e.key === "ArrowRight") show(index + 1, true);
      else if (e.key === "ArrowLeft") show(index - 1, true);
    });
    on(stage, "touchstart", (e) => { ex = null; sx = e.targetTouches[0].clientX; }, { passive: true });
    on(stage, "touchmove", (e) => { ex = e.targetTouches[0].clientX; }, { passive: true });
    on(stage, "touchend", () => {
      if (sx == null || ex == null) return;
      const d = sx - ex;
      if (d > 50) show(index + 1, true); else if (d < -50) show(index - 1, true);
    });
    on(el, "fx:close", close);
    on(el, "fx:open", open);

    return () => {
      stop();
      cancelAnimationFrame(openFrame);
      offs.forEach((f) => f());
      gsap.killTweensOf(items);
      items.forEach((it) => { it.hidden = false; gsap.set(it, { clearProps: "opacity" }); });
      dots.forEach((d) => d.remove());
      el.removeAttribute("data-viewer");
    };
  });
})();
