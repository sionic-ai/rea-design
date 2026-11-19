(() => {
  // Cube button — a front face and a back face rotated 180° on the x axis and attached. On hover it rolls 180° so the back face stands, then tilts toward the cursor and floats up, pulled slightly closer.
  // On release it rolls back along the same curve and the tilt returns slowly to place with elastic. Depth is half the button height (re-measured with ResizeObserver)
  kfFx.register("magnet-cube-hover", (el, { options, reduce, hover }) => {
    const front = el.querySelector('[data-fx-part="front"]'), back = el.querySelector('[data-fx-part="back"]');
    if (!front || !back) return;
    const box = front.parentElement === back.parentElement ? front.parentElement : null;
    if (!box || box === el) return;
    const dur = +(options.dur ?? 0.6), tilt = +(options.tilt ?? 20), pull = +(options.pull ?? 0.05), lift = +(options.lift ?? 15);
    const follow = +(options.follow || 0.04), back3 = +(options.return ?? 3);
    const ease = kfFx.ease(options.ease || "0.26,0.37,0.08,1", "power3.out");
    const turn = { rx: 0 }, pos = { x: 0, y: 0, z: 0, rx: 0, ry: 0 }, aim = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
    let half = 0, run = false, ret = null, raf = 0;
    const draw = () => {
      box.style.transform = `translate3d(${pos.x * 0.2}px, ${pos.y * 0.2}px, ${pos.z * 0.2}px) rotateX(${-pos.rx * 0.2}deg) rotateY(${-pos.ry * 0.2}deg) translateZ(${-half}px) rotateX(${turn.rx - pos.rx}deg) rotateY(${pos.ry}deg)`;
    };
    const place = () => {
      half = el.offsetHeight / 2;
      front.style.transform = `translateZ(${half}px)`;
      back.style.transform = `rotateX(180deg) translateZ(${half}px)`;
      draw();
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    if (reduce || !hover) return () => { ro.disconnect(); box.style.transform = front.style.transform = back.style.transform = ""; };
    const loop = () => {
      if (!run) return;
      pos.rx += (aim.rx - pos.rx) * follow;
      pos.ry += (aim.ry - pos.ry) * follow;
      pos.x += (aim.x * pull - pos.x) * follow;
      pos.y += (aim.y * pull - pos.y) * follow;
      pos.z += (aim.z - pos.z) * follow;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect(), hw = r.width / 2 || 1, hh = r.height / 2 || 1;
      aim.x = e.clientX - r.left - hw;
      aim.y = e.clientY - r.top - hh;
      aim.ry = -(aim.x / hw) * tilt;
      aim.rx = (aim.y / hh) * tilt;
    };
    const enter = (e) => {
      gsap.to(turn, { rx: 180, duration: dur, ease, overwrite: true, onUpdate: draw });
      ret?.kill();
      aim.z = lift;
      move(e);
      if (!run) { run = true; raf = requestAnimationFrame(loop); }
    };
    const leave = () => {
      gsap.to(turn, { rx: 0, duration: dur, ease, overwrite: true, onUpdate: draw });
      run = false;
      cancelAnimationFrame(raf);
      Object.assign(aim, { x: 0, y: 0, z: 0, rx: 0, ry: 0 });
      ret = gsap.to(pos, { x: 0, y: 0, z: 0, rx: 0, ry: 0, duration: back3, ease: "elastic.out", onUpdate: draw });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      run = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      ret?.kill();
      gsap.killTweensOf(turn);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      box.style.transform = front.style.transform = back.style.transform = "";
    };
  });
})();
