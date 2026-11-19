/* Subpage: floating dock, photo pile spread, price board, menu demo loop, logo flow, menu picking stage, title curtain wipe */
(() => {
  const { reduce } = window.AN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  /* Dock: the list shows only inside the card cell, the buy-kit dock rises after the hero is passed (.6s expo.out) */
  const dock = $("[data-dock]"), zone = $("[data-dock-zone]");
  if (dock && zone) ScrollTrigger.create({ trigger: zone, start: "top 60%", end: "bottom 80%", onToggle: (s) => dock.classList.toggle("is-away", !s.isActive) });
  const buy = $("[data-buy]");
  if (buy) ScrollTrigger.create({ trigger: ".an-mock", start: "top 40%", endTrigger: ".an-ringcta", end: "top 60%", onToggle: (s) => buy.classList.toggle("is-away", !s.isActive) });

  /* Photo stack: tap to spread into a strip (length·gap come from the value panel), tap again to return to a stack */
  const stack = $(".an-stack");
  if (stack) {
    const opt = { dur: 0.45, stagger: 0.035, side: "left" };
    const ph = $$(".an-stack__ph", stack);
    let open = false;
    const rest = () => ph.forEach((p, i) => gsap.set(p, { x: 0, y: -i * 2, rotation: (i - 2) * 3, zIndex: ph.length - i }));
    rest();
    const toggle = () => {
      open = !open;
      const box = stack.parentElement.getBoundingClientRect(), w = stack.offsetWidth;
      const dir = opt.side === "left" ? -1 : 1;
      ph.forEach((p, i) => {
        const to = open
          ? { x: dir * (box.width * 0.38) + -dir * i * (w + 8), y: box.height * 0.32, rotation: 0, scale: 0.8 }
          : { x: 0, y: -i * 2, rotation: (i - 2) * 3, scale: 1 };
        gsap.to(p, { ...to, duration: reduce ? 0 : opt.dur, delay: reduce ? 0 : i * opt.stagger, ease: open ? "back.out(1.4)" : "power3.inOut" });
      });
    };
    stack.addEventListener("click", toggle);
    const ctl = $("[data-ctl]");
    if (ctl) {
      ctl.addEventListener("ctl", (e) => { opt[e.detail.key] = e.detail.value; });
      window.AN.ctlInit(ctl);
    }
  }

  /* Menu demo video slot: the menu panel slides in and the page shifts at a slant, holds, then closes — repeats on its own */
  const loop = $("[data-menu-loop]");
  if (loop) mm.add("(prefers-reduced-motion: no-preference)", () => {
    const menu = $(".an-mock__menu", loop), page = $(".an-mock__page", loop);
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, defaults: { ease: "expo.inOut" } });
    tl.to(page, { x: "12%", rotationY: -24, scale: 0.94, duration: 1.2 }, 0.4)
      .to(menu, { x: 0, duration: 1.2 }, 0.4)
      .from($$("a", menu), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "expo.out" }, 1.1)
      .to(page, { x: 0, rotationY: 0, scale: 1, duration: 1.1 }, 3.4)
      .to(menu, { x: "-120%", duration: 1.1 }, 3.4);
  });

  /* Logo flow: two copies joined to scroll endlessly to the left */
  /* View chips: only the chosen chip lights up */
  const grid = $(".an-sitegrid");
  $$(".an-dock__chip.is-icon").forEach((c, i, all) => c.addEventListener("click", () => {
    all.forEach((x) => x.classList.toggle("is-on", x === c));
    if (!grid || grid.classList.contains("is-duo") === (i === 1)) return;
    grid.classList.toggle("is-duo", i === 1);
    if (!reduce) {
      gsap.fromTo(grid.children, { x: 48 }, { x: 0, duration: 0.3, delay: 0.05, stagger: 0.035, ease: "power3.inOut" });
      gsap.fromTo(grid.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, delay: 0.05, stagger: 0.035, ease: "power3.out" });
    }
    ScrollTrigger.refresh();
  }));

  const mq = $("[data-marquee] .an-marquee__row");
  if (mq) mm.add("(prefers-reduced-motion: no-preference)", () => { gsap.to(mq, { xPercent: -50, duration: 28, ease: "none", repeat: -1 }); });

  /* Menu picking stage — each branch opens differently: cover (drops from the top) · push (page moves sideways) · float (small island) · dig in (layered drawers) */
  const view = $("[data-pick-view]");
  if (view) {
    const name = $("[data-pick-name]"), menu = $("[data-pick-menu]"), pageEl = $(".an-pick__page", view);
    let kind = "cover", isOpen = false;
    const shut = (d = 0.6) => {
      isOpen = false;
      gsap.to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: reduce ? 0 : d, ease: "expo.inOut" });
      gsap.to(pageEl, { x: 0, rotationY: 0, duration: reduce ? 0 : d, ease: "expo.inOut" });
    };
    const openMenu = () => {
      isOpen = true;
      const d = reduce ? 0 : 0.8;
      if (kind === "cover") gsap.fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease: "expo.inOut" });
      if (kind === "move") { gsap.set(menu, { clipPath: "inset(0% 60% 0% 0%)" }); gsap.to(pageEl, { x: "40%", duration: d, ease: "expo.inOut" }); }
      if (kind === "float") gsap.fromTo(menu, { clipPath: "inset(10% 6% 90% 60% round 8px)" }, { clipPath: "inset(10% 6% 40% 60% round 8px)", duration: d, ease: "expo.out" });
      if (kind === "drill") gsap.fromTo(menu, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 55%)", duration: d, ease: "expo.inOut" });
    };
    $("[data-pick-open]").addEventListener("click", () => (isOpen ? shut() : openMenu()));
    $$("[data-pick-list] > button").forEach((b) => b.addEventListener("click", () => {
      $$("[data-pick-list] > button").forEach((x) => x.classList.toggle("is-on", x === b));
      kind = b.dataset.kind; name.textContent = b.textContent; shut(0.3);
    }));
    $("[data-pick-reset]").addEventListener("click", () => shut(0.3));
  }

  /* Title curtain wipe: a dark curtain covers from the left (.5s), the text appears and it clears to the right (.5s) — original Reveal title */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    $$("[data-wipe]").forEach((el) => {
      el.classList.add("is-hidden");
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } })
        .set(el, { "--wipe-o": "0% 50%" })
        .to(el, { "--wipe": 1, duration: 0.5, ease: "expo.inOut" })
        .add(() => el.classList.remove("is-hidden"))
        .set(el, { "--wipe-o": "100% 50%" })
        .to(el, { "--wipe": 0, duration: 0.5, ease: "expo.inOut" });
    });
    return () => $$("[data-wipe]").forEach((el) => el.classList.remove("is-hidden"));
  });
})();
