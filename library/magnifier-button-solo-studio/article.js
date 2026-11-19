/* Post: copy code (the styled select is handled by the browser select) */
(() => {
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const code = b.closest(".mt-code").querySelector("code").textContent;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.resolve()).catch(() => {});
    b.textContent = "Copied";
    setTimeout(() => { b.textContent = "Copy code"; }, 1600);
  }));
})();
