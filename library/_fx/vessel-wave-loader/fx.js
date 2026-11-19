// Inside a vessel shape (glass, bottle) waves fill up with the progress and the number climbs, then the whole panel lifts up. If there is a confirmation gate it pauses at 10% to ask, and after pressing continues filling from 85%
(() => {
  kfFx.register("vessel-wave-loader", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const center = part("center"), percent = part("percent"), gate = part("gate"), yes = gate?.querySelector('[data-fx-part="yes"]');
    const key = options.key || "";
    const passed = () => { try { return !!key && sessionStorage.getItem(key) === "1"; } catch { return false; } };
    const dur = +(options.dur ?? 2.4), first = +(options.first ?? 10), pause = +(options.pause ?? 2), resume = +(options.resume ?? 85);
    const finishDur = +(options.finish ?? 2), out = +(options.out ?? 2.1), fade = +(options.fade ?? 1), wait = +(options.wait ?? 0.5);
    const outEase = options.ease || "power4.inOut", fadeEase = options["fade-ease"] || "power2.inOut";
    const paint = (v) => { el.style.setProperty("--fx-progress", String(v / 100)); if (percent) percent.textContent = `${Math.round(v)}%`; };
    const tweens = [];
    const add = (t) => (tweens.push(t), t);
    const done = () => {
      paint(100);
      add(gsap.to(el, { yPercent: -100, duration: reduce ? 0 : out, ease: outEase, onComplete: () => { el.hidden = true; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); } }));
    };
    const count = (from, to, d, ease, then) => { const p = { v: from }; add(gsap.to(p, { v: to, duration: reduce ? 0 : d, ease, data: "count", onUpdate: () => paint(p.v), onComplete: then })); };
    paint(0);
    if (gate) gate.hidden = true;
    if (reduce || !gate || passed()) count(0, 100, dur, "sine.inOut", done);
    else {
      count(0, first, pause, "none", () => {
        count(first, resume, +(options.creep ?? 2.2), "sine.inOut");
        const show = () => { gate.hidden = false; add(gsap.delayedCall(wait, () => { add(gsap.fromTo(gate, { opacity: 0 }, { opacity: 1, duration: fade, ease: fadeEase })); (yes || gate).focus?.({ preventScroll: true }); })); };
        center ? add(gsap.to(center, { autoAlpha: 0, duration: fade, ease: fadeEase, onComplete: show })) : show();
      });
    }
    const onYes = () => {
      if (key) try { sessionStorage.setItem(key, "1"); } catch {}
      gate.style.pointerEvents = "none";
      add(gsap.to(gate, { opacity: 0, duration: fade, ease: fadeEase, onComplete: () => add(gsap.delayedCall(wait, () => {
        gate.hidden = true;
        tweens.forEach((t) => t.data === "count" && t.kill());
        paint(resume);
        if (center) add(gsap.to(center, { autoAlpha: 1, duration: fade, ease: fadeEase }));
        count(resume, 100, finishDur, "power1.out", done);
      })) }));
    };
    yes?.addEventListener("click", onYes);
    return () => {
      yes?.removeEventListener("click", onYes);
      tweens.forEach((t) => t.kill());
      gsap.set(el, { clearProps: "transform" });
      if (center) gsap.set(center, { clearProps: "opacity,visibility" });
      el.style.removeProperty("--fx-progress");
    };
  });
})();
