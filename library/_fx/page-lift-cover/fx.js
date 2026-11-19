// Transition: clicking a same-site link, after hold the current plate rises by lift (vh) with a dark veil laid over it up to shade, and when fully up it navigates.
// The incoming page covers by rising from below, from (vh) to 0. Values from the original Brand SF-transition (after .3s −20vh 1s, cover .6 .8s, new panel 100vh→0 1s, power2.inOut)
(() => {
  const KEY = "fx-page-lift-cover";
  kfFx.register("page-lift-cover", (root, { options, reduce }) => {
    const hold = reduce ? 0 : +(options.hold ?? 0.3), out = reduce ? 0 : +(options.out ?? 1), rise = reduce ? 0 : +(options.rise ?? 1);
    const shade = +(options.shade ?? 0.6), shadeDur = reduce ? 0 : +(options["shade-dur"] ?? 0.8);
    const lift = +(options.lift ?? 20), from = +(options.from ?? 100);
    const ease = kfFx.ease(options.ease || "0.455,0.03,0.515,0.955", "power2.inOut");
    // The curtain can be laid later and on a different curve than the plate (reference site: while the plate rises over 1.4s expo.inOut, the curtain goes .4s after .2s)
    const shadeAt = reduce ? 0 : +(options["shade-at"] ?? 0), shadeEase = options["shade-ease"] ? kfFx.ease(options["shade-ease"], "power1.out") : ease;
    const ac = new AbortController(), on = { signal: ac.signal };
    const veil = document.createElement("div");
    veil.className = "fx-page-lift-cover__veil";
    veil.setAttribute("aria-hidden", "true");
    root.append(veil);
    // Covers upward from below only when arriving via a link (as is on fresh open or refresh)
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (e) {}
    // look: fade — no panel is raised, opacity only: on exit it goes to 0 in out seconds, and the incoming page rises in rise seconds after in-delay (knot: after .3s .6s expo.inOut → after .1s .6s power4.out)
    const fade = options.look === "fade";
    const inEase = options["in-ease"] ? kfFx.ease(options["in-ease"], "power2.out") : ease, inDelay = reduce ? 0 : +(options["in-delay"] ?? 0);
    // slow-hold — [data-fx-part="slow"] links inside (ones like the menu drawer that must close first) wait that long before leaving (knot drawer link 1s)
    const slowHold = reduce ? 0 : +(options["slow-hold"] ?? hold);
    const entry = !came || !rise ? null
      : fade ? gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: rise, delay: inDelay, ease: inEase, clearProps: "opacity" })
      : gsap.fromTo(root, { y: `${from}vh` }, { y: 0, duration: rise, ease, clearProps: "transform" });
    addEventListener("pageshow", (e) => e.persisted && (gsap.set(root, { clearProps: "transform,opacity" }), gsap.set(veil, { opacity: 0 })), on);
    let leaving = null;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || !root.isConnected || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      // self: 1 — a link to the current page (logo) is also reopened with the same transition (knot). Default is skip
      if (!href || href.startsWith("#") || a.origin !== location.origin || (a.href === location.href && options.self !== "1")) return;
      e.preventDefault();
      if (leaving) return;
      try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
      leaving = gsap.timeline({ delay: a.closest('[data-fx-part="slow"]') ? slowHold : hold, onComplete: () => (location.href = a.href) });
      if (fade) leaving.to(root, { opacity: 0, duration: out, ease }, 0);
      else leaving.to(veil, { opacity: shade, duration: shadeDur, ease: shadeEase }, shadeAt).to(root, { y: `${-lift}vh`, duration: out, ease }, 0);
    }, on);
    return () => { ac.abort(); entry?.kill(); leaving?.kill(); gsap.set(root, { clearProps: "transform,opacity" }); veil.remove(); };
  });
})();
