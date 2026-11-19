// Shared by all pages: texture background baking · striped logo · rainbow petal shape · header and footer fill · festival menu · project header (shrinks on scroll) · phone drawer ·
// Striped logo Lottie (baked in place in the skin colors — same tempo as the original brand KV json: 60fps 62 frames, bars 1 frame in turn · 30 frames to grow, letters 15 frames to drop)
(() => {
  const root = document.documentElement;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  // Variables built with oklch·color-mix also resolve to sRGB when painted on a canvas
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (value) => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = value || "transparent";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [r / 255, g / 255, b / 255];
  };
  const tone = (name) => {
    const el = document.createElement("i");
    el.style.color = `var(${name})`;
    el.hidden = true;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    return c;
  };

  // ── Texture background: a tile like the original bg.png (250px tile) lightly sprinkled with text-colored dots ──
  {
    const c = document.createElement("canvas");
    c.width = c.height = 250;
    const g = c.getContext("2d");
    const ink = rgb(tone("--kf-ink")).map((v) => Math.round(v * 255));
    const img = g.createImageData(250, 250);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = ink[0]; img.data[i + 1] = ink[1]; img.data[i + 2] = ink[2];
      img.data[i + 3] = Math.random() < 0.5 ? Math.round(Math.random() * 16) : 0;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--site-grain", `url(${c.toDataURL()})`);
  }

  // ── Striped Logo ──
  const mark = `<svg class="ofk-logo__mark" viewBox="0 0 60 60" fill="currentColor" aria-hidden="true">${
    [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="0" y="${i * 4.2}" width="26" height="2.2"/>`).join("") +
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${30 + i * 5}" y="0" width="2.6" height="28"/>`).join("") +
    [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i * 5}" y="32" width="2.6" height="28"/>`).join("") +
    [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="30" y="${32 + i * 4.2}" width="30" height="2.2"/>`).join("")
  }</svg>`;
  const logoHTML = `${mark}<span class="ofk-logo__word">NEW<br>SEASIDE<br>PROJECT.</span>`;
  const bldgHTML = `<svg viewBox="0 0 60 24" fill="currentColor" aria-hidden="true"><path d="M0 0h60v6H40v18H18V6H0z"/></svg><span>SEASIDE<br>BLDG</span>`;
  document.querySelectorAll("[data-logo]").forEach((a) => (a.innerHTML = logoHTML));

  const nav = [
    ["list.html", "Pair PROJECT", "English name of a project the brand co-created"],
    ["interview.html", "Memories of the street", "Neighborhood story project name"],
    ["index.html", "NEW SEASIDE FES", "Festival name (English)"],
  ];
  const navHTML = `<ul>${nav.map(([h, t, l]) => `<li><a href="${h}" data-label="${l}">${t}</a></li>`).join("")}<li><a class="ofk-bldg" href="works.html" aria-label="Building website">${bldgHTML}</a></li></ul>`;

  const head = document.querySelector('header[data-slot="header"]');
  if (head) {
    head.className = "ofk-head";
    head.innerHTML = `<div class="ofk-head__in"><a class="ofk-logo" href="works.html" data-label="Project logo — striped square + three-line English name">${logoHTML}</a><nav aria-label="Project Menu">${navHTML}</nav><button class="ofk-burger" type="button" aria-label="Menu"><span></span><span></span></button></div>`;
    const drawer = document.createElement("div");
    drawer.className = "ofk-drawer";
    drawer.innerHTML = `<div class="ofk-drawer__in"><ul>${nav.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="works.html">PROJECT TOP</a></li></ul><p class="ofk-drawer__ticker" aria-hidden="true">MEETS DIFFERENT IDEAS, LIFE×ART×CULTURE×TOWN×IMAGINATION.</p><a class="ofk-logo" href="works.html">${logoHTML}</a></div>`;
    head.after(drawer);
    const burger = head.querySelector(".ofk-burger");
    const machi = document.querySelector("[data-machi-mv]");
    burger.addEventListener("click", () => {
      if (machi && scrollY < 1) head.classList.toggle("is-machi");
      burger.classList.toggle("is-active");
      drawer.classList.toggle("is-active");
      document.body.classList.toggle("is-fixed");
    });
    // Wide window: scrolling just 1px shrinks the header row 140 → 80 and makes the logo smaller. Phone: transparent with white text only on the first screen of the memory section
    const wide = matchMedia("(min-width: 768px)");
    const onScroll = () => {
      const y = scrollY;
      if (wide.matches) head.classList.toggle("is-active", y > 1);
      else if (machi) head.classList.toggle("is-machi", y <= 1 && !drawer.classList.contains("is-active"));
    };
    if (machi && !wide.matches) head.classList.add("is-machi");
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot) foot.innerHTML = `<div class="ofk-foot__in"><a class="ofk-logo" href="works.html" data-label="Project Logo">${logoHTML}</a><nav aria-label="Footer Menu">${navHTML}</nav></div>`;

  // ── Festival menu card: on phones it drops from the top via the MENU button ──
  const fesBtn = document.querySelector(".ofk-fesbtn");
  const fesNav = document.querySelector(".ofk-fesnav");
  if (fesBtn && fesNav) {
    fesBtn.addEventListener("click", () => {
      fesBtn.classList.toggle("is-active");
      fesNav.classList.toggle("is-show");
      fesBtn.querySelector("span").textContent = fesBtn.classList.contains("is-active") ? "CLOSE" : "MENU";
    });
    fesNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      fesBtn.classList.remove("is-active");
      fesNav.classList.remove("is-show");
      fesBtn.querySelector("span").textContent = "MENU";
    }));
  }

  // ── Rainbow petal shape: the original image (a grainy gradient boomerang) as SVG — colors from --site-* variables, grain from turbulence displacement ──
  // Original petal: both tips point up, the inner top edge dips concave, and a single point drops below — a boomerang (V) shape
  const PETAL = {
    a: "M0 4 C26 22 42 30 50 30 C58 30 74 22 100 4 C94 44 80 74 52 100 C22 74 6 44 0 4Z",
    b: "M2 18 C30 26 46 26 58 18 C70 10 82 4 98 0 C92 40 76 72 46 98 C26 72 12 48 2 18Z",
    c: "M0 10 C22 30 40 36 56 32 C72 28 86 18 100 6 C90 48 74 78 50 100 C26 80 10 50 0 10Z",
  };
  const names = { accent: "--kf-accent", yellow: "--site-yellow", green: "--site-green", sky: "--site-sky", blue: "--site-blue", pink: "--site-pink", magenta: "--site-magenta", purple: "--site-purple" };
  let gid = 0;
  const grad = (cols, turn) => {
    const id = `ofk-g${gid++}`;
    const stops = cols.map((c, i) => `<stop offset="${cols.length > 1 ? i / (cols.length - 1) : 0}" style="stop-color: var(${names[c] || "--kf-accent"})"/>`).join("");
    return [id, `<linearGradient id="${id}" gradientTransform="rotate(${turn} .5 .5)">${stops}</linearGradient>`];
  };
  const grain = `<filter id="ofk-grain" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  defs.innerHTML = grain;
  document.body.prepend(defs);
  const ring = ["yellow", "green", "sky", "blue", "sky", "green", "accent", "yellow", "accent", "pink"];
  document.querySelectorAll("[data-shape]").forEach((el) => {
    const kind = el.dataset.shape;
    const cols = (el.dataset.colors || "accent pink").split(/\s+/);
    const turn = +(el.dataset.turn || 0);
    let body = "", box = "0 0 100 100", d = "";
    if (kind === "ring") {
      box = "0 0 750 750";
      ring.forEach((c, i) => {
        const [id, g] = grad([c, ring[(i + 3) % ring.length]], i * 36 + 20);
        d += g;
        const a = (i / ring.length) * 360;
        body += `<g transform="rotate(${a} 375 375) translate(375 70) scale(1.7) translate(-50 -40)"><path d="${PETAL[["a", "b", "c"][i % 3]]}" fill="url(#${id})" transform="rotate(${i % 2 ? 8 : -8} 50 50)"/></g>`;
      });
    } else if (kind === "cluster") {
      box = "0 0 300 160";
      cols.forEach((c, i) => {
        const [id, g] = grad([c, cols[(i + 1) % cols.length]], 30 + i * 70);
        d += g;
        body += `<path d="${PETAL[["a", "b", "c"][i % 3]]}" fill="url(#${id})" transform="translate(${i * 95} ${i % 2 ? 50 : 0}) rotate(${i * 50 - 20} 50 50) scale(.95)"/>`;
      });
    } else if (kind === "spiral") {
      const [id, g] = grad(cols, 90);
      d = g;
      body = `<path d="M50 50 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a20 20 0 1 1 -20 -20 a28 28 0 1 1 28 28 a36 36 0 1 1 -36 -36" fill="none" stroke="url(#${id})" stroke-width="7" stroke-linecap="round"/>`;
    } else {
      const [id, g] = grad(cols, turn + 45);
      d = g;
      body = `<path d="${PETAL[kind] || PETAL.a}" fill="url(#${id})" transform="rotate(${turn} 50 50)"/>`;
    }
    el.innerHTML = `<svg viewBox="${box}" aria-hidden="true"><defs>${d}</defs><g filter="url(#ofk-grain)">${body}</g></svg>`;
  });

  // ── Striped logo Lottie (same structure as the original KV: bar groups grow one frame at a time, photo cells settle inside the mask, letters drop from above) ──
  const stage = document.querySelector("[data-kv]");
  if (stage) {
    const narrow = !matchMedia("(min-width: 768px)").matches;
    const W = narrow ? 370 : 1480, H = narrow ? 520 : 645;
    const ink = [...rgb(tone("--kf-ink-soft")), 1];
    const fill = [...rgb(tone("--wf-fill")), 1];
    const fillInk = [...rgb(tone("--wf-fill-ink")), 1];
    // Original bar curve (.109,0 → .047,1) and photo curve (.134,0 → .146,1)
    const barEase = { o: { x: 0.109, y: 0 }, i: { x: 0.047, y: 1 } };
    const picEase = { o: { x: 0.134, y: 0 }, i: { x: 0.146, y: 1 } };
    const rectPath = (x0, y0, w, h) => ({ i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]], v: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], c: true });
    const ks = (p = [0, 0, 0]) => ({ o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: p }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } });
    const layers = [];
    let ind = 1;
    const shapeLayer = (shapes, ip, extra = {}) => ({ ddd: 0, ind: ind++, ty: 4, nm: `s${ind}`, sr: 1, ks: ks(), ao: 0, shapes, ip, op: 62, st: 0, bm: 0, ...extra });
    const fl = (c) => ({ ty: "fl", c: { a: 0, k: c }, o: { a: 0, k: 100 }, r: 1, bm: 0 });
    // One bar: starts at frame t from length 0 and grows fully over 30 frames. dir: right·left·down·up
    const bar = (x, y, w, h, dir, t) => {
      const from = dir === "right" ? rectPath(x, y, 0.01, h) : dir === "left" ? rectPath(x + w, y, 0.01, h) : dir === "down" ? rectPath(x, y, w, 0.01) : rectPath(x, y + h, w, 0.01);
      const shp = { ty: "sh", ks: { a: 1, k: [{ ...barEase, t, s: [from] }, { t: t + 30, s: [rectPath(x, y, w, h)] }] } };
      layers.push(shapeLayer([{ ty: "gr", it: [shp, fl(ink), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }], t));
    };
    // Bar group: n bars, thickness 11.4 · gap 22.5 (original), each one frame later than the previous (from the last bar if rev)
    const block = (x, y, len, n, axis, dir, t0, rev) => {
      for (let i = 0; i < n; i++) {
        const t = t0 + (rev ? n - 1 - i : i);
        if (axis === "h") bar(x, y + i * 22.5, len, 11.4, dir, t);
        else bar(x + i * 22.5, y, 11.4, len, dir, t);
      }
    };
    // Photo frame: inside a frame-shaped mask it settles down from 130 above over 20 frames — a diagonal pattern panel (placeholder) instead of a photo
    const photo = (x, y, w, h, t) => {
      const matte = shapeLayer([{ ty: "gr", it: [{ ty: "sh", ks: { a: 0, k: rectPath(x, y, w, h) } }, fl(ink), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }], t, { td: 1 });
      const lines = [];
      for (let k = -h; k < w; k += 18) lines.push({ ty: "sh", ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]], v: [[x + k, y + h], [x + k + 2, y + h], [x + k + h + 2, y], [x + k + h, y]], c: true } } });
      const pic = shapeLayer([
        { ty: "gr", it: [...lines, fl(fillInk), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 35 } }] },
        { ty: "gr", it: [{ ty: "sh", ks: { a: 0, k: rectPath(x, y, w, h) } }, fl(fill), { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] },
      ], t, { tt: 1 });
      pic.ks.p = { a: 1, k: [{ ...picEase, t, s: [0, -130, 0] }, { t: t + 20, s: [0, 0, 0] }] };
      // Inserted flipped, so the photo goes first to keep the matte (td) right above the photo (tt)
      layers.push(pic, matte);
    };
    if (narrow) {
      block(0, 300, 170, 5, "h", "right", 0, false);
      block(185, 300, 220, 8, "v", "down", 3, false);
      photo(0, 420, 170, 100, 12);
    } else {
      block(0, 0, 235, 8, "h", "right", 0, false);
      block(0, 180, 290, 11, "v", "up", 9, true);
      photo(0, 480, 235, 165, 12);
      block(250, 0, 300, 11, "v", "down", 3, false);
      block(250, 315, 230, 8, "h", "left", 6, true);
      block(250, 500, 850, 6, "h", "right", 12, false);
      photo(1000, 0, 320, 150, 15);
      photo(1115, 495, 205, 150, 21);
      block(1336, 0, 645, 7, "v", "down", 18, false);
    }
    const data = { v: "5.10.2", fr: 60, ip: 0, op: 62, w: W, h: H, nm: "kv", ddd: 0, assets: [], layers: layers.reverse() };
    const s = document.createElement("script");
    s.type = "application/json";
    s.id = "ofk-kv-json";
    s.textContent = JSON.stringify(data);
    document.body.append(s);

    // Wordmark letters are overlaid as HTML so they can swap to the skin font — same frames as the original letter layers (line 1: 9~11 · line 2: 12~18 · line 3: 15~22) over 15 frames.
    // Drops from above at 130/645 (curve .136,0 → .236,1) and moves following the frame number the Lottie draws
    const lines = [["N", "E", "W"], ["S", "E", "A", "S", "I", "D", "E"], ["P", "R", "O", "J", "E", "C", "T", "."]];
    const starts = [9, 12, 15];
    const word = document.createElement("p");
    word.className = "ofk-kv__word";
    word.setAttribute("data-label", "Three-line English project wordmark");
    word.innerHTML = lines.map((l, li) => `<span class="ofk-kv__line">${l.map((ch, i) => `<i data-at="${starts[li] + i}">${ch}</i>`).join("")}</span>`).join("");
    stage.parentElement.append(word);
    const glyphs = [...word.querySelectorAll("i")];
    const bez = (x1, y1, x2, y2) => (x) => {
      let t = x;
      for (let k = 0; k < 6; k++) {
        const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3 - x;
        const dx = 3 * x1 * (1 - t) ** 2 + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
        if (Math.abs(dx) < 1e-6) break;
        t -= cx / dx;
      }
      t = Math.min(1, Math.max(0, t));
      return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
    };
    const drop = bez(0.136, 0, 0.236, 1);
    const paint = (f) => glyphs.forEach((g) => {
      const p = drop(Math.min(1, Math.max(0, (f - +g.dataset.at) / 15)));
      g.style.transform = `translateY(${(-110 * (1 - p)).toFixed(2)}%)`;
    });
    paint(0);
    const hook = () => {
      const anim = window.lottie?.getRegisteredAnimations().find((a) => a.wrapper === stage);
      if (!anim) return false;
      anim.addEventListener("drawnFrame", () => paint(anim.currentFrame));
      anim.addEventListener("complete", () => paint(62));
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) paint(62);
      return true;
    };
    // The part (lottie-enter-play) sets up Lottie after DOMContentLoaded, so hook in after that
    const wait = () => { if (!hook()) requestAnimationFrame(wait); };
    addEventListener("DOMContentLoaded", () => requestAnimationFrame(wait));
  }
})();
