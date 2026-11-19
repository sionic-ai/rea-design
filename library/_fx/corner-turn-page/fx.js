// A page arriving with at: 1 reads the sessionStorage flag and starts covered by the panel, then clears — a page opened fresh or arriving mid-spin appears as is without a panel
(() => {
  const KEY = "fx-turn";
  kfFx.register("corner-turn-page", (root, { options, reduce }) => {
    const narrowAt = +(options.narrow ?? 980);
    const narrow = () => innerWidth <= narrowAt;
    const dur = () => (reduce ? 0 : narrow() ? +(options["dur-narrow"] ?? 0.45) : +(options.dur ?? 0.72));
    const shadeDur = () => (reduce ? 0 : +(options["shade-dur"] ?? (narrow() ? 0.35 : 0.6)));
    const shade = +(options.shade ?? 0.2), out = reduce ? 0 : +(options.out ?? 0.4);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "power1.inOut");
    const at = Math.min(1, Math.max(0, +(options.at ?? 0.5)));
    const ac = new AbortController(), on = { signal: ac.signal };
    const turn = document.createElement("div");
    turn.className = "fx-turn";
    turn.innerHTML = '<i class="fx-turn__shade"></i><i class="fx-turn__plate"></i>';
    const [shadeEl, plate] = turn.children;
    root.append(turn);
    const reset = () => {
      gsap.killTweensOf([shadeEl, plate]);
      gsap.set(plate, { rotate: -90, opacity: 1, clearProps: "background" });
      gsap.set(shadeEl, { opacity: 0 });
      turn.classList.remove("is-on");
    };
    if (sessionStorage.getItem(KEY)) {
      const color = sessionStorage.getItem(KEY);
      sessionStorage.removeItem(KEY);
      if (color !== "1") plate.style.background = color;
      gsap.set(plate, { rotate: 0 });
      gsap.to(plate, { opacity: 0, duration: out, ease: "power1.inOut", onComplete: reset });
    }
    addEventListener("pageshow", (e) => e.persisted && reset(), on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      // If a link gives --fx-turn, it turns to that color panel — the value is passed along so the arriving page also walks in the same color
      const color = getComputedStyle(a).getPropertyValue("--fx-turn").trim();
      if (color) plate.style.background = color;
      if (at >= 1) sessionStorage.setItem(KEY, color ? getComputedStyle(plate).backgroundColor : "1");
      turn.classList.add("is-on");
      if (shade > 0) gsap.to(shadeEl, { opacity: shade, duration: shadeDur(), ease });
      const d = dur();
      gsap.fromTo(plate, { rotate: -90 }, { rotate: 0, duration: d, ease, onComplete: () => at >= 1 && (location.href = a.href) });
      if (at < 1) gsap.delayedCall(d * at, () => (location.href = a.href));
    }, on);
    return () => { ac.abort(); gsap.killTweensOf([shadeEl, plate]); turn.remove(); };
  });
})();
