// Spins only one turn on enter — re-hovering while spinning doesn’t overlap, and the next turn needs leaving and re-entering. When done the mark is removed and it returns to its start position
(() => {
  kfFx.register("link-swap-hover", (el, { options, reduce }) => {
    const labels = [...el.querySelectorAll('[data-fx-part="label"]')];
    if (!labels.length && el.textContent.trim()) labels.push(el);
    const icon = el.querySelector('[data-fx-part="icon"]');
    const saved = labels.map((l) => [l, [...l.childNodes]]);
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.dur != null) put("--fx-dur", +options.dur + "s");
    if (options.line != null) put("--fx-line", +options.line + "s");
    if (options.lag != null) put("--fx-lag", +options.lag + "s");
    if (options.ease) put("--fx-ease", `cubic-bezier(${options.ease})`);
    // out·out-ease — only the leaving text (first batch) gets its own length·curve, shift — distance for leaving and entering (%), look: solid — entering text does not fade, it only slides up (knot: leave .6s expo.inOut · enter .4s · 105%)
    if (options.out != null) put("--fx-out", +options.out + "s");
    if (options["out-ease"]) put("--fx-out-ease", `cubic-bezier(${options["out-ease"]})`);
    if (options.shift != null) put("--fx-shift", +options.shift + "%");
    // rest — the resting position (%) of the rising text. If farther than shift, it jumps up to shift the moment of hover and then rises (knot: rests at 150%, rises from 105%)
    if (options.rest != null) put("--fx-rest", +options.rest + "%");
    const made = [];
    labels.forEach((l) => {
      const text = l.textContent.trim();
      if (!text) return;
      const box = document.createElement("span");
      box.className = "fx-lsh";
      box.setAttribute("aria-hidden", "true");
      const a = document.createElement("span"), b = document.createElement("span");
      a.textContent = b.textContent = text;
      box.append(a, b);
      const sr = document.createElement("span");
      sr.className = "fx-sr";
      sr.textContent = text;
      l.replaceChildren(box, sr);
    });
    const svg = icon && icon.querySelector("svg");
    if (svg && icon.querySelectorAll("svg").length === 1) { const twin = svg.cloneNode(true); icon.append(twin); made.push(twin); }
    // Like the original, when the next text has fully risen (or, with no text, when the new arrow has fully entered) go back to the start — a late-starting arrow is cut off there
    const slowOut = options.out != null && +options.out > +(options.dur ?? 0.8);
    const last = (slowOut && el.querySelector(".fx-lsh > span:first-child")) || el.querySelector(".fx-lsh > span + span") || (icon && icon.querySelector("svg + svg")) || el.querySelector('[data-fx-part="line"]');
    let away = !el.matches(":hover");
    // keep: 1 — Stays at the spot where it ended (second row still visible), and the next time interaction starts it spins again from the beginning (the original fromTo as is)
    const keep = options.keep === "1";
    const run = () => {
      if (reduce) return;
      if (keep && el.classList.contains("fx-lsh-on")) { el.classList.remove("fx-lsh-on"); void el.offsetWidth; }
      if (!el.classList.contains("fx-lsh-on")) el.classList.add("fx-lsh-on");
    };
    const enter = () => { if (!away) return; away = false; run(); };
    const leave = () => { away = true; };
    const focus = () => run();
    const end = (e) => { if (!keep && (!last || e.target === last)) el.classList.remove("fx-lsh-on"); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    // focus: off — doesn’t spin on focus (including pressing). For when the original spins only on mouseenter (Brand home)
    if (options.focus !== "off") el.addEventListener("focusin", focus);
    el.addEventListener("animationend", end);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("focusin", focus);
      el.removeEventListener("animationend", end);
      el.classList.remove("fx-lsh-on");
      saved.forEach(([l, nodes]) => l.replaceChildren(...nodes));
      made.forEach((n) => n.remove());
      set.forEach((k) => el.style.removeProperty(k));
    };
  });
})();
