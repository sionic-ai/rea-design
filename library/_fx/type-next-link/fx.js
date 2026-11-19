(() => {
  // Original (next hint below the tail of the source site): hovering the logo types ‹Next› one letter every 45ms and erases it at the same speed on release.
  // On press, it erases Next and types the next page name from scratch, 300ms after finishing, is-end is added to the element and the text fades over .4s — then fx:go fires.
  kfFx.register("type-next-link", (el, { options, reduce, hover }) => {
    const text = el.querySelector('[data-fx-part="text"]');
    const name = el.querySelector('[data-fx-part="name"]');
    const link = el.querySelector('[data-fx-part="link"]');
    if (!text || !name || !link) return () => {};
    const step = +(options.step ?? 45);
    const end = +(options.end ?? 300);
    const full = { text: text.textContent, name: name.textContent };
    const timers = new Map();
    const stop = (t) => { clearInterval(timers.get(t)); timers.delete(t); };
    const set = (t, s) => { t.textContent = s; };
    let picked = false, shown = false, endTimer = 0;
    set(text, "");
    set(name, "");
    el.classList.remove("is-end");

    const type = (t, s, fresh, done) => {
      stop(t);
      if (fresh || !s.startsWith(t.textContent)) set(t, "");
      let i = t.textContent.length;
      if (reduce || step <= 0) { set(t, s); done && done(); return; }
      timers.set(t, setInterval(() => {
        set(t, s.slice(0, ++i));
        if (i >= s.length) { stop(t); done && done(); }
      }, step));
    };
    const erase = (t) => {
      stop(t);
      if (reduce || step <= 0) { set(t, ""); return; }
      let i = t.textContent.length;
      timers.set(t, setInterval(() => {
        set(t, t.textContent.slice(0, --i));
        if (i <= 0) { set(t, ""); stop(t); }
      }, step));
    };

    const enter = () => { if (!hover || picked) return; clearTimeout(endTimer); el.classList.remove("is-end"); set(name, ""); type(text, full.text); };
    const leave = () => { if (!hover || picked) return; erase(text); };
    const click = (e) => {
      if (picked) return;
      e.preventDefault();
      picked = true;
      erase(text);
      type(name, full.name, true, () => {
        endTimer = setTimeout(() => {
          el.classList.add("is-end");
          el.dispatchEvent(new CustomEvent("fx:go", { bubbles: true, detail: { href: link.href } }));
        }, reduce ? 0 : end);
      });
    };
    // On phones without hover, stamp ”Next” once when the logo crosses the lower ⅓ line of the screen
    const watch = () => {
      if (hover || shown || picked) return;
      const r = link.getBoundingClientRect();
      if (r.top <= innerHeight * (2 / 3) && r.bottom >= 0) { shown = true; type(text, full.text); }
    };
    link.addEventListener("mouseenter", enter);
    link.addEventListener("mouseleave", leave);
    link.addEventListener("click", click);
    addEventListener("scroll", watch, { passive: true });
    watch();
    return () => {
      [text, name].forEach(stop);
      clearTimeout(endTimer);
      link.removeEventListener("mouseenter", enter);
      link.removeEventListener("mouseleave", leave);
      link.removeEventListener("click", click);
      removeEventListener("scroll", watch);
      set(text, full.text);
      set(name, full.name);
      el.classList.remove("is-end");
    };
  });
})();
