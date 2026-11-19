(() => {
  kfFx.register("stripe-split-wipe", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const count = Math.max(1, +(options.count ?? 5) || 5);
    const each = +(options.each ?? 0.43), gap = +(options.gap ?? 0.107);
    const length = +(options.length ?? 2);
    const pin = options.pin !== "false";

    let own = null;
    let bands = [...el.querySelectorAll('[data-fx-part="stripe"]')];
    if (!bands.length) {
      own = document.createElement("div");
      own.className = "fx-stripes";
      own.setAttribute("aria-hidden", "true");
      bands = Array.from({ length: count }, (_, i) => {
        const b = document.createElement("div");
        b.className = "fx-stripes__band";
        b.style.setProperty("--fx-stripe-i", String(i));
        own.append(b);
        return b;
      });
      own.style.setProperty("--fx-stripe-n", String(count));
      el.append(own);
    }
    const holder = own || bands[0].parentElement;
    let covered = false;
    const done = (p) => {
      holder.classList.toggle("is-visible", p > 0.001);
      if (p >= 0.999 && !covered) el.dispatchEvent(new CustomEvent("fx:covered"));
      covered = p >= 0.999;
    };

    if (reduce) { gsap.set(bands, { scaleY: 0 }); return () => own?.remove(); }

    // From the bottom row to the top — each row spreads up and down from the center
    const order = bands.map((_, i) => i).reverse();
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: () => done(tl.progress()),
      scrollTrigger: {
        trigger: el, scroller, start: options.start || "top top",
        end: () => `+=${innerHeight * length}`, pin, pinSpacing: pin, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
      },
    });
    gsap.set(bands, { scaleY: 0, transformOrigin: "50% 50%" });
    order.forEach((idx, i) => tl.fromTo(bands[idx], { scaleY: 0 }, { scaleY: 1, duration: each, immediateRender: false }, i * gap));

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set(bands, { clearProps: "transform" });
      own?.remove();
    };
  });
})();
