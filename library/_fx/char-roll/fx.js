// Split the text to roll into two sets. Only one set of the original text is left for readers, and on detach the original text is restored
(() => {
  kfFx.register("char-roll", (el, { options, hover }) => {
    const host = el.querySelector('[data-fx-part="text"]') || el;
    const text = host.textContent.trim();
    if (!text) return;
    const saved = [...host.childNodes];
    const set = [];
    const put = (k, v) => { el.style.setProperty(k, v); set.push(k); };
    if (options.stagger) put("--fx-stagger", options.stagger + "s");
    if (options.dur) put("--fx-dur", options.dur + "s");
    if (options.ease) put("--fx-ease", `cubic-bezier(${options.ease})`);
    // out — duration on leaving (seconds), back: end — on leaving, letters revert starting from the last letter (henrietta: enter .5s from the front · leave .4s from the end)
    if (options.out != null) put("--fx-out", +options.out + "s");
    // outease — leaving curve (Brand menu: enter .62s 0.16,1,0.3,1 · leave .5s power3.out 0.215,0.61,0.355,1)
    if (options.outease) put("--fx-out-ease", `cubic-bezier(${options.outease})`);
    if (options.tone === "dim") el.classList.add("fx-roll-dim");
    // dir: down — the second set hides above and drops down one line (f-brand-st: stagger 0 · .4s · 0.43,0.05,0.17,1)
    if (options.dir === "down") el.classList.add("fx-roll-down");
    // by: word — delay per word instead of per letter. Spaces attach to the end of the previous word (the line is flex so blank text between words disappears). Brand button: words .02s apart · .2s
    const units = options.by === "word" ? text.match(/\S+\s*/g) || [text] : [...text];
    // space: skip — spaces take no stagger slot (the original where GSAP splits only the letters and assigns the order — Brand menu)
    const skip = options.space === "skip";
    const order = [];
    units.reduce((k, c) => { const blank = skip && /^\s+$/.test(c); order.push(k); return blank ? k : k + 1; }, 0);
    const last = order.length ? order[order.length - 1] : 0;
    const row = () => {
      const s = document.createElement("span");
      units.forEach((c, i) => {
        const ch = document.createElement("span");
        ch.className = "fx-ch";
        ch.style.setProperty("--i", order[i]);
        if (options.back === "end") ch.style.setProperty("--j", last - order[i]);
        ch.textContent = c;
        s.append(ch);
      });
      return s;
    };
    const roll = document.createElement("span");
    roll.className = "fx-roll";
    roll.setAttribute("aria-hidden", "true");
    roll.append(row(), row());
    const sr = document.createElement("span");
    sr.className = "fx-sr";
    sr.textContent = text;
    host.replaceChildren(roll, sr);
    // mode: once — each time a hand is raised, it rolls once per word and the second set rises, then returns to place (does not roll back when leaving)
    const off = [];
    // mode: hold — on hover it runs the entry (hold seconds) to the end before accepting the exit, and on leave snaps back with no curve. If hovered again meanwhile it continues lifting (Brand)
    if (options.mode === "hold") {
      el.classList.add("fx-roll-hold");
      const hold = +(options.hold ?? 0.8) * 1000;
      let over = false, busy = false;
      const enter = () => { busy = true; el.classList.add("fx-roll-on"); setTimeout(() => { busy = false; if (!over) leave(); }, hold); };
      const leave = () => { busy = true; el.classList.remove("fx-roll-on"); setTimeout(() => { busy = false; if (over) enter(); }, hold); };
      const on = () => { over = true; if (hover && !busy) enter(); };
      const out = () => { over = false; if (hover && !busy) leave(); };
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", out);
      off.push(() => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", out); el.classList.remove("fx-roll-hold", "fx-roll-on"); });
    }
    if (options.tone === "ink") el.classList.add("fx-roll-ink");
    // tone: under — the first layer inherits the color, only the second layer rising from below uses --kf-dim (a gray copy of the original’s drop-shadow)
    if (options.tone === "under") el.classList.add("fx-roll-under");
    // drip — drops line by line. The first copy stretches vertically (blur · blood-stain shadow) and falls out below, then the same letters drop in from above and sit (original: .85s stretch + .6s pulled back then driven down curve) · if up, reversed upward
    if (options.drip) el.classList.add("fx-roll-drip", options.drip === "up" ? "fx-roll-drip-up" : "fx-roll-drip-down");
    // skew — rolls by whole line rather than by character, the first set folds out around the bottom right by skewY and exits, the second set rises still skewed around the bottom left and straightens (century: 32° · .6s ease)
    if (options.skew != null) { el.classList.add("fx-roll-skew"); put("--fx-skew", +options.skew + "deg"); }
    // gap — gap between the two copies. A number is px, with a unit it is used as is (Brand uses .4167vw)
    if (options.gap != null) put("--fx-gap", /[a-z%]$/.test(options.gap) ? options.gap : +options.gap + "px");
    // lag — in mode: hold, the extra wait in seconds before the first letter starts. For when the original starts each letter at (i+1) × delay, one step late from the first letter (brand .05)
    if (options.lag != null) put("--fx-lag", +options.lag + "s");
    if (options.mode === "once") {
      el.classList.add("fx-roll-once");
      let inside = false, timer = null;
      const frames = options.frames != null ? +options.frames : 2;
      // cut — cuts the roll at that second and snaps back in place. Coming back up before the cut does not roll anew (Brand one-time hover)
      const cut = options.cut != null ? +options.cut * 1000 : 0;
      // Like the original, attach the clone and run it two frames (two rAFs) later — the first frame doesn’t jump
      const go = () => {
        if (inside || !hover) return;
        inside = true;
        if (cut && el.classList.contains("fx-roll-go")) return;
        // frames: 0 — rolls the moment the pointer touches. If it comes back up mid-roll, it does not roll anew (hover indicator of brand linkHoverBottomUp)
        if (frames === 0) { if (!el.classList.contains("fx-roll-go")) el.classList.add("fx-roll-go"); return; }
        el.classList.remove("fx-roll-go");
        const roll = () => {
          if (cut) { clearTimeout(timer); timer = setTimeout(() => el.classList.remove("fx-roll-go"), cut); }
          el.classList.add("fx-roll-go");
        };
        // Rolls after skipping this many frames (default 2, like the original’s two rAFs)
        const wait = (n) => (n > 0 ? requestAnimationFrame(() => wait(n - 1)) : roll());
        wait(frames);
      };
      const leave = () => (inside = false);
      // lead — only the first batch moves up and blurs out over lead seconds while the second batch rises in dur (Brand: first .6s · second .4s). Settles in place once the longer one ends
      const lead = options.lead != null ? +options.lead : null;
      if (lead != null) {
        el.classList.add("fx-roll-lead");
        put("--fx-lead", lead + "s");
        if (options["lead-ease"]) put("--fx-lead-ease", `cubic-bezier(${options["lead-ease"]})`);
      }
      const last = lead != null && lead > +(options.dur ?? 0.3) ? "fx-roll-lead" : "fx-roll-once";
      const done = (e) => { if (e.animationName === last) el.classList.remove("fx-roll-go"); };
      el.addEventListener("pointerenter", go);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("animationend", done);
      off.push(() => { clearTimeout(timer); el.removeEventListener("pointerenter", go); el.removeEventListener("pointerleave", leave); el.removeEventListener("animationend", done); });
    }
    return () => { off.forEach((f) => f()); host.replaceChildren(...saved); el.classList.remove("fx-roll-dim", "fx-roll-down", "fx-roll-ink", "fx-roll-once", "fx-roll-go", "fx-roll-skew", "fx-roll-lead", "fx-roll-drip", "fx-roll-drip-up", "fx-roll-drip-down"); set.forEach((k) => el.style.removeProperty(k)); };
  });
})();
