// Company features — when the previous group reaches 80% of the screen, the background becomes paper color, and after it passes below 50% it returns to orange.
(() => {
  (window.opPages = window.opPages || {}).strength = (main) => {
    const st = ScrollTrigger.create({ trigger: main.querySelector("[data-togglebg]"), start: "top 80%", end: "bottom 50%", toggleClass: { targets: document.documentElement, className: "is-bgwhite" } });
    return () => { st.kill(); document.documentElement.classList.remove("is-bgwhite"); };
  };
})();
