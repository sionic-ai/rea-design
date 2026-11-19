// When you hover or press the character badge floating in the screen corner, one of the speech bubbles hidden beside it is picked at random and shown right away, and
// Everything is cleared after 4 seconds. Raising again switches to a different speech bubble and restarts the 4-second count — the original toggles display, so there is no transition when it turns on
(() => {
  kfFx.register("quip-bubble-badge", (el, { options }) => {
    const trigger = el.querySelector('[data-fx-part="trigger"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!trigger || !items.length) return;
    const hold = +(options.hold ?? 4000);
    const order = options.order === "1";
    let timer = 0, next = 0;
    const clear = () => items.forEach((b) => b.classList.remove("is-on"));
    const show = () => {
      clear();
      const i = order ? next++ % items.length : Math.floor(Math.random() * items.length);
      items[i].classList.add("is-on");
      clearTimeout(timer);
      timer = setTimeout(clear, hold);
    };
    trigger.addEventListener("mouseenter", show);
    trigger.addEventListener("click", show);
    return () => {
      clearTimeout(timer);
      trigger.removeEventListener("mouseenter", show);
      trigger.removeEventListener("click", show);
      clear();
    };
  });
})();
