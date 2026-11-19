// Attach two curtain layers, a second set of letters and a second set of arrows — the motion itself is the :hover transition in fx.css, so on touch devices it just stays still
(() => {
  const DIRS = { right: ["150% 0", "-150% 0"], left: ["-150% 0", "150% 0"], up: ["0 -150%", "0 150%"], down: ["0 150%", "0 -150%"], "up-right": ["150% -150%", "-150% 150%"], "down-right": ["150% 150%", "-150% -150%"] };
  kfFx.register("layer-wipe-button", (el, { options }) => {
    const made = [];
    if (options.look !== "plain") {
      for (const c of ["fx-lw-b", "fx-lw-a"]) {
        const s = document.createElement("span");
        s.className = c;
        s.setAttribute("aria-hidden", "true");
        el.prepend(s);
        made.push(s);
      }
    }
    const label = el.querySelector('[data-fx-part="label"]');
    let wrapped = null;
    if (label && label.textContent.trim()) {
      wrapped = document.createElement("span");
      wrapped.className = "fx-lw-t";
      while (label.firstChild) wrapped.append(label.firstChild);
      label.append(wrapped);
      label.setAttribute("data-lw-text", wrapped.textContent.trim());
    }
    const icon = el.querySelector('[data-fx-part="icon"]');
    const art = icon?.firstElementChild;
    let clone = null;
    if (art) {
      clone = art.cloneNode(true);
      clone.classList.add("fx-lw-clone");
      clone.setAttribute("aria-hidden", "true");
      icon.append(clone);
      const d = DIRS[options.dir] || DIRS.right;
      icon.style.setProperty("--lw-out", d[0]);
      icon.style.setProperty("--lw-in", d[1]);
    }
    if (options.dur != null) el.style.setProperty("--lw-dur", `${+options.dur}s`);
    return () => {
      made.forEach((m) => m.remove());
      if (wrapped && label) { while (wrapped.firstChild) label.insertBefore(wrapped.firstChild, wrapped); wrapped.remove(); label.removeAttribute("data-lw-text"); }
      clone?.remove();
      icon?.style.removeProperty("--lw-out");
      icon?.style.removeProperty("--lw-in");
      el.style.removeProperty("--lw-dur");
    };
  });
})();
