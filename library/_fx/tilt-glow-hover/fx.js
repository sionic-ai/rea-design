// On hover the button tilts toward the mouse and lifts 15px, and the inner light blob follows the mouse position.
// Tilt follows only 2% of the remaining distance each frame so it feels heavy, and on release returns to place over 3 seconds
(() => {
  kfFx.register("tilt-glow-hover", (el, { options, hover }) => {
    if (!hover) return;
    const px = +(options.x ?? 0.05), py = +(options.y ?? 0.05), pz = +(options.z ?? 1.5), rx = +(options.rx ?? 5), ry = +(options.ry ?? 10);
    const speed = +(options.speed ?? 0.02), back = +(options.back ?? 3), lift = +(options.lift ?? 10), glowScale = +(options.glow ?? 3);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    // track: target — measured by coordinates relative to the element under the mouse (offsetX) like the original. The light receives the pointer, so its own top-left becomes the reference and it skews to the top left
    const byTarget = options.track === "target";
    const glow = el.querySelector('[data-fx-part="glow"]');
    const pos = { x: 0, y: 0, z: 0, rx: 0, ry: 0 }, aim = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
    let raf = 0, live = false, tw = null, w = 1, h = 1;
    const paint = () => { el.style.transform = `perspective(1000px) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(${-pos.rx}deg) rotateY(${-pos.ry}deg)`; };
    const tick = () => {
      if (!live) return;
      raf = requestAnimationFrame(tick);
      pos.x += (aim.x * px - pos.x) * speed;
      pos.y += (aim.y * py - pos.y) * speed;
      pos.z += (aim.z * pz - pos.z) * speed;
      pos.rx += (aim.rx - pos.rx) * speed;
      pos.ry += (aim.ry - pos.ry) * speed;
      paint();
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      w = (byTarget ? el.offsetWidth : r.width) / 2; h = (byTarget ? el.offsetHeight : r.height) / 2;
      const ox = byTarget ? e.offsetX - w : e.clientX - r.left - w, oy = byTarget ? e.offsetY - h : e.clientY - r.top - h;
      aim.x = ox; aim.y = oy; aim.rx = (oy / h) * rx; aim.ry = -(ox / w) * ry;
      if (glow) glow.style.transform = `translate3d(calc(-50% + ${ox}px), calc(-50% + ${oy}px), 0) scale(${glowScale})`;
    };
    const enter = (e) => {
      tw?.kill();
      aim.z = lift;
      move(e);
      el.classList.add("fx-tgh-on");
      if (!live) { live = true; raf = requestAnimationFrame(tick); }
    };
    const leave = () => {
      live = false;
      cancelAnimationFrame(raf);
      Object.assign(aim, { x: 0, y: 0, z: 0, rx: 0, ry: 0 });
      el.classList.remove("fx-tgh-on");
      tw = gsap.to(pos, { x: 0, y: 0, z: 0, rx: 0, ry: 0, duration: back, ease, onUpdate: paint });
    };
    if (byTarget) el.classList.add("fx-tgh-target");
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      tw?.kill();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("fx-tgh-on", "fx-tgh-target");
      el.style.transform = "";
      if (glow) glow.style.transform = "";
    };
  });
})();
