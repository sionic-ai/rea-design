(() => {
  // Loader styled like model training in a terminal — a loss curve is drawn from the left and descends, each time progress passes another 1/6 an epoch line stacks up as [ OK ] (max 6 lines),
  // While the segment bar fills the stage name changes. When full the enter button shows and pressing it lifts the veil in .45s and fires fx:enter (detail.sound = on|off)
  kfFx.register("train-curve-loader", (el, { options, reduce }) => {
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const line = q("curve"), dot = q("dot"), now = q("now"), log = q("log"), live = q("live"), fill = q("fill"), pct = q("pct"), msg = q("msg"), go = q("go");
    const svg = line?.ownerSVGElement;
    if (!svg || !fill) return;
    const goal = Number(options.dur) || 2.5;
    const steps = Number(options.steps) || 6000;
    const loss = (e) => 0.09 + 2.5 * Math.exp(-3.4 * e) + 0.05 * Math.sin(e * 47) * Math.exp(-2.5 * e);
    const acc = (e) => 0.97 - 0.62 * Math.exp(-3 * e);
    const PH = [[0, "Loading the dataset"], [0.08, "Training"], [0.88, "Evaluating"], [1, "Converged"]];
    const seen = new Set(), pts = [];
    let last = -1, m = 0, prev = performance.now(), raf = 0, timer = 0, done = false;
    const say = (text, t = "OK") => {
      if (!log || seen.has(text)) return;
      seen.add(text);
      const li = document.createElement("li");
      const i = document.createElement("i");
      i.textContent = `[  ${t}  ]`;
      li.append(i, ` ${text}`);
      log.append(li);
      while (log.children.length > 6) log.firstElementChild.remove();
    };
    const paint = () => {
      for (let t = last + 1; t <= Math.floor(m * 120); t++) { pts.push(t / 120); last = t; }
      const w = svg.clientWidth || 300;
      svg.setAttribute("viewBox", `0 0 ${w} 90`);
      line.setAttribute("points", pts.map((e) => `${(e * w).toFixed(1)},${(90 - (loss(e) / 2.6) * 86).toFixed(1)}`).join(" "));
      if (dot) { dot.setAttribute("cx", (m * w).toFixed(1)); dot.setAttribute("cy", (90 - (loss(m) / 2.6) * 86).toFixed(1)); }
      if (now) now.textContent = loss(m).toFixed(3);
      for (let k = 1; k <= 6; k++) if (m >= k / 6) say(`epoch ${k}/6  loss ${loss(k / 6).toFixed(3)}  acc ${acc(k / 6).toFixed(2)}  val ✓`);
      if (live) { const t = performance.now(), tok = 11.4 + 1.6 * Math.sin(t / 310) + 0.6 * Math.sin(t / 97); live.textContent = `step ${Math.round(m * steps)}/${steps} · ${m < 1 ? tok.toFixed(1) : "0.0"}k tok/s · gpu ${m < 1 ? 94 + Math.round(4 * Math.sin(t / 500)) : 0}%`; }
      fill.style.transform = `scaleX(${m})`;
      if (pct) pct.textContent = `${Math.floor(m * 100)}%`;
      if (msg) { const l = PH.filter(([e]) => m >= e).pop()[1]; if (msg.textContent !== l) msg.textContent = l; }
    };
    // Original progress — moves toward the target by at least dt/(length) at a time, following 1−e^(−dt/150) of the remainder. If the caller gives el.dataset.progress (0~1), it goes only up to that value
    const step = (t) => {
      const dt = Math.max(0, Math.min(t - prev, 1000 / 30));
      prev = t;
      const target = el.dataset.progress != null ? Math.min(1, Number(el.dataset.progress)) : 1;
      m = Math.min(target, m + Math.max(dt / (goal * 1000), (target - m) * (1 - Math.exp(-dt / 150)) * (el.dataset.progress != null ? 1 : 0)));
      paint();
      if (m >= 1) { timer = setTimeout(ready, 250); return; }
      raf = requestAnimationFrame(step);
    };
    const ready = () => {
      if (!go) return;
      go.hidden = false;
      el.dispatchEvent(new CustomEvent("fx:ready", { bubbles: true }));
    };
    const pick = (e) => {
      const b = e.target.closest("[data-sound]");
      if (!b || done) return;
      done = true;
      go.hidden = true;
      say("deploying the model", "RUN");
      el.classList.add("is-fx-off");
      el.dispatchEvent(new CustomEvent("fx:enter", { bubbles: true, detail: { sound: b.dataset.sound } }));
    };
    go?.addEventListener("click", pick);
    if (go) go.hidden = true;
    say(options.first || "dataset: 14 shards");
    if (reduce) { m = 1; paint(); ready(); } else raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); go?.removeEventListener("click", pick); el.classList.remove("is-fx-off"); };
  });
})();
