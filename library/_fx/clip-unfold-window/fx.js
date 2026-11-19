// Window unfold: the clip grows from the top-left inset(20px) point to the handle cell (handle 40px) over dur, unfolds to the right after .2·dur, and downward after dur.
// Meanwhile the surface-color curtain covering the window ends and lifts in .45s power2.out, and the icons pop out at .05 intervals with back.out(1.6).
// on: scroll means when entering the screen, otherwise right after attaching (after delay). Even if it covers the whole panel, the text behind the curtain remains so reading tools do not miss it
(() => {
  kfFx.register("clip-unfold-window", (el, { options, reduce }) => {
    const icons = [...el.querySelectorAll('[data-fx-part="icon"]')];
    if (reduce) return;
    const dur = +(options.dur ?? 1), delay = +(options.delay ?? 0), radius = +(options.radius ?? 4);
    const ease = kfFx.ease(options.ease || "0.33,0,0,1", "expo.out");
    let tl = null, shield = null, io = null;
    const run = () => {
      const n = el.offsetWidth, r = el.offsetHeight;
      if (!n || !r) return;
      const i = Math.min(+(options.inset ?? 20), n / 2, r / 2), a = Math.min(+(options.handle ?? 40), n, r), b = Math.max(0, r - a);
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      shield = document.createElement("div");
      shield.className = "fx-cuw-shield";
      shield.setAttribute("aria-hidden", "true");
      el.prepend(shield);
      const c = { t: i, r: n - i, b: r - i, l: i };
      const paint = () => { el.style.clipPath = `inset(${c.t}px ${c.r}px ${c.b}px ${c.l}px round ${radius}px)`; };
      paint();
      if (icons.length) gsap.set(icons, { scale: 0, transformOrigin: "50% 50%" });
      tl = gsap.timeline({ delay, defaults: { duration: dur, ease } });
      tl.to(c, { t: 0, r: Math.max(0, n - a), b, l: 0, onUpdate: paint })
        .to(c, { r: 0, onUpdate: paint }, `-=${dur * 0.8}`)
        .to(c, { b: 0, onUpdate: paint, onComplete: () => { el.style.clipPath = ""; } }, `-=${dur * 0.2}`)
        .to(shield, { opacity: 0, duration: 0.45, ease: "power2.out", onComplete: () => { shield?.remove(); shield = null; } });
      if (icons.length) tl.to(icons, { scale: 1, duration: 0.55, stagger: 0.05, ease: "back.out(1.6)", clearProps: "transform" }, "-=0.25");
      el.dispatchEvent(new CustomEvent("fx:unfold", { bubbles: true }));
    };
    if (options.on === "scroll") {
      el.style.clipPath = "inset(50%)";
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); io = null; el.style.clipPath = ""; run(); } }, { threshold: 0.15 });
      io.observe(el);
    } else run();
    return () => {
      io?.disconnect();
      tl?.kill();
      shield?.remove();
      el.style.clipPath = "";
      if (icons.length) gsap.set(icons, { clearProps: "transform" });
    };
  });
})();
