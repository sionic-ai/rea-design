(() => {
  // Section list rail — one dot per section, dotted lines between dots (solid for passed steps). A 7px ring hangs on the dot of the section that has passed screen center,
  // The rail color flips depending on whether the section background is light or dark (data-tone or the --dark, --photo, --cream type). Clicking a dot brings the center of that section’s card to the center of the screen
  kfFx.register("chapter-rail-dots", (el, { options, reduce, scroller }) => {
    const sel = options.from || "[data-fx-part=chapter]";
    const chapters = [...document.querySelectorAll(sel)];
    if (!chapters.length) return;
    const made = [];
    const items = chapters.map((ch, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", ch.getAttribute("aria-label") || ch.querySelector("h2, h3")?.textContent.trim() || `${i + 1}`);
      li.append(b);
      el.append(li);
      made.push(li);
      return { li, b, ch };
    });
    const tone = (ch) => ch.dataset.tone || (ch.matches(".--cream, .--light") ? "light" : "dark");
    const box = scroller || window;
    const viewH = () => (scroller ? scroller.clientHeight : innerHeight);
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const centerOf = (ch) => {
      const card = ch.querySelector("[data-fx-part=card]") || ch.firstElementChild || ch;
      const r = card.getBoundingClientRect();
      return top() + r.top + r.height / 2;
    };
    let now = -1;
    const update = () => {
      const mid = top() + viewH() / 2;
      let i = -1;
      chapters.forEach((ch, k) => { if (centerOf(ch) - viewH() * 0.25 <= mid) i = k; });
      if (i === now) return;
      now = i;
      items.forEach(({ li, b }, k) => {
        li.classList.toggle("is-done", k < i);
        b.setAttribute("aria-current", String(k === i));
      });
      const t = i >= 0 ? tone(chapters[i]) : options.start || "dark";
      el.classList.toggle("--on-light", t === "light");
      el.classList.toggle("--on-dark", t !== "light");
    };
    const go = (e) => {
      const k = items.findIndex(({ b }) => b === e.target.closest("button"));
      if (k < 0) return;
      const y = Math.max(0, centerOf(chapters[k]) - viewH() / 2);
      box.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    };
    el.addEventListener("click", go);
    box.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
    return () => {
      el.removeEventListener("click", go);
      box.removeEventListener("scroll", update);
      removeEventListener("resize", update);
      made.forEach((n) => n.remove());
      el.classList.remove("--on-light", "--on-dark");
    };
  });
})();
