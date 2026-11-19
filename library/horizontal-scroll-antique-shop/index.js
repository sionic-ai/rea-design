// Home only — a narrow window opening to full screen, three objects stuck to the screen overlapping and passing, and a horizontal parallax photo
(() => {
  const site = window.dkSite;
  if (!site) return;
  const { st, norm } = site;
  const lerp = (a, b, k) => a + (b - a) * k;
  const r1 = (v) => Math.round(v * 10) / 10;
  const raf = requestAnimationFrame;

  // Narrow window — the window (half-width 115) enters from the right, and once it reaches screen center it stays in place while the next one screen is scrolled through
  // Top (poem block head height) · bottom (10.4% of the screen) · half width (→ half the screen) unfold straight into the full screen (tied to scroll without a curve)
  function windowMask() {
    const item = document.querySelector(".dk-window");
    const top = document.querySelector(".dk-hero__poem");
    if (!item || !top) return;
    const body = item.querySelector(".dk-window__body");
    const bw = item.querySelector(".dk-window__base-w");
    const bx = item.querySelector(".dk-window__base-x");
    let m = null;
    const measure = () => {
      const baseX = -(item.offsetWidth / 2 + bw.offsetWidth + bx.offsetWidth);
      m = { from: innerWidth + baseX, to: innerWidth, baseTop: Math.round(top.getBoundingClientRect().top), baseW: bw.offsetWidth, baseX, endW: innerWidth / 2 };
    };
    const upd = () => raf(() => {
      if (st.fixed || !st.horiz || !m) return;
      const sx = scrollX;
      let x = m.baseX, t = m.baseTop, b = (innerHeight * 104) / 1000, w = m.baseW;
      if (sx > m.from && sx < m.to) x = r1(lerp(x, 1, norm(sx, m.from, m.to)));
      else if (sx >= m.to) x = 0;
      if (sx > m.from && sx < m.to) {
        const k = norm(sx, m.from, m.to);
        t = r1(m.baseTop - lerp(0, m.baseTop, k));
        b = r1(b - lerp(0, b, k));
        w = r1(lerp(m.baseW, m.endW, k));
        item.classList.add("is-active");
      } else if (sx >= m.to) { t = 0; b = 0; w = innerWidth; item.classList.add("is-active"); }
      else item.classList.remove("is-active");
      body.style.setProperty("--mx", `${x}px`);
      body.style.setProperty("--mt", `${t}px`);
      body.style.setProperty("--mb", `${b}px`);
      body.style.setProperty("--mw", `${w}px`);
    });
    const reset = () => { ["--mx", "--mt", "--mb", "--mw"].forEach((k) => body.style.removeProperty(k)); measure(); upd(); };
    measure();
    upd();
    addEventListener("scroll", upd);
    addEventListener("resize", reset);
    new ResizeObserver(reset).observe(document.body);
  }

  // Three items — while passing through the section, the three bodies stay fixed on screen and overlap. The current item’s photo is erased toward a wavy edge as it passes its cell (mask 100%→20%)
  // The item below is revealed, and 1/5 of the screen before the next cell’s start, the next item’s text rises line by line (1.2s expo-out · 80ms per line)
  function stack() {
    const t = document.querySelector(".dk-stack");
    if (!t) return;
    const groups = [...t.querySelectorAll(".dk-group")];
    const texts = [...t.querySelectorAll(".dk-rows-g")];
    const html = new Map(texts.map((el) => [el, el.innerHTML]));
    const info = new Map();
    let o = 0, n = 0;
    const measure = () => {
      if (!st.horiz) return;
      const r = t.getBoundingClientRect();
      o = Math.ceil(r.left) + scrollX;
      n = o + Math.ceil(r.width) - innerWidth;
      const ahead = innerWidth / 5;
      groups.forEach((g, i) => {
        const b = g.getBoundingClientRect();
        const k = Math.ceil(b.left) + scrollX, end = k + Math.ceil(b.width);
        info.set(g, { k, end, cs: k - ahead, ce: end - ahead, first: i === 0, last: i === groups.length - 1 });
      });
    };
    const setup = () => {
      if (st.side) { t.classList.add("is-rows-manual"); texts.forEach((el) => site.setUpRows(el, html.get(el))); }
      else { t.classList.remove("is-rows-manual"); texts.forEach((el) => el.classList.add("dk-rows")); site.rows(t); }
    };
    const upd = () => raf(() => {
      if (st.fixed) return;
      if (!st.horiz) { t.classList.remove("is-active"); return; }
      const sx = scrollX;
      if (o <= sx && n >= sx) { t.classList.add("is-active"); t.classList.remove("is-end"); }
      else { t.classList.remove("is-active"); t.classList.toggle("is-end", n < sx); }
      groups.forEach((g) => {
        const e = info.get(g);
        if (!e) return;
        if (e.cs <= sx && e.ce >= sx) { groups.forEach((x) => x.classList.remove("is-active")); g.classList.add("is-active"); }
        else if (e.ce < sx) { if (e.last) g.classList.add("is-end"); else g.classList.remove("is-active"); }
        else if (e.k > sx) { if (e.first) g.classList.add("is-active"); else g.classList.remove("is-active"); }
        let y = 100;
        const inside = e.k <= sx && e.end >= sx;
        if (!inside && e.end < sx) { if (!e.last) y = 20; }
        else if (inside && !e.last) y = 100 - Math.round(lerp(0, 80, Math.round(norm(sx, e.k, e.end) * 100) / 100));
        g.style.setProperty("--mask-y", `${y}%`);
      });
    });
    // Tapping an item in the top list re-blurs the photos in up to that item (.6s), then moves to that cell’s head after 700ms
    document.querySelectorAll(".dk-stack-nav").forEach((a) => a.addEventListener("click", () => {
      if (!st.horiz) return;
      const id = a.getAttribute("href");
      let at = 0, open = true;
      t.classList.add("is-scroll-busy");
      groups.forEach((g) => {
        if (!open) return;
        if (g.matches(id)) { at = info.get(g)?.k ?? 0; open = false; }
        g.querySelectorAll(".dk-group__img, .dk-group__thumb").forEach((img) => {
          img.style.animation = "dk-mask-show 0.6s var(--site-ease)";
          setTimeout(() => { img.style.animation = ""; }, 600);
        });
      });
      setTimeout(() => { scrollTo(at, 0); t.classList.remove("is-scroll-busy"); }, 700);
      setTimeout(() => { measure(); upd(); }, 710);
    }));
    // Pressing the cell’s cover (::before) goes to the in-cell detail link
    groups.forEach((g) => g.querySelector(".dk-group__body")?.addEventListener("click", (e) => { if (!e.target.closest("a")) g.querySelector(".dk-group__link")?.click(); }));
    setup();
    measure();
    upd();
    addEventListener("scroll", upd);
    addEventListener("resize", () => { measure(); upd(); });
    new ResizeObserver(() => { measure(); upd(); }).observe(document.body);
  }

  // Horizontal parallax — a picture wider than its box is pushed left by the overflow while the box passes the screen
  function parallax() {
    document.querySelectorAll(".dk-parallax").forEach((box) => {
      const item = box.querySelector(".dk-parallax__item");
      if (!item) return;
      let f = 0, p = 0, d = 0, g = 0;
      const measure = () => {
        f = box.offsetWidth;
        p = box.getBoundingClientRect().left + scrollX;
        g = item.offsetWidth - f;
        d = g / (innerWidth + f);
      };
      const upd = () => raf(() => {
        if (st.fixed || !st.horiz) return;
        let a = Math.round((scrollX + innerWidth - p) * d);
        a = Math.max(0, Math.min(g, a));
        box.style.setProperty("--pos", `-${a}px`);
      });
      new IntersectionObserver((es) => es.forEach((e) => {
        if (!st.horiz) return;
        if (e.isIntersecting) { box.classList.add("is-on"); measure(); addEventListener("scroll", upd); }
        else { box.classList.remove("is-on"); removeEventListener("scroll", upd); }
      }), { rootMargin: "0px 50%" }).observe(box);
      measure();
      upd();
      addEventListener("resize", () => { measure(); upd(); });
    });
  }

  site.onInit(() => { windowMask(); stack(); parallax(); });
})();
