/* Outer frame — binding Lenis (lerp .1) with ScrollTrigger · word cover splitting · right-side dot progress indicator · legal document drawer. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CF = (window.CF = { reduce });
  gsap.registerPlugin(ScrollTrigger);

  /* ---- Smooth scroll: original --lenis-lerp .1 ---- */
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    CF.lenis = lenis;
  }
  CF.scrollTo = (y) => (CF.lenis ? CF.lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: typeof y === "number" ? y : y.getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" }));

  /* ---- Split words into a cover (.cf-w) around a core (.cf-wi) — spaces between are left as they are ---- */
  CF.words = (el) => {
    if (el.querySelector(".cf-w")) return [...el.querySelectorAll(".cf-wi")];
    /* Per line <span> Titles split this way keep the line breaks between lines */
    const kids = [...el.children];
    const parts = kids.length && kids.every((c) => c.tagName === "SPAN") ? kids.map((c) => c.textContent) : [el.textContent];
    el.textContent = "";
    parts.forEach((t, pi) => {
      if (pi) el.appendChild(document.createElement("br"));
      const words = t.trim().split(/\s+/);
      words.forEach((w, i) => {
        const o = document.createElement("span"), n = document.createElement("span");
        o.className = "cf-w"; n.className = "cf-wi"; n.textContent = w; o.appendChild(n); el.appendChild(o);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
    return [...el.querySelectorAll(".cf-wi")];
  };

  /* ---- Dot progress indicator (original rule):
     Dot 8px, the current section’s dot is a 14×48 red bar (measured by opening the original).
     Vertical slot height: 42 for the hovered dot, 48 for the current section, other dots at their own size, gaps are (screen height×.72 − remaining share)/(count−1), clamped to 12~22px.
     Each cell approaches its own place by .2/(1 + cells away×.08) per frame, and spreads slightly up and down by scroll speed (±90, following 10% per frame).
     The hovered dot expands into a pill (42px) the width of the label (--loz-w), and the name shows .12s later over .25s. Pressing spreads a ripple over .4s ---- */
  const dots = document.querySelector(".cf-dots");
  const D = { act: -1, hov: -1, items: [], scroll: scrollY, vel: 0 };
  if (dots) {
    D.items = [...dots.querySelectorAll("li")].map((li) => ({ li, dot: li.querySelector(".dot"), lbl: li.querySelector(".lbl"), y: null }));
    const measure = () => D.items.forEach((d) => {
      d.lbl.style.width = "auto"; d.lbl.style.display = "flex";
      d.dot.style.setProperty("--loz-w", Math.ceil(d.lbl.getBoundingClientRect().width) + "px");
      d.lbl.style.width = ""; d.lbl.style.display = "";
    });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
    const cur = () => (D.hov >= 0 ? D.hov : D.act);
    const slot = (k) => (k === D.hov ? 42 : k === D.act && D.hov < 0 ? 48 : 8);
    const gap = (n) => Math.max(12, Math.min(22, (innerHeight * 0.72 - (n * 8 + 48 + 42)) / (n - 1)));
    const hover = (k) => {
      if (k === D.hov) return;
      if (D.hov >= 0 && D.items[D.hov]) D.items[D.hov].li.classList.remove("open");
      D.hov = k;
      if (k >= 0 && D.items[k]) D.items[k].li.classList.add("open");
      dots.classList.toggle("is-hover", k >= 0);
    };
    dots.addEventListener("mouseover", (e) => { const b = e.target.closest("button"); hover(b ? D.items.findIndex((d) => d.li.contains(b)) : -1); });
    dots.addEventListener("mouseleave", () => hover(-1));
    dots.addEventListener("focusin", (e) => { const b = e.target.closest("button"); if (b) hover(D.items.findIndex((d) => d.li.contains(b))); });
    dots.addEventListener("focusout", () => hover(-1));
    dots.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("button"); if (!b || reduce) return;
      const host = document.createElement("span"); host.className = "cf-ripple-host";
      const rip = document.createElement("span"); rip.className = "cf-ripple"; host.appendChild(rip); b.appendChild(host);
      rip.animate([{ transform: "scale(.1)", opacity: 0.32 }, { transform: "scale(1)", opacity: 0 }], { duration: 460, easing: "cubic-bezier(.25,.46,.45,.94)" }).finished.then(() => host.remove());
    });
    gsap.ticker.add((t, dt) => {
      const f = Math.min((dt || 16.67) / 16.67, 3), n = D.items.length;
      if (!n) return;
      const vel = (scrollY - D.scroll) / f; D.scroll = scrollY;
      D.vel += (Math.max(-90, Math.min(90, vel)) - D.vel) * 0.1;
      const c = cur();
      const g = gap(n);
      let total = 0; for (let k = 0; k < n; k++) total += slot(k) + (k ? g : 0);
      let at = -total / 2;
      D.items.forEach((d, k) => {
        const h = slot(k), spread = reduce ? 0 : (-D.vel * 0.1 * (k - (n - 1) / 2)) / ((n - 1) / 2);
        const want = at + h / 2 + spread;
        if (d.y == null || reduce) d.y = want;
        else { const dist = Math.abs(k - (c < 0 ? k : c)); d.y += (want - d.y) * (1 - Math.pow(1 - 0.2 / (1 + dist * 0.08), f)); }
        d.li.style.transform = `translate3d(0,${d.y.toFixed(2)}px,0)`;
        at += h + g;
      });
    });
  }
  CF.setDot = (i, ink) => {
    if (!dots) return;
    D.act = i;
    D.items.forEach((d, k) => d.li.classList.toggle("active", k === i));
    dots.classList.toggle("is-ink", !!ink);
  };
  CF.showDots = (on) => dots && dots.classList.toggle("on", on);

  /* ---- Legal documents drawer ---- */
  const legal = document.querySelector(".cf-legal");
  if (legal) {
    const close = () => { legal.classList.remove("on"); if (CF.lenis) CF.lenis.start(); };
    document.querySelectorAll("[data-legal]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      legal.querySelector(".cf-legal__title").textContent = a.dataset.legal;
      legal.classList.add("on"); if (CF.lenis) CF.lenis.stop();
      legal.querySelector(".cf-legal__close").focus();
    }));
    legal.querySelector(".cf-legal__close").addEventListener("click", close);
    legal.addEventListener("click", (e) => { if (e.target === legal) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && legal.classList.contains("on")) close(); });
  }

  /* ---- Cursor (original rule): a 12px white dot follows with difference blend, 22% of the remaining distance per frame (the box too moves 22% to that spot), over links 2.67× and ink color.
     Over an ember button ([data-magnet]) the dot immediately becomes a box wrapping the button by 3px, growing 30% per frame (pulled ±3px horizontally and ±2px vertically toward the cursor)
     Holds the button text (name tag .06s later, over .2s). When leaving the button the box shrinks to a dot and the color returns after .25s ---- */
  if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const root = document.documentElement;
    const dot = document.createElement("div"); dot.className = "cf-cursor"; dot.setAttribute("aria-hidden", "true");
    const lbl = document.createElement("span"); lbl.className = "cf-cursor__label"; dot.appendChild(lbl);
    document.body.appendChild(dot);
    root.classList.add("has-cursor", "cursor-hidden");
    const S0 = 12;
    let mx = -100, my = -100, kx = -100, ky = -100, seen = false, mag = null, unmag = 0;
    const box = { x: -100, y: -100, w: S0, h: S0 };
    const clamp = (a, b, v) => Math.min(b, Math.max(a, v));
    const inside = (r, pad) => mx >= r.left - pad && mx <= r.right + pad && my >= r.top - pad && my <= r.bottom + pad;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (!seen) { seen = true; kx = mx; ky = my; box.x = mx - S0 / 2; box.y = my - S0 / 2; } root.classList.remove("cursor-hidden"); }, { passive: true });
    /* The dot grows over links, except ember buttons (magnet) which turn into a box */
    document.addEventListener("mouseover", (e) => { const a = e.target.closest && e.target.closest('a, button, [role="button"]'); root.classList.toggle("cursor-link", !!a && !a.matches(".cf-fuse, [data-magnet]")); }, { passive: true });
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget) { mx = my = -100; mag = null; root.classList.add("cursor-hidden"); } });
    gsap.ticker.add((t, dt) => {
      if (!seen) return;
      const f = Math.min((dt || 16.67) / 16.67, 3), kp = 1 - Math.pow(1 - 0.22, f), kb = 1 - Math.pow(1 - 0.3, f);
      kx += (mx - kx) * kp; ky += (my - ky) * kp;
      if (mag && !inside(mag.getBoundingClientRect(), 12)) { mag = null; unmag = performance.now(); }
      if (!mag) mag = [...document.querySelectorAll(".cf-fuse, [data-magnet]")].find((el) => el.offsetParent !== null && inside(el.getBoundingClientRect(), 0)) || null;
      if (mag && lbl._for !== mag) { lbl._for = mag; lbl.textContent = mag.textContent.trim(); lbl.style.font = getComputedStyle(mag).font; }
      root.classList.toggle("cursor-mag", !!mag);
      root.classList.toggle("cursor-unmag", !mag && performance.now() - unmag < 600);
      root.classList.toggle("cursor-coral", !!(mag && mag.matches(".qf-ok")));
      let tx = kx - S0 / 2, ty = ky - S0 / 2, tw = S0, th = S0;
      if (mag) {
        const r = mag.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        tx = r.left - 3 + clamp(-3, 3, (mx - cx) * 0.12); ty = r.top - 3 + clamp(-2, 2, (my - cy) * 0.2); tw = r.width + 6; th = r.height + 6;
      }
      /* 30% only when magnetic or when the box is larger than the dot, and 22% for the box too when it simply follows */
      const kc = mag || box.w > S0 + 0.5 || box.h > S0 + 0.5 ? kb : kp;
      box.x += (tx - box.x) * kc; box.y += (ty - box.y) * kc; box.w += (tw - box.w) * kc; box.h += (th - box.h) * kc;
      dot.style.transform = `translate3d(${box.x.toFixed(1)}px,${box.y.toFixed(1)}px,0)`;
      dot.style.width = box.w.toFixed(1) + "px"; dot.style.height = box.h.toFixed(1) + "px";
    });
  }

  /* ---- Same-page anchors go through Lenis ---- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-legal")) return;
    const id = a.getAttribute("href").slice(1);
    const t = id === "top" ? 0 : document.getElementById(id);
    if (t === null) return;
    e.preventDefault();
    CF.scrollTo(t);
  });
})();
