(() => {
  kfFx.register("fill-dot-slider", (el, { options, reduce }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    const track = el.querySelector('[data-fx-part="track"]');
    if (!mask || !track) return;
    const slides = [...track.querySelectorAll(':scope > [data-fx-part="slide"]')];
    const n = slides.length;
    if (n < 2) return;
    const hold = +(options.hold ?? 5), dur = reduce ? 0 : +(options.dur ?? 1);
    const barW = +(options.bar ?? 36), gap = +(options.gap ?? 30) + 8;
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const fade = kfFx.ease(options.fade || "power1.out", "power1.out");
    const auto = !reduce && options.auto !== "0";
    const swipe = +(options.swipe ?? 50);

    // Like the original, clone the whole board one set before and after to loop endlessly. On reaching the end, silently jump to the same spot in the middle set.
    const clone = (s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.inert = true; c.dataset.fxClone = ""; return c; };
    const before = slides.map(clone), after = slides.map(clone);
    track.prepend(...before);
    track.append(...after);

    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const dots = [];
    if (dotsBox) {
      dotsBox.replaceChildren();
      for (let i = 0; i < n; i++) {
        const li = document.createElement("li");
        li.innerHTML = '<button type="button" data-fx-part="dot"></button><span data-fx-part="bar"></span>';
        li.firstChild.setAttribute("aria-label", `${i + 1} / ${n}`);
        dotsBox.append(li);
        dots.push(li);
      }
    }

    let cur = 0, moving = false, timer = null, slideTw = null;
    const width = () => mask.offsetWidth;
    const place = (i) => gsap.set(track, { x: -(i + n) * width() });
    const mod = (i) => ((i % n) + n) % n;
    const bar = (i) => dots[i]?.querySelector('[data-fx-part="bar"]');

    const startBar = () => {
      timer?.kill();
      if (!auto) return;
      // The bar fills from 0 to the end with no curve over (dwell + transition) including the transition length — when full, next panel
      const b = bar(mod(cur));
      timer = gsap.fromTo(b || {}, { width: 0 }, { width: barW, duration: hold + dur, ease: "none", onComplete: () => go(1) });
    };

    const mark = () => dots.forEach((d, i) => { d.classList.toggle("is-on", i === mod(cur)); d.firstChild.setAttribute("aria-current", i === mod(cur) ? "true" : "false"); });

    function go(vec) {
      if (moving || !vec) return;
      const old = bar(mod(cur));
      cur += vec;
      if (cur > n) { cur -= n; place(cur - vec); }
      else if (cur < -n) { cur += n; place(cur - vec); }
      moving = true;
      slideTw = gsap.to(track, { x: -(cur + n) * width(), duration: dur, ease, onComplete: () => { moving = false; } });
      if (old) {
        timer?.kill();
        if (vec > 0) gsap.fromTo(old, { width: barW, left: 6 }, { left: gap + 4, width: 0, duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1, ease: fade, onComplete: () => gsap.set(old, { clearProps: "left,width" }) });
        else gsap.to(old, { left: 0, width: 0, duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1, ease: fade, onComplete: () => gsap.set(old, { clearProps: "left,width" }) });
      }
      mark();
      startBar();
    }

    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const onPrev = () => go(-1), onNext = () => go(1);
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    const onDot = (e) => {
      const li = e.target.closest("li");
      const i = dots.indexOf(li);
      if (i < 0 || i === mod(cur)) return;
      go(i - mod(cur));
    };
    dotsBox?.addEventListener("click", onDot);

    // Touch push from the original — vertical scroll is not blocked (touch-action: pan-y), and a horizontal swipe past 50px by default turns the page
    let sx = null;
    const down = (e) => { sx = e.clientX; };
    const up = (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > swipe) go(dx < 0 ? 1 : -1); };
    mask.addEventListener("pointerdown", down);
    mask.addEventListener("pointerup", up);
    mask.addEventListener("pointercancel", () => { sx = null; });

    const ro = new ResizeObserver(() => { if (!moving) place(cur); });
    ro.observe(mask);
    place(0);
    mark();
    startBar();

    return () => {
      timer?.kill(); slideTw?.kill(); ro.disconnect();
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      dotsBox?.removeEventListener("click", onDot);
      mask.removeEventListener("pointerdown", down);
      mask.removeEventListener("pointerup", up);
      [...before, ...after].forEach((c) => c.remove());
      dotsBox?.replaceChildren();
      gsap.set(track, { clearProps: "transform" });
    };
  });
})();
