(() => {
  const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const TOP = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
  const BOTTOM = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";

  kfFx.register("clip-dir-preview", (el, { options, reduce, hover }) => {
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    const media = el.querySelector('[data-fx-part="media"]');
    const cards = media ? [...media.querySelectorAll('[data-fx-part="card"]')] : [];
    if (!rows.length || !cards.length || !hover) return;
    const open = reduce ? 0 : +(options.open ?? 0.35);
    const close = reduce ? 0 : +(options.close ?? 0.6);
    const lerp = +(options.lerp ?? 0.1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    gsap.set(cards, { clipPath: TOP });
    // Side of entry and exit — whichever of the row’s top center and bottom center is closer to the hand
    const side = (e, row) => {
      const r = row.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top;
      return x * x + y * y <= x * x + (y - r.height) ** 2 ? "top" : "bottom";
    };
    let current = null;
    const enters = rows.map((row, i) => (e) => {
      const card = cards[i % cards.length], dir = side(e, row);
      const prev = current !== null && current !== i ? cards[current % cards.length] : null;
      current = i;
      gsap.killTweensOf(card);
      if (prev && prev !== card) { gsap.killTweensOf(prev); gsap.set(prev, { zIndex: 1 }); }
      gsap.set(card, { zIndex: 2 });
      if (gsap.getProperty(card, "clipPath") !== OPEN) gsap.set(card, { clipPath: dir === "top" ? TOP : BOTTOM });
      gsap.to(card, { clipPath: OPEN, duration: open, ease });
      if (prev && prev !== card) gsap.to(prev, { clipPath: dir === "top" ? BOTTOM : TOP, duration: open, ease, onComplete: () => gsap.set(prev, { zIndex: 0 }) });
    });
    const leaves = rows.map((row, i) => (e) => gsap.to(cards[i % cards.length], { clipPath: side(e, row) === "top" ? TOP : BOTTOM, duration: close, ease }));
    rows.forEach((row, i) => { row.addEventListener("mouseenter", enters[i]); row.addEventListener("mouseleave", leaves[i]); });
    let aim = 0, y = 0, lastY = null, raf = 0;
    const onMove = (e) => { lastY = e.clientY; aim = e.clientY - el.getBoundingClientRect().top; };
    const onScroll = () => { if (lastY !== null) aim = lastY - el.getBoundingClientRect().top; };
    el.addEventListener("mousemove", onMove);
    addEventListener("scroll", onScroll, { passive: true });
    const follow = () => {
      y += (aim - y) * lerp;
      const max = Math.max(0, el.offsetHeight - (cards[0].offsetHeight || 0));
      gsap.to(media, { y: Math.max(0, Math.min(y, max)), duration: 0.1, ease: "power2.out", overwrite: true });
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      removeEventListener("scroll", onScroll);
      rows.forEach((row, i) => { row.removeEventListener("mouseenter", enters[i]); row.removeEventListener("mouseleave", leaves[i]); });
      gsap.killTweensOf([media, ...cards]);
      gsap.set(cards, { clearProps: "clipPath,zIndex" });
      gsap.set(media, { clearProps: "transform" });
    };
  });
})();
