(() => {
  // Reads hue and saturation from the accent color (--kf-accent) and uses hsl — when the skin changes, the gradient colors follow
  const hueOf = (el) => {
    const probe = document.createElement("i");
    probe.style.color = getComputedStyle(el).getPropertyValue("--kf-accent").trim() || "currentColor";
    el.append(probe);
    const m = (getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((v) => +v / 255);
    probe.remove();
    const [r, g, b] = m, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
    if (!d) return [0, 0];
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [Math.round(((h * 60) + 360) % 360), Math.round(s * 100)];
  };

  kfFx.register("hue-breath-loader", (el, { options, reduce }) => {
    const KEY = "fx-hue-breath-seen";
    const once = options.once != null && options.once !== "0";
    const finish = () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || (once && sessionStorage.getItem(KEY))) { finish(); return; }
    if (once) sessionStorage.setItem(KEY, "1");

    const cont = el.querySelector('[data-fx-part="cont"]');
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const [h0, s0] = hueOf(el);
    const hue = +(options.hue ?? h0), sat = +(options.sat ?? s0);
    const low = +(options.low ?? 85), d1 = +(options.dur ?? 1), d2 = +(options["dur-end"] ?? 1.4);
    const hold = +(options.hold ?? 1), fade = +(options.fade ?? 0.8);
    const p = { sl: 100, el: 100, sa: 1, ea: 1 };
    let w = 0, hgt = 0;
    const size = () => {
      const r = devicePixelRatio || 1;
      w = el.clientWidth; hgt = el.clientHeight;
      canvas.width = w * r; canvas.height = hgt * r;
    };
    const draw = () => {
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, `hsla(${hue}, ${sat}%, ${p.sl}%, ${p.sa})`);
      g.addColorStop(1, `hsla(${hue}, ${sat}%, ${p.el}%, ${p.ea})`);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const ro = new ResizeObserver(() => { size(); draw(); });
    ro.observe(el);
    size(); draw();

    // Both ends of the gradient brightness rise and fall separately (1s · 1.4s) — original TweenMax default curve (power1.out) · yoyo
    const t1 = gsap.to(p, { sl: low, duration: d1, repeat: -1, yoyo: true, ease: "power1.out", onUpdate: draw });
    const t2 = gsap.to(p, { el: low, duration: d2, repeat: -1, yoyo: true, ease: "power1.out", onUpdate: draw });
    requestAnimationFrame(() => el.classList.add("is-preloaded", "is-started"));

    let tl;
    const out = () => {
      tl = gsap.timeline({ delay: hold });
      if (cont) tl.to(cont, { opacity: 0, duration: 0.5, ease: "power1.out" });
      tl.add(() => {
        t1.kill(); t2.kill();
        gsap.to(p, { sl: 100, el: 100, sa: 0, duration: 0.5, ease: "power1.out", onUpdate: draw });
        gsap.to(p, { ea: 0, duration: 0.5, delay: 0.2, ease: "power1.out", onUpdate: draw });
      });
      tl.to(el, { opacity: 0, duration: fade, delay: 0.3, ease: "power1.out", onComplete: finish });
    };
    if (document.readyState === "complete") out();
    else addEventListener("load", out, { once: true });

    return () => {
      removeEventListener("load", out);
      t1.kill(); t2.kill(); tl?.kill();
      ro.disconnect();
      canvas.remove();
      el.classList.remove("is-preloaded", "is-started");
      gsap.set([el, cont].filter(Boolean), { clearProps: "opacity" });
    };
  });
})();
