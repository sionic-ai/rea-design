// When the current section’s shrink animation ends (animationend), the next section follows — thumbnails clone the photo and attach slots (fx-a0~a4) to five before and after, and CSS pushes them in the direction moved (fx-next·fx-prev)
(() => {
  kfFx.register("thumb-stack-autoplay", (el, { options, reduce }) => {
    const pages = [...el.querySelectorAll('[data-fx-part="page"]')];
    const n = pages.length;
    if (!n) return;
    const holder = el.querySelector('[data-fx-part="thumbs"]');
    const captions = [...el.querySelectorAll('[data-fx-part="caption"]')];
    const prev = el.querySelector('[data-fx-part="prev"]');
    const next = el.querySelector('[data-fx-part="next"]');
    if (options.dur) el.style.setProperty("--fx-dur", +options.dur + "s");
    if (options.zoom) el.style.setProperty("--fx-zoom", +options.zoom);
    let pos = 0;
    const NAMES = ["fx-a0", "fx-a1", "fx-a2", "fx-a3", "fx-a4"];
    const thumbs = holder ? pages.map((p) => {
      const t = document.createElement("div");
      t.className = "fx-thumb";
      t.setAttribute("aria-hidden", "true");
      t.append(p.firstElementChild ? p.firstElementChild.cloneNode(true) : document.createElement("i"));
      holder.append(t);
      return t;
    }) : [];
    const paint = (forward) => {
      pages.forEach((p, i) => p.classList.toggle("fx-on", i === pos));
      captions.forEach((c, i) => c.classList.toggle("fx-on", i === pos % Math.max(1, captions.length)));
      el.dataset.fxPosition = pos;
      if (!holder) return;
      thumbs.forEach((t) => t.classList.remove(...NAMES));
      [-1, 0, 1, 2, 3].map((o) => (((pos + o) % n) + n) % n).forEach((i, k) => thumbs[i].classList.add(NAMES[k]));
      holder.classList.remove("fx-prev", "fx-next");
      holder.classList.add(forward ? "fx-next" : "fx-prev");
    };
    const go = (step) => {
      pos = (((pos + step) % n) + n) % n;
      paint(step > 0);
      el.dispatchEvent(new CustomEvent("fx:page", { bubbles: true, detail: { page: pos } }));
    };
    const onPrev = () => go(-1);
    const onNext = () => go(1);
    const onEnd = (e) => { if (pages.includes(e.target) && e.target.classList.contains("fx-on")) go(1); };
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    if (!reduce) el.addEventListener("animationend", onEnd);
    // Starts running when it reaches the bottom of the screen, stops when it leaves, and on re-entry shrinks again from the current section
    const io = new IntersectionObserver(([e]) => el.classList.toggle("fx-live", e.isIntersecting));
    io.observe(el);
    paint(true);
    return () => {
      io.disconnect();
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      el.removeEventListener("animationend", onEnd);
      thumbs.forEach((t) => t.remove());
      holder?.classList.remove("fx-prev", "fx-next");
      pages.forEach((p) => p.classList.remove("fx-on"));
      captions.forEach((c) => c.classList.remove("fx-on"));
      el.classList.remove("fx-live");
      delete el.dataset.fxPosition;
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-zoom");
    };
  });
})();
