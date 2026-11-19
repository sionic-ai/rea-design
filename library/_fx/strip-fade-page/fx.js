(() => {
  // The original (Brand) uses the same five strips for both the curtain and the page turn — on entering, each is delayed .1s and turns transparent at .7s, on leaving, each is delayed .05s and covers at .15s, then navigates after 450ms (400ms on phone)
  kfFx.register("strip-fade-page", (root, { options, reduce }) => {
    if (reduce) return;
    // widths — width ratio per strip (Brand fit to ruled cells: 3 23 23 23 23 23 23 3). If given, the strip count is that count
    const nums = (s) => String(s || "").trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const widths = nums(options.widths), widthsSp = nums(options["widths-sp"]);
    const count = widths.length || Math.max(1, Math.round(+(options.count || 5)));
    const go = +(options.go ?? 0.45), goSp = +(options["go-sp"] ?? 0.4);
    const veil = document.createElement("div");
    veil.className = "fx-sfp";
    veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = Array.from({ length: count }, (_, i) => {
      const w = widths[i] != null ? `;--w:${widths[i]}` : "";
      const ws = widthsSp.length ? (widthsSp[i] != null ? `;--ws:${widthsSp[i]}` : "") : "";
      return `<i style="--i:${i}${w}${ws}"${widthsSp.length && widthsSp[i] == null ? ' class="is-sp-off"' : ""}></i>`;
    }).join("");
    for (const k of ["out", "out-step", "out-delay", "in", "in-step"]) if (options[k] != null) veil.style.setProperty(`--fx-${k}`, `${+options[k]}s`);
    // logo: true — [data-fx-part inside the attached element=logo] moved to the center of the curtain, so that when opening it wipes away right→left and when covering it wipes in (Brand)
    const logo = options.logo === "true" ? root.querySelector('[data-fx-part="logo"]') : null;
    const home = logo && { parent: logo.parentNode, next: logo.nextSibling };
    if (logo) { const box = document.createElement("div"); box.className = "fx-sfp__logo"; box.append(logo); veil.append(box); }
    document.body.append(veil);
    const ac = new AbortController(), on = { signal: ac.signal };
    let timer = 0;
    const open = () => requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("is-open")));
    // If attached at first open it starts covered and then lifts. An element added after everything has opened stays lifted
    if (options.wait) document.addEventListener(options.wait, open, { once: true, ...on });
    else if (document.readyState === "complete") veil.classList.add("is-open");
    else addEventListener("load", open, { once: true, ...on });
    addEventListener("pageshow", (e) => { if (e.persisted) { clearTimeout(timer); veil.classList.remove("is-cover"); veil.classList.add("is-open"); } }, on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href) || a.origin !== location.origin) return;
      const [here] = location.href.split("#"), [there] = a.href.split("#");
      if (here === there) return;
      e.preventDefault();
      veil.classList.add("is-open", "is-cover");
      timer = setTimeout(() => (location.href = a.href), (innerWidth < 768 ? goSp : go) * 1000);
    }, on);
    return () => {
      ac.abort(); clearTimeout(timer);
      if (logo && home.parent.isConnected) home.parent.insertBefore(logo, home.next && home.next.parentNode === home.parent ? home.next : null);
      veil.remove();
    };
  });
})();
