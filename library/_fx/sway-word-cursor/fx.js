(() => {
  // Inside the area, the three-line guide text (Drag / to / Discover) follows the cursor late at .1, and when moving sideways
  // The top row tilts ∓10°, center ±20px, bottom row ±10° (.08), then stands straight as soon as it stops for 150ms. Turns off in .3s when the cursor leaves the area
  kfFx.register("sway-word-cursor", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    const words = [...el.querySelectorAll('[data-fx-part="word"]')];
    if (!label || reduce || !hover) return;
    const lerp = +(options.lerp ?? 0.1), sway = +(options.sway ?? 0.08), tilt = +(options.tilt ?? 10), shift = +(options.shift ?? 20), idle = +(options.idle ?? 150);
    const cur = { x: 0, y: 0, a: 0, b: 0, c: 0 }, tgt = { x: 0, y: 0, a: 0, b: 0, c: 0 };
    let raf = null, wait = null, prev = null;
    const step = () => {
      cur.x += (tgt.x - cur.x) * lerp; cur.y += (tgt.y - cur.y) * lerp;
      ["a", "b", "c"].forEach((k) => (cur[k] += (tgt[k] - cur[k]) * sway));
      label.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      if (words[0]) words[0].style.transform = `rotate(${cur.a}deg)`;
      if (words[1]) words[1].style.transform = `translateX(${cur.b}px)`;
      if (words[2]) words[2].style.transform = `rotate(${cur.c}deg)`;
      raf = ["x", "y", "a", "b", "c"].some((k) => Math.abs(tgt[k] - cur[k]) > 0.1) ? requestAnimationFrame(step) : null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tgt.x = e.clientX - r.left - label.offsetWidth / 2;
      tgt.y = e.clientY - r.top - label.offsetHeight / 2;
      if (prev !== null && e.clientX !== prev) [tgt.a, tgt.b, tgt.c] = e.clientX > prev ? [-tilt, shift, tilt] : [tilt, -shift, -tilt];
      prev = e.clientX;
      clearTimeout(wait);
      wait = setTimeout(() => { tgt.a = tgt.b = tgt.c = 0; kick(); }, idle);
      el.classList.add("fx-sway-on");
      kick();
    };
    const leave = () => { el.classList.remove("fx-sway-on"); prev = null; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(wait);
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      el.classList.remove("fx-sway-on");
      [label, ...words].forEach((w) => (w.style.transform = ""));
    };
  });
})();
