(() => {
  // Swaps the slide group every interval — adds is-finished to the current slide so the photo folds away, then after finish seconds makes the next slide is-active (CSS flies it in).
  // If drive: external, advancing is left to the consumer (Splide etc.), and pressing the circle (cursor) only fires fx:next / fx:prev.
  kfFx.register("swing-mask-slides", (el, { options, reduce, hover }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    const external = options.drive === "external";
    const interval = +(options.interval ?? 4) * 1000;
    const finish = +(options.finish ?? 1.4) * 1000;
    const lerp = +(options.lerp ?? 0.15);
    let cur = 0, busy = false, timer = 0, inView = true, finTimer = 0;
    const show = (i) => {
      slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
      el.dispatchEvent(new CustomEvent("fx:slide", { detail: { index: i } }));
    };
    const go = (dir) => {
      if (busy || slides.length < 2) return;
      const next = (cur + dir + slides.length) % slides.length;
      if (reduce) { cur = next; show(cur); return; }
      busy = true;
      slides[cur].classList.add("is-finished");
      el.dispatchEvent(new CustomEvent("fx:leave", { detail: { index: cur } }));
      finTimer = setTimeout(() => { slides[cur].classList.remove("is-finished"); cur = next; show(cur); busy = false; }, finish);
    };
    const loop = () => { clearTimeout(timer); timer = setTimeout(() => { if (inView) go(1); loop(); }, interval); };
    let io = null;
    if (!external && slides.length) {
      show(0);
      io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; });
      io.observe(el);
      if (!reduce) loop();
    }

    // Next/previous circle — approaches the cursor position inside the panel by a lerp amount each frame, and shows Next if right of the panel center, Prev if left
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const label = el.querySelector('[data-fx-part="cursor-text"]');
    let raf = 0, tx = 0, ty = 0, x = el.clientWidth / 2, y = el.clientHeight / 2, last = 0;
    const onMove = (e) => { const r = el.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; cursor.style.opacity = "1"; };
    const onLeave = () => { cursor.style.opacity = "0"; };
    const tick = (now) => {
      const dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - lerp, dt / 16.7);
      x += (tx - x) * k; y += (ty - y) * k;
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      if (label) label.textContent = x > el.clientWidth / 2 ? options.next || "Next" : options.prev || "Prev";
      raf = requestAnimationFrame(tick);
    };
    const onClick = () => {
      const dir = x > el.clientWidth / 2 ? 1 : -1;
      if (external) el.dispatchEvent(new CustomEvent(dir > 0 ? "fx:next" : "fx:prev"));
      else { go(dir); loop(); }
    };
    if (cursor && hover) {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cursor.addEventListener("click", onClick);
      raf = requestAnimationFrame(tick);
    }
    return () => {
      clearTimeout(timer); clearTimeout(finTimer); cancelAnimationFrame(raf); io?.disconnect();
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cursor?.removeEventListener("click", onClick);
      if (!external) slides.forEach((s) => s.classList.remove("is-active", "is-finished"));
    };
  });
})();
