(() => {
  // N works follow the cursor in a line (silhouette), and pressing sends the front one to the shelf (data-fx-part="shelf" flies in a parabolic arc and lands on the bottom line of …)
  // When seated the shelf sways in place (damped cos), and the wheel spins each shelf sideways at a different speed. The words of the text (flow) step aside from the artwork
  kfFx.register("trail-shelf-drop", (el, { options, reduce, hover }) => {
    const srcs = [...el.querySelectorAll("[data-fx-part='item']")];
    const shelves = [...el.querySelectorAll("[data-fx-part='shelf']")];
    if (!srcs.length) return;
    const count = +options.count || 5, sizeU = +options.size || 66, fly = +(options.fly ?? .75) * 1000, push = +(options.push ?? 120);
    const speeds = (options.speeds || "1,-.8,.6").split(",").map(Number);
    let n = innerWidth / 1400;
    const layer = document.createElement("div");
    layer.className = "fx-tsd-layer";
    layer.setAttribute("aria-hidden", "true");
    el.appendChild(layer);
    const make = (k, cls) => {
      const src = srcs[k % srcs.length], d = document.createElement("div");
      d.className = "fx-tsd-item " + cls;
      d.innerHTML = src.innerHTML;
      d.dataset.k = k;
      layer.appendChild(d);
      return d;
    };
    const order = [0, ...srcs.map((_, i) => i).slice(1).sort(() => Math.random() - .5)];
    let next = Math.min(count, order.length);
    const ptr = { x: innerWidth / 2, y: .75 * innerHeight, seen: false, t: 0 };
    const trail = order.slice(0, count).map((k) => ({ el: make(k, "sil"), k, x: ptr.x, y: ptr.y, box: null }));
    const flying = [];
    const kicks = shelves.map(() => []);
    const off = shelves.map(() => 0), goal = shelves.map(() => 0);
    const bends = [];
    const wrap = (x, L) => { const w = 1360 * n, m = 20 * n; return m + (((x - m + L) % w) + w) % w; };
    const wave = (b, x, now) => kicks[b].reduce((sum, k) => {
      const age = (now - k.t0) / 1000, d = x - wrap(k.tx, off[b]), w = 110 * n;
      return sum + 5 * n * Math.exp(-d * d / (w * w)) * Math.exp(-age / .32) * Math.cos(17 * age);
    }, 0);
    const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

    // Text: each word wrapped in a chunk (spaces kept as is)
    const words = [];
    el.querySelectorAll("[data-fx-part='flow']").forEach((f) => {
      const walk = (node) => {
        [...node.childNodes].forEach((c) => {
          if (c.nodeType === 3 && c.textContent.trim()) {
            const frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              const w = document.createElement("span"); w.className = "fx-tsd-word"; w.textContent = part; frag.appendChild(w); words.push({ el: w, push: 0 });
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1) walk(c);
        });
      };
      walk(f);
    });
    // Shelf words also step aside from passing works — the big title word is pushed sideways as a whole
    el.querySelectorAll("[data-fx-part='word']").forEach((w) => words.push({ el: w, push: 0 }));

    const move = (e) => {
      ptr.x = e.clientX; ptr.y = e.clientY;
      if (!ptr.seen) { ptr.seen = true; ptr.t = performance.now(); trail.forEach((o) => { o.x = e.clientX; o.y = e.clientY; }); }
    };
    function spot() {
      const sz = sizeU * n, half = sz / 2;
      const bands = shelves.map((s) => { const r = s.getBoundingClientRect(), wd = s.querySelector("[data-fx-part='word']")?.getBoundingClientRect(); return { bot: r.bottom, word: wd ? [wd.left - 24 * n, wd.right + 24 * n] : [0, 0] }; });
      for (let i = 0; i < 80 && bands.length; i++) {
        const b = Math.random() * bands.length | 0, x = 20 * n + half + Math.random() * (1360 * n - sz);
        if (x + half > bands[b].word[0] && x - half < bands[b].word[1]) continue;
        if (flying.some((f) => f.band === b && f.tx != null && Math.abs((f.dx ?? f.tx) - x) < sz + 14 * n)) continue;
        return { tx: x - off[b], band: b, ty: bands[b].bot - half - 1, size: sz };
      }
      return {};
    }
    const down = (e) => {
      if (e.button || e.target.closest("a, button, input, textarea, select") || !trail.length || !ptr.seen) return;
      const aim = spot();
      if (next < count * order.length) {
        const k = order[next % order.length], last = trail[trail.length - 1] || ptr;
        trail.push({ el: make(k, "sil"), k, x: last.x, y: last.y, box: null });
        next++;
      }
      const head = trail.shift();
      const d = make(head.k, "drop");
      head.el.remove();
      flying.push(Object.assign({ el: d, x: head.x, y: head.y, x0: head.x, y0: head.y, t0: performance.now(), r: 0, vx: 2 * (Math.random() - .5), vy: -3, vr: 4 * (Math.random() - .5) }, aim));
      el.dispatchEvent(new CustomEvent("fx:drop", { bubbles: true }));
    };
    const wheel = (e) => {
      if (!flying.some((f) => f.tx != null) || !shelves.length) return;
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      goal.forEach((_, b) => { goal[b] += .55 * d * (speeds[b % speeds.length] ?? 1); });
    };
    const resize = () => { n = innerWidth / 1400; };

    let raf = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const sz = sizeU * n;
      trail.forEach((o, i) => {
        const lead = i ? trail[i - 1] : ptr, f = i ? .2 : .25;
        o.x += (lead.x - o.x) * f; o.y += (lead.y - o.y) * f;
        const grow = ptr.seen ? 1 - Math.pow(1 - Math.min(1, Math.max(0, (now - ptr.t - 120 * i) / 500)), 3) : 0, lean = .15 * (lead.x - o.x);
        o.el.style.width = o.el.style.height = sz + "px";
        o.el.style.transform = `translate(${(o.x - sz / 2).toFixed(1)}px,${(o.y - sz / 2).toFixed(1)}px) rotate(${lean.toFixed(2)}deg) scale(${grow.toFixed(3)})`;
        o.el.style.opacity = grow > 0 ? 1 : 0;
        o.box = grow > .02 ? { cx: o.x, cy: o.y, S: sz * grow } : null;
      });
      off.forEach((v, b) => { off[b] += .045 * (goal[b] - v); });
      for (let i = flying.length - 1; i >= 0; i--) {
        const o = flying[i];
        if (o.tx != null) {
          const t = Math.min(1, (now - o.t0) / fly), e = 1 - Math.pow(1 - t, 3), r = Math.max(0, (now - o.t0 - fly) / 450);
          const bob = r < 1 ? Math.sin(r * Math.PI * 2) * (1 - r) * 6 * n : 0, cx = wrap(o.tx, off[o.band]);
          o.dx = cx;
          const ang = (cx - innerWidth / 2) / (680 * n) * Math.PI / 2, face = Math.max(0, Math.cos(ang));
          o.x = o.x0 + (cx - o.x0) * e;
          o.y = o.y0 + (o.ty - o.y0) * e - 90 * Math.sin(t * Math.PI) * n - bob;
          o.sz = sz + (o.size - sz) * e;
          o.r = (1 - e) * o.vr * 18;
          o.face = 1 - e + face * e;
          if (t >= 1 && !o.placed) { o.placed = true; kicks[o.band].push({ tx: o.tx, t0: now }); el.dispatchEvent(new CustomEvent("fx:land", { bubbles: true })); }
          if (o.placed) o.y += wave(o.band, cx, now);
        } else { o.vy += .55; o.x += o.vx; o.y += o.vy; o.r += o.vr; o.sz = sz; }
        o.el.style.width = o.el.style.height = o.sz + "px";
        o.el.style.transform = `translate(${(o.x - o.sz / 2).toFixed(1)}px,${(o.y - o.sz / 2).toFixed(1)}px) rotate(${o.r.toFixed(1)}deg)`;
        o.el.style.opacity = o.tx != null ? smooth(o.face ?? 1).toFixed(3) : 1;
        o.box = { cx: o.x, cy: o.y, S: o.sz };
        if (o.tx == null && o.y - sz > innerHeight) { o.el.remove(); flying.splice(i, 1); }
      }
      // Shelf line: only while it wobbles, draw it bent with 160 segments and hide the original line
      shelves.forEach((s, b) => {
        kicks[b] = kicks[b].filter((k) => now - k.t0 < 1300);
        const on = kicks[b].length > 0;
        s.classList.toggle("fx-tsd-bent", on);
        let svg = bends[b];
        if (!svg && on) { svg = bends[b] = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "fx-tsd-bend"); svg.innerHTML = "<path/>"; layer.appendChild(svg); }
        if (!svg) return;
        svg.style.display = on ? "" : "none";
        if (!on) return;
        const r = s.getBoundingClientRect(), x0 = 20 * n, w = 1360 * n, y = r.bottom - .5;
        Object.assign(svg.style, { left: x0 + "px", top: y - 12 + "px", width: w + "px", height: "24px" });
        svg.setAttribute("viewBox", `0 0 ${w.toFixed(1)} 24`);
        let d = "";
        for (let k = 0; k <= 160; k++) { const x = w * k / 160; d += (k ? "L" : "M") + x.toFixed(1) + " " + (12 + wave(b, x0 + x, now)).toFixed(2); }
        svg.firstChild.setAttribute("d", d);
      });
      // Word: when it lands at the same height as the artwork, it steps aside (max push u), by .18 of the remaining amount each frame
      if (words.length) {
        const boxes = [...trail, ...flying].map((o) => o.box).filter(Boolean);
        words.forEach((w) => {
          const r = w.el.getBoundingClientRect(), mx = r.left + r.width / 2 - w.push;
          let want = 0;
          boxes.forEach((b) => {
            if (b.cy + b.S / 2 < r.top - 4 || b.cy - b.S / 2 > r.bottom + 4) return;
            const c = Math.min(r.width / 2, .35 * b.S), reach = b.S / 2 + c + 12 * n, d = mx - b.cx;
            if (Math.abs(d) < reach) { const p = (d > 0 ? 1 : -1) * (reach - Math.abs(d)); if (Math.abs(p) > Math.abs(want)) want = p; }
          });
          want = Math.max(-push * n, Math.min(push * n, want));
          w.push += .18 * (want - w.push);
          w.el.style.transform = Math.abs(w.push) > .05 ? `translateX(${w.push.toFixed(1)}px)` : "";
        });
      }
    }

    if (reduce || !hover) {
      // Devices without hover or with reduced motion: don’t line them up, just seat the works on the shelf once
      trail.forEach((o) => o.el.remove());
      trail.length = 0;
      shelves.forEach((s, b) => {
        const r = s.getBoundingClientRect(), d = make(order[b % order.length], "drop rest"), sz = sizeU * n;
        d.style.width = d.style.height = sz + "px";
        d.style.transform = `translate(${(r.left + r.width * (.2 + .3 * b) - sz / 2).toFixed(1)}px,${(r.bottom - sz - 1).toFixed(1)}px)`;
      });
      return () => layer.remove();
    }
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    addEventListener("wheel", wheel, { passive: false });
    addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      removeEventListener("wheel", wheel);
      removeEventListener("resize", resize);
      words.forEach((w) => { w.el.style.transform = ""; });
      shelves.forEach((s) => s.classList.remove("fx-tsd-bent"));
      layer.remove();
    };
  });
})();
