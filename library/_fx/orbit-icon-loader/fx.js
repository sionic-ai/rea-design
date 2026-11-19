// The original strings ten CSS keyframes together with delays — the same timetable is moved into one timeline so the duration option (dur) can shorten it all at once
(() => {
  const list = (s, n, make) => {
    const v = String(s || "").split(",").map((x) => +x).filter((x) => !Number.isNaN(x));
    return Array.from({ length: n }, (_, i) => (v.length ? v[Math.min(i, v.length - 1)] : make(i)));
  };
  kfFx.register("orbit-icon-loader", (el, { options, reduce }) => {
    const ring = el.querySelector('[data-fx-part="ring"]');
    if (!ring) return;
    const spin = el.querySelector('[data-fx-part="spin"]') || ring;
    const icons = [...el.querySelectorAll('[data-fx-part="icon"]')];
    const finish = (skipped) => {
      el.style.display = "none";
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true, detail: { skipped } }));
    };
    const key = options.once;
    let seen = false;
    try { seen = !!key && localStorage.getItem(key) === "true"; if (key) localStorage.setItem(key, "true"); } catch {}
    if (seen || reduce) { finish(true); return; }

    const n = icons.length, r = +(options.radius ?? 47), start = +(options.start ?? -124);
    icons.forEach((ic, i) => {
      const a = ((start - (i * 360) / n) * Math.PI) / 180;
      ic.style.left = `${50 + r * Math.cos(a)}%`;
      ic.style.top = `${50 + r * Math.sin(a)}%`;
    });
    const css = kfFx.ease("0.25,0.1,0.25,1", "power1.inOut");
    const e1 = kfFx.ease(options.ease || "0.42,0,0.36,0.98", "power2.inOut");
    const e2 = kfFx.ease("0.42,0,0.19,0.98", "power3.inOut");
    const ins = list(options.in, n, (i) => [0.6, 0.7, 1, 1.3, 1.6, 1.9][i] ?? 0.6 + i * 0.26);
    const outs = list(options.out, n, (i) => Math.min(4.2, 4 + i * 0.05));
    const outDur = list(options["out-dur"], n, (i) => (i < n / 2 ? 0.8 : 1));
    const tl = gsap.timeline({ onComplete: () => finish(false) });
    if (icons.length) gsap.set(icons, { autoAlpha: 0, scale: 0 });
    tl.fromTo(ring, { scale: 3 }, { scale: 1, duration: 3, ease: e1 }, 0.2)
      .to(ring, { scale: 0.4, duration: 1, ease: e2 }, 3.9)
      .fromTo(spin, { rotate: 0 }, { rotate: 720, duration: 3.4, ease: e1 }, 0.4)
      .fromTo(spin, { rotate: 0 }, { rotate: 720, duration: 3.4, ease: css, immediateRender: false }, 3.9);
    icons.forEach((ic, i) => {
      tl.to(ic, { autoAlpha: 1, scale: 1, duration: 2, ease: css }, ins[i]).to(ic, { scale: 0, duration: outDur[i], ease: css }, outs[i]);
    });
    tl.to(el, { autoAlpha: 0, duration: +(options.fade ?? 0.6), ease: "none" }, +(options.lift ?? 5));
    tl.timeScale(5.6 / (+(options.dur) || 5.6));
    return () => { tl.kill(); gsap.set([el, ring, spin, ...icons], { clearProps: "all" }); icons.forEach((ic) => { ic.style.left = ""; ic.style.top = ""; }); };
  });
})();
