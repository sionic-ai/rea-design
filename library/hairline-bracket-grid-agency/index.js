// Home page: clicking a capability list item moves the gray bar to that row’s position and height (.3s, css) and the description swaps at .2s.
// Measures the horizontal line width of the process steps (--line-w) so each step box slides from the line end into place as far as the line is drawn.
(() => {
  const list = document.querySelector(".rc-svc__list");
  if (list) {
    const buttons = [...list.querySelectorAll("button")];
    const texts = [...document.querySelectorAll(".rc-svc__box > p")];
    let on = Math.max(0, buttons.findIndex((b) => b.classList.contains("is-on")));
    const place = () => {
      const b = buttons[on];
      list.style.setProperty("--bar-y", `${b.offsetTop}px`);
      list.style.setProperty("--bar-h", `${b.offsetHeight}px`);
    };
    buttons.forEach((b, i) => b.addEventListener("click", () => {
      on = i;
      buttons.forEach((x, j) => { x.classList.toggle("is-on", j === i); x.setAttribute("aria-selected", j === i); });
      texts.forEach((t, j) => { t.classList.toggle("is-on", j === i); t.setAttribute("aria-hidden", j !== i); });
      place();
    }));
    place();
    new ResizeObserver(place).observe(list);
  }

  const steps = document.querySelector(".rc-process__steps");
  if (steps) {
    const measure = () => steps.querySelectorAll("[data-step-line]").forEach((l) => l.parentElement.style.setProperty("--line-w", `${l.offsetWidth}px`));
    measure();
    new ResizeObserver(measure).observe(steps);
  }
})();
