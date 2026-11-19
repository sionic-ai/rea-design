(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // News strip — chain the same row three times so it flows endlessly
  const tptr = $("[data-ik-ticker]");
  if (tptr) tptr.innerHTML = tptr.innerHTML.repeat(3);

  // Manifesto — split into word chunks
  const mf = $(".ik-mf"), mfp = $("[data-ik-words]");
  let words = [];
  if (mfp) {
    mfp.innerHTML = mfp.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    words = [...mfp.querySelectorAll(".w")];
  }

  // Code lines — 120ms after the declaration is 88% formed they open at 130ms intervals, and build succeeded appears 540ms after the last line
  const code = $("[data-ik-code]");
  const lns = code ? [...code.querySelectorAll(".ln")] : [];
  let codeDone = false;
  const openCode = () => {
    if (codeDone || !code) return;
    codeDone = true;
    if (reduce) { lns.forEach((l) => l.classList.add("on")); code.classList.add("built"); return; }
    lns.forEach((l, k) => setTimeout(() => {
      lns.forEach((x) => x.classList.remove("act"));
      l.classList.add("on");
      if (k < lns.length - 1) l.classList.add("act");
      else setTimeout(() => { lns.forEach((x) => x.classList.remove("act")); code.classList.add("built"); const s = code.querySelector("[data-ik-code-state]"); if (s) s.textContent = "shipped"; }, 540);
    }, 120 + k * 130));
  };

  // Work strip
  const fw = $(".ik-fw"), track = $("[data-ik-track]"), pag = $("[data-ik-pag]");
  const cards = $$(".ik-card");
  if (pag) for (let i = 0; i < 14; i++) pag.append(document.createElement("i"));
  const ticks = pag ? [...pag.querySelectorAll("i")] : [], box = pag && pag.querySelector(".box");
  let tx = 0, maxX = 0, focused = null;
  const measure = () => { if (track) maxX = Math.max(0, track.scrollWidth - innerWidth + 40); };
  setTimeout(measure, 400);
  addEventListener("resize", measure, { passive: true });
  const hovered = new Set();
  cards.forEach((c) => {
    c.addEventListener("pointerenter", () => hovered.add(c));
    c.addEventListener("pointerleave", () => hovered.delete(c));
  });

  // Mission — size of the four Frames
  const lines = $$("[data-ik-stack] span"), frames = $$("[data-ik-frames] i"), dk = $(".ik-dk");
  frames.forEach((el, i) => { el.style.width = 26 + i * 13 + "vw"; el.style.height = 16 + i * 8 + "vw"; });

  // Once when visible — service rows stagger by 60ms
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  $$(".sr").forEach((el, i) => { el.style.transitionDelay = i * 60 + "ms"; io.observe(el); });
  if (dk) io.observe(dk);

  // Services — each row has a faint big number and Explore, the left rail dot follows the hovered row
  const sv = $(".ik-sv .in"), rows = $$(".sr");
  if (sv && rows.length) {
    const rail = document.createElement("div"), dot = document.createElement("span");
    rail.className = "ik-rail"; dot.className = "dot"; rail.append(dot); sv.append(rail);
    const place = () => { const f = rows[0], l = rows[rows.length - 1]; rail.style.top = f.offsetTop + "px"; rail.style.height = l.offsetTop + l.offsetHeight - f.offsetTop + "px"; };
    place();
    addEventListener("resize", place, { passive: true });
    addEventListener("load", place);
    rows.forEach((r, i) => {
      const g = document.createElement("span"); g.className = "ghost"; g.textContent = ("0" + (i + 1)).slice(-2); r.append(g);
      const go = document.createElement("span"); go.className = "go"; go.innerHTML = "Explore <b>→</b>"; r.append(go);
      r.addEventListener("pointerenter", () => { rail.classList.add("on"); dot.style.top = r.offsetTop - rows[0].offsetTop + r.offsetHeight / 2 + "px"; });
    });
    $(".ik-sv").addEventListener("pointerleave", () => rail.classList.remove("on"));
  }

  // Agency cell — adds a sweep background, corner marks and an arrow, and tilts ±3.5° toward the cursor
  const ag = $("[data-ik-ag]");
  if (ag) {
    [...ag.children].forEach((c) => {
      const sw = document.createElement("span"); sw.className = "sweep"; c.prepend(sw);
      const cn = document.createElement("span"); cn.className = "cn"; c.append(cn);
      const ar = document.createElement("span"); ar.className = "ar"; ar.textContent = "↗"; c.append(ar);
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + "deg");
        c.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 7).toFixed(2) + "deg");
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    const agIo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { ag.classList.add("rvl"); agIo.disconnect(); } }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    agIo.observe(ag);
  }

  // Who with — when visible, cards rise in turn and the title types at 42ms per character
  const who = $(".ik-who"), tt = $("[data-ik-type]");
  if (who) {
    const head = tt ? tt.getAttribute("data-ik-type") : "";
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      who.classList.add("in");
      if (!tt) return;
      if (reduce) { tt.textContent = head; return; }
      let i = 0;
      const typer = setInterval(() => { i++; tt.textContent = head.slice(0, i); if (i >= head.length) clearInterval(typer); }, 42);
    };
    const wIo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) play(); }), { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    wIo.observe(who);
  }

  // FAQ — only one open at a time. Height is answer height + 42px over .55s
  const faq = $("[data-ik-faq]");
  if (faq) {
    const h = (fi) => { const fin = fi.querySelector(".fa-in"); return fin ? fin.scrollHeight + 42 : 0; };
    faq.addEventListener("click", (e) => {
      const btn = e.target.closest(".fq");
      if (!btn) return;
      const fi = btn.parentNode, fa = btn.nextElementSibling, open = fi.classList.contains("open");
      faq.querySelectorAll(".fi.open").forEach((o) => { if (o !== fi) { o.classList.remove("open"); o.querySelector(".fa").style.maxHeight = "0px"; } });
      if (open) { fi.classList.remove("open"); fa.style.maxHeight = "0px"; }
      else { fi.classList.add("open"); fa.style.maxHeight = h(fi) + "px"; }
    });
    addEventListener("resize", () => faq.querySelectorAll(".fi.open").forEach((o) => { o.querySelector(".fa").style.maxHeight = h(o) + "px"; }), { passive: true });
  }

  // Parallax of the faint big numbers — the farther the row center is from the screen center, ∓22px
  const para = () => {
    const vh = innerHeight || 1;
    rows.forEach((r) => { const b = r.getBoundingClientRect(), c = (b.top + b.height / 2) / vh - 0.5, g = r.querySelector(".ghost"); if (g) g.style.setProperty("--gy", (-c * 44).toFixed(1) + "px"); });
  };

  if (reduce) {
    words.forEach((w) => { w.style.opacity = 1; });
    if (mf) mf.classList.add("done");
    openCode();
    return;
  }

  // One loop — tilt from scroll speed (follows at .16), statement words, news strip, work strip, mission letter strip
  let lastY = scrollY, vel = 0, mvX = 0;
  const loop = () => {
    const y = scrollY, vh = innerHeight;
    const dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.16;
    const sk = clamp(vel * 0.09, -8, 8);

    if (mf && words.length) {
      const r = mf.getBoundingClientRect();
      const p = clamp(-r.top / (mf.offsetHeight - vh || 1), 0, 1), n = words.length, span = 0.3;
      for (let i = 0; i < n; i++) {
        const e = ease(clamp((p - (i / n) * (1 - span)) / span, 0, 1)), w = words[i];
        w.style.opacity = e.toFixed(3);
        w.style.filter = `blur(${((1 - e) * 10).toFixed(2)}px)`;
        w.style.transform = `translateY(${((1 - e) * 0.45).toFixed(3)}em) scale(${(0.97 + e * 0.03).toFixed(3)})`;
      }
      mf.classList.toggle("done", p > 0.92);
      if (p > 0.88) openCode();
    }

    if (tptr) {
      mvX -= 0.5 + vel * 0.32;
      const wdt = tptr.scrollWidth / 3;
      if (mvX <= -wdt) mvX += wdt;
      if (mvX > 0) mvX -= wdt;
      tptr.style.transform = `translateX(${mvX.toFixed(1)}px) skewX(${(sk * 0.3).toFixed(2)}deg)`;
    }

    if (fw && track) {
      const rf = fw.getBoundingClientRect();
      const fp = clamp(-rf.top / (fw.offsetHeight - vh || 1), 0, 1);
      tx += (-fp * maxX - tx) * 0.12;
      track.style.transform = `translateX(${tx.toFixed(1)}px) skewX(${(sk * 0.12).toFixed(2)}deg)`;
      // With no hovered card, the card nearest the screen center becomes the photo
      let target = hovered.size ? [...hovered][0] : null;
      if (!target) {
        let bd = 1e9;
        cards.forEach((c) => { const r = c.getBoundingClientRect(); if (r.right < 40 || r.left > innerWidth - 40) return; const d = Math.abs((r.left + r.right) / 2 - innerWidth / 2); if (d < bd) { bd = d; target = c; } });
      }
      if (target !== focused) {
        cards.forEach((c) => c.dispatchEvent(new CustomEvent("fx:focus", { detail: { on: c === target } })));
        focused = target;
      }
      if (ticks.length && box) {
        const idx = Math.round(fp * (ticks.length - 1));
        ticks.forEach((t, i) => t.classList.toggle("on", i === idx));
        box.style.transform = `translateX(${(fp * 10).toFixed(1)}px)`;
      }
    }

    if (dk && (lines.length || frames.length)) {
      const r2 = dk.getBoundingClientRect();
      if (r2.bottom > -300 && r2.top < vh + 300) {
        const q = (vh - r2.top) / (vh + r2.height);
        lines.forEach((el, i) => { const dir = i % 2 === 0 ? -1 : 1; el.style.transform = `${i % 2 ? "scaleY(-1) " : ""}translateX(${((q - 0.5) * 340 * dir).toFixed(1)}px) skewX(${(sk * 0.2 * dir).toFixed(2)}deg)`; });
        frames.forEach((el, i) => { el.style.transform = `scale(${(1 + (q - 0.5) * (0.5 + i * 0.22)).toFixed(3)}) rotate(${((q - 0.5) * (2 + i * 1.4)).toFixed(2)}deg)`; });
      }
    }
    para();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
