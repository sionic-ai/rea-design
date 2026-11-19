// The curtain is itself a part — it splits letters and floats them up twice, and the curtain lifts when the text line blurs. Only the first time in the same window
(() => {
  kfFx.register("letter-bob-loader", (el, { options, reduce }) => {
    const KEY = "kf-fx-letter-bob-loader";
    const fire = (name) => document.dispatchEvent(new Event(name));
    const hide = () => { el.style.display = "none"; };
    if (reduce || (options.every !== "true" && sessionStorage.getItem(KEY) === "1")) { hide(); fire("fx:reveal"); fire("fx:done"); return; }
    sessionStorage.setItem(KEY, "1");
    const host = el.querySelector('[data-fx-part="text"]');
    const veil = el.querySelector('[data-fx-part="veil"]') || el;
    const saved = host ? [...host.childNodes] : [];
    const text = host ? host.textContent.trim() : "";
    const chars = [...text].map((c) => { const s = document.createElement("span"); s.className = "fx-lbl-ch"; s.textContent = c; return s; });
    if (host && chars.length) { const sr = document.createElement("span"); sr.className = "fx-sr"; sr.textContent = text; const box = document.createElement("span"); box.setAttribute("aria-hidden", "true"); box.append(...chars); host.replaceChildren(box, sr); }
    const each = +(options.each ?? 0.2), dur = +(options.dur ?? 1), rise = +(options.rise ?? 5), times = +(options.times ?? 2);
    const gap = +(options.gap ?? 0.1), hold = +(options.hold ?? 0.2), fade = +(options.fade ?? 0.5), lift = +(options.veil ?? 1.5);
    const ease = kfFx.ease(options.ease || "power4.out", "power4.out");
    const tl = gsap.timeline({ onComplete: () => { hide(); fire("fx:done"); } });
    if (chars.length) {
      gsap.set(chars, { y: rise, opacity: 0 });
      tl.to(chars, { y: 0, opacity: 1, duration: dur, stagger: each, repeat: Math.max(0, times - 1), repeatDelay: gap, ease });
      tl.to(host, { opacity: 0, duration: fade, delay: hold, ease });
    }
    // The original starts lifting the curtain at the same time the text lines begin to blur (after a .2s pause) — hero text counts from this moment (fx:reveal)
    tl.add(() => fire("fx:reveal"), chars.length ? "<" : 0);
    tl.to(veil === el ? el : veil, { opacity: 0, duration: lift, ease }, "<");
    if (veil !== el) tl.set(el, { opacity: 0 });
    return () => { tl.kill(); if (host) host.replaceChildren(...saved); gsap.set([el, veil, host].filter(Boolean), { clearProps: "opacity,display" }); };
  });
})();
