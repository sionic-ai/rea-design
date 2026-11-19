// A vertical color band twice the screen height (transparent from the bottom → three colors → transparent) hides below the screen, and when a same-site link is clicked, in .5s power2.out
// Rises to 25% of the strip height above, covering the screen and passing. The arriving page, after .1s, has the strip exit upward (−150%) in .5s power2.in, uncovering, and returns to the lower position.
// For sites where a transition tool like barba grabs the links, set links: off and call the element’s fxRainbowRisePage.cover()·reveal() at the transition steps (both return a Promise)
(() => {
  const KEY = "fx-rainbow-rise-page";
  kfFx.register("rainbow-rise-page", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const leave = +(options.leave ?? 0.5), enter = +(options.enter ?? 0.5), delay = +(options.delay ?? 0.1);
    const box = document.createElement("div");
    box.className = "fx-rainbow";
    box.setAttribute("aria-hidden", "true");
    const band = document.createElement("div");
    band.className = "fx-rainbow__band";
    box.append(band);
    el.append(box);
    gsap.set(band, { y: 0, yPercent: 50 });
    let tw;
    const cover = () => new Promise((done) => {
      tw?.kill();
      tw = gsap.to(band, { yPercent: -25, duration: reduce ? 0 : leave, ease: "power2.out", onComplete: done });
    });
    const reveal = () => new Promise((done) => {
      tw?.kill();
      tw = gsap.to(band, { yPercent: -150, duration: reduce ? 0 : enter, delay: reduce ? 0 : delay, ease: "power2.in",
        onComplete: () => { gsap.set(band, { yPercent: 50 }); done(); } });
    });
    el.fxRainbowRisePage = { cover, reveal };

    const ac = new AbortController();
    if (options.links !== "off") {
      el.addEventListener("click", (e) => {
        const a = e.target.closest?.("a[href]");
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
        e.preventDefault();
        try { sessionStorage.setItem(KEY, "1"); } catch {}
        cover().then(() => { location.href = url.href; });
      }, { signal: ac.signal });
      let came = false;
      try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
      if (came) { gsap.set(band, { yPercent: -25 }); reveal(); }
      // So a page returned to via Back doesn’t stay covered
      addEventListener("pageshow", (e) => { if (e.persisted) { tw?.kill(); gsap.set(band, { yPercent: 50 }); } }, { signal: ac.signal });
    }
    return () => { ac.abort(); tw?.kill(); box.remove(); delete el.fxRainbowRisePage; };
  });
})();
