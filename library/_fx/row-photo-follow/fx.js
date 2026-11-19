// Hovering a text-only list row swaps that row’s photo instantly into a fixed frame beside the list, and the frame follows only the cursor height (y) over .5s power3 (Brand archive).
// The frame is a square at 25% of screen width and 16.67% from the left, on and off in .15s. It turns off when leaving the list or scrolling.
(() => {
  kfFx.register("row-photo-follow", (el, { options, hover }) => {
    if (!hover) return;
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')];
    if (!rows.length) return;
    const frame = document.createElement("div");
    frame.setAttribute("data-fx-part", "frame");
    frame.innerHTML = "<div><div></div></div>";
    el.appendChild(frame);
    const slot = frame.firstElementChild.firstElementChild;
    const toY = gsap.quickTo(frame.firstElementChild, "y", { duration: +(options.dur ?? 0.5), ease: options.ease || "power3" });
    const on = () => frame.classList.contains("is-on");
    const vis = (v) => frame.classList.toggle("is-on", v);
    const move = (e) => { if (on()) toY(e.clientY); };
    const enters = rows.map((row) => {
      const photo = row.querySelector('[data-fx-part="photo"]');
      const f = (e) => {
        if (!on()) gsap.set(frame.firstElementChild, { y: e.clientY });
        vis(true);
        slot.replaceChildren();
        if (photo) { const c = photo.cloneNode(true); c.hidden = false; c.removeAttribute("data-fx-part"); slot.appendChild(c); }
      };
      row.addEventListener("mouseenter", f);
      return [row, f];
    });
    const off = () => vis(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", off, { passive: true });
    el.addEventListener("mouseleave", off);
    return () => {
      enters.forEach(([r, f]) => r.removeEventListener("mouseenter", f));
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", off);
      el.removeEventListener("mouseleave", off);
      frame.remove();
    };
  });
})();
