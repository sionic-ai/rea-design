// News — original MyNews: go through the cards in order, and if the left column height ≤ the right column height, put the card on the left, otherwise attach a clone to the right column
// (on wide screens the original slot is hidden and the clone shown, on phones the clone is hidden and it runs back as a single line). more joins the cards together and then splits them again.
(() => {
  const GAP = 30;
  const pages = (window.vnPages = window.vnPages || {});
  pages.news = (main) => {
    const list = main.querySelector(".vn-news__list");
    const left = main.querySelector(".vn-news__col");
    const more = main.querySelector(".vn-news__more");
    if (!list || !left) return;
    const right = document.createElement("ul");
    right.className = "vn-news__col vn-news__col--copy";
    list.append(right);
    const seed = [...left.children].map((li) => li.cloneNode(true));

    const arrange = () => {
      const fresh = [...left.querySelectorAll(".vn-news__item:not(.is-origin):not(.is-copied)")];
      const sizes = fresh.map((li) => li.clientHeight);
      fresh.forEach((li) => li.remove());
      let l = left.clientHeight, r = right.clientHeight;
      fresh.forEach((li, i) => {
        if (l <= r) {
          li.classList.add("is-origin");
          left.append(li);
          l += sizes[i] + GAP;
        } else {
          const copy = li.cloneNode(true);
          copy.classList.add("is-copy");
          li.classList.add("is-copied");
          left.append(li);
          right.append(copy);
          r += sizes[i] + GAP;
        }
      });
      setTimeout(() => window.vnScan?.(), 250);
    };
    const loadMore = () => {
      seed.slice(0, 4).forEach((li) => left.append(li.cloneNode(true)));
      arrange();
    };
    arrange();
    more?.addEventListener("click", loadMore);
    return () => {
      more?.removeEventListener("click", loadMore);
      right.remove();
    };
  };
})();
