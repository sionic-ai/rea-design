// Tilted panel button — give only a label and an icon, and it builds the panel, hover panel, text mask and icon slot (two sets). The motion is handled by the hover rules in fx.css
(() => {
  kfFx.register("slant-rise-btn", (el) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label) return;
    const icon = el.querySelector('[data-fx-part="icon"]');
    const kids = [...el.childNodes];
    const bg = document.createElement("span");
    bg.className = "fx-srb__bg";
    bg.innerHTML = '<span class="fx-srb__plate"></span>';
    const inner = document.createElement("span");
    inner.className = "fx-srb__inner";
    const mask = document.createElement("span");
    mask.className = "fx-srb__mask";
    mask.appendChild(label);
    inner.appendChild(mask);
    if (icon) {
      el.classList.add("fx-srb--icon");
      const wrap = document.createElement("span");
      wrap.className = "fx-srb__icon-wrap";
      wrap.innerHTML = '<span class="fx-srb__icon-bg"></span><span class="fx-srb__icon-mask"><span class="fx-srb__icon-list"></span></span>';
      const list = wrap.querySelector(".fx-srb__icon-list");
      const twin = icon.cloneNode(true);
      twin.removeAttribute("data-fx-part");
      twin.setAttribute("aria-hidden", "true");
      list.append(twin, icon);
      inner.appendChild(wrap);
    }
    el.append(bg, inner);
    return () => {
      el.classList.remove("fx-srb--icon");
      bg.remove(); inner.remove();
      kids.forEach((k) => { if (!el.contains(k)) el.appendChild(k); });
    };
  });
})();
