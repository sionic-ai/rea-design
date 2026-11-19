(() => {
  // Original brand loader: the timetable is held by css keyframes (.1s logo blink · from .35s fills up for 1.2s · 1.75s logo off · 1.85s split top and bottom·light line ·
  // 2s glitch · ends 2.5s), the part builds the logo layer to be filled in and at the end hides the panel and fires fx:done. Passing --fx-csl-k multiplies every duration by it.
  const grainOnce = () => {
    const root = document.documentElement;
    if (getComputedStyle(root).getPropertyValue("--fx-grain").trim()) return;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 40 + Math.random() * 50;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--fx-grain", `url(${c.toDataURL("image/png")})`);
  };

  kfFx.register("crt-split-loader", (el, { reduce }) => {
    const done = () => {
      el.classList.add("is-gone");
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    if (reduce) {
      done();
      return () => el.classList.remove("is-gone");
    }
    grainOnce();
    // The timetable is held by css from the moment the plate is drawn (not waiting for the script like the original). The fill-up layer attaches late, so the delay is pulled in by the amount already passed
    const clock = el.getAnimations?.().find((a) => a.animationName === "fx-csl-done");
    const passed = Math.max(0, Number(clock?.currentTime) || 0);
    const k = parseFloat(getComputedStyle(el).getPropertyValue("--fx-csl-k")) || 1;
    const logo = el.querySelector('[data-fx-part="logo"]');
    const art = logo?.firstElementChild;
    let fill = null;
    if (art) {
      fill = document.createElement("div");
      fill.className = "fx-csl-fill";
      fill.setAttribute("aria-hidden", "true");
      fill.style.animationDelay = `${(0.35 * k * 1000 - passed).toFixed(0)}ms`;
      const copy = art.cloneNode(true);
      copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      fill.append(copy);
      logo.append(fill);
    }
    const end = (e) => {
      if (e.target === el && e.animationName === "fx-csl-done") done();
    };
    el.addEventListener("animationend", end);
    if (clock?.playState === "finished") done();
    return () => {
      el.removeEventListener("animationend", end);
      el.classList.remove("is-gone");
      fill?.remove();
    };
  });
})();
