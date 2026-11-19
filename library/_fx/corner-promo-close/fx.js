// Promo card stuck to the corner — on close, the close button hides at once and the card height folds to 0 over .3s, then the card is removed (STUDIO sd-toggle).
// The interaction response (card 1.04x, close 180°) is a transition in fx.css
(() => {
  kfFx.register("corner-promo-close", (el, { options, reduce }) => {
    const close = el.querySelector('[data-fx-part="close"]');
    const card = el.querySelector('[data-fx-part="card"]');
    if (!close || !card) return;
    const fold = reduce ? 0 : +(options.fold ?? 0.3);
    el.style.setProperty("--fx-fold", `${fold}s`);
    let timer = 0;
    const shut = () => {
      if (el.classList.contains("is-closed")) return;
      card.style.height = `${card.offsetHeight}px`;
      void card.offsetHeight;
      el.classList.add("is-closed");
      close.setAttribute("aria-expanded", "false");
      card.style.height = "0px";
      el.dispatchEvent(new CustomEvent("fx:close"));
      // When fully folded, remove the card and set is-gone — in the original STUDIO toggle, the panel width is then only the close button width
      timer = setTimeout(() => { card.hidden = true; el.classList.add("is-gone"); }, fold * 1000);
    };
    close.setAttribute("aria-expanded", "true");
    close.addEventListener("click", shut);
    return () => {
      close.removeEventListener("click", shut);
      clearTimeout(timer);
      el.classList.remove("is-closed", "is-gone");
      close.removeAttribute("aria-expanded");
      card.hidden = false;
      card.style.height = "";
      el.style.removeProperty("--fx-fold");
    };
  });
})();
