// A cover circle covers the screen from the clicked spot (showing the destination name) and navigates, then on the new page the circle shrinks back to the same spot and lifts.
(() => {
  const KEY = "fx-click-iris";
  kfFx.register("click-iris-page", (el, { options, reduce }) => {
    const T = { in: +(options.in ?? 0.56) * 1000, out: +(options.out ?? 0.64) * 1000, wait: +(options.wait ?? 0.06) * 1000 };
    const ease = options.ease ? `cubic-bezier(${options.ease})` : "cubic-bezier(0.77, 0, 0.175, 1)";
    let cover = el.querySelector('[data-fx-part="cover"]'), made = false;
    if (!cover) {
      cover = document.createElement("div");
      cover.setAttribute("data-fx-part", "cover");
      cover.innerHTML = '<span data-fx-part="label"></span>';
      el.appendChild(cover);
      made = true;
    }
    cover.classList.add("fx-iris-cover");
    cover.setAttribute("aria-hidden", "true");
    const label = cover.querySelector('[data-fx-part="label"]');
    const R = (x, y) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
    let timer = 0;
    let came = null;
    try { came = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); } catch (e) {}
    if (came && !reduce) {
      if (label) label.textContent = came.label || "";
      const r = R(came.x, came.y);
      cover.style.visibility = "visible";
      cover.style.clipPath = `circle(${r}px at ${came.x}px ${came.y}px)`;
      timer = setTimeout(() => {
        cover.animate([{ clipPath: `circle(${r}px at ${came.x}px ${came.y}px)` }, { clipPath: `circle(0px at ${came.x}px ${came.y}px)` }], { duration: T.out, easing: ease, fill: "forwards" })
          .finished.then(() => (cover.style.visibility = "hidden"), () => {});
      }, T.wait);
    }
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a || !el.contains(a) || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search && url.hash)) return;
      e.preventDefault();
      const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2, name = a.dataset.label || a.textContent.trim().slice(0, 24);
      try { sessionStorage.setItem(KEY, JSON.stringify({ x, y, label: name })); } catch (err) {}
      if (reduce || !T.in) { location.href = url.href; return; }
      if (label) label.textContent = name;
      cover.style.visibility = "visible";
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = url.href; } };
      cover.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R(x, y)}px at ${x}px ${y}px)` }], { duration: T.in, easing: ease, fill: "forwards" }).finished.then(go, go);
      setTimeout(go, T.in + 340);
    };
    el.addEventListener("click", onClick);
    return () => { el.removeEventListener("click", onClick); clearTimeout(timer); if (made) cover.remove(); else cover.classList.remove("fx-iris-cover"); };
  });
})();
