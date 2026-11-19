// A center-aligned ring carousel that runs only on narrow screens — duplicates cells front and back to loop endlessly, advances one cell by button·dot·finger swipe (over 50px).
// On wide screens (wider than below) the clones are removed and the cells sit side by side as they are. Transitions move the track’s transform with a CSS transition (.3s ease).
(() => {
  kfFx.register("center-loop-swipe", (el, { options, reduce }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const items = [...track.children];
    const n = items.length;
    if (n < 2) return;
    const ctrl = el.querySelector('[data-fx-part="ctrl"]');
    const prevBtn = el.querySelector('[data-fx-part="prev"]');
    const nextBtn = el.querySelector('[data-fx-part="next"]');
    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const below = +(options.below ?? 1099);
    const clone = Math.max(1, Math.min(n, +options.clone || 2));
    const dur = reduce ? 0 : +(options.dur ?? 0.3);
    const ease = options.ease || "ease";
    const swipe = +(options.swipe ?? 50);
    let on = false, idx = 0, clones = [], dots = [], timer = 0, sx = 0, cx = 0, dragging = false;

    const step = () => (items[1] ? items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left : items[0].getBoundingClientRect().width);
    const base = () => el.offsetWidth / 2 - items[0].getBoundingClientRect().width / 2 - (idx + clone) * step();
    const loopIdx = () => ((idx % n) + n) % n;
    const place = (animate, extra = 0) => {
      if (!on) return;
      track.style.transition = animate && dur ? `transform ${dur}s ${ease}` : "none";
      track.style.transform = `translateX(${base() + extra}px)`;
      dots.forEach((d, i) => { d.classList.toggle("is-active", i === loopIdx()); d.setAttribute("aria-current", i === loopIdx()); });
      clearTimeout(timer);
      // After reaching the clone cell, jump with no transition to the real cell that looks identical
      if (animate) timer = setTimeout(() => { if (idx >= n || idx < 0) { idx = loopIdx(); place(false); } }, dur * 1000);
    };
    const go = (d) => { idx += d; place(true); };
    const onPrev = () => go(-1);
    const onNext = () => go(1);
    const onDot = (e) => { const b = e.target.closest("button"); if (!b) return; idx = +b.dataset.index; place(true); };
    const onStart = (e) => { if (!on) return; dragging = true; sx = cx = e.touches[0].clientX; track.style.transition = "none"; };
    const onMove = (e) => { if (!dragging) return; cx = e.touches[0].clientX; track.style.transform = `translateX(${base() + cx - sx}px)`; };
    const onEnd = () => { if (!dragging) return; dragging = false; const dx = cx - sx; if (dx < -swipe) idx++; else if (dx > swipe) idx--; place(true); };

    const build = () => {
      on = true;
      idx = 0;
      const head = items.slice(-clone).map((x) => x.cloneNode(true));
      const tail = items.slice(0, clone).map((x) => x.cloneNode(true));
      clones = [...head, ...tail];
      clones.forEach((c) => { c.setAttribute("aria-hidden", "true"); c.inert = true; });
      track.prepend(...head);
      track.append(...tail);
      if (dotsBox) {
        dotsBox.innerHTML = "";
        dots = items.map((_, i) => {
          const li = document.createElement("li");
          const b = document.createElement("button");
          b.type = "button";
          b.dataset.index = i;
          b.setAttribute("aria-label", `${i + 1}Nth`);
          li.append(b);
          dotsBox.append(li);
          return b;
        });
      }
      if (ctrl) ctrl.hidden = false;
      place(false);
    };
    const tear = () => {
      on = false;
      clearTimeout(timer);
      clones.forEach((c) => c.remove());
      clones = [];
      dots = [];
      if (dotsBox) dotsBox.innerHTML = "";
      if (ctrl) ctrl.hidden = true;
      track.style.transform = "";
      track.style.transition = "";
    };
    const fit = () => {
      const want = !below || window.innerWidth <= below;
      if (want && !on) build();
      else if (!want && on) tear();
      else if (on) place(false);
    };

    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);
    dotsBox?.addEventListener("click", onDot);
    // Finger swipes aren’t blocked. Swiping vertically scrolls the page as usual
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    const ro = new ResizeObserver(() => fit());
    ro.observe(el);
    fit();
    return () => {
      ro.disconnect();
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      dotsBox?.removeEventListener("click", onDot);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      tear();
    };
  });
})();
