(() => {
  // Path from the original TransitionView — stretches the 100×100 viewBox to fit the screen. A bulging sheet hidden below → fills the screen → (on the opening side) lifts away upward
  const UNDER = (sp) => (sp ? "M 0 100 V 120 Q 50 82 100 120 V 100 z" : "M 0 100 V 150 Q 50 50 100 150 V 100 z");
  const FULL = "M 0 100 V 0 Q 50 -1 100 0 V 100 z";
  const OVER = (sp) => (sp ? "M 0 0 V 120 Q 50 82 100 120 V 0 z" : "M 0 0 V 150 Q 50 50 100 150 V 0 z");
  const GONE = "M 0 0 V 0 Q 50 0 100 0 V 0 z";
  const KEY = "fx-curve-sheet";
  kfFx.register("curve-sheet-page", (root, { options, reduce }) => {
    const cover = +(options.cover ?? 0.85), each = +(options.each ?? 0.15), wait = +(options.wait ?? 1), reveal = +(options.reveal ?? 0.65);
    const sp = () => innerWidth <= 767;
    const box = document.createElement("div");
    box.className = "fx-curve-sheet";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path/><path/><path/></svg>';
    const paths = [...box.querySelectorAll("path")];
    const rest = () => { gsap.killTweensOf(paths); paths.forEach((p) => p.setAttribute("d", UNDER(sp()))); box.classList.remove("is-on"); };
    root.append(box);
    rest();
    const ac = new AbortController(), on = { signal: ac.signal };
    let timer = 0;
    // If arrived by a page turn, it starts covered and lifts only the top section (the other two are hidden)
    if (sessionStorage.getItem(KEY) === "1") {
      sessionStorage.removeItem(KEY);
      if (!reduce) {
        box.classList.add("is-on");
        paths[0].style.visibility = paths[1].style.visibility = "hidden";
        paths[2].setAttribute("d", OVER(sp()));
        gsap.to(paths[2], { attr: { d: GONE }, duration: reveal, ease: "power3.inOut", delay: +(options.delay ?? (sp() ? 0 : 0.1)), onComplete: () => { paths[0].style.visibility = paths[1].style.visibility = ""; rest(); } });
      }
    }
    addEventListener("pageshow", (e) => e.persisted && rest(), on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.matches('[data-fx-part="top"]')) { e.preventDefault(); return scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      if (reduce) { location.href = a.href; return; }
      box.classList.add("is-on");
      paths.forEach((p, i) => { p.setAttribute("d", UNDER(sp())); gsap.to(p, { attr: { d: FULL }, duration: cover, ease: "power3.inOut", delay: each * i }); });
      clearTimeout(timer);
      timer = setTimeout(() => { sessionStorage.setItem(KEY, "1"); location.href = a.href; }, wait * 1000);
    }, on);
    return () => { ac.abort(); clearTimeout(timer); gsap.killTweensOf(paths); box.remove(); };
  });
})();
