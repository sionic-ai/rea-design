// CSS 3D photo cylinder: N photos each split into five pieces, bent slightly and joined into a curved band set up around a circle, rotating continuously at speed° per second.
// The cylinder’s tilt (rotateX·rotateY) sits on the tilt option panel, while the element’s own transform is left to the caller (e.g. tilt changes on scroll).
(() => {
  kfFx.register("css3d-ring-spin", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll(':scope > [data-fx-part="photo"]')];
    if (!photos.length) return;
    const segs = Math.max(2, +(options.segs || 5));
    const speed = +(options.speed ?? 12);
    const tilt = document.createElement("div");
    tilt.className = "fx-ring__tilt";
    tilt.style.transform = `rotateX(${+(options["tilt-x"] ?? -110)}deg) rotateY(${+(options["tilt-y"] ?? -15)}deg)`;
    const spin = document.createElement("div");
    spin.className = "fx-ring__spin";
    el.style.setProperty("--fx-n", photos.length);
    el.style.setProperty("--fx-segs", segs);
    photos.forEach((p, i) => {
      const bg = getComputedStyle(p).backgroundImage;
      const item = document.createElement("div");
      item.className = "fx-ring__item";
      item.style.setProperty("--i", i);
      let html = "";
      for (let k = 0; k < segs; k++) html += `<div class="fx-ring__seg" style="--k:${k}"></div>`.replace("</div>", "");
      html += "</div>".repeat(segs);
      item.innerHTML = `<div class="fx-ring__img">${html}</div>`;
      if (bg && bg !== "none") item.querySelectorAll(".fx-ring__seg").forEach((s) => (s.style.backgroundImage = bg));
      if (p.dataset.label) item.firstElementChild.setAttribute("aria-label", p.dataset.label);
      spin.append(item);
      p.hidden = true;
    });
    tilt.append(spin);
    el.append(tilt);

    let deg = 0, last = 0, raf = 0, on = !reduce, seen = true;
    const tick = (now) => {
      const dt = last ? Math.max(1, now - last) : 16;
      last = now;
      if (on && seen) { deg = (deg + (dt / 1000) * speed) % 360; spin.style.rotate = `${deg}deg`; }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    if (!reduce) raf = requestAnimationFrame(tick);
    // Pause button — pauses when the host sends fx:pause and runs again on fx:play
    const pause = () => (on = false), play = () => { if (!reduce) on = true; };
    el.addEventListener("fx:pause", pause);
    el.addEventListener("fx:play", play);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener("fx:pause", pause); el.removeEventListener("fx:play", play);
      tilt.remove(); photos.forEach((p) => (p.hidden = false));
    };
  });
})();
