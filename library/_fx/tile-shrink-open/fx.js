(() => {
  // Vertical tiles covering the screen shrink toward their center and vanish in sequence. Once seen in a tab (once: session), it jumps straight to the end state without the cover
  kfFx.register("tile-shrink-open", (el, { options, reduce }) => {
    let tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    const made = !tiles.length;
    if (made) {
      const n = Math.max(1, Math.round(+options.count || 4));
      for (let i = 0; i < n; i++) el.insertAdjacentHTML("beforeend", '<i data-fx-part="tile"></i>');
      tiles = [...el.querySelectorAll('[data-fx-part="tile"]')];
    }
    el.style.setProperty("--fx-count", tiles.length);
    const key = options.once === "session" ? `fx-tile-shrink-open:${location.pathname}` : "";
    const done = () => {
      el.setAttribute("data-done", "");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      if (key) try { sessionStorage.setItem(key, "1"); } catch {}
    };
    let seen = false;
    if (key) try { seen = !!sessionStorage.getItem(key); } catch {}
    if (reduce || seen) {
      gsap.set(tiles, { scale: 0 });
      done();
      return () => { gsap.set(tiles, { clearProps: "transform" }); el.removeAttribute("data-done"); if (made) tiles.forEach((t) => t.remove()); el.style.removeProperty("--fx-count"); };
    }
    const tl = gsap.to(tiles, {
      scale: 0,
      delay: +(options.delay ?? 1.05),
      duration: +(options.dur ?? 0.5),
      stagger: { each: +(options.each ?? 0.2) },
      ease: kfFx.ease(options.ease || "power1.out", "power1.out"),
      onComplete: done,
    });
    return () => {
      tl.kill();
      gsap.set(tiles, { clearProps: "transform" });
      el.removeAttribute("data-done");
      if (made) tiles.forEach((t) => t.remove());
      el.style.removeProperty("--fx-count");
    };
  });
})();
