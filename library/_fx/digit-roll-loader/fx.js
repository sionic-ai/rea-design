(() => {
  kfFx.register("digit-roll-loader", (el, { options, reduce }) => {
    const KEY = "fx-digit-roll-loader";
    const once = (options.every || "session") !== "visit";
    const finish = () => { el.classList.add("is-fx-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce || (once && sessionStorage.getItem(KEY))) { finish(); return () => el.classList.remove("is-fx-done"); }
    if (once) sessionStorage.setItem(KEY, "1");
    const to = String(Math.max(0, Math.round(+(options.to ?? 100))));
    const list = (s, d) => (s ? String(s).split(",").map(Number) : d);
    const durs = list(options.durs, [0.8, 1.3, 2]), delays = list(options.delays, [1.2, 0.8, 0.4]);
    const last = (a, i) => a[Math.min(i, a.length - 1)];
    const hold = +(options.hold ?? 0.6), out = +(options.out ?? 0.4), fade = +(options.fade ?? 0.4);
    const ease = kfFx.ease("0.327,0.007,0.327,0.96", "power2.inOut");

    const wrap = document.createElement("div");
    wrap.className = "fx-dr__wrap";
    const row = document.createElement("div");
    row.className = "fx-dr__row";
    wrap.append(row);
    // First digit is 0 → that number. The rest spin through 0–9 once and land on that number
    const strips = [...to].map((ch, i) => {
      const n = +ch, digits = i === 0 ? Array.from({ length: n + 1 }, (_, k) => k) : [...Array(10).keys(), n];
      const col = document.createElement("div");
      col.className = "fx-dr__col";
      const strip = document.createElement("div");
      strip.className = "fx-dr__strip";
      strip.innerHTML = digits.map((d) => `<span>${d}</span>`).join("");
      col.append(strip);
      row.append(col);
      return { strip, steps: digits.length - 1, i };
    });
    el.append(wrap);
    const tl = gsap.timeline({ onComplete: finish });
    let end = 0;
    strips.forEach(({ strip, steps, i }) => {
      const d = last(durs, i), at = last(delays, i);
      tl.fromTo(strip, { yPercent: 0 }, { yPercent: -100 * steps / (steps + 1), duration: d, ease }, at);
      end = Math.max(end, at + d);
    });
    tl.to(row, { yPercent: -100, duration: out, ease }, end + hold)
      .to(el, { opacity: 0, duration: fade, ease: "power3.out" }, end + hold + out);
    return () => { tl.kill(); wrap.remove(); gsap.set(el, { clearProps: "opacity" }); el.classList.remove("is-fx-done"); };
  });
})();
