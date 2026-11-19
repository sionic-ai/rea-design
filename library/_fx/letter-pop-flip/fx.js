(() => {
  // Hovering makes letters shrink upward one by one and vanish (−75%, 0×), and the same letters bounce up from below and settle (+75%, 0× → in place).
  // A small square marker pops out at the front of the incoming side first to show what is currently pointed at. On release it rewinds along the same path
  const charsOf = (text, role) =>
    [...text].map((c) => `<span data-fx-part="${role}">${c === " " ? "&#32;" : c.replace(/[<&>]/g, (m) => `&#${m.charCodeAt(0)};`)}</span>`).join("");

  kfFx.register("letter-pop-flip", (el, { options, reduce, hover }) => {
    const host = el.querySelector('[data-fx-part="label"]') || el;
    const label = host.textContent.trim();
    if (!label) return;
    const to = options.to || label;
    const original = host.innerHTML;
    const mark = options.mark !== "off";
    host.innerHTML =
      `<span data-fx-part="stage">` +
      `<span data-fx-part="ghost">${(to.length > label.length ? to : label).replace(/[<&>]/g, (m) => `&#${m.charCodeAt(0)};`)}</span>` +
      `<span data-fx-part="out-row">${charsOf(label, "out")}</span>` +
      `<span data-fx-part="in-row">${charsOf(to, "in")}</span>` +
      (mark ? `<span data-fx-part="mark-box"><span data-fx-part="mark"></span></span>` : "") +
      `</span>`;
    const outs = [...host.querySelectorAll('[data-fx-part="out"]')];
    const ins = [...host.querySelectorAll('[data-fx-part="in"]')];
    const markEl = host.querySelector('[data-fx-part="mark"]');
    const undo = () => { gsap.killTweensOf([...outs, ...ins, markEl].filter(Boolean)); host.innerHTML = original; };
    const shown = { yPercent: 0, scale: 1, opacity: 1 };
    const below = { yPercent: 75, scale: 0, opacity: 0 };
    const above = { yPercent: -75, scale: 0, opacity: 0 };
    gsap.set(outs, shown);
    gsap.set(markEl ? [markEl, ...ins] : ins, below);
    // tap: on — on touch devices a tap also spins it as if hovered (the original behavior where mobile browsers fake mouseenter after a tap). Turned off below the tap-from width (px)
    const tap = !reduce && !hover && options.tap === "on" && innerWidth >= +(options["tap-from"] ?? 0);
    if ((reduce || !hover) && !tap) {
      // With no hand or reduced motion, just toggle the display on and off without swapping
      if (markEl && !reduce) {
        const on = () => gsap.set(markEl, shown), off = () => gsap.set(markEl, below);
        el.addEventListener("focus", on); el.addEventListener("blur", off);
        return () => { el.removeEventListener("focus", on); el.removeEventListener("blur", off); undo(); };
      }
      return undo;
    }
    const dur = +(options.dur ?? 0.45), each = +(options.each ?? 0.04), lag = +(options.lag ?? 0.15);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    const tl = gsap.timeline({ paused: true });
    tl.to(outs, { ...above, duration: dur, ease, stagger: each }, 0);
    tl.to(markEl ? [markEl, ...ins] : ins, { ...shown, duration: dur, ease, stagger: each }, lag);
    if (tap) {
      const play = () => tl.play();
      const away = (e) => { if (!el.contains(e.target)) tl.reverse(); };
      el.addEventListener("click", play);
      document.addEventListener("pointerdown", away);
      return () => { tl.kill(); el.removeEventListener("click", play); document.removeEventListener("pointerdown", away); undo(); };
    }
    // Draw the first scene in the very frame the hand touches — waiting for the next tick starts one or two frames later than the original (right when the mouse enters)
    const on = () => { tl.play(); tl.time(Math.min(tl.duration(), tl.time() + 1 / 240)); };
    const off = () => { tl.reverse(); tl.time(Math.max(0, tl.time() - 1 / 240)); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    return () => {
      tl.kill();
      el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off);
      el.removeEventListener("focus", on); el.removeEventListener("blur", off);
      undo();
    };
  });
})();
