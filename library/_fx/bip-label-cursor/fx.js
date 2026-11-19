// Name tag cursor (brand) — hidden normally, and appears stuck to the mouse position with no lag when it reaches a spot with a name tag.
// data-cursor="circle" For an icon, a 32px circle bounces 1 → 1.5 → 1 in .3s. For text, it shows that text. Difference blending makes it look inverted over each color below.
(() => {
  kfFx.register("bip-label-cursor", (el, { hover }) => {
    if (!hover) return;
    const dot = document.createElement("div");
    dot.setAttribute("data-fx-part", "cursor");
    dot.innerHTML = "<div></div>";
    document.body.appendChild(dot);
    const pin = dot.firstElementChild;
    const setX = gsap.quickSetter(pin, "x", "px"), setY = gsap.quickSetter(pin, "y", "px");
    setX(-100); setY(-100);
    const move = (e) => { setX(e.clientX); setY(e.clientY); };
    let cur = null;
    const show = (area) => {
      const t = area.getAttribute("data-cursor") || "circle";
      pin.innerHTML = t === "circle" ? '<div data-fx-part="circle"></div>' : `<div data-fx-part="label"></div>`;
      if (t !== "circle") pin.firstElementChild.textContent = t;
      dot.classList.add("is-on");
    };
    const over = (e) => {
      const area = e.target.closest?.("[data-cursor]");
      if (area === cur || (area && !el.contains(area))) return;
      cur = area;
      if (area) show(area); else dot.classList.remove("is-on");
    };
    const leave = () => { cur = null; dot.classList.remove("is-on"); };
    window.addEventListener("mousemove", move);
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      el.removeEventListener("mouseover", over);
      el.removeEventListener("mouseleave", leave);
      dot.remove();
    };
  });
})();
