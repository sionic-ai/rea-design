// Beneath the panel covering the Hero, a year counts up over a ruler (circ.inOut) while running from the left end to the right end (power2.inOut, same length), then the panel lifts — when fully lifted, fx:done
(() => {
  kfFx.register("year-ruler-loader", (el, { options, reduce }) => {
    const count = el.querySelector('[data-fx-part="count"]');
    const finish = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (!count) { finish(); return () => el.classList.remove("is-done"); }
    const text = count.textContent;
    const from = +(options.from ?? parseInt(text, 10)) || 0;
    const to = +(options.to ?? from);
    if (reduce) { count.textContent = String(to); finish(); return () => { count.textContent = text; el.classList.remove("is-done"); }; }
    const dur = +(options.dur ?? 2), fade = +(options.fade ?? 0.8);
    const n = { v: from };
    count.textContent = String(from);
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0), onComplete: finish });
    tl.to(n, { v: to, duration: dur, ease: kfFx.ease(options.ease || "circ.inOut", "circ.inOut"), onUpdate: () => { count.textContent = String(Math.round(n.v)); } })
      .to(count, { left: "100%", xPercent: -100, duration: dur, ease: kfFx.ease(options.slide || "power2.inOut", "power2.inOut") }, "<")
      .to(el, { opacity: 0, duration: fade, ease: "power1.in" });
    // Original counts after window load — so the cover lifts only after images and fonts have all arrived
    const start = () => tl.play();
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      tl.kill();
      gsap.set([el, count], { clearProps: "opacity,left,transform" });
      count.textContent = text;
      el.classList.remove("is-done");
    };
  });
})();
