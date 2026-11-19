// News detail: copy link button — copies the address like the original, and once copied swells to 1.1× for .45 seconds (.35s).
(() => {
  const write = (text) => {
    if (navigator.clipboard) return navigator.clipboard.writeText(text).then(() => true, () => false);
    const t = Object.assign(document.createElement("textarea"), { value: text });
    Object.assign(t.style, { position: "fixed", left: "-999999px", top: "-999999px" });
    document.body.append(t);
    t.select();
    const ok = document.execCommand("copy");
    t.remove();
    return Promise.resolve(ok);
  };
  M.page("detail", (main) => {
    const btn = main.querySelector(".d-copy a");
    const timers = [];
    const copy = (e) => {
      e.preventDefault();
      write(btn.dataset.url || location.href).then((ok) => {
        if (!ok) return;
        btn.classList.add("is-clicked");
        timers.push(setTimeout(() => btn.classList.remove("is-clicked"), 450));
      });
    };
    btn.addEventListener("click", copy);
    return () => { btn.removeEventListener("click", copy); timers.forEach(clearTimeout); };
  });
})();
