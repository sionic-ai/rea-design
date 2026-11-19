(() => {
  // Element = Curtain that covers the screen. Clicking a link to another page on the same site covers instantly, the body fades out in .3s, then navigation happens after 350ms
  kfFx.register("flash-veil-nav", (el, { options }) => {
    const wait = +(options.delay ?? 350), fade = +(options.fade ?? 0.3);
    // in: length the curtain covers (seconds, default 0 = immediately) · body: keep means the body is not removed · arrive: covered means it opens with the cover still on and lifts over out seconds on load (Brand #cover .4s)
    const inDur = +(options.in ?? 0), keep = options.body === "keep", arrive = options.arrive === "covered", out = +(options.out ?? 0.4);
    const hide = () => { el.style.transition = ""; el.dataset.veil = "off"; document.body.style.opacity = ""; document.body.style.transition = ""; };
    const lift = () => { el.style.transition = `opacity ${out}s ease, visibility 0s linear ${out}s`; el.dataset.veil = "off"; };
    let onLoad = null;
    if (arrive) {
      el.style.transition = "none";
      el.dataset.veil = "on";
      if (document.readyState === "complete") requestAnimationFrame(lift);
      else addEventListener("load", (onLoad = () => lift()), { once: true });
    } else hide();
    const click = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      let url;
      try { url = new URL(a.getAttribute("href"), location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      el.style.transition = inDur > 0 ? `opacity ${inDur}s ease, visibility 0s` : "";
      el.dataset.veil = "on";
      if (!keep) {
        document.body.style.transition = `opacity ${fade}s ease`;
        document.body.style.opacity = "0";
      }
      setTimeout(() => { location.href = url.href; }, wait);
    };
    const back = (e) => { if (e.persisted) (arrive ? lift : hide)(); };
    document.addEventListener("click", click);
    addEventListener("pageshow", back);
    return () => { document.removeEventListener("click", click); removeEventListener("pageshow", back); if (onLoad) removeEventListener("load", onLoad); hide(); };
  });
})();
