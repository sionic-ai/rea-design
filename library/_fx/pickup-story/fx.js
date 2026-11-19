// Tapping the ”Call me” bubble starts a pick-up story that continues scene by scene — the original chained nine jQuery animate calls with promises.
// Moves from the earlier step to the next on the side that finished first, and places it at the same position (seconds) up to the tempo where the two branches overlap. swing = sine.inOut
(() => {
  kfFx.register("pickup-story", (el, { options, reduce }) => {
    const q = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const trigger = q("trigger"), car = q("car"), carEnd = q("car-end"), title = q("title"), crowd = q("crowd"), replay = q("replay");
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    if (!trigger || !car || scenes.length < 3) return;
    const speed = +(options.speed ?? 1) || 1;
    const on = (t) => t.filter(Boolean);
    const sw = "sine.inOut";

    const rest = () => {
      gsap.set(car, { opacity: 0, left: "100%", scaleX: 1 });
      if (carEnd) gsap.set(carEnd, { opacity: 0, left: "50%" });
      gsap.set(scenes[0], { xPercent: 0, opacity: 1 });
      gsap.set(scenes.slice(1), { xPercent: -100, opacity: 0 });
      if (replay) gsap.set(replay, { opacity: 0, pointerEvents: "none" });
    };
    rest();
    if (title) gsap.set(title, { opacity: 0 });

    let tl = null, back = null;
    const play = () => {
      back?.kill();
      tl?.kill();
      trigger.style.display = "none";
      tl = gsap.timeline({ defaults: { ease: "none" } });
      if (title) tl.to(title, { opacity: 1, duration: 0.3 }, 0);
      tl.to(trigger, { opacity: 0, duration: 0.3 }, 0)
        .to(car, { opacity: 1, left: "50%", duration: 0.3 }, 1.3);
      if (crowd) tl.to(crowd, { opacity: 0, duration: 0.2 }, 2.4);
      tl.to(car, { left: "-100%", duration: 1 }, 3.4)
        .to(scenes[0], { xPercent: 100, opacity: 0, duration: 0.5, ease: sw }, 4.4)
        .to(scenes[1], { xPercent: 0, opacity: 1, duration: 0.5, ease: sw }, 4.6)
        .set(car, { scaleX: -1 }, 4.9)
        .to(car, { left: "50%", duration: 1 }, 4.9)
        .to(scenes[2], { xPercent: 0, opacity: 1, duration: 0.5, ease: sw }, 7.4)
        .to(scenes[1], { xPercent: 100, opacity: 0, duration: 0.3, ease: sw }, 7.9)
        .to(car, { opacity: 0, duration: 0.2 }, 8.9);
      if (carEnd) tl.to(carEnd, { opacity: 1, duration: 0.2 }, 8.9).to(carEnd, { left: "100%", duration: 2 }, 9.4);
      if (replay) tl.to(replay, { opacity: 1, duration: 0.3 }, 9.1).set(replay, { pointerEvents: "auto" }, 9.1);
      tl.timeScale(speed);
      if (reduce) tl.progress(1);
      el.dispatchEvent(new CustomEvent("fx:play", { bubbles: true }));
    };
    const reset = () => {
      tl?.kill();
      back?.kill();
      rest();
      gsap.set(scenes[0], { xPercent: 100, opacity: 0 });
      trigger.style.display = "";
      back = gsap.timeline({ defaults: { ease: "none" } })
        .to(scenes[0], { xPercent: 0, opacity: 1, duration: 0.3, ease: sw }, 0)
        .to(trigger, { opacity: 1, duration: 0.3 }, 0);
      if (title) back.to(title, { opacity: 0, duration: 0.3 }, 0);
      if (crowd) back.to(crowd, { opacity: 1, duration: 0.3 }, 1.3);
      back.timeScale(speed);
      if (reduce) back.progress(1);
      trigger.focus?.({ preventScroll: true });
    };
    trigger.addEventListener("click", play);
    replay?.addEventListener("click", reset);
    return () => {
      trigger.removeEventListener("click", play);
      replay?.removeEventListener("click", reset);
      tl?.kill();
      back?.kill();
      trigger.style.display = "";
      gsap.set(on([car, carEnd, title, crowd, replay, trigger, ...scenes]), { clearProps: "opacity,left,transform,pointerEvents" });
    };
  });
})();
