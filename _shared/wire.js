// So the person transcribing can turn annotations off and view it like the finished version, the on/off state is kept for next time.
(() => {
  const KEY = "wf-notes-hidden";
  const root = document.documentElement;
  if (localStorage.getItem(KEY) === "1") root.classList.add("wf-hide-notes");

  const toggle = () => {
    const hidden = root.classList.toggle("wf-hide-notes");
    localStorage.setItem(KEY, hidden ? "1" : "0");
  };

  addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    toggle();
  });

  addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("nav");
    bar.className = "wf-ui";
    bar.innerHTML = '<a href="../../index.html">List</a><button type="button">Note N</button>';
    bar.querySelector("button").addEventListener("click", toggle);
    document.body.append(bar);
  });
})();
