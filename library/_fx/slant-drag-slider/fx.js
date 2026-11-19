(() => {
  // Drag-to-turn diagonal photo panels — slides are stacked, and dragging left covers with the next slide from the right with a diagonal clip-path following the hand (upper right leads by 20%),
  // Dragging right, the previous section covers from the left. The inner photo (img) follows from ±60px to 0. On release it finishes the remaining path in dur (.75s) sine.inOut,
  // Release within 10px of movement and it advances toward the pressed side (right half of the panel : next). The tip follows the cursor height inside the panel by .2 per frame.
  // Two rows of ‹now · next› (the original’s large cell and side cell) in a multi-panel set share one data-key and are passed along together.
  kfFx.register("slant-drag-slider", (el, { options, reduce, hover }) => {
    const rows = {};
    el.querySelectorAll('[data-fx-part="slide"]').forEach((s) => { const k = s.dataset.key || "a"; (rows[k] ||= []).push(s); });
    const groups = Object.values(rows);
    const n = groups[0]?.length || 0;
    if (n < 2) return;
    const dur = +(options.dur ?? 0.75), shift = +(options.shift ?? 60), lag = +(options.lag ?? 0.2);
    const ease = kfFx.ease(options.ease || "sine.inOut", "sine.inOut");
    const tips = [...el.querySelectorAll('[data-fx-part="tip"]')];
    const counts = [...el.querySelectorAll('[data-fx-part="count"]')];
    let cur = 0, busy = false, down = false, x0 = 0, p = 0, ty = 0, my = 0, active = false;
    const pair = (i) => groups.map((g) => g[(i + n) % n]);
    const img = (i) => pair(i).map((s) => s.querySelector('[data-fx-part="img"]')).filter(Boolean);
    const HIDE_N = "polygon(120% 0%, 100% 0%, 100% 100%, 100% 100%)", HIDE_P = "polygon(0% 0%, -20% 0%, 0% 100%, 0% 100%)";
    const label = () => counts.forEach((c) => { const dir = c.dataset.key === "prev" ? -1 : 1; c.textContent = `${((cur + dir + n) % n) + 1} - ${n}`; });
    const reset = () => {
      groups.forEach((g) => g.forEach((s, i) => { s.style.zIndex = i === cur ? 1 : 0; }));
      pair(cur + 1).concat(pair(cur - 1)).forEach((s) => (s.style.zIndex = 2));
      gsap.set(pair(cur + 1), { clipPath: HIDE_N });
      gsap.set(pair(cur - 1), { clipPath: HIDE_P });
      gsap.set(pair(cur), { clipPath: "none" });
      p = 0; busy = false; label();
    };
    const go = (dir) => {
      if (busy) return;
      busy = true;
      const to = cur + dir;
      gsap.set(img(to), { x: dir > 0 ? shift + shift * p : shift * p - shift });
      gsap.to(img(cur), { duration: dur, ease, x: -dir * shift });
      gsap.to(img(to), { duration: dur, ease, x: 0 });
      gsap.to(pair(to), { duration: dur, ease, clipPath: dir > 0 ? "polygon(-10% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 120% 0%, 100% 100%, 0% 100%)", onComplete: () => { cur = (to + n) % n; reset(); el.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: cur } })); } });
    };
    const xOf = (e) => e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const start = (e) => { if (busy || down) return; down = true; x0 = xOf(e); el.classList.add("is-dragging"); };
    const move = (e) => {
      if (e.clientY != null) my = e.clientY;
      if (!down || busy) return;
      p = (xOf(e) - x0) / innerWidth;
      if (p > 0) gsap.set(pair(cur - 1), { clipPath: `polygon(0% 0%, ${120 * p - 20}% 0%, ${100 * p}% 100%, 0% 100%)` });
      else gsap.set(pair(cur + 1), { clipPath: `polygon(${120 + 120 * p}% 0%, 100% 0%, 100% 100%, ${100 + 100 * p}% 100%)` });
      gsap.set(img(cur - 1), { x: shift * p - shift });
      gsap.set(img(cur + 1), { x: shift + shift * p });
    };
    const end = (e) => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      const x = xOf(e), dx = x - x0, r = el.getBoundingClientRect();
      if (dx < -10) go(1); else if (dx > 10) go(-1); else go(x > r.left + r.width / 2 ? 1 : -1);
    };
    const enter = () => (active = true);
    const leave = (e) => { active = false; if (down) end(e); };
    const tick = () => {
      if (!active || !tips.length) return;
      ty += (my - el.getBoundingClientRect().top - ty) * lag;
      gsap.set(tips, { y: ty });
    };
    reset();
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    if (hover && !reduce) gsap.ticker.add(tick);
    return () => {
      el.removeEventListener("pointerdown", start); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", end);
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave);
      gsap.ticker.remove(tick);
      groups.flat().forEach((s) => (s.style.zIndex = ""));
      gsap.set(groups.flat(), { clearProps: "clipPath" });
      gsap.set(groups.flat().map((s) => s.querySelector('[data-fx-part="img"]')).filter(Boolean), { clearProps: "transform" });
      if (tips.length) gsap.set(tips, { clearProps: "transform" });
    };
  });
})();
