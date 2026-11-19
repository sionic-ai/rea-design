(() => {
  kfFx.register("coord-circle-hover", (el, { reduce, hover }) => {
    if (!hover) return;
    const at = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--fx-x", e.clientX - (r.left + r.width / 2) + "px");
      el.style.setProperty("--fx-y", e.clientY - (r.top + r.height / 2) + "px");
      el.style.setProperty("--fx-ap", (r.width / Math.max(1, r.height)).toFixed(1));
    };
    const on = (e) => { at(e); el.classList.add("is-fx-on"); };
    const off = (e) => { if (!reduce) at(e); el.classList.remove("is-fx-on"); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.classList.remove("is-fx-on");
      ["--fx-x", "--fx-y", "--fx-ap"].forEach((v) => el.style.removeProperty(v));
    };
  });
})();
