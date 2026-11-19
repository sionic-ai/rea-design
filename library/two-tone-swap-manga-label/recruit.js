// The share box’s ”Copy URL” — like the original, pressing it copies the address and changes the text for 1 second
(() => {
  document.querySelectorAll(".js-copy").forEach((a) => {
    const label = a.querySelector("p");
    if (!label) return;
    const was = label.textContent;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigator.clipboard?.writeText(location.href).catch(() => {});
      label.textContent = "Copied";
      setTimeout(() => (label.textContent = was), 1000);
    });
  });
})();
