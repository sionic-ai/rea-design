// A small logo pane grows in place into the menu pane (width 172→680 · height from the top row to the inside, .5s cubic-bezier(.35,0,.35,1)), and the inside follows .12s later for .3s — Brand header
(() => {
  kfFx.register("panel-grow-menu", (el, { options, reduce }) => {
    const panel = el.querySelector('[data-fx-part="panel"]'), bar = el.querySelector('[data-fx-part="bar"]');
    const toggle = el.querySelector('[data-fx-part="toggle"]'), body = el.querySelector('[data-fx-part="body"]'), veil = el.querySelector('[data-fx-part="veil"]');
    if (!panel || !bar || !toggle || !body) return;
    const from = +(options.from ?? 172), to = +(options.to ?? 680), dur = reduce ? 0 : +(options.dur ?? 0.5), delay = +(options.delay ?? 0.12);
    const narrow = matchMedia(`(max-width: ${+(options.narrow ?? 1023)}px)`);
    const ease = kfFx.ease("0.35,0,0.35,1", "power2.inOut");
    let open = false;
    const fit = () => { if (!open) gsap.set(panel, { width: narrow.matches ? "100%" : from, height: bar.offsetHeight }); };
    body.inert = true;
    toggle.setAttribute("aria-expanded", "false");
    fit();
    const set = (v) => {
      if (v === open) return;
      open = v;
      el.classList.toggle("is-fx-open", v);
      toggle.setAttribute("aria-expanded", String(v));
      body.inert = !v;
      const h = bar.offsetHeight + (v ? body.scrollHeight : 0);
      gsap.to(panel, { width: narrow.matches ? "100%" : v ? to : from, height: Math.min(h, innerHeight - 32), duration: dur, ease, overwrite: "auto" });
      gsap.to(body, { opacity: v ? 1 : 0, duration: reduce ? 0 : 0.3, delay: v && !reduce ? delay : 0, overwrite: "auto" });
    };
    const flip = () => set(!open), shut = () => set(false), key = (e) => { if (e.key === "Escape") set(false); };
    toggle.addEventListener("click", flip);
    veil?.addEventListener("click", shut);
    addEventListener("keydown", key);
    narrow.addEventListener("change", fit);
    return () => {
      toggle.removeEventListener("click", flip);
      veil?.removeEventListener("click", shut);
      removeEventListener("keydown", key);
      narrow.removeEventListener("change", fit);
      gsap.killTweensOf([panel, body]);
      gsap.set([panel, body], { clearProps: "width,height,opacity" });
      el.classList.remove("is-fx-open");
      body.inert = false;
    };
  });
})();
