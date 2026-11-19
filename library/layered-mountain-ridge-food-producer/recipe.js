// Recipe list: in the original each category pill goes to /recipe/ct/<Category> Moves pages with it, but since the form is the same, only the title and list change on one page (opens directly via the #cat-n address).
// ”Load more” briefly shows the character ”Loading” like the original CMS, then appends the next batch, and removes the button when there are no more.
(() => {
  const nav = document.querySelector(".rc-nav");
  if (!nav) return;
  const pills = [...nav.querySelectorAll("a")];
  const title = document.querySelector("[data-cat-title]");
  const list = document.querySelector("[data-cards]");
  const more = document.querySelector("[data-more]");
  const wait = document.querySelector(".rc-more__wait");
  const first = [...list.children].map((li) => li.cloneNode(true));
  const PAGE = 8, PAGES = 2;
  let loaded = 0;

  const show = (els) => gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: HS.reduced ? 0 : 0.5, ease: "power2.out", stagger: 0.04, clearProps: "transform" });

  const apply = (pill) => {
    pills.forEach((p) => p.classList.toggle("is-on", p === pill));
    title.textContent = pill.textContent;
    list.replaceChildren(...first.map((n) => n.cloneNode(true)));
    list.querySelectorAll(".rc-cards__tags i:last-child").forEach((i) => (i.textContent = pill.textContent));
    loaded = 0;
    more.hidden = false;
    show(list.children);
    ScrollTrigger.refresh();
  };
  pills.forEach((p) =>
    p.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", p.getAttribute("href"));
      apply(p);
    })
  );
  const start = pills.find((p) => p.getAttribute("href") === location.hash);
  if (start && !start.classList.contains("is-on")) apply(start);

  let busy = false;
  more.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    wait.hidden = false;
    setTimeout(() => {
      busy = false;
      wait.hidden = true;
      const add = first.slice(0, PAGE).map((n, i) => {
        const li = n.cloneNode(true);
        li.querySelector("b").textContent = `Your dish name $ here{String(list.children.length + i + 1).padStart(2, "0")}`;
        return li;
      });
      list.append(...add);
      show(add);
      loaded++;
      more.hidden = loaded >= PAGES;
      ScrollTrigger.refresh();
    }, HS.reduced ? 0 : 600);
  });
})();
