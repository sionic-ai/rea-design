(() => {
  // Next to the big logo on a background-color panel, a number counts 1→100 (2s power3.inOut), when done, the panel gets is-fx-done, and CSS makes the panel transparent over 2.5s after 1.5s —
  // Meanwhile the logo rests 1.5s, then over 2.5s power4.out changes to the text color over the photo (--fx-melt), melting into the hero. After staying 2s it blurs out over 1s while sliding 100px upward,
  // On finish it releases the document lock and fires fx:done. The number rises out .5s after the panel starts peeling, over .5s (css).
  kfFx.register("melt-count-loader", (el, { options, reduce }) => {
    const logo = el.querySelector('[data-fx-part="logo"]');
    const num = el.querySelector('[data-fx-part="count"]');
    if (!logo || !window.gsap) return;
    const root = document.documentElement;
    const T = {
      count: +(options.count ?? 2), wait: +(options.wait ?? 1.5), tint: +(options.tint ?? 2.5),
      stay: +(options.stay ?? 2), out: +(options.out ?? 1), rise: +(options.rise ?? 100),
    };
    const lock = options.lock !== "false";
    const melt = getComputedStyle(el).getPropertyValue("--fx-melt").trim() || getComputedStyle(root).getPropertyValue("--kf-contrast-ink").trim();
    const fire = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const unlock = () => { if (lock) { root.style.removeProperty("overflow"); document.body.style.removeProperty("overflow"); } };
    if (reduce) {
      el.classList.add("is-fx-done");
      if (num) num.textContent = "100";
      gsap.set(logo, { opacity: 0 });
      fire();
      return () => { el.classList.remove("is-fx-done"); gsap.set(logo, { clearProps: "all" }); };
    }
    if (lock) { root.style.overflow = "hidden"; document.body.style.overflow = "hidden"; }
    const t = { v: 1 };
    let tl = null;
    const run = () => {
      tl = gsap.timeline()
        .to(t, { v: 100, duration: T.count, ease: "power3.inOut", onUpdate: () => { if (num) num.textContent = Math.round(t.v); }, onComplete: () => el.classList.add("is-fx-done") })
        .to(logo, { duration: T.tint, color: melt, ease: "power4.out" }, `+=${T.wait}`)
        .to(logo, { duration: T.out, opacity: 0, ease: "power2.out" }, `+=${T.stay}`)
        .to(logo, { duration: T.out, y: -T.rise, ease: "power2.out", onComplete: () => { unlock(); fire(); } }, "<");
    };
    if (document.readyState === "complete") run(); else addEventListener("load", run, { once: true });
    return () => {
      removeEventListener("load", run);
      if (tl) tl.kill();
      unlock();
      el.classList.remove("is-fx-done");
      gsap.set(logo, { clearProps: "color,opacity,transform" });
    };
  });
})();
