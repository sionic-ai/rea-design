// First-visit loader per session — original (brand-brand #first_text): in a background-color curtain, the center mark turns on in 1s at load, turns off in 1s at 3.6s after the script runs, and
// At 4.2s the curtain lifts via jQuery fadeOut(1300, swing). If already seen this session (sessionStorage), it goes straight to fx:open without a curtain.
// fx:open fires when the lift starts and fx:done when it is fully lifted, so the hero text (vertical text line etc.) turns on after that.
(() => {
  kfFx.register("mark-fade-veil", (el, { options, reduce }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    const num = (k, d) => +(options[k] ?? d);
    const key = options.key || "fx-mark-fade-veil";
    let seen = false;
    try { seen = sessionStorage.getItem(key) === "1"; } catch (e) { seen = false; }
    if (options.mode === "first") seen = false;
    if (options.mode === "again") seen = true;
    const fire = (type, again) => el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: { again } }));
    const timers = [];
    let tween = null;
    const clean = () => {
      timers.forEach(clearTimeout);
      tween?.kill();
      removeEventListener("load", show);
      el.classList.remove("is-show", "is-done", "is-again");
      gsap.set(el, { clearProps: "opacity,visibility" });
    };
    function show() { el.classList.add("is-show"); }
    if (reduce || seen) {
      el.classList.add("is-done", "is-again");
      // Returning visitors must also receive fx:open for the hero to turn on — fire on the next frame to give listeners time to attach
      timers.push(setTimeout(() => { fire("fx:open", true); fire("fx:done", true); }, 0));
      return clean;
    }
    try { sessionStorage.setItem(key, "1"); } catch (e) { /* If storage is blocked, every visit counts as the first */ }
    el.style.setProperty("--fx-in", `${num("in", 1)}s`);
    if (document.readyState === "complete") requestAnimationFrame(show);
    else addEventListener("load", show, { once: true });
    if (!mark) el.classList.add("is-show");
    timers.push(setTimeout(() => el.classList.remove("is-show"), num("out", 3.6) * 1000));
    timers.push(setTimeout(() => {
      fire("fx:open", false);
      tween = gsap.to(el, { autoAlpha: 0, duration: num("fade", 1.3), ease: kfFx.ease(options.ease || "sine.inOut", "sine.inOut"), onComplete: () => { el.classList.add("is-done"); fire("fx:done", false); } });
    }, num("lift", 4.2) * 1000));
    return clean;
  });
})();
