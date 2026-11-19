// List — pressing a category chip turns that chip black and fades the other posts in .2s (placeholder, so it filters randomly), and the maker toggle works the same way
(() => {
  const posts = [...document.querySelectorAll(".bw-check > .bw-post")];
  document.querySelectorAll(".bw-chips, .bw-toggle").forEach((group) => {
    const btns = [...group.querySelectorAll("button")];
    btns.forEach((b, k) => b.addEventListener("click", () => {
      btns.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-selected", String(o === b)); });
      posts.forEach((p, i) => p.classList.toggle("is-out", k > 0 && (i + k) % 3 === 0));
    }));
  });
})();
