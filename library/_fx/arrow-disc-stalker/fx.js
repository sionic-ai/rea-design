(() => {
  // A dot taking the mouse position directly and a trailing ring — the lagging feel comes from CSS transition (dot .3s · ring .8s).
  // Over links and buttons the dot becomes a 40px accent-color circle (.6) and an arrow appears in place of the ring. data-cursor="image" Above that, a 240px photo circle
  kfFx.register("arrow-disc-stalker", (el, { hover, reduce }) => {
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const follower = el.querySelector('[data-fx-part="follower"]');
    if (!hover || reduce || !cursor || !follower) return;
    const half = 10;
    const move = (e) => {
      el.style.opacity = 1;
      const t = `translate(${Math.round(e.clientX - half)}px,${Math.round(e.clientY - half)}px)`;
      cursor.style.transform = t;
      follower.style.transform = t;
    };
    const links = "a,button,input[type='submit']";
    const over = (e) => {
      const img = e.target.closest?.('[data-cursor="image"]');
      if (img) {
        el.classList.add("is-image");
        cursor.dataset.label = img.getAttribute("data-cursor-label") || "";
        return;
      }
      if (e.target.closest?.(links) && !el.classList.contains("is-drag")) el.classList.add("is-hover");
    };
    const out = (e) => {
      const to = e.relatedTarget;
      const img = e.target.closest?.('[data-cursor="image"]');
      if (img && !(to && img.contains(to))) el.classList.remove("is-image");
      const a = e.target.closest?.(links);
      if (a && !(to && a.contains(to))) el.classList.remove("is-hover");
    };
    const hide = () => (el.style.opacity = 0);
    const show = () => (el.style.opacity = 1);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    document.documentElement.addEventListener("mouseleave", hide);
    document.documentElement.addEventListener("mouseenter", show);
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.documentElement.removeEventListener("mouseenter", show);
      el.classList.remove("is-hover", "is-image");
      el.style.opacity = "";
    };
  });
})();
