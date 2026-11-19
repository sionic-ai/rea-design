// To start the intro text from the lower right of the hero (the empty placeholder cell), as in the original it is pulled up by the text height and the empty cells above and below are matched in height (setPosIntroText)
(() => {
  const text = document.querySelector("[data-intro-text]");
  const dummies = document.querySelectorAll("[data-intro-dummy]");
  if (!text) return;
  const setPos = () => {
    text.style.marginTop = "";
    dummies.forEach((d) => (d.style.height = ""));
    if (innerWidth <= 767) return;
    const h = text.clientHeight;
    text.style.marginTop = `calc(${-h}px - 4.5rem)`;
    dummies.forEach((d) => (d.style.height = `${h}px`));
  };
  setPos();
  document.fonts?.ready.then(setPos);
  addEventListener("resize", setPos);
})();
