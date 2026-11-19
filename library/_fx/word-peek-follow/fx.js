// Big word list + following photo box — hovering a row blurs the others, and a square box opens from the center, follows the cursor and flips through that row’s photos
(() => {
  kfFx.register("word-peek-follow", (el, { options, reduce, hover }) => {
    const box = el.querySelector('[data-fx-part="box"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!box || !items.length || !hover) return;
    const groups = [...box.querySelectorAll('[data-fx-part="group"]')];
    const dim = +(options.dim ?? 0.2), every = +(options.every ?? 0.5), wait = +(options.wait ?? 0.2);
    const open = reduce ? 0 : +(options.open ?? 0.8), close = reduce ? 0 : +(options.close ?? 0.2), follow = reduce ? 0 : +(options.follow ?? 0.6), fade = reduce ? 0 : 0.5;
    const KEY = "kfFxLastMouse";
    let state = "LEAVE", openTw = null, closeTw = null, timer = 0, placed = false;
    gsap.set(box, { xPercent: -50, yPercent: -50, clipPath: "inset(50%)", opacity: 0 });
    const qx = gsap.quickTo(box, "x", { duration: follow, ease: "power3" });
    const qy = gsap.quickTo(box, "y", { duration: follow, ease: "power3" });
    // Original paging: the next slide is placed on top (z 2) and transparent, turned on after every seconds with no curve, then the stacking is released — stacking is kept only when returning from the last slide to the first.
    const loops = every > 0 && !reduce ? groups.map((g) => {
      const imgs = [...g.children];
      if (imgs.length < 2) return null;
      const tl = gsap.timeline({ repeat: -1 });
      imgs.forEach((_, r) => {
        const n = (r + 1) % imgs.length;
        tl.set(imgs[n], { opacity: 0, zIndex: 2 }).to(imgs[n], { opacity: 1, duration: 0, ease: "none", delay: every });
        if (n !== 0) tl.set(imgs, { zIndex: 0 });
      });
      return tl;
    }) : [];
    const show = (i) => groups.forEach((g, j) => (g.hidden = i !== j));
    const enter = (item, i) => {
      state = "ENTER";
      if (groups.length) show(Math.min(i, groups.length - 1));
      gsap.to(items, { opacity: dim, duration: fade });
      gsap.to(item, { opacity: 1, duration: fade });
      openTw = gsap.to(box, { clipPath: "inset(0%)", opacity: 1, duration: open, ease: "power4.out", onComplete: () => closeTw && closeTw.kill() });
    };
    const leave = () => {
      state = "LEAVE";
      gsap.to(items, { opacity: 1, duration: fade });
      if (openTw) openTw.kill();
      clearTimeout(timer);
      timer = setTimeout(() => { if (state !== "ENTER") closeTw = gsap.to(box, { clipPath: "inset(50%)", opacity: 0, duration: close }); }, wait * 1000);
    };
    const ac = new AbortController(), signal = ac.signal;
    addEventListener("mousemove", (e) => {
      qx(e.clientX);
      qy(e.clientY);
      try { localStorage.setItem(KEY, JSON.stringify({ x: e.clientX, y: e.clientY })); } catch (_) {}
    }, { signal });
    // Original: if you scroll before moving the mouse, the box is moved once to the mouse position remembered from the previous page
    addEventListener("scroll", () => {
      if (placed) return;
      placed = true;
      try {
        const p = JSON.parse(localStorage.getItem(KEY) || "null");
        if (p) { qx(p.x); qy(p.y); }
      } catch (_) {}
    }, { signal, passive: true });
    items.forEach((item, i) => {
      item.addEventListener("mouseenter", () => enter(item, i), { signal });
      item.addEventListener("mouseleave", leave, { signal });
    });
    return () => {
      ac.abort();
      clearTimeout(timer);
      loops.forEach((tl) => tl && tl.kill());
      gsap.killTweensOf([box, ...items]);
      gsap.set(items, { clearProps: "opacity" });
      gsap.set(box, { clearProps: "all" });
      groups.forEach((g, j) => { g.hidden = j !== 0; gsap.set(g.children, { clearProps: "opacity,zIndex" }); });
    };
  });
})();
