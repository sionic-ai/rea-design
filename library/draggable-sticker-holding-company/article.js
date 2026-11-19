(() => {
  // Copy text — puts the body text on the clipboard and briefly changes the button text to Copied
  const btn = document.querySelector(".ax-downloads [data-copy]");
  if (!btn) return;
  const label = btn.querySelector("span");
  btn.addEventListener("click", () => {
    const text = [...document.querySelectorAll(".ax-article p")].map((p) => p.textContent).join("\n\n");
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    label.textContent = "Copied";
    setTimeout(() => { label.textContent = "Copy post"; }, 1500);
  });
})();
