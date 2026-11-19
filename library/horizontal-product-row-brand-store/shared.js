// Two header expansions (large Shop panel·Support) and the phone menu. As in the original, it opens when interaction enters and closes immediately when it leaves — during the .3s closing the panel is still visible, so moving onto the panel reopens it.
(() => {
  const mega = document.querySelector(".bu-mega");
  const shop = document.querySelector('[data-drop="shop"]');
  const care = document.querySelector('[data-drop="care"]');

  const setShop = (on) => {
    shop?.classList.toggle("is-open", on);
    mega?.classList.toggle("is-open", on);
    shop?.querySelector(".bu-trigger")?.setAttribute("aria-expanded", String(on));
  };
  const setCare = (on) => {
    care?.classList.toggle("is-open", on);
    care?.querySelector(".bu-trigger")?.setAttribute("aria-expanded", String(on));
  };

  for (const [el, set] of [[shop, setShop], [mega, setShop], [care, setCare]]) {
    if (!el) continue;
    el.addEventListener("mouseenter", () => set(true));
    el.addEventListener("mouseleave", () => set(false));
    // Open for keyboard-entered focus too — focus from a mouse press was already opened by hover
    el.addEventListener("focusin", (e) => e.target.matches(":focus-visible") && set(true));
    el.addEventListener("focusout", (e) => !el.contains(e.relatedTarget) && !(el === shop && mega?.contains(e.relatedTarget)) && set(false));
  }
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setShop(false);
    setCare(false);
  });

  const findBtn = document.querySelector(".bu-search-btn");
  const find = document.querySelector(".bu-search");
  findBtn?.addEventListener("click", () => {
    const open = find.hidden;
    find.hidden = !open;
    findBtn.setAttribute("aria-expanded", String(open));
    if (open) find.querySelector("input")?.focus();
  });

  const burger = document.querySelector(".bu-burger");
  const mnav = document.querySelector(".bu-mnav");
  burger?.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", String(open));
    mnav.hidden = !open;
  });
  mnav?.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    burger.setAttribute("aria-expanded", "false");
    mnav.hidden = true;
  });
})();
