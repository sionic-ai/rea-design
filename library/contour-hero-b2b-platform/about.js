// About — original initFlipOnScroll (pill → next section fills the screen, scrub .8, radius 100vw→0) · Webflow tabs (length 0) · team intro board (fills in .6s on hover)
AB.page("about", (root, { k }) => {
  const wraps = [...root.querySelectorAll("[data-flip-wrapper]")];
  const target = root.querySelector("[data-flip-target]");
  if (wraps.length > 1 && target && window.Flip) {
    let tl, radius;
    const build = () => {
      if (tl) { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(target, { clearProps: "all" }); }
      if (radius) { radius.scrollTrigger?.kill(); radius.kill(); }
      if (AB.reduced) { Flip.fit(target, wraps[wraps.length - 1], { simple: true }); gsap.set(target, { borderRadius: 0 }); return; }
      gsap.set(target, { willChange: "transform" });
      const st = { trigger: wraps[0], start: "center center", endTrigger: wraps[wraps.length - 1], end: "center center", scrub: 0.8, invalidateOnRefresh: true };
      tl = gsap.timeline({ scrollTrigger: st });
      wraps.forEach((el, i) => {
        const nx = wraps[i + 1];
        if (!nx) return;
        const a = el.getBoundingClientRect(), b = nx.getBoundingClientRect();
        const offset = b.top + scrollY + nx.offsetHeight / 2 - (a.top + scrollY + el.offsetHeight / 2);
        tl.add(Flip.fit(target, nx, { duration: offset, ease: "none", simple: true }));
      });
      radius = gsap.fromTo(target, { borderRadius: "100vw" }, { borderRadius: "0vw", ease: "none", scrollTrigger: { ...st } });
    };
    build();
    let t;
    k.on(window, "resize", () => { clearTimeout(t); t = setTimeout(build, 100); });
    k.add(() => { tl?.scrollTrigger?.kill(); tl?.kill(); radius?.scrollTrigger?.kill(); radius?.kill(); });
  }

  const tabs = root.querySelector("[data-tabs]");
  if (tabs) {
    const links = [...tabs.querySelectorAll("[data-tab]")], panes = [...tabs.querySelectorAll("[data-pane]")];
    const go = (i) => {
      links.forEach((l, j) => { l.classList.toggle("is-current", i === j); l.setAttribute("aria-selected", String(i === j)); l.tabIndex = i === j ? 0 : -1; });
      panes.forEach((p, j) => p.classList.toggle("is-active", i === j));
      ScrollTrigger.refresh();
    };
    links.forEach((l, i) => {
      k.on(l, "click", () => go(i));
      k.on(l, "keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const n = (i + (e.key === "ArrowRight" ? 1 : -1) + links.length) % links.length;
        links[n].focus();
        go(n);
      });
    });
  }

  const hover = matchMedia("(hover: hover)").matches;
  root.querySelectorAll("[data-team-card]").forEach((c) => {
    const bio = c.querySelector(".ap-team__bio");
    k.on(c, "mouseenter", () => bio.classList.add("is-active"));
    k.on(c, "mouseleave", () => bio.classList.remove("is-active"));
    if (!hover) k.on(c, "click", () => bio.classList.toggle("is-active"));
  });
  return {};
});
