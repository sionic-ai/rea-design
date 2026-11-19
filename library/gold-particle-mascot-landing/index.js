(() => {
  const mv = document.querySelector(".ms-mv"), head = document.querySelector(".ms-header.is-bottom");

  /* Big words: apply the original per-letter delays (.51~.72s) in order */
  const DELAYS = [.64, .57, .6, .54, .51, .65, .56, .66, .7, .68, .7, .72, .68, .51, .69, .57, .69, .56, .63, .71, .66, .7];
  const copy = document.querySelector(".ms-mv__copy");
  if (copy) {
    let n = 0;
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...c.nodeValue].forEach((ch) => {
          if (/\s/.test(ch)) { frag.append(ch); return; }
          const s = document.createElement("span");
          s.setAttribute("data-char", "");
          s.textContent = ch;
          s.style.transitionDelay = DELAYS[n++ % DELAYS.length] + "s";
          frag.append(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(copy);
  }
  /* Original attaches a marker to the hero and header after .5s */
  setTimeout(() => {
    mv?.classList.add("is-animated");
    mv?.querySelector(".ms-frame")?.classList.add("is-animated");
    mv?.querySelector(".ms-mv__txt")?.classList.add("is-animated");
    head?.classList.add("is-mv-animated");
  }, 500);

  /* Eras and backgrounds: OverlayScrollbars horizontal panel + mouse drag (original values kept as is) */
  const OS = window.OverlayScrollbarsGlobal?.OverlayScrollbars;
  document.querySelectorAll(".js-h-scroll").forEach((el) => {
    const inst = OS ? OS(el, { scrollbars: { theme: "os-theme-miso", autoHide: "never", autoHideDelay: 400, clickScroll: "instant" } }) : null;
    const vp = inst ? inst.elements().viewport : el;
    vp.setAttribute("data-lenis-prevent-wheel", "");
    let down = false, x0 = 0, s0 = 0;
    vp.addEventListener("mousedown", (e) => { down = true; x0 = e.pageX; s0 = vp.scrollLeft; vp.style.cursor = "grabbing"; vp.style.userSelect = "none"; });
    document.addEventListener("mousemove", (e) => { if (down) vp.scrollLeft = s0 - (e.pageX - x0); });
    document.addEventListener("mouseup", () => { if (!down) return; down = false; vp.style.cursor = ""; vp.style.userSelect = ""; });
  });
  /* Item’s second photo: switches to diagonal when visible */
  const swap = new IntersectionObserver((list) => list.forEach((e) => e.target.classList.toggle("is-animated", e.isIntersecting)), { threshold: .6 });
  document.querySelectorAll(".ms-narr__photo-2").forEach((n) => swap.observe(n));

  /* Service row: only the hovered row lights up */
  const cards = [...document.querySelectorAll(".js-services-card")];
  cards.forEach((c) => {
    c.addEventListener("mouseenter", () => { cards.forEach((o) => o.classList.remove("is-active")); c.classList.add("is-active"); });
    c.addEventListener("mouseleave", () => c.classList.remove("is-active"));
  });
})();
