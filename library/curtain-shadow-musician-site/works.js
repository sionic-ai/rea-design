/* Activity list photo strip: snaps to the photo’s left edge, and dragging over 50px goes next·previous. After release it auto-advances every 5.6 seconds (same as the original). */
(() => {
  window.ikPages = window.ikPages || {};
  window.ikPages.works = (root) => {
  const offs = [];
  root.querySelectorAll(".works-list__item").forEach((item) => {
    const track = item.querySelector(".works-list__track");
    const imgs = [...track.children];
    if (imgs.length <= 1) return;
    let cur = 0, base = 0, pos = [], timer = null;
    let pid = null, sx = 0, dx = 0, dragging = false, moved = false;
    const measure = () => { pos = imgs.map((el) => el.offsetLeft); };
    const goTo = (i) => {
      if (i < 0) i = imgs.length - 1;
      if (i >= imgs.length) i = 0;
      cur = i;
      base = -(pos[i] || 0);
      track.style.transform = `translateX(${base}px)`;
    };
    const clearAuto = () => { clearTimeout(timer); timer = null; };
    const startAuto = () => { clearAuto(); timer = setTimeout(() => { goTo(cur + 1); startAuto(); }, 5600); };
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    item.querySelector(".is-next").addEventListener("click", () => goTo(cur + 1));
    item.querySelector(".is-prev").addEventListener("click", () => goTo(cur - 1));
    if (fine) track.style.cursor = "grab";
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      clearAuto();
      pid = e.pointerId; sx = e.clientX; dx = 0; dragging = true; moved = false;
      track.setPointerCapture?.(pid);
      track.classList.add("is-dragging");
      if (fine) track.style.cursor = "grabbing";
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - sx;
      if (Math.abs(dx) > 3) moved = true;
      track.style.transform = `translateX(${base + dx}px)`;
    });
    const end = (cancel) => {
      if (!dragging) return;
      track.classList.remove("is-dragging");
      if (cancel) { goTo(cur); startAuto(); }
      else if (dx > 50) goTo(cur - 1);
      else if (dx < -50) goTo(cur + 1);
      else { goTo(cur); startAuto(); }
      pid = null; dx = 0; dragging = false;
      if (fine) track.style.cursor = "grab";
    };
    track.addEventListener("pointerup", () => end(false));
    track.addEventListener("pointercancel", () => end(true));
    track.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    const onResize = () => { measure(); goTo(cur); };
    addEventListener("resize", onResize);
    offs.push(() => { removeEventListener("resize", onResize); clearAuto(); });
    measure();
    goTo(0);
  });
  window.ikStalker(".js-stalker-area", "Swipe");
  return () => offs.forEach((f) => f());
  };
})();
