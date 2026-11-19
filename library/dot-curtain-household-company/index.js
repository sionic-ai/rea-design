// First page: vertical card strip of media articles. One card in the center with the edges above and below peeking, and as in the original it waits 2.5s then moves up one (1.5s .19,1,.22,1), and after it finishes rising waits 2.5s again.
(() => {
  const press = document.querySelector(".ix-press");
  if (!press) return;
  const track = press.querySelector(".ix-press__track");
  const dots = [...press.querySelectorAll(".ix-press__pager button")];
  const n = track.children.length;
  [...track.children].forEach((c) => track.append(c.cloneNode(true)));
  const step = () => track.children[1].offsetTop - track.children[0].offsetTop;
  let i = 0, timer = null;
  const paint = () => dots.forEach((d, k) => d.classList.toggle("is-on", k === (i + 1) % n));
  const go = (to) => {
    i = to;
    track.style.transform = `translateY(${-step() * i}px)`;
    paint();
    clearTimeout(timer);
  };
  const wait = () => { clearTimeout(timer); if (!TN.reduced) timer = setTimeout(() => go(i + 1), 2500); };
  track.addEventListener("transitionend", (e) => {
    if (e.target !== track) return;
    if (i >= n) {
      track.style.transition = "none";
      i -= n;
      track.style.transform = `translateY(${-step() * i}px)`;
      track.offsetWidth;
      track.style.transition = "";
      paint();
    }
    wait();
  });
  dots.forEach((d, k) => d.addEventListener("click", () => go((k - 1 + n) % n)));
  go(0);
  wait();
})();

// Hero stamp button: original setCircleHover. On hover, two frames later hover is applied to the border circle for 900ms (re-hovering in between does not restart it)
(() => {
  const stamp = document.querySelector(".ix-stamp");
  if (!stamp || TN.reduced || !matchMedia("(hover: hover)").matches) return;
  let timer = null;
  stamp.addEventListener("mouseenter", () => {
    if (stamp.classList.contains("is-hover")) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      stamp.classList.add("is-hover");
      clearTimeout(timer);
      timer = setTimeout(() => stamp.classList.remove("is-hover"), 900);
    }));
  });
})();
