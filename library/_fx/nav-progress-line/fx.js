// A single 1px line under the header line signals page transitions — clicking another page link grows the line from the left to 40% (while waiting),
// On opened pages it disappears .5s late after filling to the end. No curtain is laid, so the screen is not covered during the transition.
(() => {
  const NAME = "nav-progress-line";
  const inside = (a) => {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    return !(url.pathname === location.pathname && url.search === location.search);
  };

  kfFx.register(NAME, (el, { options, reduce }) => {
    if (!window.gsap) return;
    const grow = +(options.grow ?? 40);
    // Line growth length (dur) and the handoff time (wait) are separate — the original hands off to the next page as soon as it arrives (.52s), while the line has already started growing as a 1s animation
    const dur = +(options.dur ?? 1);
    const wait = +(options.wait ?? dur);
    const fill = +(options.fill ?? 1);
    const fade = +(options.fade ?? 1);
    const hold = +(options.hold ?? 0.5);
    // start — wait (seconds) before filling up on an opened page. The original starts after the screen is painted and the app is attached (Brand .2)
    const start = +(options.start ?? 0);
    const tweens = [];
    if (reduce) gsap.set(el, { width: "100%", opacity: 0 });
    else {
      gsap.set(el, { width: "0%", opacity: 1 });
      tweens.push(gsap.to(el, { width: "100%", duration: fill, delay: start, ease: "sine.inOut" }));
      tweens.push(gsap.to(el, { opacity: 0, duration: fade, delay: start + hold, ease: "circ.in" }));
    }
    // When the same header row exists at two widths (wide screen and phone), only the visible one takes the press — if both do, the movement fires twice
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!inside(a) || !el.offsetParent) return;
      e.preventDefault();
      const go = () => { location.href = a.href; };
      if (reduce || wait <= 0) return go();
      tweens.forEach((t) => t.kill());
      gsap.set(el, { width: "0%", opacity: 1 });
      tweens.push(gsap.to(el, { width: `${grow}%`, duration: dur, ease: "power1.in" }));
      tweens.push(gsap.delayedCall(wait, go));
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      tweens.forEach((t) => t.kill());
      gsap.set(el, { clearProps: "width,opacity" });
    };
  });
})();
