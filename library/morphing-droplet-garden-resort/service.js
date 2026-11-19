// Q&A accordion: a height tween instead of the original jQuery slideToggle(.4s swing)
(() => {
  document.querySelectorAll(".sv-faq__q").forEach((q) =>
    q.addEventListener("click", () => {
      const open = !q.classList.contains("is-open");
      q.classList.toggle("is-open", open);
      gsap.to(q.nextElementSibling, { height: open ? "auto" : 0, duration: TD.reduced ? 0 : 0.4, ease: "power1.inOut" });
    })
  );
})();
