// Page transition curtain: a curtain hidden below the screen fills up with its top edge slanted 5% to the right over .8s expo.inOut, covering the screen,
// On the new page, the bottom edge of the same slope curls upward and lifts away (on narrow screens the slope is 2.5%).
// Either intercept links directly to switch pages (links: on), or send fx:cover and fx:uncover from the hooks of a transition tool like swup (detail.done is called at the end).
(() => {
  const KEY = "fx-slant-rise-page";
  kfFx.register("slant-rise-page", (el, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 0.8);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const bp = +(options.bp || 961);
    const slope = () => (innerWidth >= bp ? +(options.slope ?? 5) : +(options["slope-narrow"] ?? 2.5));
    const poly = (a, b, c, d) => `polygon(0 ${a}%, 100% ${b}%, 100% ${c}%, 0% ${d}%)`;
    let tw = null;
    const cover = (done) => {
      const s = slope();
      if (tw) tw.kill();
      gsap.set(el, { autoAlpha: 1, clipPath: poly(100 + 2 * s, 100 + s, 100 + 2 * s, 100 + s) });
      tw = gsap.to(el, { clipPath: poly(0, -s, 100 + 2 * s, 100 + s), duration: dur, ease, onComplete: () => done && done() });
    };
    const uncover = (done) => {
      const s = slope();
      if (tw) tw.kill();
      gsap.set(el, { autoAlpha: 1, clipPath: poly(0, -s, 100 + s, 100 + 2 * s) });
      tw = gsap.to(el, { clipPath: poly(0, -s, -s, 0), duration: dur, ease, onComplete: () => { gsap.set(el, { autoAlpha: 0 }); done && done(); } });
    };
    const onCover = (e) => cover(e.detail && e.detail.done);
    const onUncover = (e) => uncover(e.detail && e.detail.done);
    el.addEventListener("fx:cover", onCover);
    el.addEventListener("fx:uncover", onUncover);
    gsap.set(el, { autoAlpha: 0 });

    let onClick = null;
    if (options.links !== "off") {
      if (sessionStorage.getItem(KEY) === "1") { sessionStorage.removeItem(KEY); uncover(); }
      onClick = (e) => {
        const a = e.target.closest && e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target === "_blank" || a.hasAttribute("download")) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
        e.preventDefault();
        cover(() => { sessionStorage.setItem(KEY, "1"); location.href = url.href; });
      };
      document.addEventListener("click", onClick);
    }
    return () => {
      if (tw) tw.kill();
      el.removeEventListener("fx:cover", onCover);
      el.removeEventListener("fx:uncover", onUncover);
      if (onClick) document.removeEventListener("click", onClick);
      gsap.set(el, { clearProps: "clipPath,opacity,visibility" });
    };
  });
})();
