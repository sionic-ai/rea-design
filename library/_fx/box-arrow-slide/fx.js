(() => {
  // Original brand: on hover it adds .hover for 500ms and moves the arrows in the box, ::before (in place) and ::after (one cell behind), together by one cell (100%) over .75s.
  // So the visible arrow slides out and the same arrow hidden behind it comes in and stays — it doesn’t revert on release, and it pushes again only after 500ms.
  const DIRS = { right: ["X", -1], left: ["X", 1], down: ["Y", -1], up: ["Y", 1] };
  kfFx.register("box-arrow-slide", (el, { options, reduce, hover }) => {
    const box = el.querySelector('[data-fx-part="arrow-box"]');
    if (!box || !box.firstElementChild || reduce || !hover) return;
    const dir = DIRS[options.dir] ? options.dir : "right";
    const [axis, side] = DIRS[dir];
    const a = document.createElement("span");
    a.className = "fx-bas-a";
    while (box.firstChild) a.append(box.firstChild);
    const b = a.cloneNode(true);
    b.className = "fx-bas-a fx-bas-b";
    b.setAttribute("aria-hidden", "true");
    b.style.transform = `translate${axis}(${side * 100}%)`;
    box.append(a, b);
    box.classList.add("fx-bas-box");
    el.style.setProperty("--fx-bas-dur", `${+(options.dur ?? 0.75)}s`);
    if (options.ease) el.style.setProperty("--fx-bas-ease", /^[\d.,\s-]+$/.test(options.ease) ? `cubic-bezier(${options.ease})` : options.ease);
    el.classList.add(`fx-bas--${dir}`);
    const hold = +(options.hold ?? 0.5) * 1000;
    let timer = 0;
    const enter = () => {
      if (el.classList.contains("is-fx-bas")) return;
      el.classList.add("is-fx-bas");
      timer = setTimeout(() => el.classList.remove("is-fx-bas"), hold);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("focusin", enter);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("focusin", enter);
      el.classList.remove("is-fx-bas");
      el.style.removeProperty("--fx-bas-dur");
      el.style.removeProperty("--fx-bas-ease");
      el.classList.remove(`fx-bas--${dir}`);
      b.remove();
      while (a.firstChild) box.append(a.firstChild);
      a.remove();
      box.classList.remove("fx-bas-box");
    };
  });
})();
