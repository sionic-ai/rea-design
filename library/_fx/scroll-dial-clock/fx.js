(() => {
  kfFx.register("scroll-dial-clock", (el, { options, reduce, scroller }) => {
    const start = +(options.value ?? 26), N = Math.max(12, +options.ticks || 221), from = +(options.start ?? 0.75);
    const body = el.querySelector('[data-fx-part="body"]');
    const stage = document.createElement("div"); stage.className = "fx-sdc__stage";
    const sticky = document.createElement("div"); sticky.className = "fx-sdc__sticky";
    const pad = String(start).length;
    sticky.innerHTML = `<div class="fx-sdc__dial"><svg class="fx-sdc__ring" viewBox="0 0 100 100"><circle class="fx-sdc__circle" cx="50" cy="50" r="49" pathLength="1" stroke-dasharray="1.001" stroke-dashoffset="1" transform="rotate(90 50 50)"/><path class="fx-sdc__ticks"/></svg>
      <div class="fx-sdc__digits">${String(start).split("").map((d) => `<svg viewBox="0 0 66 88" overflow="visible"><text class="fx-sdc__digit" x="33" y="80" text-anchor="middle">${d}</text></svg>`).join("")}</div>
      <div class="fx-sdc__hand"><svg viewBox="0 0 100 100"><rect x="48.6" y="12.5" width="2.8" height="50" rx="1.4"/><circle cx="50" cy="50" r="4.6"/></svg></div></div>`;
    stage.appendChild(sticky); el.prepend(stage);
    if (body) sticky.appendChild(body);
    const dial = sticky.querySelector(".fx-sdc__dial"), circle = sticky.querySelector(".fx-sdc__circle"), ticks = sticky.querySelector(".fx-sdc__ticks");
    const digitsBox = sticky.querySelector(".fx-sdc__digits"), digits = [...sticky.querySelectorAll(".fx-sdc__digit")], hand = sticky.querySelector(".fx-sdc__hand svg");
    const half = Math.floor(N / 2), IN = 49 * 0.9655, OUT = 49 * 0.976, SPAN = 3.5;
    const marks = Array.from({ length: N }, (_, e) => { const t = (e / N) * Math.PI * 2; return { o: (e - half + N) % N, ox: 50 + OUT * Math.sin(t), oy: 50 - OUT * Math.cos(t), ix: 50 + IN * Math.sin(t), iy: 50 - IN * Math.cos(t) }; });
    const path = (y) => { const e = y * (N - 1 + SPAN); let d = ""; for (const m of marks) { if (m.o >= e) continue; const k = Math.min((e - m.o) / SPAN, 1); d += `M${m.ox.toFixed(2)} ${m.oy.toFixed(2)}L${(m.ox + (m.ix - m.ox) * k).toFixed(2)} ${(m.oy + (m.iy - m.oy) * k).toFixed(2)}`; } return d; };
    const scr = scroller || window;
    const scrollTop = () => (scroller ? scroller.scrollTop : scrollY);
    const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
    let z = 0, filled = false, filledAt = 0, value = start, lastY = -1;
    const update = () => {
      const m = viewH(), S = scrollTop(), g = dial.offsetHeight;
      const top = stage.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) + S;
      const span = stage.offsetHeight - m;
      z = reduce ? 1 : Math.min(Math.max((S - top) / Math.max(span, 1), 0), 1);
      const Nn = Math.max(2, (m * 2.5) / Math.max(g, 1)), X = (m - g) / (2 * m);
      const H = m * (1.5 - (1.5 - X) * z), j = Nn - (Nn - 1) * z, Y = 0.25 + 0.75 * z, k = g * j, vis = H > -k && H < m + k;
      dial.style.transform = `translate(-50%, ${H}px) scale(${j})`; dial.style.visibility = vis ? "visible" : "hidden";
      if (Y !== lastY) { lastY = Y; circle.setAttribute("stroke-dashoffset", String(1 - Y)); ticks.setAttribute("d", path(Y)); }
      const A = Math.min(Math.max((Y - from) / (1 - from), 0), 1);
      if (A >= 1 && !filled) { filled = true; filledAt = performance.now(); digitsBox.classList.add("is-filled"); }
      if (!filled) digits.forEach((d) => (d.style.strokeDashoffset = String(720 * (1 - A))));
      sticky.style.setProperty("--fx-body-y", `${H + k * 0.78}px`); sticky.style.setProperty("--fx-body-vis", vis ? "visible" : "hidden");
    };
    let ang = 180, vel = 0, raf = 0;
    const tick = (now) => {
      let target;
      if (filled) {
        const k = Math.floor((now - filledAt) / 1000) % (start + 1), v = start - k;
        if (v !== value) { value = v; const s = String(v).padStart(pad, "0"); digits.forEach((d, i) => (d.textContent = s[i])); }
        target = 360 + (360 * k) / Math.max(start, 1);
      } else target = 180 + 180 * z;
      let d = target - ang; d -= Math.round(d / 360) * 360;
      if (reduce) ang = target; else { vel += d * 0.26; vel *= 0.32; ang += vel; }
      hand.style.transform = `rotate(${ang}deg)`;
      raf = requestAnimationFrame(tick);
    };
    scr.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    const ro = new ResizeObserver(update); ro.observe(stage);
    update(); raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); scr.removeEventListener("scroll", update); removeEventListener("resize", update); ro.disconnect();
      if (body) el.appendChild(body);
      stage.remove();
    };
  });
})();
