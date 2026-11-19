(() => {
  // Original brand(Nuxt <Transition> .door): clicking a same-site link widens an accent-color panel’s cut edge from the left, covering the screen in 1s and
  // (clip-path inset(0 100% 0 0) → 0, cubic-bezier(1,0,.175,1)), on the new page the same panel is clipped off to the right (0 → inset(0 0 0 100%)) and clears in 1s
  const KEY = "fx-door-wipe";
  kfFx.register("door-wipe-page", (el, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 1);
    const wait = +(options.wait ?? 0);
    // At what fraction of the cover length to switch — the original Brand site (Nuxt) changes the page at .73, when the door is 94% closed
    const go = Math.min(1, Math.max(0, +(options.go ?? 1)));
    const door = document.createElement("div");
    door.setAttribute("data-fx-part", "door");
    door.setAttribute("aria-hidden", "true");
    door.style.setProperty("--fx-dur", `${dur}s`);
    if (options.ease) door.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    el.append(door);
    const timers = [];
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
    const open = () => {
      door.classList.add("is-fx-leave");
      timers.push(setTimeout(() => { door.classList.remove("is-fx-shut", "is-fx-leave"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); }, dur * 1000));
    };
    if (came) {
      door.classList.add("is-fx-shut");
      const go = () => requestAnimationFrame(() => requestAnimationFrame(open));
      if (document.readyState === "complete") go();
      else addEventListener("load", go, { once: true });
    }
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || a.origin !== location.origin || a.hasAttribute("download")) return;
      if (a.pathname === location.pathname && a.search === location.search) return;
      e.preventDefault();
      door.classList.remove("is-fx-leave", "is-fx-shut");
      door.classList.add("is-fx-enter");
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      timers.push(setTimeout(() => (location.href = a.href), (dur * go + wait) * 1000));
    };
    // When shown again from cache via back, clear it so it isn’t left covering
    const onShow = (e) => { if (e.persisted) { door.classList.remove("is-fx-enter"); door.classList.add("is-fx-shut"); requestAnimationFrame(open); } };
    el.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      el.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      timers.forEach(clearTimeout);
      door.remove();
    };
  });
})();
