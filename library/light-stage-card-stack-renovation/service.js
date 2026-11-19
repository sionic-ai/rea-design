// Business intro — checklist toggles (.5s height), results ”Show more” (9 cards at a time)
(() => {
  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  document.querySelectorAll(".rb-insp__sec").forEach((sec) => {
    const label = sec.querySelector(".rb-insp__label"), body = sec.querySelector(".rb-insp__body"), inner = sec.querySelector(".rb-insp__inner");
    let quiet = 0;
    label.addEventListener("mouseleave", () => { label.classList.remove("is-quiet"); clearTimeout(quiet); });
    label.addEventListener("click", () => {
      const open = !sec.classList.contains("is-open");
      sec.classList.toggle("is-open", open);
      body.style.height = (open ? 0 : inner.offsetHeight) + "px";
      body.style.transition = `height 0.5s ${ease}`;
      requestAnimationFrame(() => requestAnimationFrame(() => { body.style.height = (open ? inner.offsetHeight : 0) + "px"; }));
      label.classList.add("is-quiet");
      clearTimeout(quiet);
      quiet = setTimeout(() => label.classList.remove("is-quiet"), 1000);
    });
    body.addEventListener("transitionend", () => {
      body.style.transition = "";
      body.style.height = sec.classList.contains("is-open") ? "auto" : "";
      ScrollTrigger.refresh();
    });
  });

  document.querySelectorAll(".rb-track[data-page]").forEach((box) => {
    const items = box.querySelectorAll(".rb-track__item"), more = box.querySelector(".rb-track__more"), btn = box.querySelector(".rb-track__btn");
    const last = Math.ceil(items.length / 9);
    if (!btn || last <= 1) { more && more.remove(); return; }
    let page = 1;
    btn.addEventListener("click", () => {
      if (page >= last) return;
      page += 1;
      box.dataset.page = page;
      if (page >= last) more.remove();
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    });
  });
})();
