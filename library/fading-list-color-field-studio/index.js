// First page: when the work rows are revealed, names are written in from blank (text-scramble fx:play), and the work count rolls 0 → 27,
// While on the hero, the featured work (second) is laid faintly behind and a large name floats up. Txt · Img toggle the preview photo off and on.
(() => {
  const board = document.querySelector(".am-cases");
  if (!board) return;

  document.querySelectorAll(".am-cases__grid > li").forEach((li) => {
    li.addEventListener("am:in", () => li.querySelector(".am-case__name")?.dispatchEvent(new CustomEvent("fx:play")), { once: true });
  });
  const side = board.querySelector(".am-cases__side");
  side?.addEventListener("am:in", () => {
    const n = side.querySelector("[data-value]");
    if (n) n.dataset.value = String(board.querySelectorAll('[data-fx-part="item"]').length);
  }, { once: true });

  // Hero: lay the featured case photo faintly (.3) and float the name — remove it when scrolling down, lay it again when coming back up
  const HERO_KEY = "c02";
  let idle = false;
  const heroIdle = () => {
    const top = scrollY < 120;
    if (top === idle) return;
    if (top && board.classList.contains("is-on")) return;
    idle = top;
    board.dispatchEvent(new CustomEvent(top ? "fx:show" : "fx:hide", { detail: { key: HERO_KEY, idle: true } }));
  };
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth >= 1024) {
    setTimeout(heroIdle, AM.reduce ? 0 : 750);
    addEventListener("scroll", heroIdle, { passive: true });
  }

  // Txt (current panel, blur) · Img (link to swap, underline) — the Img panel opens each case thumbnail from the left in .8s (original th-thumbnail-image-reveal)
  const scroll = board.querySelector(".am-cases__scroll"), last = [...board.querySelectorAll(".am-cases__grid > li")].at(-1);
  if (scroll && last) {
    const io = new IntersectionObserver(([e]) => {
      scroll.classList.toggle("is-on", !e.isIntersecting);
      if (!e.isIntersecting) setTimeout(() => scroll.style.setProperty("--am-scroll-wait", "0s"), 1300);
    }, { rootMargin: "0px 0px -40px 0px", threshold: 1 });
    io.observe(last);
  }

  board.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
    board.querySelectorAll("[data-mode]").forEach((n) => { n.classList.toggle("is-on", n === b); n.setAttribute("aria-pressed", n === b ? "true" : "false"); });
    document.body.classList.toggle("am-img", b.dataset.mode === "img");
    // Every time a board is picked (even the current one), the case-name underline is drawn once more (original replayUnderlineToken)
    board.classList.remove("is-replay"); void board.offsetWidth; board.classList.add("is-replay");
    setTimeout(() => board.classList.remove("is-replay"), 700);
    if (b.dataset.mode === "img") board.dispatchEvent(new CustomEvent("fx:hide"));
  }));
  document.querySelectorAll(".am-sound, .am-sfx").forEach((b) => b.addEventListener("click", () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true")));
})();
