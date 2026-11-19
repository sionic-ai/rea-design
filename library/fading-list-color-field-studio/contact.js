// Contact: big sentence appears letter by letter with 25ms delay (same letter reveal as the line playing in the header line), and inserts the mark
(() => {
  const t = document.querySelector("[data-type]");
  if (t) {
    const txt = t.textContent;
    t.textContent = "";
    [...txt].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "am-char";
      s.style.animationDelay = `${300 + i * 25}ms`;
      s.textContent = c === " " ? " " : c;
      t.append(s);
    });
  }
  const m = document.querySelector("[data-mark]");
  if (m) m.innerHTML = AM.mark;
  document.querySelectorAll(".ct .am-lines").forEach((n) => setTimeout(() => n.classList.add("is-in"), AM.reduce ? 0 : +(n.dataset.delay || 0)));
})();
