// Work list — FILTER panel (original MyFilter): open and close is a .5s curveless opacity fade, cards are filtered by the chosen category and genre, and if none match show ‹Not found›
(() => {
  const pages = (window.vnPages = window.vnPages || {});
  pages.works = (main) => {
    const opener = main.querySelector(".vn-filter__opener");
    const editor = main.querySelector(".vn-filter__editor");
    const list = main.querySelector(".vn-wlist");
    const empty = main.querySelector(".vn-works-empty");
    if (!opener || !editor || !list) return;
    const cards = [...list.children];
    const picked = { cat: "ALL", genre: "ALL" };
    const fade = (show) => {
      gsap.killTweensOf(editor);
      opener.setAttribute("aria-expanded", String(show));
      if (show) {
        editor.hidden = false;
        gsap.fromTo(editor, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" });
      } else {
        gsap.to(editor, { opacity: 0, duration: 0.5, ease: "none", onComplete: () => { editor.hidden = true; gsap.set(editor, { clearProps: "opacity" }); } });
      }
    };
    const onOpener = () => fade(editor.hidden || opener.getAttribute("aria-expanded") !== "true");
    const onClose = () => fade(false);
    const search = () => {
      const hit = cards.filter((c) => (picked.cat === "ALL" || c.dataset.cat === picked.cat) && (picked.genre === "ALL" || c.dataset.genre === picked.genre));
      cards.forEach((c) => { c.hidden = !hit.includes(c); });
      list.hidden = !hit.length;
      if (empty) empty.hidden = !!hit.length;
      fade(false);
      window.vnScan?.();
    };
    const offs = [];
    for (const box of main.querySelectorAll(".vn-filter__box")) {
      const sel = box.querySelector(".vn-filter__selected");
      const opts = box.querySelector(".vn-filter__options");
      const text = box.querySelector(".vn-filter__text");
      const toggle = () => { const open = opts.hidden; opts.hidden = !open; sel.setAttribute("aria-expanded", String(open)); };
      const choose = (e) => {
        const li = e.target.closest("li");
        if (!li) return;
        text.textContent = li.textContent;
        picked[box.dataset.key] = li.textContent;
        opts.hidden = true;
        sel.setAttribute("aria-expanded", "false");
      };
      sel.addEventListener("click", toggle);
      opts.addEventListener("click", choose);
      offs.push(() => { sel.removeEventListener("click", toggle); opts.removeEventListener("click", choose); });
    }
    const go = main.querySelector(".vn-filter__go");
    const close = main.querySelector(".vn-filter__close");
    opener.addEventListener("click", onOpener);
    close?.addEventListener("click", onClose);
    go?.addEventListener("click", search);
    return () => {
      opener.removeEventListener("click", onOpener);
      close?.removeEventListener("click", onClose);
      go?.removeEventListener("click", search);
      offs.forEach((f) => f());
      gsap.killTweensOf(editor);
    };
  };
})();
