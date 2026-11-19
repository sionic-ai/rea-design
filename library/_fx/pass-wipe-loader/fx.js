// First-visit loader — the mark enters from off-screen right to the center in 1s easeOutCubic and stands there, until the set minimum time (4s) and document loading
// When both finish, it exits off the left of the screen in 1s easeInOutCubic, and .5s later the curtain lifts as inset(0 100% 0 0) in 1.2s easeInOutQuart.
// fx:open fires when the curtain starts lifting, fx:done when fully lifted. Only the first time in the same tab (sessionStorage).
(() => {
  kfFx.register("pass-wipe-loader", (el, { options, reduce }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    const key = options.key || "fx-pass-wipe-loader";
    let seen = false;
    try { seen = options.once !== "always" && !!sessionStorage.getItem(key); } catch (e) { seen = false; }
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const finish = () => { el.classList.add("is-fx-done"); fire("fx:done"); };
    if (reduce || seen) { const t = setTimeout(() => { fire("fx:open"); finish(); }, 0); return () => { clearTimeout(t); el.classList.remove("is-fx-done"); }; }
    const inDur = +(options.in ?? 1), outDur = +(options.out ?? 1), wipe = +(options.wipe ?? 1.2), gap = +(options.gap ?? 0.5), min = +(options.min ?? 4);
    const tl = gsap.timeline({ paused: true });
    if (mark) tl.fromTo(mark, { xPercent: 0, x: () => mark.offsetWidth + innerWidth / 2 }, { x: 0, duration: inDur, ease: kfFx.ease("0.215,0.61,0.355,1", "power3.out") });
    tl.addPause(">", () => { waiting = true; go(); });
    if (mark) tl.to(mark, { x: () => -(mark.offsetWidth + innerWidth / 2), duration: outDur, ease: kfFx.ease("0.645,0.045,0.355,1", "power2.inOut") });
    tl.call(() => fire("fx:open"), null, mark ? `<${gap}` : 0);
    tl.fromTo(el, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 100% 0% 0%)", duration: wipe, ease: kfFx.ease("0.77,0,0.175,1", "power3.inOut") }, "<");
    tl.call(() => { try { sessionStorage.setItem(key, "1"); } catch (e) { /* If saving fails, it just shows again next time */ } finish(); });
    let waiting = false, timeUp = false, loaded = document.readyState === "complete";
    const go = () => { if (waiting && timeUp && loaded) { waiting = false; tl.play(); } };
    const onLoad = () => { loaded = true; go(); };
    if (!loaded) addEventListener("load", onLoad, { once: true });
    const t = setTimeout(() => { timeUp = true; go(); }, min * 1000);
    tl.play();
    return () => { tl.kill(); clearTimeout(t); removeEventListener("load", onLoad); el.classList.remove("is-fx-done"); gsap.set([el, mark].filter(Boolean), { clearProps: "clipPath,transform" }); };
  });
})();
