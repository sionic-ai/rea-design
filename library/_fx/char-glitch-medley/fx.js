(() => {
  // Intensity is the --fx-chaos that scroll-chaos-mode writes on html — without that part, the option rate (default 1).
  const rateOf = (o) => {
    const v = document.documentElement.style.getPropertyValue("--fx-chaos");
    const base = v === "" ? 1 : +v;
    if (o.rate !== undefined && o.rate !== "chaos") return +o.rate;
    return base;
  };
  const cl = (t, a, b, lo, hi) => (t <= lo ? a : t >= hi ? b : a + ((t - lo) * (b - a)) / (hi - lo));
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const rad = (d) => (d * Math.PI) / 180;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const hit = (n) => Math.random() * Math.max(2, n) < 1;
  const any = (arr) => arr[(Math.random() * arr.length) | 0];
  const LOOKS = ["block", "blur", "echo", "strike", "wave", "font", "slice", "scale", "wobble", "shadow"];
  const FONTS = 12;
  const INK = "var(--kf-ink)", BG = "var(--kf-bg)";

  const split = (el) => {
    const text = el.textContent;
    el.textContent = "";
    const chars = [];
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { el.append(part); continue; }
      const w = document.createElement("span");
      w.className = "fx-cgm-w";
      for (const ch of part) {
        const c = document.createElement("span");
        c.className = "fx-cgm-c";
        c.textContent = ch;
        w.append(c);
        chars.push(c);
      }
      el.append(w);
    }
    return { text, chars };
  };
  const abs = (tag = "span") => {
    const n = document.createElement(tag);
    n.className = "fx-cgm-abs";
    n.setAttribute("aria-hidden", "true");
    return n;
  };
  // Text split into bands that overlap as shapes (blur, wave, slice) — each band holds the same text and is visible only inside its band
  const strips = (ch, count) => {
    const box = abs();
    box.classList.add("is-box");
    const list = [];
    for (let i = 0; i < count; i++) {
      const con = abs();
      const img = abs();
      img.classList.add("is-img");
      img.textContent = ch.textContent;
      con.append(img);
      box.append(con);
      list.push({ con, img });
    }
    ch.classList.add("is-host");
    ch.append(box);
    return list;
  };

  const builders = {
    block(chars) {
      return chars.filter(() => hit(3)).map((ch) => {
        const txt = document.createElement("span");
        txt.className = "fx-cgm-txt";
        txt.textContent = ch.textContent;
        ch.textContent = "";
        ch.append(txt);
        const bg = abs();
        bg.classList.add("is-fill");
        const h = rnd(0, 360);
        gsap.set(bg, { backgroundColor: `hsl(${h} 100% 50%)`, borderColor: `hsl(${h + 180} 100% 50%)` }); // Not skin: the random color wheel in chaos mode is the content
        ch.classList.add("is-host", "is-clip");
        ch.append(bg);
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1, 2]), every: 2, types: [0, 1, 2] };
        it.draw = (r) => {
          const e = rad(it.c * [3, -5, 4][it.type]);
          gsap.set(bg, {
            scale: mix(0, cl(Math.sin(e), 0, 1, -1, 1), r),
            borderRadius: mix(0, cl(Math.cos(it.type === 2 ? -e : e), 0, 100, -1, 1), r) + "%",
            borderStyle: ["dotted", "double", "dashed"][it.type],
            borderWidth: mix(0, cl(Math.sin(e * 0.88), 0.1, 0.5, -1, 1), r) + "em",
            backgroundColor: it.type === 2 ? "transparent" : `hsl(${h} 100% 50%)`, // Not skin: random color wheel
          });
        };
        return it;
      });
    },
    blur(chars, el) {
      return chars.filter(() => hit(4)).map((ch) => {
        const list = strips(ch, 2);
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1]), every: 3, types: [0, 1], ch };
        it.draw = (r, w) => {
          const e = w * 1.2, i = rad(it.c * 6);
          const blur = mix(0, cl(Math.sin(i), 0, 20, -1, 1), r);
          const s = mix(0, cl(Math.sin(i * -2.87), 0, e * (it.type ? 0.2 : -0.2), -1, 1), r);
          gsap.set(ch, { color: r > 0 ? BG : "" });
          list.forEach((b, o) => {
            const on = it.type ? o % 2 !== 0 : o % 2 === 0;
            gsap.set(b.con, { filter: on ? `blur(${blur}px)` : "none", width: "100%", height: e / 2 + 1, top: (e / 2) * o, color: r > 0 ? INK : "", y: on ? s : 0 });
            gsap.set(b.img, { y: -(e / 2) * o, x: 0 });
          });
        };
        return it;
      });
    },
    echo(chars, el) {
      return chars.filter(() => hit(3)).map((ch) => {
        const txt = document.createElement("span");
        txt.className = "fx-cgm-txt";
        txt.textContent = ch.textContent;
        ch.textContent = "";
        ch.append(txt);
        const minis = [];
        for (let n = 0, k = 4 + ((Math.random() * 5) | 0); n < k; n++) {
          const m = abs();
          m.classList.add("is-mini");
          m.textContent = txt.textContent;
          ch.append(m);
          minis.push(m);
        }
        ch.classList.add("is-host");
        gsap.set(txt, { opacity: 0 });
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1, 2]), every: 2, types: [0, 1, 2] };
        it.draw = (r, w) => {
          const R = (it.fs ||= parseFloat(getComputedStyle(el).fontSize)) * 0.45, len = minis.length;
          minis.forEach((m, n) => {
            const s = rad(it.c * (it.type === 1 ? -4 : 3) + n * (360 / len));
            if (it.type === 2) gsap.set(m, { x: mix(0, R * Math.sin(s), r), y: mix(0, R * Math.cos(s), r), rotation: mix(0, cl(Math.sin(s), 0, 360, -1, 1), r), scale: mix(1, (1 / len) * 3.5, r) });
            else gsap.set(m, { x: mix(0, R * Math.cos(s), r), y: mix(0, R * Math.sin(s), r), rotation: 0, scale: mix(1, (1 / len) * 1.5, r) });
          });
        };
        return it;
      });
    },
    strike(chars, el) {
      const it = { c: (Math.random() * 360) | 0, type: 0, every: 2, types: [0] };
      it.draw = (r) => {
        const t = rad(it.c * 3);
        const style = ["dashed", "dotted", "solid", "wavy"][Math.floor(mix(0, cl(Math.cos(t * -0.88), 0, 10, -1, 1), r)) % 4];
        gsap.set(el, { textDecorationLine: r === 0 ? "none" : "line-through", textDecorationStyle: style, textDecorationThickness: mix(0, cl(Math.sin(t), 0, 1, -1, 1), r) + "em" });
      };
      return [it];
    },
    wave(chars) {
      return chars.filter(() => hit(4)).map((ch) => {
        const list = strips(ch, 10);
        list.forEach((b) => b.con.classList.add("is-col"));
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1]), every: 3, types: [0, 1], ch };
        it.draw = (r, w) => {
          const e = w * 1.2, a = e / 10;
          gsap.set(ch, { color: r > 0 ? BG : "" });
          list.forEach((b, n) => {
            const l = a * n;
            if (it.type === 0) {
              const h = mix(0, mix(0, Math.sin(rad(it.c * 7 + n * 20)) * e * 0.2, r), r);
              gsap.set(b.con, { height: "100%", width: a + 1, left: l, y: h, color: r > 0 ? INK : "" });
              gsap.set(b.img, { x: -l, y: 0, scaleY: 1 });
            } else {
              const h = mix(0, mix(0, Math.sin(rad(it.c * 7 + n * 10)) * e * 0.25, r), r);
              gsap.set(b.con, { height: "100%", width: a + 1, left: l, y: 0, color: r > 0 ? INK : "" });
              gsap.set(b.img, { x: -l + h, y: 0, scaleY: mix(1, 1 + Math.abs(h) * 0.1, r) });
            }
          });
        };
        return it;
      });
    },
    font(chars) {
      return chars.map((ch) => {
        const nx = rnd(0, 1) * (hit(2) ? -1 : 1), ny = rnd(0, 1) * (hit(2) ? -1 : 1);
        const it = { c: 0, c2: 0, type: any([0, 1]), types: [0, 1], live: nx > 0.1 };
        Object.defineProperty(it, "every", { get: () => (it.type === 1 ? 4 : Math.floor(cl(ny, 10, 30, -1, 1))) });
        const clear = () => { for (let i = 0; i <= FONTS; i++) ch.classList.remove("is-f" + i); };
        const plain = { mixBlendMode: "", fontSize: "", fontStyle: "", textDecoration: "", backgroundColor: "", color: "", padding: "", display: "", scaleY: 1, backgroundImage: "" };
        it.draw = (r) => {
          if (!it.live) return;
          clear();
          if (it.type === 1) {
            if (r > 0.1) ch.classList.add("is-f" + (it.c2++ % FONTS));
            gsap.set(ch, plain);
            return;
          }
          if (r > 0.1) ch.classList.add("is-f" + ((Math.random() * (FONTS + 1)) | 0));
          if (r <= 0.1) { gsap.set(ch, plain); return; }
          const dark = hit(2), fill = dark ? INK : BG, ink = dark ? BG : INK;
          let size = (r > 0 ? rnd(0.8, 1) : 1) + "em";
          if (hit(5)) size = (r > 0 ? rnd(0.4, 0.5) : 1) + "em";
          gsap.set(ch, {
            mixBlendMode: hit(3) ? "difference" : "", fontSize: size, fontStyle: hit(4) ? "italic" : "",
            textDecoration: hit(4) ? any(["none", "underline", "line-through", "overline"]) : "",
            backgroundColor: fill, color: ink, padding: `0 ${rnd(0, 0.1)}em`, display: "inline-block",
            scaleY: hit(3) ? rnd(1, 2) : 1, backgroundImage: hit(3) ? `linear-gradient(to right, ${fill}, ${ink})` : "",
          });
        };
        return it;
      });
    },
    slice(chars) {
      return chars.filter(() => hit(4)).map((ch) => {
        const list = strips(ch, 20);
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1]), every: 3, types: [0, 1], ch };
        it.draw = (r, w) => {
          const e = w * 1.2, a = e / 20;
          gsap.set(ch, { color: r > 0 ? BG : "" });
          list.forEach((b, n) => {
            const s = rad(it.c * 6 + n * (it.type ? 10 : 6));
            const o = mix(0, Math.sin(s) * e * (it.type ? 0.5 : 0.2), r);
            const h = mix(0, o, r) * (it.type === 0 && n % 2 ? -1 : 1);
            gsap.set(b.con, { width: "100%", height: a + 1, top: a * n, x: h, color: r > 0 ? INK : "" });
            gsap.set(b.img, { y: -a * n, x: 0 });
          });
        };
        return it;
      });
    },
    scale(chars) {
      return chars.filter((_, n) => n % 3 === 0).map((ch) => {
        const copies = [];
        for (let i = 0; i < 8; i++) {
          const k = abs();
          k.classList.add("is-copy");
          k.textContent = ch.textContent;
          ch.append(k);
          copies.push(k);
        }
        ch.classList.add("is-host", "is-ghost");
        const it = { c: (Math.random() * 360) | 0, type: any([0, 1, 2]), every: 3, types: [0, 1, 2] };
        it.draw = (r) => copies.forEach((k, i) => {
          if (it.type === 0) gsap.set(k, { scale: mix(1, cl(Math.sin(rad(it.c * 3 + i * 6)), 0, 2, -1, 1), r), rotation: 0, x: 0 });
          else if (it.type === 1) gsap.set(k, { scale: 1, rotation: mix(0, Math.sin(rad(it.c * 10 + i * 6)) * 90, r), x: 0 });
          else gsap.set(k, { scale: 1, rotation: 0, x: mix(0, Math.sin(rad(it.c * 10 + i * 10)) * 20, r) });
        });
        return it;
      });
    },
    wobble(chars, el) {
      const rot = [rnd(-50, 50), rnd(-50, 50), rnd(-10, 10)], pos = [rnd(-10, 10), rnd(-10, 10), rnd(-10, 10)];
      const it = { c: (Math.random() * 360) | 0, type: any([0, 1]), every: 2, types: [0, 1] };
      it.draw = (r) => {
        if (it.type === 0) {
          const e = rad(it.c);
          gsap.set(el, {
            display: "inline-block", skewX: 0,
            rotationX: mix(0, rot[0] + Math.sin(e) * 10, r), rotationY: mix(0, rot[1] + Math.cos(e * 1.22) * 10, r), rotationZ: mix(0, rot[2] + Math.sin(e * -0.88) * 10, r),
            x: mix(0, pos[0] + Math.sin(e) * 20, r), y: mix(0, pos[1] + Math.cos(e * 1.02) * 20, r), z: mix(0, pos[2] + Math.sin(e * -1.8) * 40, r),
          });
        } else gsap.set(el, { display: "inline-block", skewX: mix(0, Math.sin(rad(it.c * 10)) * 20, r), rotationX: 0, rotationY: 0, rotationZ: 0, x: 0 });
      };
      return [it];
    },
    shadow(chars, el) {
      const nx = rnd(0, 1) * (hit(2) ? -1 : 1);
      let base = (Math.random() * 361) | 0;
      const it = { c: (Math.random() * 1000) | 0, type: 0, every: 2, types: [0] };
      it.draw = (r) => {
        if (hit(20)) base = any([45, -45, 135, -135]);
        const a = cl(Math.sin(rad(it.c * 2 + nx * 2) * -2.8), 0, 1, -1, 1), ang = rad(base);
        let o = cl(nx, 0, 5, -1, 1) * r;
        const list = [];
        for (let h = 0; h < 3; h++) {
          list.push(`${Math.trunc(Math.sin(ang) * o) * r * a}px ${Math.trunc(Math.cos(ang) * o) * r * a}px 0px ${INK}`);
          o += 11;
        }
        gsap.set(el, { textShadow: r > 0 ? list.join(", ") : "none", color: r > 0 ? BG : "" });
      };
      return [it];
    },
  };

  kfFx.register("char-glitch-medley", (el, { options, reduce }) => {
    if (reduce || !el.textContent.trim()) return;
    const pool = String(options.looks || LOOKS.join(",")).split(",").map((s) => s.trim()).filter((s) => LOOKS.includes(s));
    const look = LOOKS.includes(options.look) ? options.look : any(pool.length ? pool : LOOKS);
    const swap = +(options.swap ?? 1);
    const { text, chars } = split(el);
    el.setAttribute("aria-label", text);
    el.classList.add("fx-cgm-on");
    const items = builders[look](chars, el);
    const widths = new Map();
    const measure = () => chars.forEach((ch) => widths.set(ch, ch.offsetWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let seen = false, last = -1;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);
    const tick = (time) => {
      const f = Math.floor(time * 60);
      if (f === last) return;
      const steps = last < 0 ? 1 : Math.min(f - last, 10);
      last = f;
      const r = rateOf(options);
      for (const it of items) {
        let due = false;
        for (let i = 0; i < steps; i++) {
          it.c++;
          if (it.types.length > 1 && Math.random() * 100 < swap) it.type = any(it.types);
          if (it.c % Math.max(1, it.every) === 0) due = true;
        }
        if (seen && due) it.draw(r, widths.get(it.ch) || parseFloat(getComputedStyle(el).fontSize));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      gsap.set(el, { clearProps: "all" });
      el.textContent = text;
      el.removeAttribute("aria-label");
      el.classList.remove("fx-cgm-on");
    };
  });
})();
