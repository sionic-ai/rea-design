// A background-color curtain covering the hero folds up with its top edge as the axis, vertical scale 1 → 0, revealing the page. This is the opening curtain of a Studio site (original 2s CSS default ease).
// The curtain is in the HTML from the start so it covers even the first paint, and starts folding two frames later (or after window load if on: load). When fully folded it hides and fires fx:done
(() => {
  kfFx.register("veil-fold-loader", (el, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 2);
    const delay = reduce ? 0 : +(options.delay ?? 0);
    const ease = options.ease || "ease";
    let raf = 0, timer = 0, gone = false;
    const done = () => {
      el.classList.add("fx-vfl-done");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    const fold = () => {
      if (gone) return;
      if (!dur) { done(); return; }
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          el.style.transition = `scale ${dur}s ${ease} ${delay}s`;
          el.style.scale = "1 0";
          timer = setTimeout(done, (dur + delay) * 1000);
        });
      });
    };
    const onLoad = options.on === "load" && document.readyState !== "complete";
    if (onLoad) addEventListener("load", fold, { once: true });
    else fold();
    return () => {
      gone = true;
      removeEventListener("load", fold);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      el.style.transition = "";
      el.style.scale = "";
      el.classList.remove("fx-vfl-done");
    };
  });
})();
