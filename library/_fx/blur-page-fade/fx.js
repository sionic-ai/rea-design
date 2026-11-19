// Page blur transition — original (source site script.js): body is drawn with 30px blur and .8 transparency, then fade-in is added on DOMContentLoaded
// Only the blur clears, over 1s easeOutSine (opacity goes straight to 1). Pressing a same-site link removes fade-in (blur and opacity start spreading again over 1s) and navigates immediately.
// A page restored via back button (bfcache) is cleared again.
(() => {
  kfFx.register("blur-page-fade", (el, { options, reduce }) => {
    const wait = +(options.go ?? 0);
    const ac = new AbortController(), on = { signal: ac.signal };
    let timer = 0;
    if (reduce) { el.classList.add("is-in", "is-still"); return () => el.classList.remove("is-in", "is-still"); }
    const raf = requestAnimationFrame(() => el.classList.add("is-in"));
    addEventListener("pageshow", (e) => { if (e.persisted) el.classList.add("is-in"); }, on);
    el.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.hostname !== location.hostname) return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#")) return;
      if (a.hash && a.href.split("#")[0] === location.href.split("#")[0]) return;
      e.preventDefault();
      el.classList.remove("is-in");
      timer = setTimeout(() => { location.href = a.href; }, wait * 1000);
    }, on);
    return () => { ac.abort(); cancelAnimationFrame(raf); clearTimeout(timer); el.classList.remove("is-in"); };
  });
})();
