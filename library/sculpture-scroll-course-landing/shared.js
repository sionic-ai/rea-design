// Page-wide parts: loading number, smooth scroll, horizontal band, section map and SCROLL arrow, text splitting and hover, phone menu.
// index.js (3D scene) only reads the section progress values of window.HR to move the camera.
(() => {
  const html = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isAny = () => html.classList.contains("is-any");
  const mode = () => (html.classList.contains("is-v-s") ? "s" : isAny() ? "m" : "l");
  const ORDER = ["top", "concept", "about", "purpose", "curriculum", "supervisor", "apply", "entry"];

  const HR = (window.HR = { y: 0, anchors: [], progress: 0, listeners: [], load: window.HR_LOAD || [] });
  window.HR_LOAD = HR.load;

  // Moving to a board of a different width reopens it fresh like the original — a horizontal strip and a vertical stack differ in structure
  const startMode = mode();
  const pickMode = () => {
    const w = innerWidth, phone = /iPhone|Android.+Mobile/i.test(navigator.userAgent);
    return phone || w < 768 ? "s" : w <= 1024 ? "m" : "l";
  };

  /* ── Split Text ── */
  const wrapChars = (el, cls) => {
    const chars = Array.from(el.textContent);
    el.textContent = "";
    return chars.map((ch) => {
      const c = document.createElement("span");
      const t = document.createElement("span");
      if (cls) c.className = cls[0], t.className = cls[1];
      t.textContent = ch;
      c.append(t);
      el.append(c);
      return t;
    });
  };
  document.querySelectorAll(".h-split").forEach((split) => {
    let i = 0;
    const lines = split.querySelectorAll(".w");
    (lines.length ? lines : [split]).forEach((w) => {
      const d = Number(w.dataset.delay) || 0;
      wrapChars(w, ["c", "t"]).forEach((t) => {
        t.style.setProperty("--c", i++);
        if (d) t.style.setProperty("--d", d);
      });
    });
  });
  const hoverSpans = new Map();
  document.querySelectorAll(".h-hl").forEach((hl) => hoverSpans.set(hl, wrapChars(hl)));

  /* ── Link hover: the text slips out to the left (.2s) and comes back in from the right (1s expo.out) — measured on the original, it goes toward −110% first ── */
  if (!reduced && !isAny()) {
    document.querySelectorAll(".a-hover").forEach((a) => {
      const spans = [...a.querySelectorAll(".h-hl")].flatMap((hl) => hoverSpans.get(hl) || []);
      if (!spans.length) return;
      const tl = gsap.timeline({ paused: true })
        .to(spans, { duration: 0.2, xPercent: -110 })
        .set(spans, { xPercent: 110 })
        .to(spans, { duration: 1, xPercent: 0, ease: "expo.out" });
      a.addEventListener("mouseenter", () => tl.restart());
    });
  }

  // Measures the arrow line length so the dash hover erases and redraws exactly one line
  const measureArrow = (svg) => {
    const h = svg.querySelector(".ah"), b = svg.querySelector(".ab");
    if (h?.getAttribute("d")) svg.style.setProperty("--hl", h.getTotalLength() + "px");
    if (b?.getAttribute("d")) svg.style.setProperty("--bl", b.getTotalLength() + "px");
  };
  document.querySelectorAll(".h-arrow").forEach(measureArrow);

  /* ── Once when visible: text splitting starts here ── */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) e.target.dataset.shown = "1";
  }), { threshold: 0, rootMargin: isAny() ? "40px 0px 0px 0px" : "0px" });
  document.querySelectorAll(".js-iv").forEach((el) => io.observe(el));

  /* ── Smooth scroll — original lerp .15 ── */
  const lenis = new Lenis({ lerp: reduced ? 1 : 0.15, smoothWheel: !reduced });
  HR.lenis = lenis;
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ── Horizontal strip: the pinned inner part moves left by (scroll - start), and when finished moves up by the container’s leftover height ── */
  const track = document.querySelector(".h-track");
  const inner = track.querySelector(".h-track__in");
  const hr = { start: 0, scrollWidth: 0, tail: 0, secs: [] };
  const absTop = (el) => el.getBoundingClientRect().top + scrollY;

  const layout = () => {
    html.style.setProperty("--vh", innerHeight / 100 + "px");
    inner.style.transform = "";
    if (isAny()) {
      track.style.height = "";
    } else {
      let x = 0;
      hr.secs = [...inner.children].map((s) => {
        const r = { el: s, key: s.id, local: x, w: s.offsetWidth };
        x += r.w;
        return r;
      });
      hr.scrollWidth = Math.max(x - innerWidth, 0);
      const apply = document.getElementById("apply");
      hr.tail = Math.max(apply.offsetHeight - innerHeight, 0);
      track.style.height = hr.scrollWidth + innerHeight + hr.tail + "px";
      hr.start = absTop(track);
    }
    HR.anchors = ORDER.map((key) => {
      const s = hr.secs.find((r) => r.key === key);
      return { key, y: s && !isAny() ? hr.start + s.local : absTop(document.getElementById(key)) };
    });
    HR.limit = document.documentElement.scrollHeight - innerHeight;
    measureMap();
    document.querySelectorAll(".h-sup__msg-txt").forEach((m) => {
      const label = m.querySelector(".h-sup__mlabel h3");
      m.querySelector(".h-indent")?.style.setProperty("--indent", label.getBoundingClientRect().width + "px");
    });
    update(scrollY);
  };

  const keyAt = (y) => {
    let k = HR.anchors[0]?.key;
    // The finish starts from the front by the header-line height — since the document end almost matches the top of the closing section
    const hh = document.querySelector(".h-header").offsetHeight;
    for (const a of HR.anchors) if (y >= Math.min(a.y, HR.limit) - (a.key === "entry" ? hh : 0) - 1) k = a.key;
    return k;
  };

  /* ── Bottom-right 5×4 cell map: a lit cell slides between section cells with scroll ── */
  const mapBody = document.querySelector(".h-map__body");
  const mapP = mapBody.querySelector(".h-map__p");
  const cells = {};
  const measureMap = () => {
    const b = mapBody.getBoundingClientRect();
    // The spot that led to an outside page (View process details) is left as an empty link — so pressing it doesn’t jump within the strip
  document.querySelectorAll('a[href="#"]:not(.js-next)').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  mapBody.querySelectorAll("i.b").forEach((c) => {
      const r = c.getBoundingClientRect();
      cells[c.dataset.to] = { x: r.left - b.left, y: r.top - b.top };
    });
  };
  const syncMap = (y) => {
    const a = HR.anchors;
    if (!a.length || !cells.top) return;
    let i = 1;
    while (i < a.length - 1 && y > a[i].y) i++;
    const p = a[i - 1], q = a[i];
    const f = Math.min(Math.max((y - p.y) / Math.max(q.y - p.y, 1e-4), 0), 1);
    const c0 = cells[p.key], c1 = cells[q.key];
    mapP.style.transform = `translate3d(${c0.x + (c1.x - c0.x) * f}px, ${c0.y + (c1.y - c0.y) * f}px, 0)`;
  };

  /* ── SCROLL arrow: ↘ in the vertical stretch, → in the horizontal, ↗ (BACK) at the end — bends and changes over 420ms ── */
  const scrollBtn = document.querySelector(".h-scroll");
  const morph = scrollBtn.querySelector(".js-morph");
  const SHAPES = {
    down: ["M120 160 L180 220 L240 160", "M60 75 H150 Q180 75 180 105 V220"],
    normal: ["M175 80 L245 150 L175 220", "M55 150 H245"],
    up: ["M120 140 L180 80 L240 140", "M60 225 H150 Q180 225 180 195 V80"],
  };
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const sample = (d, n) => {
    probe.setAttribute("d", d);
    morph.append(probe);
    const L = probe.getTotalLength();
    const pts = Array.from({ length: n }, (_, i) => {
      const p = probe.getPointAtLength((L * i) / (n - 1));
      return { x: p.x, y: p.y };
    });
    probe.remove();
    return pts;
  };
  const poses = Object.fromEntries(Object.entries(SHAPES).map(([k, [h, b]]) => [k, { head: sample(h, 4), body: sample(b, 8) }]));
  const toD = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join("");
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const mixPts = (a, b, t, part) => a.map((p, i) => {
    const dx = b[i].x - p.x, dy = b[i].y - p.y, len = Math.max(Math.hypot(dx, dy), 1e-4);
    const strength = part === "body" ? (i === 1 ? 0.14 : 0.03) : i === 1 ? 0.08 : 0.05;
    const sign = i === 1 ? (part === "body" ? 1 : -1) : part === "head" && i === 0 ? 1 : -1;
    const bend = Math.min(len * strength, 16) * Math.sin(Math.PI * t) * sign;
    return { x: p.x + dx * t + (-dy / len) * bend, y: p.y + dy * t + (dx / len) * bend };
  });
  let shape = "down", pose = poses.down, raf = 0;
  const apply = (ps) => {
    morph.querySelector(".ah").setAttribute("d", toD(ps.head));
    morph.querySelector(".ab").setAttribute("d", toD(ps.body));
  };
  apply(pose);
  measureArrow(morph);
  const morphTo = (next) => {
    if (next === shape) return;
    shape = next;
    scrollBtn.dataset.shape = next;
    cancelAnimationFrame(raf);
    const from = pose, to = poses[next], t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / 420, 1), e = ease(t);
      pose = { head: mixPts(from.head, to.head, e, "head"), body: mixPts(from.body, to.body, e, "body") };
      apply(pose);
      if (t < 1) raf = requestAnimationFrame(step);
      else measureArrow(morph);
    };
    raf = requestAnimationFrame(step);
  };
  const shapeAt = (y, key) => {
    if (key === "entry") return "up";
    if (key === "apply" && !isAny()) {
      const s = hr.secs.find((r) => r.key === "apply");
      return y < hr.start + Math.max(s.local - innerWidth + 0.5 * s.w, 0) - 1 ? "normal" : "down";
    }
    return ["about", "purpose", "curriculum", "supervisor"].includes(key) && !isAny() ? "normal" : "down";
  };

  const update = (y) => {
    HR.y = y;
    if (!isAny()) {
      const e = Math.max(y - hr.start, 0);
      const x = Math.min(e, hr.scrollWidth);
      const t = Math.min(Math.max(e - hr.scrollWidth, 0), hr.tail);
      inner.style.transform = `translate3d(${-x}px, ${-t}px, 0)`;
    }
    const a = HR.anchors;
    let i = 1;
    while (i < a.length - 1 && y > a[i].y) i++;
    const f = a.length ? Math.min(Math.max((y - a[i - 1].y) / Math.max(a[i].y - a[i - 1].y, 1), 0), 1) : 0;
    HR.progress = i - 1 + f;
    HR.key = keyAt(y);
    syncMap(y);
    morphTo(shapeAt(y, HR.key));
    HR.listeners.forEach((fn) => fn(HR));
  };
  lenis.on("scroll", ({ scroll }) => update(scroll));
  addEventListener("scroll", () => { if (!lenis.isScrolling) update(scrollY); }, { passive: true });

  /* ── Navigation links · next section ── */
  const goTo = (key) => {
    const a = HR.anchors.find((r) => r.key === key);
    if (!a) return;
    html.classList.remove("is-menu-opened");
    lenis.scrollTo(Math.min(a.y, HR.limit), { immediate: reduced });
  };
  document.querySelectorAll(".js-to").forEach((el) => el.addEventListener("click", (e) => {
    const id = (el.getAttribute("href") || "").slice(1);
    if (!ORDER.includes(id)) return;
    e.preventDefault();
    goTo(id);
  }));
  // The spot that led to an outside page (View process details) is left as an empty link — so pressing it doesn’t jump within the strip
  document.querySelectorAll('a[href="#"]:not(.js-next)').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  mapBody.querySelectorAll("i.b").forEach((c) => c.addEventListener("click", () => goTo(c.dataset.to)));
  scrollBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (shape === "up") return goTo("top");
    goTo(ORDER[Math.min(ORDER.indexOf(HR.key) + 1, ORDER.length - 1)]);
  });

  /* ── Phone menu: dark ink panel slides in from the right in .6s, 3D canvas shifts half a screen left ── */
  const toggle = document.querySelector(".js-menu");
  toggle.addEventListener("click", () => {
    const open = html.classList.toggle("is-menu-opened");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  });

  /* ── Loading: raises the target as tasks complete, and the number closes the gap to the target by .33 each frame ── */
  const digits = [...document.querySelectorAll(".h-loading__n .t")];
  const start = () => {
    // The original opens SPLASH right when asset (model·texture) loading finishes — our assets are only fonts and 3D setup, so it waits for just those two
    const jobs = [document.fonts.ready, ...HR.load];
    let done = 0, target = 0, shown = 0, last = -1;
    jobs.forEach((j) => Promise.resolve(j).catch(() => {}).finally(() => { target = (++done / jobs.length) * 100; }));
    html.classList.add("is-a0");
    const tick = () => {
      const d = target - shown;
      shown = Math.abs(d) < 0.1 ? target : shown + 0.33 * d;
      const n = Math.round(shown);
      if (n !== last) {
        String(n).padStart(3, "0").split("").forEach((ch, i) => (digits[i].textContent = ch));
        last = n;
      }
      if (target >= 100 && Math.abs(target - shown) < 0.1) {
        gsap.ticker.remove(tick);
        finish();
      }
    };
    gsap.ticker.add(tick);
  };
  const finish = () => {
    html.classList.remove("is-lbf");
    layout();
    html.classList.add("is-a1");
    document.dispatchEvent(new CustomEvent("hr:a1"));
    // Original SPLASH.onStart: adds is-a1, then is-a2 1000ms later
    setTimeout(() => {
      html.classList.add("is-a2");
      lenis.start();
    }, reduced ? 0 : 1000);
  };

  addEventListener("load", () => {
    layout();
    if (reduced) {
      html.classList.add("is-a0");
      finish();
    } else start();
  });
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (pickMode() !== startMode) return location.reload();
      layout();
      lenis.resize();
    }, 120);
  });
  HR.layout = layout;
})();
