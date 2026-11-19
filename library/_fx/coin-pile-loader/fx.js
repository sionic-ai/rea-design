(() => {
  // If the dummy panel is empty, lay out twenty coins (four rows of five, each coin with slightly different tilt · depth · spin angle), and on fx:hide fill hold (ms) then lift the curtain.
  // The reveal follows css opacity .5s (.12s late) — fires fx:lift when it starts lifting and fx:done when fully lifted, then hides.
  const SPIN = [-160, -89, -18, 53, 124, -117, -46, 25, 96, 167, -74, -3, 68, 139, -150, -31, 40, 111, -102, 182];
  const TILT = [-5, 0, 5, -1, 4, -3, 2, -4, 3, 0, 4, -2, -5, 1, 3, -1, 5, -3, 2, -4];
  const Z = [14, -6, 18, -10, 6];
  const flat = '<svg class="fx-cpl-flat" viewBox="0 0 46 46" aria-hidden="true"><circle class="fx-cpl-face" cx="23" cy="23" r="20"/><circle class="fx-cpl-mark" cx="23" cy="23" r="12"/></svg>';
  const solid = '<svg class="fx-cpl-solid" viewBox="0 0 46 46" aria-hidden="true"><path class="fx-cpl-face" d="M3 23v8c0 4.4 9 8 20 8s20-3.6 20-8v-8"/><ellipse class="fx-cpl-face" cx="23" cy="23" rx="20" ry="8"/><ellipse class="fx-cpl-mark" cx="23" cy="23" rx="11" ry="4.2"/></svg>';
  kfFx.register("coin-pile-loader", (el, { options }) => {
    const pile = el.querySelector('[data-fx-part="pile"]');
    let made = false;
    if (pile && !pile.children.length) {
      made = true;
      pile.innerHTML = Array.from({ length: 20 }, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        return `<span data-fx-part="coin" style="--x:${(col - 2) * 47}px; --h:${row}; --z:${Z[col]}px; --spin:${SPIN[i]}deg; --tilt:${TILT[i]}deg; --d:${(i * 0.13).toFixed(2)}s">${flat}${solid}</span>`;
      }).join("");
    }
    const hold = +(options.hold ?? 0), born = performance.now();
    let t1 = 0, t2 = 0;
    const hide = () => {
      clearTimeout(t1);
      t1 = setTimeout(() => {
        el.classList.add("is-done");
        el.dispatchEvent(new CustomEvent("fx:lift", { bubbles: true }));
        const fade = parseFloat(getComputedStyle(el).transitionDuration) + parseFloat(getComputedStyle(el).transitionDelay);
        t2 = setTimeout(() => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); }, (fade || 0) * 1000 + 20);
      }, Math.max(0, hold - (performance.now() - born)));
    };
    el.addEventListener("fx:hide", hide, { once: true });
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      el.removeEventListener("fx:hide", hide);
      el.classList.remove("is-done");
      if (made) pile.innerHTML = "";
    };
  });
})();
