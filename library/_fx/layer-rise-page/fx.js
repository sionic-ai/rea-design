// Three color curtains cover from below in turn and pass over, then peel back in reverse on the arriving page
(() => {
  const KEY = "fx-layer-rise-page";
  kfFx.register("layer-rise-page", (el, { options, reduce }) => {
    let made = null;
    let layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!layers.length) {
      made = document.createElement("div");
      made.className = "fx-layers";
      made.innerHTML = '<i data-fx-part="layer"></i><i data-fx-part="layer"></i><i data-fx-part="layer"></i>';
      el.append(made);
      layers = [...made.children];
    }
    const dur = reduce ? 0 : +(options.dur ?? 0.8), each = +(options.each ?? 0.1);
    const ease = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    let arrived = false;
    try { arrived = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (e) { arrived = false; }

    let tl = null;
    // CSS translate3d(0,100%,0) is read by GSAP as pixels (y), so yPercent appears as 0 — set the initial position directly
    gsap.set(layers, { y: 0, yPercent: 100 });
    if (arrived && dur > 0) {
      gsap.set(layers, { yPercent: 0 });
      tl = gsap.to(layers, { yPercent: 100, duration: dur, ease, stagger: -each, delay: 0.05 });
    }

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("[data-no-wipe]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      try { sessionStorage.setItem(KEY, "1"); if (options.mark) sessionStorage.setItem(options.mark, "1"); } catch (err) { /* Even if it can’t be saved, the transition still goes through */ }
      if (dur <= 0) { location.href = url.href; return; }
      tl?.kill();
      tl = gsap.to(layers, { yPercent: 0, duration: dur, ease, stagger: each, onComplete: () => { location.href = url.href; } });
    };
    // Returning via the back button leaves a covered, frozen screen — drop the curtain when waking from bfcache
    const onShow = (e) => { if (e.persisted) { tl?.kill(); gsap.set(layers, { y: 0, yPercent: 100 }); } };
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      tl?.kill();
      gsap.set(layers, { clearProps: "transform" });
      made?.remove();
    };
  });
})();
