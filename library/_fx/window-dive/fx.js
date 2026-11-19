// Wheel or touch at the very top moves into the window (is-in) and locks document scroll meanwhile — the original locks for 2s, and when returning to top it rewinds while locking for 1.5s.
// Scroll down while inside, rewind on reaching the top, and after the lock releases, rolling the wheel again goes in again
(() => {
  kfFx.register("window-dive", (el, { options, scroller }) => {
    const lock = +(options.lock ?? 2000), relock = +(options.relock ?? 1500);
    if (options.scale) el.style.setProperty("--fx-scale", options.scale);
    if (options.origin) el.style.setProperty("--fx-origin", options.origin);
    const box = scroller || document.scrollingElement || document.documentElement;
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    const toTop = () => (scroller ? scroller.scrollTo({ top: 0, behavior: "instant" }) : window.scrollTo({ top: 0, behavior: "instant" }));
    let ready = true, timer = 0;
    const hold = (ms, after) => {
      box.style.overflow = "hidden";
      clearTimeout(timer);
      timer = setTimeout(() => { box.style.overflow = ""; after(); }, ms);
    };
    const enter = () => {
      if (!ready || top() >= 1 || el.classList.contains("is-in") || !el.isConnected) return;
      el.classList.add("is-in");
      toTop();
      el.dispatchEvent(new CustomEvent("fx:dive", { bubbles: true, detail: { in: true } }));
      hold(lock, () => { ready = false; });
    };
    const leave = () => {
      if (top() > 0 || !el.classList.contains("is-in")) return;
      el.classList.remove("is-in");
      toTop();
      el.dispatchEvent(new CustomEvent("fx:dive", { bubbles: true, detail: { in: false } }));
      hold(relock, () => { ready = true; });
    };
    const target = scroller || window;
    target.addEventListener("wheel", enter, { passive: true });
    target.addEventListener("touchmove", enter, { passive: true });
    target.addEventListener("scroll", leave, { passive: true });
    return () => {
      target.removeEventListener("wheel", enter);
      target.removeEventListener("touchmove", enter);
      target.removeEventListener("scroll", leave);
      clearTimeout(timer);
      box.style.overflow = "";
      el.classList.remove("is-in");
      el.style.removeProperty("--fx-scale");
      el.style.removeProperty("--fx-origin");
    };
  });
})();
