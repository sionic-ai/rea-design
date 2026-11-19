(() => {
  // Selection pill (month/year · type select) — the pill’s leading end reaches the pressed button first in .35s, and the trailing end follows .05s later in .55s
  // While crossing, the pill stretches long then shrinks back (both power3.out). Snaps immediately on first position·window resize. On pick fires fx:pick (button).
  kfFx.register("lead-trail-pill", (el, { options, reduce }) => {
    const btns = [...el.querySelectorAll('[data-fx-part="option"]')];
    if (!btns.length) return;
    const lead = +(options.lead ?? 0.35), trail = +(options.trail ?? 0.55), lag = +(options.lag ?? 0.05);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power3.out");
    let pill = el.querySelector('[data-fx-part="pill"]'), made = false;
    if (!pill) { pill = document.createElement("i"); pill.className = "fx-lead-trail-pill__pill"; pill.setAttribute("aria-hidden", "true"); el.prepend(pill); made = true; }
    const st = { l: 0, r: 0 };
    const draw = () => { pill.style.left = `${st.l}px`; pill.style.width = `${Math.max(0, st.r - st.l)}px`; };
    let on = btns.find((b) => b.getAttribute("aria-pressed") === "true") || btns[0];
    const place = (b, instant) => {
      const L = b.offsetLeft, R = L + b.offsetWidth, right = L > st.l;
      gsap.killTweensOf(st);
      if (instant || reduce) { st.l = L; st.r = R; draw(); return; }
      gsap.to(st, { [right ? "r" : "l"]: right ? R : L, duration: lead, ease, onUpdate: draw });
      gsap.to(st, { [right ? "l" : "r"]: right ? L : R, duration: trail, delay: lag, ease, onUpdate: draw });
    };
    const pick = (b) => { on = b; btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b))); place(b); el.dispatchEvent(new CustomEvent("fx:pick", { bubbles: true, detail: { index: btns.indexOf(b) } })); };
    const handlers = btns.map((b) => { const h = () => pick(b); b.addEventListener("click", h); return h; });
    btns.forEach((x) => x.setAttribute("aria-pressed", String(x === on)));
    const ro = new ResizeObserver(() => place(on, true)); ro.observe(el);
    place(on, true);
    return () => { ro.disconnect(); gsap.killTweensOf(st); btns.forEach((b, i) => b.removeEventListener("click", handlers[i])); if (made) pill.remove(); };
  });
})();
