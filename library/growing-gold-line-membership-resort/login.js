// Member login — show password, close the lodging reservation pill
(() => {
  document.querySelectorAll(".hl-eye").forEach((b) => b.addEventListener("click", () => {
    const input = b.parentElement.querySelector("input");
    if (input) input.type = input.type === "password" ? "text" : "password";
  }));
  const float = document.querySelector(".hl-float");
  float?.querySelector("button")?.addEventListener("click", () => float.classList.add("is-off"));
})();
