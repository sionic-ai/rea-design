// The image is sliced into six horizontal strips that jitter sideways while waiting, then snap into place, and once flattened the background-color strips open — original brand loader order and values
(() => {
  kfFx.register("slice-jitter-loader", (el, { options, reduce }) => {
    const KEY = "kf-fx-slice-jitter-loader";
    const done = () => document.dispatchEvent(new Event("fx:loaded"));
    const art = el.querySelector('[data-fx-part="art"]');
    if (!art) return () => {};
    if (reduce || (!(options.every === "true") && sessionStorage.getItem(KEY) === "1")) { el.style.display = "none"; done(); return () => {}; }
    sessionStorage.setItem(KEY, "1");
    const minDur = +(options.min ?? 1.2), hold = +(options.hold ?? 0.7);
    const title = el.querySelector('[data-fx-part="title"]'), bar = el.querySelector('[data-fx-part="bar"]'), pct = el.querySelector('[data-fx-part="pct"]');
    const made = [];
    const add = (tag, cls, parent = el) => { const n = document.createElement(tag); n.className = cls; parent.append(n); made.push(n); return n; };
    // Image panel: height follows the image ratio, and each strip pulls the same image upward so only its share shows
    const box = add("div", "fx-sj-art");
    const r0 = art.getBoundingClientRect(), ratio = (art.viewBox?.baseVal?.height || r0.height || 3) / (art.viewBox?.baseVal?.width || r0.width || 2);
    box.style.aspectRatio = `1 / ${ratio}`;
    const BANDS = [[0, 18], [18, 19], [37, 16], [53, 12], [65, 17], [82, 18]];
    const f = BANDS.map(([top, h]) => {
      const fr = add("div", "fx-sj-frag", box); fr.style.top = `${top}%`; fr.style.height = `${h}%`;
      const c = art.cloneNode(true); c.removeAttribute("data-fx-part"); c.style.top = `${(-top / h) * 100}%`; fr.append(c); return fr;
    });
    const mid = add("div", "fx-sj-mid");
    if (title) { const m = document.createElement("span"); m.className = "fx-sj-mask"; title.replaceWith(m); m.append(title); mid.append(m); }
    let prog = null;
    if (bar || pct) { prog = add("div", "fx-sj-prog", mid); const tr = add("div", "fx-sj-track", prog); if (bar) tr.append(bar); if (pct) prog.append(pct); }
    const band = add("div", "fx-sj-band");
    const u = (v) => (v * box.offsetWidth) / 465;
    const ctx = gsap.context(() => {});
    let raf = 0, cap = 0, alive = true, ready = !options.wait;
    const onReady = () => (ready = true);
    if (options.wait) document.addEventListener(options.wait, onReady);
    ctx.add(() => {
      gsap.set(f, { autoAlpha: 0, scale: 1.06 });
      [[-2, -1], [1, -2], [-1, 1], [2, 1], [-1, -1], [1, 2]].forEach(([x, y], i) => gsap.set(f[i], { xPercent: x, yPercent: y }));
      gsap.to(f, { autoAlpha: 0.16, xPercent: 0, yPercent: 0, scale: 1, duration: 0.26, ease: "power4.out", delay: 0.03 });
      if (prog) gsap.fromTo(prog, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.out", delay: 0.3 });
      if (title) gsap.fromTo(title, { yPercent: 115, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 2.1, ease: kfFx.ease("0.17,0.67,0.1,0.99", "power3.out"), delay: 0.85 });
    });
    const [a, b, c, d, e, g] = f;
    const jit = gsap.timeline({ delay: 0.3, repeat: -1, repeatDelay: 0.25 })
      .set(c, { x: u(-46), autoAlpha: 1 }, 0.06).set(e, { x: u(31), autoAlpha: 1 }, 0.13)
      .to(c, { x: u(24), scaleX: 1.07, duration: 0.11, ease: "power1.in" }, 0.18).set(b, { x: u(54), autoAlpha: 1 }, 0.26)
      .set(c, { x: u(-28), scaleX: 0.985 }, 0.3).to(c, { x: u(-11), scaleX: 1, duration: 0.18, ease: "power3.out" }, 0.31)
      .to(e, { x: u(-34), scaleX: 1.045, duration: 0.13, ease: "power1.in" }, 0.31).set(g, { x: u(-41), autoAlpha: 1 }, 0.43).set(e, { x: u(18), scaleX: 1 }, 0.45)
      .add("slip", 0.78).set(a, { x: u(37), autoAlpha: 1 }, "slip").set(d, { x: u(-52), autoAlpha: 1 }, "slip+=0.07")
      .to(a, { x: u(-29), scaleX: 1.055, duration: 0.14, ease: "power2.in" }, "slip+=0.08").to(d, { x: u(43), scaleX: 1.08, duration: 0.12, ease: "power2.in" }, "slip+=0.15")
      .set(a, { x: u(14), scaleX: 1 }, "slip+=0.23").set(d, { x: u(-17), scaleX: 0.99 }, "slip+=0.28").to(d, { x: u(27), scaleX: 1, duration: 0.17, ease: "power3.out" }, "slip+=0.29")
      .add("resolve", "slip+=0.5").to([a, b, c, d, e, g], { x: 0, duration: 0.15, ease: "power3.out", stagger: 0.06 }, "resolve");
    const finish = () => {
      if (!alive) return;
      jit.kill();
      const strong = kfFx.ease("0.76,0,0.24,1", "power3.inOut"), ex = "cubic-bezier(0.87, 0, 0.13, 1)";
      const tl = gsap.timeline({ onComplete: () => setTimeout(close, hold * 1000) }).to(f, { autoAlpha: 1, scaleX: 1, duration: 0.12, ease: "power1.out" }, 0);
      [[7, 0.34, 0], [-4, 0.36, 0.025], [3, 0.34, 0.045], [-9, 0.38, 0.06], [4, 0.34, 0.08], [-3, 0.36, 0.1]].forEach(([x, duration, at], i) => tl.to(f[i], { x, duration, ease: strong }, at));
      const close = () => {
        if (!alive) return;
        mid.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease-in", fill: "forwards" });
        box.animate([{ transform: "translate(-50%, -50%) scaleY(1)", opacity: 1 }, { transform: "translate(-50%, -50%) scaleY(0.025)", opacity: 1, offset: 0.97 }, { transform: "translate(-50%, -50%) scaleY(0.025)", opacity: 0 }], { delay: 40, duration: 380, easing: ex, fill: "forwards" });
        const k = 0.08 / 0.58;
        band.animate([{ transform: "scaleY(0)", easing: "linear" }, { transform: `scaleY(${3 / Math.max(innerHeight, 1)})`, offset: k, easing: ex }, { transform: "scaleY(1)" }], { delay: 340, duration: 580, fill: "forwards" })
          .finished.then(() => { if (!alive) return; el.style.display = "none"; done(); }).catch(() => {});
      };
    };
    // Progress: follows the smaller of the ready share (0 or 1) and the minimum length at a .14 ratio
    const t0 = performance.now(); let v = 0;
    cap = setTimeout(() => (ready = true), 6000);
    const step = () => {
      const target = Math.min(ready ? 1 : 0.9, Math.min(1, (performance.now() - t0) / 1000 / Math.max(0.001, minDur)));
      v += (target - v) * 0.14; if (target - v < 0.002) v = target;
      if (bar) bar.style.transform = `scaleX(${v})`;
      if (pct) pct.textContent = `${Math.round(v * 100)}%`;
      if (v >= 1) { clearTimeout(cap); finish(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      alive = false; cancelAnimationFrame(raf); clearTimeout(cap); jit.kill(); ctx.revert();
      if (options.wait) document.removeEventListener(options.wait, onReady);
      if (title && title.parentElement?.classList.contains("fx-sj-mask")) el.append(title);
      if (bar) el.append(bar); if (pct) el.append(pct);
      made.forEach((n) => n.remove()); el.style.display = "";
    };
  });
})();
