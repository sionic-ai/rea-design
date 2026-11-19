// Pressing the menu button slides the panel in from the right (.75s power3.out). On the left a dark overlay fades in over .3s, then .1s later the card on the overlay pops up from .8x scale.
// On close, the curtain and cards clear first and the board leaves in .3s — original TweenMax values
(() => {
  kfFx.register("side-drawer", (el, { options, reduce }) => {
    const q = (p) => el.querySelector(`[data-fx-part="${p}"]`);
    const toggle = q("toggle"), layer = q("layer"), panel = q("panel"), lay = q("lay");
    if (!toggle || !layer || !panel) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.75), out = reduce ? 0 : +(options.close ?? 0.3), fade = reduce ? 0 : +(options.fade ?? 0.3), wait = reduce ? 0 : +(options.delay ?? 0.1);
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    // fade-ease — curtain curve. Default is the GSAP default (power1.out) as is
    const fadeEase = kfFx.ease(options["fade-ease"] || "power1.out", "power1.out");
    const ac = new AbortController(), on = { signal: ac.signal };
    let open = false, call;
    gsap.set(panel, { xPercent: 100 });
    if (lay) gsap.set(lay, { opacity: 0 });
    const set = (v) => {
      open = v;
      el.classList.toggle("is-open", v);
      toggle.setAttribute("aria-expanded", String(v));
      call?.kill();
      if (v) {
        layer.style.display = "block";
        call = gsap.delayedCall(wait, () => el.classList.add("is-view"));
        gsap.to(panel, { xPercent: 0, duration: dur, ease, overwrite: true });
        if (lay) gsap.to(lay, { opacity: 1, duration: fade, ease: fadeEase, overwrite: true });
      } else {
        el.classList.remove("is-view");
        if (lay) gsap.to(lay, { opacity: 0, duration: fade, ease: fadeEase, overwrite: true });
        gsap.to(panel, { xPercent: 100, duration: out, ease, overwrite: true, onComplete: () => { if (!open) layer.style.display = "none"; } });
      }
    };
    toggle.addEventListener("click", () => set(!open), on);
    lay?.addEventListener("click", (e) => { if (e.target === lay) set(false); }, on);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) set(false); }, on);
    return () => { ac.abort(); call?.kill(); gsap.killTweensOf([panel, lay].filter(Boolean)); gsap.set([panel, lay].filter(Boolean), { clearProps: "all" }); layer.style.display = ""; el.classList.remove("is-open", "is-view"); };
  });
})();
