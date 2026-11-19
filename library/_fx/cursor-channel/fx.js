(() => {
  // Channel dialed by the cursor — each time the cursor crosses a cell (width divided by channel count), it switches straight to that cell’s channel (no curve).
  // On narrow screens (width mobile and below) advances to the next channel every every seconds, and swiping left/right or tapping the left/right half moves on (with Hammer present, pan threshold 10 like the original)
  kfFx.register("cursor-channel", (el, { options, reduce }) => {
    const kids = [...el.querySelectorAll('[data-fx-part="channel"]')];
    const count = kids.length || Math.max(0, Math.trunc(+options.count || 0));
    if (!count) return;
    const every = +(options.every ?? 4), narrow = +(options.mobile ?? 750);
    const whole = options.area !== "self";
    let cur = -1, live = options.wait !== "true", timer = 0, hammer = null;

    const set = (i) => {
      i = ((i % count) + count) % count;
      if (i === cur) return;
      cur = i;
      el.dataset.channel = String(i);
      kids.forEach((k, j) => k.classList.toggle("is-on", j === i));
      el.dispatchEvent(new CustomEvent("fx:channel", { detail: { index: i, count } }));
    };
    set(Math.trunc(+(options.start ?? 0)));

    const mobile = () => innerWidth <= narrow;
    const move = (e) => {
      if (!live || mobile() || e.pointerType === "touch") return;
      const r = whole ? { left: 0, width: innerWidth } : el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.left + r.width) return;
      set(Math.min(count - 1, Math.trunc((e.clientX - r.left) / (r.width / count))));
    };
    const step = (back) => set(cur + (back ? -1 : 1));
    const auto = () => {
      clearInterval(timer);
      timer = 0;
      if (live && mobile() && every > 0 && !reduce) timer = setInterval(() => step(false), every * 1000);
    };
    // Finger — original Hammer: swipe left or tap the left half to call changeChannel(true), tapping the right side calls changeChannel()
    let down = null;
    const pdown = (e) => { if (e.pointerType !== "mouse") down = { x: e.clientX, y: e.clientY }; };
    const pup = (e) => {
      if (!down || !live || !mobile()) return (down = null);
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down = null;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) step(dx < 0);
      else if (Math.abs(dx) <= 10 && Math.abs(dy) <= 10) step(e.clientX < innerWidth / 2);
      auto();
    };
    if (window.Hammer) {
      hammer = new Hammer(whole ? document.body : el, { touchAction: "pan-y" });
      hammer.get("pan").set({ threshold: 10 });
      hammer.on("pan tap", (e) => {
        if (!live || !mobile() || (e.type === "pan" && !e.isFinal)) return;
        if (e.direction === Hammer.DIRECTION_LEFT || (e.type === "tap" && e.center.x < innerWidth / 2)) step(true);
        else if (e.direction === Hammer.DIRECTION_RIGHT || (e.type === "tap" && e.center.x >= innerWidth / 2)) step(false);
      });
    } else {
      addEventListener("pointerdown", pdown);
      addEventListener("pointerup", pup);
    }
    // wait: true — starts running when the caller sends fx:channel-on (after passing the entrance door)
    const on = () => { live = true; auto(); };
    el.addEventListener("fx:channel-on", on);
    addEventListener("pointermove", move);
    addEventListener("resize", auto);
    auto();

    return () => {
      clearInterval(timer);
      hammer?.destroy();
      el.removeEventListener("fx:channel-on", on);
      removeEventListener("pointermove", move);
      removeEventListener("resize", auto);
      removeEventListener("pointerdown", pdown);
      removeEventListener("pointerup", pup);
      kids.forEach((k) => k.classList.remove("is-on"));
      delete el.dataset.channel;
    };
  });
})();
