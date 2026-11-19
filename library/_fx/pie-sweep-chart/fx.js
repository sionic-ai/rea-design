(() => {
  // The original rebuilds a Chart.js pie chart each time (destroy → new) and draws it clockwise from the top over 2s easeOutQuart.
  // The panel also shrinks from 1.2x to its normal size over 1.6s, giving a feeling of being drawn while approaching. The logo side keeps only two pieces and changes their ratio every few seconds.
  const PICKS = [[9, 1], [8, 2], [7, 3], [6, 4], [5, 5], [4, 6], [3, 7], [2, 8], [1, 9]];

  const rgba = (() => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    return (css) => {
      c.clearRect(0, 0, 1, 1);
      c.fillStyle = "transparent";
      c.fillStyle = css;
      c.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    };
  })();
  const readColor = (el, name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    el.appendChild(probe);
    const v = getComputedStyle(probe).color;
    probe.remove();
    return rgba(v);
  };
  // Two patterns — 3 is a faint grid (faint color with tight dot spacing), 4 is round dots on the background (original logo pattern). Size follows the screen scale
  const pattern = (ctx, kind, ink, paper, scale) => {
    const dpr = window.devicePixelRatio || 1, s = Math.max(1, scale) * dpr;
    const t = document.createElement("canvas"), g = t.getContext("2d");
    if (kind === "grid") {
      t.width = t.height = Math.round(3 * s);
      g.fillStyle = paper; g.fillRect(0, 0, t.width, t.height);
      g.fillStyle = ink; g.globalAlpha = 0.55;
      g.fillRect(0, 0, Math.max(1, Math.round(s)), Math.max(1, Math.round(s)));
      g.fillRect(Math.round(1.5 * s), Math.round(1.5 * s), Math.max(1, Math.round(s)), Math.max(1, Math.round(s)));
    } else {
      t.width = t.height = Math.round(6 * s);
      g.fillStyle = paper; g.fillRect(0, 0, t.width, t.height);
      g.fillStyle = ink; g.beginPath(); g.arc(t.width / 2, t.height / 2, 1.25 * s, 0, Math.PI * 2); g.fill();
    }
    const p = ctx.createPattern(t, "repeat");
    p.setTransform?.(new DOMMatrix().scale(1 / dpr));
    return p;
  };

  kfFx.register("pie-sweep-chart", (el, { options, reduce, scroller }) => {
    const Chart = window.Chart;
    if (!Chart) return;
    const values = (options.data || "").split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n));
    const shuffle = options.shuffle === "on";
    if (!values.length && !shuffle) return;
    const slots = (options.colors || (shuffle ? "4 5" : "1 2 3 4 5 6 7")).split(/\s+/).map((n) => Math.min(7, Math.max(1, +n || 1)));
    const dur = +(options.dur ?? 2) * 1000;
    const grow = +(options.grow ?? 1.2), growOn = options["grow-on"] || "width", size = +(options.size ?? 100);
    const growDur = +(options["grow-dur"] ?? 1.6);
    const labels = options.labels !== "off" && !shuffle, labelMin = +(options["label-min"] ?? 3);
    const start = options.start || "view";
    let canvas = el.querySelector(':scope > canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    const ctx = canvas.getContext("2d");
    let chart = null, growTween = null, labelTimer = 0, shuffleTimer = 0, firstTimer = 0, st = null, io = null;
    const made = [];

    const colors = () => {
      const paper = readColor(el, "--fx-pie-5");
      const scale = el.clientWidth / 300;
      return slots.map((n) => {
        const c = readColor(el, `--fx-pie-${n}`);
        if (n === 3) return pattern(ctx, "grid", c, paper, scale);
        if (n === 4) return pattern(ctx, "dots", c, paper, scale);
        return c;
      });
    };

    const placeLabels = (data) => {
      el.querySelectorAll(':scope > [data-fx-part="label"][data-made]').forEach((n) => n.remove());
      if (!labels) return;
      const total = data.reduce((a, b) => a + b, 0) || 1;
      let acc = 0;
      data.forEach((v, k) => {
        const mid = ((acc + v / 2) / total) * Math.PI * 2 - Math.PI / 2;
        acc += v;
        if (v < labelMin) return;
        const span = document.createElement("span");
        span.setAttribute("data-fx-part", "label");
        span.dataset.made = "";
        if (slots[k] === 1) span.dataset.on = "accent";
        const r = 0.49 * 0.6;
        span.style.left = (50 + Math.cos(mid) * r * 100) + "%";
        span.style.top = (50 + Math.sin(mid) * r * 100) + "%";
        span.textContent = Math.round((v / total) * 100) + "%";
        el.appendChild(span);
        made.push(span);
      });
    };

    const make = (data, animate) => {
      chart?.destroy();
      chart = new Chart(canvas, {
        type: "pie",
        data: { datasets: [{ data, backgroundColor: colors(), borderColor: readColor(el, "--fx-pie-line"), borderWidth: 1, radius: "98%" }] },
        options: {
          events: [],
          responsive: true,
          maintainAspectRatio: true,
          plugins: { tooltip: { enabled: false }, legend: { display: false } },
          animation: animate && !reduce ? { duration: dur, easing: "easeOutQuart" } : false,
        },
      });
    };

    const draw = () => {
      clearTimeout(labelTimer);
      el.querySelectorAll(':scope > [data-fx-part="label"]').forEach((n) => n.classList.remove("is-shown"));
      make(values, true);
      placeLabels(values);
      if (!reduce && grow !== 1) {
        growTween?.kill();
        growTween = gsap.fromTo(el, { [growOn]: size * grow + "%" }, { [growOn]: size + "%", duration: growDur, delay: 0.1, ease: "power2.out" });
      }
      const show = () => el.querySelectorAll(':scope > [data-fx-part="label"]').forEach((n) => n.classList.add("is-shown"));
      if (reduce) show(); else labelTimer = setTimeout(show, dur * 0.4);
    };
    const clear = () => {
      clearTimeout(labelTimer);
      el.querySelectorAll(':scope > [data-fx-part="label"]').forEach((n) => n.classList.remove("is-shown"));
    };

    const spin = () => {
      const next = () => {
        const pick = PICKS[Math.floor(Math.random() * PICKS.length)];
        chart.data.datasets[0].data = pick;
        chart.options.animation = { duration: 1800, easing: "easeOutQuart" };
        chart.update();
        shuffleTimer = setTimeout(next, 2000 + 3000 * Math.random());
      };
      shuffleTimer = setTimeout(next, 2000 + 3000 * Math.random());
    };
    const startShuffle = () => {
      make([0, 10], false);
      if (reduce) { chart.data.datasets[0].data = [8, 2]; chart.update("none"); return; }
      firstTimer = setTimeout(() => {
        chart.data.datasets[0].data = [8, 2];
        chart.options.animation = { duration: 2000, easing: "easeOutQuart" };
        chart.update();
        if (options.loop !== "off") spin();
      }, +(options.delay ?? 1.4) * 1000);
    };

    const onDraw = () => (shuffle ? startShuffle() : draw());
    el.addEventListener("fx:draw", onDraw);
    el.addEventListener("fx:clear", clear);

    if (shuffle) {
      if (start !== "wait") startShuffle();
    } else if (start === "load" || reduce) {
      draw();
    } else if (start === "view") {
      if (window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, scroller, onEnter: draw });
      else { io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); draw(); } }); io.observe(el); }
    }

    return () => {
      clearTimeout(labelTimer); clearTimeout(shuffleTimer); clearTimeout(firstTimer);
      st?.kill(); io?.disconnect(); growTween?.kill();
      chart?.destroy();
      el.removeEventListener("fx:draw", onDraw);
      el.removeEventListener("fx:clear", clear);
      made.forEach((n) => n.remove());
      if (madeCanvas) canvas.remove();
      gsap.set(el, { clearProps: growOn });
    };
  });
})();
