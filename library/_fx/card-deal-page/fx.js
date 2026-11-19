// Clicking a link to another page brings four color panels, tilted −8·6·−4·2°, up from 118% below at .07s intervals with a .78s ‹deal› curve (0.16,1,0.3,1)
// Stack neatly into a card pile, at .52s the card-back pattern on the top panel opens from the bottom (clip inset 100% → 0 · 14% down → 0, .7s) and hands off at .86s.
// On the arrived page the pattern moves out 18% upward with a .4s ‹sweep› (0.76,0,0.24,1), and from .05s the panels go up to −118% at .6x the opposite of the initial tilt
// Tilting, it peels away from the top panel at .06s intervals over .62s — sends fx:reveal at .32s to start the hero choreography
(() => {
  const KEY = "kf-card-deal";
  kfFx.register("card-deal-page", (el, { options, reduce }) => {
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!layers.length) return;
    const mark = el.querySelector('[data-fx-part="mark"]');
    const tilts = (options.tilts || "-8, 6, -4, 2").split(",").map(Number);
    const tilt = (i) => tilts[i % tilts.length] || 0;
    const deal = kfFx.ease(options.ease || "0.16,1,0.3,1", "expo.out"), sweep = kfFx.ease(options["out-ease"] || "0.76,0,0.24,1", "power3.inOut");
    const dur = +(options.dur ?? 0.78), each = +(options.each ?? 0.07), out = +(options.out ?? 0.62), go = +(options.go ?? 0.86);
    const rest = () => { layers.forEach((l, i) => gsap.set(l, { yPercent: 118, rotation: tilt(i), autoAlpha: 1 })); if (mark) gsap.set(mark, { clipPath: "inset(100% 0% 0% 0%)", yPercent: 14 }); };
    rest();
    let busy = false, tl = null;
    const reveal = () => dispatchEvent(new Event("fx:reveal"));
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
    if (came) {
      el.dataset.dealing = "";
      layers.forEach((l) => gsap.set(l, { yPercent: 0, rotation: 0 }));
      if (mark) gsap.set(mark, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0 });
      if (reduce) {
        tl = gsap.to(layers, { autoAlpha: 0, duration: 0.2, onStart: reveal, onComplete: () => { rest(); delete el.dataset.dealing; } });
      } else {
        tl = gsap.timeline({ onComplete: () => { rest(); delete el.dataset.dealing; } });
        if (mark) tl.to(mark, { yPercent: -18, duration: 0.4, ease: sweep }, 0);
        tl.to(layers, { yPercent: -118, rotation: (i) => -(0.6 * tilt(i)), duration: out, stagger: { each: 0.06, from: "end" }, ease: sweep }, 0.05)
          .call(reveal, [], 0.32);
      }
    } else requestAnimationFrame(reveal);
    const click = (e) => {
      if (busy || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-deal-skip]")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname) return;
      e.preventDefault();
      busy = true;
      el.dataset.dealing = "";
      const leave = () => { try { sessionStorage.setItem(KEY, "1"); } catch {} location.href = u.href; };
      if (reduce) {
        layers.slice(0, -1).forEach((l) => gsap.set(l, { autoAlpha: 0 }));
        const top = layers[layers.length - 1];
        gsap.set(top, { yPercent: 0, rotation: 0 });
        if (mark) gsap.set(mark, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0 });
        tl = gsap.fromTo(top, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, onComplete: leave });
        return;
      }
      tl = gsap.timeline().to(layers, { yPercent: 0, rotation: 0, duration: dur, stagger: each, ease: deal });
      if (mark) tl.to(mark, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 0.7, ease: deal }, 0.52);
      tl.call(leave, [], go);
    };
    document.addEventListener("click", click);
    const show = (e) => { if (e.persisted) { busy = false; tl?.kill(); rest(); delete el.dataset.dealing; } };
    addEventListener("pageshow", show);
    return () => { document.removeEventListener("click", click); removeEventListener("pageshow", show); tl?.kill(); gsap.set([...layers, mark].filter(Boolean), { clearProps: "all" }); delete el.dataset.dealing; };
  });
})();
