(() => {
  // Center square — swaps the tile every cycle ms, and grows to window size while the track passes the screen (held on the first tile while growing)
  kfFx.register("square-grow-pin", (el, { options, reduce }) => {
    const square = el.querySelector('[data-fx-part="square"]');
    if (!square) return;
    const tiles = square.querySelectorAll('[data-fx-part="tile"]');
    const track = el.querySelector('[data-fx-part="track"]');
    const fades = el.querySelectorAll('[data-fx-part="fade"]');
    const every = +options.cycle || 2000, scrub = +(options.scrub ?? 1), lead = +(options.lead ?? 0.1);
    let timer = 0, count = 2, running = false;
    const set = (n) => square.setAttribute("data-step", String(n));
    const start = () => {
      if (running || tiles.length < 2 || reduce) return;
      running = true;
      set(count); count = count >= tiles.length ? 1 : count + 1;
      timer = setInterval(() => { set(count); count = count >= tiles.length ? 1 : count + 1; }, every);
    };
    const stop = () => { clearInterval(timer); timer = 0; set(1); count = 2; running = false; };
    set(1);
    const onCycle = () => start();
    el.addEventListener("fx:cycle", onCycle);
    if (options.auto !== "0") start();
    if (reduce || !track || !window.ScrollTrigger) return () => { stop(); el.removeEventListener("fx:cycle", onCycle); };
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track, start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true,
        onEnter: () => { stop(); el.dispatchEvent(new CustomEvent("fx:grow")); },
        onLeaveBack: () => { stop(); requestAnimationFrame(start); el.dispatchEvent(new CustomEvent("fx:shrink")); },
      },
    });
    tl.to(square, { width: () => document.documentElement.clientWidth, height: () => document.documentElement.clientHeight }, `+=${lead}`);
    if (fades.length) tl.to(fades, { opacity: 0 }, "<");
    return () => { stop(); el.removeEventListener("fx:cycle", onCycle); tl.scrollTrigger?.kill(); tl.kill(); gsap.set([square, ...fades], { clearProps: "width,height,opacity" }); };
  });
})();
