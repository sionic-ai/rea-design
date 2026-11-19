// Bottom tag row — folded to four lines tall, and pressing ”+ Read more” expands it with a 400ms height transition (original AccordionTags)
(() => {
  const tags = document.querySelector("[data-accordion]");
  if (!tags) return;
  const shut = "calc((var(--fs-13) + 1em) * 4)";
  const row = document.createElement("div");
  row.className = "dd-term__more";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "+ Read more";
  row.append(btn);
  Object.assign(tags.style, { overflow: "hidden", rowGap: "1em", height: shut, lineHeight: "1", transition: "height 400ms" });
  tags.after(row);
  let open = false, busy = false;
  btn.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    if (open) {
      tags.style.height = tags.scrollHeight + "px";
      requestAnimationFrame(() => (tags.style.height = shut));
      tags.addEventListener("transitionend", () => (busy = false), { once: true });
      btn.textContent = "+ Read more";
    } else {
      tags.style.height = tags.scrollHeight + "px";
      tags.addEventListener("transitionend", () => { tags.style.height = "auto"; busy = false; }, { once: true });
      btn.textContent = "- Close";
    }
    open = !open;
  });
})();
