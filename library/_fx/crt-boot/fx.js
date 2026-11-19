// CRT boot — turns on lines at each interval and types the command (data-key or text) at 40–90ms per character, then ready (is-fx-ready). On click or Enter · Space (or after auto seconds)
// Flashes, folds up and switches off (is-fx-off, dur), then fires fx:booted after .32s.
// look: beam — instead of folding, a light line moves down 8 steps (30fps) from top to bottom, erasing the screen where it has passed. With a bar, it fills as far as the lit lines,
// Turn on the last line after the fonts have fully loaded. A press before ready turns on the remaining lines at once (skip), and a press within guard seconds right after ready is dropped.
// When type is given, each line prints its characters at that interval in seconds (min .08s per line, BIOS boot style), and blink words inside a line blink five times at .1s after everything is printed.
// look: fade — no flash or fold, the screen disappears over dur (.35s) power2.out and the panel disappears .25s later
(() => {
  kfFx.register("crt-boot", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')], cmd = el.querySelector('[data-fx-part="cmd"]');
    const bar = el.querySelector('[data-fx-part="bar"]'), go = el.querySelector('[data-fx-part="go"]'), screen = el.querySelector('[data-fx-part="screen"]');
    const each = +(options.each ?? 0.16) * 1000, auto = +(options.auto ?? 0), text = cmd ? (cmd.dataset.key || cmd.textContent) : "";
    const beam = options.look === "beam", anyKey = options.keys === "any", guard = +(options.guard ?? (beam ? 0.35 : 0)) * 1000;
    const goText = go?.textContent ?? "";
    const type = +(options.type ?? 0), gap = type > 0 && options.each == null ? 60 : each, typed = [];
    const caret = document.createElement("i");
    caret.className = "fx-crt-caret";
    caret.setAttribute("aria-hidden", "true");
    const typeLine = async (l) => {
      const nodes = [];
      const walk = (n) => n.childNodes.forEach((c) => (c.nodeType === 3 ? nodes.push([c, c.textContent]) : c !== caret && walk(c)));
      walk(l);
      const total = nodes.reduce((s, [, t]) => s + t.length, 0);
      l.append(caret);
      if (!total) return;
      nodes.forEach((n) => { typed.push(n); n[0].textContent = ""; });
      const per = Math.max(80, type * 1000 * total) / total;
      for (const [n, t] of nodes) for (let j = 1; j <= t.length; j++) {
        if (!alive || el.classList.contains("is-fx-ready")) return;
        n.textContent = t.slice(0, j);
        await wait(per);
      }
      const blinks = [...l.querySelectorAll('[data-fx-part="blink"]')];
      for (let r = 0; r < 10 && blinks.length; r++) {
        if (!alive || el.classList.contains("is-fx-ready")) break;
        blinks.forEach((b) => { b.style.opacity = r % 2 ? "" : "0"; });
        await wait(100);
      }
      blinks.forEach((b) => { b.style.opacity = ""; });
    };
    const untype = () => { typed.forEach(([n, t]) => { n.textContent = t; }); typed.length = 0; };
    if (options.dur != null) el.style.setProperty("--fx-dur", `${+options.dur}s`);
    let alive = true, timers = [], shown = 0, readyAt = 0, leaving = false;
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, reduce ? 0 : ms)));
    const fill = () => { if (bar) bar.style.width = `${Math.min(1, shown / Math.max(1, lines.length)) * 100}%`; };
    const done = () => { el.classList.add("is-fx-off"); el.dispatchEvent(new CustomEvent("fx:booted", { bubbles: true })); };
    const sweep = () => {
      const target = screen || el, line = document.createElement("i");
      line.className = "fx-crt-beam";
      line.setAttribute("aria-hidden", "true");
      el.append(line);
      const box = el.getBoundingClientRect(), r = target.getBoundingClientRect();
      let n = 0;
      const stepIt = () => {
        if (!alive) return;
        n++;
        line.style.top = `${(n / 8) * 100}%`;
        const cut = Math.max(0, Math.min(1, (box.top + (n / 8) * box.height - r.top) / Math.max(1, r.height)));
        target.style.clipPath = `inset(${cut * 100}% 0 0 0)`;
        if (n < 8) timers.push(setTimeout(stepIt, 1000 / 30));
        else { line.remove(); done(); }
      };
      stepIt();
    };
    const off = () => {
      if (!alive || leaving) return;
      leaving = true;
      if (beam && !reduce) { sweep(); return; }
      el.classList.add("is-fx-off");
      timers.push(setTimeout(() => el.dispatchEvent(new CustomEvent("fx:booted", { bubbles: true })), reduce ? 0 : 320));
    };
    const ready = () => {
      if (el.classList.contains("is-fx-ready")) return;
      lines.forEach((l) => l.classList.add("is-fx-on"));
      untype();
      if (type > 0 && lines.length) lines[lines.length - 1].append(caret);
      shown = lines.length; fill();
      if (cmd) cmd.textContent = text;
      if (go?.dataset.ready) go.textContent = go.dataset.ready;
      el.classList.add("is-fx-ready");
      readyAt = performance.now();
      if (auto > 0) timers.push(setTimeout(off, auto * 1000));
    };
    const press = () => {
      if (!el.classList.contains("is-fx-ready")) { if (options.skip ? options.skip !== "off" : beam) ready(); return; }
      if (performance.now() - readyAt < guard) return;
      off();
    };
    const onKey = (e) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (anyKey ? !/^(Shift|Tab|Escape)$/.test(e.key) : e.key === "Enter" || e.key === " ") {
        if (e.key === " " || e.key === "Enter") e.preventDefault();
        press();
      }
    };
    const onClick = () => press();
    (async () => {
      if (cmd) cmd.textContent = "";
      fill();
      for (const [i, l] of lines.entries()) {
        if (!alive || el.classList.contains("is-fx-ready")) return;
        if (bar && i === lines.length - 1) await Promise.race([document.fonts?.ready, wait(3500)]);
        l.classList.add("is-fx-on");
        if (type > 0) await typeLine(l);
        if (!alive || el.classList.contains("is-fx-ready")) return;
        shown = i + 1; fill();
        await wait(gap);
      }
      for (let i = 1; cmd && i <= text.length; i++) {
        if (!alive || el.classList.contains("is-fx-ready")) return;
        cmd.textContent = text.slice(0, i);
        el.classList.add("is-fx-key"); timers.push(setTimeout(() => el.classList.remove("is-fx-key"), 90));
        await wait(40 + Math.random() * 50);
      }
      if (alive) ready();
    })();
    addEventListener("keydown", onKey);
    el.addEventListener("click", onClick);
    return () => {
      alive = false; timers.forEach(clearTimeout);
      removeEventListener("keydown", onKey); el.removeEventListener("click", onClick);
      el.classList.remove("is-fx-ready", "is-fx-key", "is-fx-off");
      lines.forEach((l) => l.classList.remove("is-fx-on"));
      untype();
      caret.remove();
      el.querySelectorAll('[data-fx-part="blink"]').forEach((b) => { b.style.opacity = ""; });
      el.querySelector(".fx-crt-beam")?.remove();
      if (screen) screen.style.clipPath = "";
      if (bar) bar.style.width = "";
      if (go) go.textContent = goText;
      if (cmd) cmd.textContent = text;
    };
  });
})();
