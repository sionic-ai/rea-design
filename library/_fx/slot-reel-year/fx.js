(() => {
  // Number reel slot — when Start is pressed, the reel at each digit of the chosen value (year etc.) spins at .15s intervals with (1.3 + .25 × digit)s ease-out
  // Overshoots by 10% of the cell height and settles back in .16s. When all have stopped, the element fires fx:result(detail.value).
  kfFx.register("slot-reel-year", (el, { options, reduce }) => {
    const reels = [...el.querySelectorAll('[data-fx-part="reel"]')];
    const btn = el.querySelector('[data-fx-part="start"]');
    if (!reels.length) return;
    const SETS = 5, REST = 1, SPIN = 3;
    const values = String(options.values || "").split(",").map((s) => s.trim()).filter(Boolean);
    const cur = String(options.init || "0".repeat(reels.length)).padStart(reels.length, "0").slice(-reels.length).split("").map(Number);
    const strips = reels.map((reel) => {
      const strip = document.createElement("div");
      strip.setAttribute("data-fx-part", "strip");
      for (let k = 0; k < SETS * 10; k++) {
        const cell = document.createElement("span");
        cell.setAttribute("data-fx-part", "cell");
        cell.textContent = String(k % 10);
        strip.append(cell);
      }
      reel.append(strip);
      return strip;
    });
    const h = (reel) => reel.offsetHeight || 1;
    const rest = () => reels.forEach((reel, i) => {
      strips[i].querySelectorAll('[data-fx-part="cell"]').forEach((c) => (c.style.height = `${h(reel)}px`));
      strips[i].style.transition = "none";
      strips[i].style.transform = `translateY(-${(REST * 10 + cur[i]) * h(reel)}px)`;
    });
    rest();
    const ro = new ResizeObserver(() => { if (!spinning) rest(); });
    ro.observe(el);
    let spinning = false;
    const timers = [];
    const spin = () => {
      if (spinning) return;
      spinning = true;
      if (btn) btn.disabled = true;
      el.classList.add("is-spinning");
      const pick = values.length ? values[Math.floor(Math.random() * values.length)] : String(Math.floor(Math.random() * 10 ** reels.length)).padStart(reels.length, "0");
      const digits = String(pick).padStart(reels.length, "0").slice(-reels.length).split("").map(Number);
      let done = 0;
      const finish = () => {
        if (++done < reels.length) return;
        spinning = false;
        if (btn) btn.disabled = false;
        el.classList.remove("is-spinning");
        el.dispatchEvent(new CustomEvent("fx:result", { bubbles: true, detail: { value: pick } }));
      };
      reels.forEach((reel, i) => {
        const strip = strips[i], ch = h(reel);
        const startY = (REST * 10 + SPIN * 10 + cur[i]) * ch, endY = (REST * 10 + digits[i]) * ch;
        if (reduce) { strip.style.transition = "none"; strip.style.transform = `translateY(-${endY}px)`; cur[i] = digits[i]; finish(); return; }
        timers.push(setTimeout(() => {
          strip.style.transition = "none";
          strip.style.transform = `translateY(-${startY}px)`;
          void strip.offsetHeight;
          strip.style.transition = `transform ${+(options.dur ?? 1300) + i * +(options.each ?? 250)}ms ease-out`;
          strip.style.transform = `translateY(-${endY - Math.round(ch * 0.1)}px)`;
          strip.addEventListener("transitionend", () => {
            strip.style.transition = "transform 160ms ease-out";
            strip.style.transform = `translateY(-${endY}px)`;
            strip.addEventListener("transitionend", () => { cur[i] = digits[i]; finish(); }, { once: true });
          }, { once: true });
        }, i * +(options.stagger ?? 150)));
      });
    };
    btn?.addEventListener("click", spin);
    el.addEventListener("fx:spin", spin);
    return () => {
      timers.forEach(clearTimeout); ro.disconnect();
      btn?.removeEventListener("click", spin); el.removeEventListener("fx:spin", spin);
      strips.forEach((s) => s.remove());
    };
  });
})();
