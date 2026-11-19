(() => {
  // A 4px border outside the button spreads out from cloud clumps — a 60-frame noise threshold sprite is laid down as a mask and the frames are flipped (the original also uses a 60-frame sprite)
  const NS = "http://www.w3.org/2000/svg";
  const FRAMES = 60;
  let sprite = null, grainId = null, uid = 0;

  // Four layers of value noise — each section cuts the same noise at a different threshold, section 0 (all visible) → section 59 (all hidden)
  function makeSprite() {
    const S = 64, cv = document.createElement("canvas");
    cv.width = S * FRAMES; cv.height = S;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(cv.width, S);
    const G = 9, grid = Array.from({ length: (G + 1) * (G + 1) * 4 }, (_, i) => Math.abs(Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1);
    const val = (x, y, o) => {
      const g = G >> (3 - o) || 1, fx = x * g, fy = y * g, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      const at = (a, b) => grid[(((b % (G + 1)) * (G + 1) + (a % (G + 1))) * 4 + o) % grid.length];
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      return (at(ix, iy) * (1 - sx) + at(ix + 1, iy) * sx) * (1 - sy) + (at(ix, iy + 1) * (1 - sx) + at(ix + 1, iy + 1) * sx) * sy;
    };
    const field = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      let n = 0, a = 0.5;
      for (let o = 0; o < 4; o++, a *= 0.5) n += val(x / S, y / S, o) * a;
      field[y * S + x] = n / 0.9375;
    }
    for (let f = 0; f < FRAMES; f++) {
      const t = (f / (FRAMES - 1)) * 1.1 - 0.05;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = (y * cv.width + f * S + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = field[y * S + x] > t ? 255 : 0;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
  }

  // Make the border line sparse like grains — the original used a grain image as the line pattern
  function ensureGrain() {
    if (grainId) return grainId;
    grainId = "fx-cloud-ring-grain";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    svg.innerHTML = `<defs><filter id="${grainId}" x="-2%" y="-10%" width="104%" height="120%">` +
      `<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="3" result="n"/>` +
      `<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3.2 -1.05" result="g"/>` +
      `<feComposite in="SourceGraphic" in2="g" operator="in"/></filter></defs>`;
    document.body.append(svg);
    return grainId;
  }

  kfFx.register("cloud-ring-hover", (el, { options, reduce, hover }) => {
    const reveal = +(options.reveal ?? 0.7);
    const hideDur = +(options.hide ?? 0.35);
    const ring = options.ring !== "off";
    const fill = options.look === "fill";
    sprite ||= makeSprite();
    el.style.setProperty("--fx-cloud-sprite", `url("${sprite}")`);
    const gid = ensureGrain();
    const made = [];
    const mk = (part, pad, rx) => {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("data-fx-part", part);
      svg.innerHTML = `<rect x="0.5" y="0.5" rx="${rx}" ry="${rx}" fill="none" stroke-width="1" filter="url(#${gid})"/>`;
      el.prepend(svg);
      made.push(svg);
      return { svg, rect: svg.firstChild, pad };
    };
    const border = el.querySelector(':scope > [data-fx-part="border"]') ? null : mk("border", 0, options.radius ?? 3.5);
    const halo = ring && !fill ? mk("ring", 8, (+(options.radius ?? 3.5) + 0.75)) : null;
    if (fill) { const f = document.createElement("span"); f.setAttribute("data-fx-part", "fill"); f.setAttribute("aria-hidden", "true"); el.prepend(f); made.push(f); }

    // Line rolling text — [data-fx-part=If label] is present, the same text is placed once more below and swapped in 120% upward
    const label = el.querySelector('[data-fx-part="label"]');
    let twin = null;
    if (label && options.roll !== "off") {
      twin = label.cloneNode(true);
      twin.setAttribute("data-fx-part", "label-twin");
      twin.setAttribute("aria-hidden", "true");
      label.after(twin);
      label.parentElement.classList.add("fx-crh-roll");
    }

    const size = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (w < 1 || h < 1) return;
      if (border) { border.rect.setAttribute("width", String(w - 1)); border.rect.setAttribute("height", String(h - 1)); }
      if (halo) { halo.rect.setAttribute("width", String(w + 7)); halo.rect.setAttribute("height", String(h + 7)); }
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const st = { p: 0 };
    const frame = () => el.style.setProperty("--fx-cloud-x", `${(Math.round((1 - st.p) * (FRAMES - 1)) / (FRAMES - 1)) * 100}%`);
    frame();
    const go = (to) => {
      if (reduce) { st.p = to; frame(); return; }
      const d = Math.abs(to - st.p) * (to > st.p ? reveal : hideDur);
      gsap.to(st, { p: to, duration: d, ease: "none", overwrite: true, onUpdate: frame });
    };
    const on = (e) => { if (e.pointerType === "touch") return; el.classList.add("is-hover"); go(1); };
    const off = (e) => { if (e?.pointerType === "touch") return; el.classList.remove("is-hover"); go(0); };
    const fin = () => { el.classList.add("is-hover"); go(1); };
    const fout = () => { el.classList.remove("is-hover"); go(0); };
    if (hover) { el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off); }
    el.addEventListener("focusin", fin);
    el.addEventListener("focusout", fout);
    return () => {
      ro.disconnect();
      gsap.killTweensOf(st);
      el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", fin); el.removeEventListener("focusout", fout);
      made.forEach((n) => n.remove());
      twin?.remove();
      label?.parentElement?.classList.remove("fx-crh-roll");
      el.classList.remove("is-hover");
      el.style.removeProperty("--fx-cloud-x");
      el.style.removeProperty("--fx-cloud-sprite");
    };
  });
})();
