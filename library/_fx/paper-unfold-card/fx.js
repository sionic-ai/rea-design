// Three paper layers (paper > fold base·middle·top) are created and inserted if missing, and the text children get an order index (--fx-i). A close child or Esc sets data-exit to fold the panel out of the way and fires fx:closed.
(() => {
  kfFx.register("paper-unfold-card", (el, { options }) => {
    const made = [];
    let paper = el.querySelector(':scope > [data-fx-part="paper"]');
    if (!paper) {
      paper = document.createElement("div");
      paper.dataset.fxPart = "paper";
      paper.setAttribute("aria-hidden", "true");
      paper.innerHTML = '<div data-fx-part="fold" data-key="base"></div><div data-fx-part="fold" data-key="middle"><div data-fx-part="fold" data-key="top"></div></div>';
      el.prepend(paper);
      made.push(paper);
    }
    if (options.speed != null) el.style.setProperty("--fx-speed", String(+(options.speed ?? 1)));
    const content = el.querySelector(':scope > [data-fx-part="content"]');
    if (content) [...content.children].forEach((c, i) => c.style.setProperty("--fx-i", String(Math.max(0, i - 1))));
    let timer = 0;
    const exit = () => {
      if (el.dataset.exit) return;
      el.dataset.exit = options.exit || "dismissed";
      timer = setTimeout(() => el.dispatchEvent(new CustomEvent("fx:closed", { bubbles: true })), 1560);
    };
    const close = el.querySelector('[data-fx-part="close"]');
    const key = (e) => e.key === "Escape" && exit();
    close?.addEventListener("click", exit);
    el.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      close?.removeEventListener("click", exit);
      el.removeEventListener("keydown", key);
      made.forEach((n) => n.remove());
      content && [...content.children].forEach((c) => c.style.removeProperty("--fx-i"));
      delete el.dataset.exit;
    };
  });
})();
