(() => {
  // A photo set switches to the next one every every seconds, and the title word changes to that set’s color (--tone or data-color). The first tick re-shows the first set (Brand alternate-logo-image-text)
  kfFx.register("swap-tint-cycle", (el, { options, reduce }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const word = el.querySelector('[data-fx-part="word"]');
    const every = (+options.every || 3) * 1000;
    const tone = (it) => getComputedStyle(it).getPropertyValue("--tone").trim() || it.dataset.color || "";
    const show = (i) => {
      items.forEach((it) => it.classList.remove("is-displayed"));
      items[i].classList.add("is-displayed");
      if (word) word.style.color = tone(items[i]);
    };
    show(Math.max(0, items.findIndex((it) => it.classList.contains("is-displayed"))));
    if (reduce || items.length < 2) return () => { if (word) word.style.color = ""; };
    let i = 0;
    const id = setInterval(() => {
      if (i >= items.length) i = 0;
      show(i);
      i++;
    }, every);
    return () => {
      clearInterval(id);
      if (word) word.style.color = "";
    };
  });
})();
