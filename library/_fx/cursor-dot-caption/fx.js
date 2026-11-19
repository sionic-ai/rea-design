// Inside a panel with the cursor hidden, the dot and name show only over a named child (item). On empty space in the panel there is neither cursor nor dot — exactly as the original
(() => {
  kfFx.register("cursor-dot-caption", (el, { options, hover }) => {
    if (!hover) return;
    const ac = new AbortController(), signal = ac.signal;
    const cur = document.createElement("div");
    cur.className = "fx-dotcap";
    cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<span class="fx-dotcap__text"></span>';
    for (const k of ["--fx-dot", "--fx-size", "--fx-color"]) { const v = el.style.getPropertyValue(k); if (v) cur.style.setProperty(k, v); }
    document.body.append(cur);
    const text = cur.firstChild;
    const place = (e) => { cur.style.left = `${e.clientX}px`; cur.style.top = `${e.clientY}px`; };
    el.addEventListener("pointermove", place, { signal });
    el.addEventListener("pointerover", (e) => {
      const item = e.target.closest?.('[data-fx-part="item"]');
      if (!item || !el.contains(item)) return;
      text.textContent = item.getAttribute("data-label") || options.text || "VIEW MORE";
      place(e);
      cur.classList.add("is-on");
    }, { signal });
    el.addEventListener("pointerout", (e) => {
      const item = e.target.closest?.('[data-fx-part="item"]');
      if (item && !item.contains(e.relatedTarget)) cur.classList.remove("is-on");
    }, { signal });
    el.addEventListener("pointerleave", () => cur.classList.remove("is-on"), { signal });
    return () => { ac.abort(); cur.remove(); };
  });
})();
