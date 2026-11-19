(() => {
  kfFx.register("pin-pair-stack", (el, { options, reduce, scroller }) => {
    const panels = [...el.querySelectorAll(':scope > [data-fx-part="panel"]')];
    const n = panels.length;
    if (!n) return;
    gsap.registerPlugin(ScrollTrigger);
    const nums = [...el.querySelectorAll('[data-fx-part="num"]')];
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    const cover = +(options.cover ?? 1), lead = +(options.lead ?? 0.169), tail = +(options.tail ?? 0.56);
    const narrow = +(options.narrow ?? 0), holdWide = +(options.hold ?? 1), holdNarrow = +(options["hold-narrow"] ?? holdWide);
    el.style.setProperty("--fx-n", n);
    el.style.setProperty("--fx-cover", cover);
    // From the second panel on, the photo stays on screen and only the window (the panel’s top edge) rises — the photo is attached inside the cell that starts one screen above the panel
    const wraps = panels.slice(1).map((p) => {
      const shift = document.createElement("div"), stick = document.createElement("div");
      shift.className = "fx-pp-shift"; stick.className = "fx-pp-stick";
      stick.append(...p.childNodes);
      shift.append(stick);
      p.append(shift);
      return [p, shift, stick];
    });
    const show = (k) => {
      nums.forEach((x, i) => gsap.set(x, { opacity: i === k ? 1 : 0 }));
      bars.forEach((x, i) => { x.style.setProperty("--fx-p", i === k ? 1 : 0); gsap.set(x, { opacity: i === k ? 1 : 0 }); });
    };
    const mm = gsap.matchMedia();
    if (reduce) show(0);
    else mm.add(narrow ? { wide: `(min-width: ${narrow + 1}px)`, small: `(max-width: ${narrow}px)` } : { wide: "all" }, (ctx) => {
      const hold = ctx.conditions.wide ? holdWide : holdNarrow, step = 1 + hold;
      el.style.setProperty("--fx-hold", hold);
      show(-1);
      if (nums[0]) gsap.set(nums[0], { opacity: 1 });
      if (bars[0]) gsap.set(bars[0], { opacity: 1 });
      // The time unit is the screen height — panel k fully rises at k×(1+dwell) screens (the original number change runs from .027 screens before to .046 after)
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      for (let k = 0; k < n; k++) {
        const at = step * k, from = k ? at - 0.027 : lead, to = k < n - 1 ? step * (k + 1) - 0.1 : step * n - tail;
        if (bars[k]) tl.fromTo(bars[k], { "--fx-p": 0 }, { "--fx-p": 1, duration: to - from }, from);
        if (k) {
          if (nums[k - 1]) tl.to(nums[k - 1], { opacity: 0, duration: 0.073 }, at - 0.027);
          if (bars[k - 1]) tl.set(bars[k - 1], { opacity: 0 }, at - 0.027);
          if (nums[k]) tl.fromTo(nums[k], { opacity: 0 }, { opacity: 1, duration: 0.073 }, at - 0.027);
          if (bars[k]) tl.set(bars[k], { opacity: 1 }, at - 0.027);
        }
      }
      const total = step * n + 1 + 0.388;
      tl.set({}, {}, total);
      ScrollTrigger.create({ trigger: el, scroller, start: "top top", end: () => `+=${total * innerHeight}`, scrub: true, animation: tl, invalidateOnRefresh: true });
    });
    return () => {
      mm.revert();
      for (const x of [...nums, ...bars]) { gsap.set(x, { clearProps: "opacity" }); x.style.removeProperty("--fx-p"); }
      el.style.removeProperty("--fx-n");
      el.style.removeProperty("--fx-cover");
      el.style.removeProperty("--fx-hold");
      for (const [p, shift, stick] of wraps) { p.append(...stick.childNodes); shift.remove(); }
    };
  });
})();
