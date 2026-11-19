(() => {
  // One board per document — it turns night if any of the hooked elements is visible
  const seen = new Set();
  let cover = null;
  const paint = () => document.body.classList.toggle("is-fx-night", seen.size > 0);
  kfFx.register("night-fall-cover", (el, { options }) => {
    if (!cover || !cover.isConnected) {
      cover = document.createElement("div");
      cover.className = "fx-night-fall-cover";
      cover.setAttribute("aria-hidden", "true");
      document.body.append(cover);
    }
    cover.style.zIndex = String(options.z ?? -1);
    cover.style.setProperty("--fx-in", `${+(options.in ?? 2)}s`);
    cover.style.setProperty("--fx-out", `${+(options.out ?? 1)}s`);
    if (options["ease-in"]) cover.style.setProperty("--fx-ease-in", options["ease-in"]);
    if (options["ease-out"]) cover.style.setProperty("--fx-ease-out", options["ease-out"]);
    // line — only while it overlaps that horizontal line of the screen (Brand: while the section spans top 50%~bottom 50% of the screen center line)
    const line = options.line != null ? Math.min(100, Math.max(0, +options.line)) : null;
    const io = new IntersectionObserver(([e]) => { e.isIntersecting ? seen.add(el) : seen.delete(el); paint(); },
      line == null ? undefined : { rootMargin: `-${line}% 0px -${100 - line}% 0px` });
    io.observe(el);
    return () => {
      io.disconnect();
      seen.delete(el);
      paint();
      if (!seen.size && !document.querySelector('[data-fx~="night-fall-cover"]')) { cover?.remove(); cover = null; }
    };
  });
})();
