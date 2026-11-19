// Feature suggestion board — vote cycle (press for +1·blue, press again to cancel), Open/Shipped pills, sort menu, load more
(() => {
  // Like the original, clicking the ticket box opens a login window — the backdrop and window come in from .95x and transparent over .2s (45ms late, as in the original). Ticket count unchanged
  const dlg = document.querySelector(".pa-login");
  const open = () => {
    if (!dlg) return;
    dlg.hidden = false;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) [dlg, dlg.querySelector(".pa-login__card")].forEach((el) => el.animate([{ opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1 }], { duration: 200, delay: 45, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "backwards" }));
    dlg.querySelector("button")?.focus({ preventScroll: true });
  };
  const close = () => { if (dlg) dlg.hidden = true; };
  document.querySelectorAll(".pa-vote").forEach((v) => v.addEventListener("click", open));
  dlg?.addEventListener("click", (e) => { if (e.target === dlg || e.target.closest("[data-close]")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const lists = [...document.querySelectorAll(".pa-ideas__list")];
  const more = document.querySelector(".pa-ideas__more");
  const chips = [...document.querySelectorAll(".pa-chips button")];
  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((x) => x.setAttribute("aria-selected", String(x === c)));
    lists.forEach((l) => { l.hidden = l.dataset.list !== c.dataset.show; });
    if (more) more.hidden = c.dataset.show !== "open" || !document.querySelector("[data-more][hidden]");
  }));

  more?.addEventListener("click", () => {
    document.querySelectorAll("[data-more][hidden]").forEach((li) => { li.hidden = false; });
    more.hidden = true;
  });

  const sort = document.querySelector(".pa-sort");
  const toggle = sort?.querySelector(":scope > button");
  const menu = sort?.querySelector(".pa-sort__menu");
  const setMenu = (on) => { if (!menu) return; menu.hidden = !on; toggle.setAttribute("aria-expanded", String(on)); };
  toggle?.addEventListener("click", (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  menu?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    menu.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    toggle.firstChild.textContent = b.textContent;
    const list = lists.find((l) => !l.hidden);
    if (list && b.textContent === "New") [...list.children].reverse().forEach((li) => list.append(li));
    setMenu(false);
  }));
  document.addEventListener("click", () => setMenu(false));
})();
