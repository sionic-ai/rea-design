// Open and close can also be called on this element with fx:open · fx:close events — for app screens where the button is outside the dialog, like shortcuts · menu rows
(() => {
  const opened = new Set();
  document.addEventListener("keydown", (e) => e.key === "Escape" && opened.forEach((el) => el.dispatchEvent(new Event("fx:close"))));

  kfFx.register("dialog-pop", (el, { options, reduce }) => {
    const q = (role) => el.querySelectorAll(`[data-fx-part="${role}"]`);
    const scrim = q("scrim")[0], card = q("card")[0];
    if (!card) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const fade = options.fade != null && options.fade !== "false", d = reduce ? 0 : 1;
    // Original page transition: overlay · fade .3s (0.4,0,0.2,1) · card enter .225s (0,0,0.2,1) · exit .125s (0.4,0,1,1)
    // Given ease, all three curves become that one — the Brand campaign window has overlay and card both at .3s ease-out
    const one = options.ease ? kfFx.ease(options.ease, "power1.out") : null;
    const ui = one || kfFx.ease("0.4,0,0.2,1", "power2.inOut"), dIn = one || kfFx.ease("0,0,0.2,1", "power2.out"), dOut = one || kfFx.ease("0.4,0,1,1", "power2.in");
    const dim = +(options.dim ?? 0.32);
    // Bank confirmation dialog: only the card goes from .8 scale, delayed .2s, overshooting over .4s on curve (0,.89,.29,1.25) — taken as scale, wait, in-ease
    const s0 = +(options.scale ?? 0.9), wait = +(options.wait ?? 0) * d, inEase = options["in-ease"] ? kfFx.ease(options["in-ease"], "back.out(1.4)") : dIn;
    // remodal’s default theme zooms in from 1.05x and shrinks out to .95x — only the exit scale is set separately
    const sOut = +(options["scale-out"] ?? s0);
    const T = { scrim: +(options.scrim ?? 0.3), fadeT: +(options.fade_dur ?? 0.3), in: +(options.in ?? 0.225), out: +(options.out ?? 0.125) };
    // RainbowKit connect modal: the card rises from below by its own height in .35s cubic-bezier(.15,1.15,.6,1) with opacity separately in .15s — rise is a % of the card height
    const rise = +(options.rise ?? 0);
    // rise is a CSS animation in the original, so run it with Web Animations — GSAP starts on the next tick, so the first frame would paint one frame late
    const bez = (c, fb) => (c && String(c).includes(",") ? `cubic-bezier(${c})` : fb);
    const stopWaapi = () => [scrim, card].forEach((n) => n?.getAnimations?.().forEach((a) => a.cancel()));
    const open = () => {
      if (opened.has(el)) return;
      opened.add(el);
      el.classList.add("is-open");
      if (rise) {
        stopWaapi();
        gsap.killTweensOf([scrim, card].filter(Boolean));
        gsap.set(card, { clearProps: "opacity,transform" });
        const fadeEase = bez(options.ease, "ease");
        if (scrim) { gsap.set(scrim, { opacity: dim }); scrim.animate([{ opacity: 0 }, { opacity: dim }], { duration: T.scrim * d * 1000, easing: fadeEase }); }
        card.animate([{ transform: `translateY(${rise}%) scale(${s0})` }, { transform: "none" }], { duration: T.in * d * 1000, delay: wait * d * 1000, easing: bez(options["in-ease"], "ease-out"), fill: "backwards" });
        card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T.fadeT * d * 1000, delay: wait * d * 1000, easing: fadeEase, fill: "backwards" });
      } else {
        if (scrim) gsap.fromTo(scrim, { opacity: 0 }, { opacity: dim, duration: T.scrim * d, ease: ui });
        if (fade) gsap.fromTo(card, { opacity: 0, scale: 1 }, { opacity: 1, duration: T.fadeT * d, ease: ui });
        else gsap.fromTo(card, { opacity: 0, scale: s0 }, { opacity: 1, scale: 1, duration: T.in * d, delay: wait, ease: inEase });
      }
      card.querySelector("input, [autofocus]")?.focus();
    };
    const close = () => {
      if (!opened.has(el)) return;
      opened.delete(el);
      const done = () => el.classList.remove("is-open");
      if (rise) stopWaapi();
      if (scrim) gsap.to(scrim, { opacity: 0, duration: T.scrim * d, ease: ui, onComplete: done });
      gsap.to(card, fade ? { opacity: 0, duration: T.fadeT * d, ease: ui } : { opacity: 0, scale: sOut, duration: T.out * d, ease: dOut, onComplete: scrim ? null : done });
    };
    el.addEventListener("fx:open", open, on);
    el.addEventListener("fx:close", close, on);
    q("open").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); open(); }, on));
    q("close").forEach((b) => b.addEventListener("click", close, on));
    scrim?.addEventListener("click", close, on);
    return () => { ac.abort(); stopWaapi(); opened.delete(el); gsap.killTweensOf([scrim, card].filter(Boolean)); gsap.set([scrim, card].filter(Boolean), { clearProps: "opacity,transform" }); el.classList.remove("is-open"); };
  });
})();
