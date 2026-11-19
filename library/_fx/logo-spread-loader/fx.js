(() => {
  // Logo piece loader — over a dark film (video), logo pieces light up one by one in a centered frame (after a 1.5s wait, 1s apart), and when the center piece goes out
  // The frame opens out to the screen edges and only the corner pieces go to the screen corners, turning the accent color. After 1.9s it clears over .7s and emits fx:done. Pressing skips the remaining steps
  kfFx.register("logo-spread-loader", (el, { options, reduce }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length) return;
    const first = +(options.first ?? 1.5) * 1000, each = +(options.each ?? 1) * 1000, hold = +(options.hold ?? 1.9) * 1000, out = +(options.out ?? 0.7);
    const done = () => { el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); el.remove(); };
    if (reduce) { done(); return; }
    let stop = false, skip = false, timer = 0, wake = null;
    const wait = (ms) => new Promise((r) => { wake = r; timer = setTimeout(r, ms); });
    const tap = () => { skip = true; clearTimeout(timer); wake?.(); };
    el.addEventListener("click", tap);
    const on = (i) => pieces[i]?.classList.add("is-on");
    const spread = () => el.classList.add("is-spread");
    const fade = () => gsap.to(el, { opacity: 0, duration: out, ease: "power1.inOut", onComplete: () => !stop && done() });
    const rest = async () => {
      pieces.forEach((p, i) => on(i));
      el.classList.add("is-thin");
      await new Promise((r) => setTimeout(r, each));
      spread();
      await new Promise((r) => setTimeout(r, hold));
      fade();
    };
    (async () => {
      await wait(first);
      if (stop) return;
      if (skip) return rest();
      for (let i = 0; i < pieces.length; i++) {
        on(i);
        await wait(each);
        if (stop) return;
        if (skip) return rest();
      }
      el.classList.add("is-thin");
      await wait(each);
      if (stop) return;
      if (skip) return rest();
      spread();
      await wait(hold);
      if (!stop) fade();
    })();
    return () => { stop = true; clearTimeout(timer); el.removeEventListener("click", tap); gsap.killTweensOf(el); };
  });
})();
