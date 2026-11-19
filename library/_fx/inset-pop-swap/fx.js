// The pressed card keeps its color photo on — so it doesn’t flicker back to grayscale while the page transition curtain covers
(() => {
  kfFx.register("inset-pop-swap", (el) => {
    const pick = () => el.classList.add("is-picked");
    el.addEventListener("click", pick);
    return () => { el.removeEventListener("click", pick); el.classList.remove("is-picked"); };
  });
})();
