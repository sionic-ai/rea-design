(() => {
  // For each long scroll stretch, one panel is pinned to the screen — the previous panel scales up to 1.05 and fades out, then the next panel fades in from 1.05 to 1.
  // If text in the board is taller than the window, during the middle scroll of that range the text flows up inside the window, and the range grows by the flow distance.
  kfFx.register("swap-fixed-panels", (el, { options, reduce, scroller }) => {
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')].filter((p) => p.closest('[data-fx~="swap-fixed-panels"]') === el);
    if (!panels.length || !window.ScrollTrigger) return;
    // Even with reduced motion the panel must still switch so the content shows — only the length is 0
    const dur = reduce ? 0 : +(options.dur ?? 0.5), grow = +(options.scale ?? 1.05);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const parts = panels.map((panel) => ({
      panel,
      stage: panel.querySelector('[data-fx-part="stage"]'),
      win: panel.querySelector('[data-fx-part="window"]'),
      body: panel.querySelector('[data-fx-part="body"]'),
    })).filter((p) => p.stage);
    if (!parts.length) return;

    const mm = gsap.matchMedia();
    const stages = parts.map((p) => p.stage);
    let swap = null;
    const show = (p) => {
      swap?.kill();
      swap = gsap.timeline();
      const live = stages.filter((s) => s.classList.contains("is-live"));
      if (live.length) {
        swap.to(live, { opacity: 0, pointerEvents: "none", scale: grow, duration: dur, ease, overwrite: true })
          .call(() => live.forEach((s) => s.classList.remove("is-live")));
      }
      swap.call(() => {
        p.stage.classList.add("is-live");
        p.panel.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true }));
      }).to(p.stage, { opacity: 1, scale: 1, pointerEvents: "all", duration: dur, ease, overwrite: true });
    };
    const hide = (p) => {
      swap = gsap.timeline();
      swap.to(p.stage, { opacity: 0, scale: grow, pointerEvents: "none", duration: dur, ease, overwrite: true })
        .call(() => p.stage.classList.remove("is-live"));
      p.panel.dispatchEvent(new CustomEvent("fx:leave", { bubbles: true }));
    };

    // Range lengths are all fixed at once before any trigger measures its position — if a later trigger changes height, earlier trigger positions shift.
    const fit = () => parts.forEach((p) => {
      if (!p.win || !p.body) return;
      p.panel.style.removeProperty("height");
      const base = p.panel.offsetHeight, view = p.win.offsetHeight, full = p.body.offsetHeight;
      p.panel.style.height = `${base + Math.max(0, full - view)}px`;
      p.body.style.setProperty("--fx-view", `${view}px`);
      p.win.classList.toggle("can-scroll", full > view);
    });
    ScrollTrigger.addEventListener("refreshInit", fit);
    fit();

    mm.add("(min-width: 0px)", () => {
      parts.forEach((p, i) => {
        const first = i === 0, lastOne = i === parts.length - 1;
        if (p.win && p.body) {
          const over = () => (p.body.offsetHeight - p.win.offsetHeight) / 2;
          const edges = (self) => {
            p.win.classList.toggle("mask-top", self.progress > 0);
            p.win.classList.toggle("mask-bottom", self.progress < 1);
          };
          gsap.fromTo(p.body, { "--fx-progress": 0 }, {
            "--fx-progress": 1, ease: "none",
            scrollTrigger: { trigger: p.panel, scroller, start: () => `50%-=${over()} top`, end: () => `50%+=${over()} top`, scrub: reduce ? false : true, onRefresh: edges, onUpdate: edges },
          });
        }
        ScrollTrigger.create({
          trigger: p.panel, scroller, start: "top top+=1", end: "bottom top+=1",
          onEnter: () => show(p), onEnterBack: () => show(p),
          onLeave: lastOne ? () => hide(p) : undefined,
          onLeaveBack: first ? () => hide(p) : undefined,
        });
      });
    });

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", fit);
      mm.revert();
      swap?.kill();
      parts.forEach((p) => {
        p.panel.style.removeProperty("height");
        gsap.set(p.stage, { clearProps: "opacity,scale,pointerEvents" });
        p.stage.classList.remove("is-live");
        p.win?.classList.remove("can-scroll", "mask-top", "mask-bottom");
      });
    };
  });
})();
