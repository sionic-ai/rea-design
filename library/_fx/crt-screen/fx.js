(() => {
  let uid = 0;
  kfFx.register("crt-screen", (el, { options }) => {
    const num = (k, d) => +(options[k] ?? d);
    const set = (k, v) => el.style.setProperty(`--fx-${k}`, v);
    if (options.scan != null) set("scan", num("scan", 0.18));
    if (options.gap != null) set("gap", num("gap", 3) + "px");
    if (options.vignette != null) set("vignette", num("vignette", 0.35));
    if (options.glow != null) set("glow", num("glow", 0.05));
    if (options.grain != null) set("grain", num("grain", 0.05));
    const parts = ["grain", "scan", "glare", "vignette", "bezel"].map((n) => {
      const i = document.createElement("i");
      i.className = `fx-crt-${n}`;
      el.append(i);
      return i;
    });
    // Red is pushed left and blue right so they overlap — a filter on the document root so only one, off on narrow screens and Safari
    const shift = num("chroma", 0.8);
    const root = document.documentElement;
    const id = `fx-crt-chroma-${++uid}`;
    let defs = null, mq = null, apply = null;
    const safari = CSS.supports("-webkit-hyphens", "none") && !CSS.supports("hyphens", "auto");
    if (shift && !safari && !root.dataset.fxCrtChroma) {
      const ns = "http://www.w3.org/2000/svg";
      defs = document.createElementNS(ns, "svg");
      defs.setAttribute("class", "fx-crt-defs");
      defs.setAttribute("aria-hidden", "true");
      defs.innerHTML = `<defs><filter id="${id}" x="0%" y="0%" width="100%" height="100%">
        <feOffset in="SourceGraphic" dx="${-shift}" dy="0" result="r"/><feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="ro"/>
        <feOffset in="SourceGraphic" dx="${shift}" dy="0" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bo"/>
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="go"/>
        <feBlend in="ro" in2="go" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen"/></filter></defs>`;
      el.append(defs);
      root.dataset.fxCrtChroma = id;
      mq = matchMedia("(min-width: 769px)");
      apply = () => (root.style.filter = mq.matches ? `url(#${id})` : "");
      apply();
      mq.addEventListener("change", apply);
    }
    return () => {
      parts.forEach((p) => p.remove());
      if (defs) {
        mq.removeEventListener("change", apply);
        if (root.dataset.fxCrtChroma === id) { root.style.filter = ""; delete root.dataset.fxCrtChroma; }
        defs.remove();
      }
      ["scan", "gap", "vignette", "glow", "grain"].forEach((k) => el.style.removeProperty(`--fx-${k}`));
    };
  });
})();
