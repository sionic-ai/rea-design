(() => {
  // Product card — pressing a small image moves the marker to that slot (the large image area is a placeholder so it stays as is)
  document.querySelectorAll(".us-goods__thumbs").forEach((list) => {
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      list.querySelectorAll("li").forEach((x) => x.classList.toggle("is-on", x === li));
    });
  });
})();
