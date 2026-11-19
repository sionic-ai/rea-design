// Post collection — press a category pill and only that category’s cards remain
(() => {
  const btns = [...document.querySelectorAll(".nw-filter .nw-pill")];
  const posts = [...document.querySelectorAll(".nw-grid .dv-post")];
  btns.forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    btns.forEach((x) => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", String(x === b)); });
    posts.forEach((p) => (p.hidden = b.dataset.f !== "all" && p.dataset.tag !== b.dataset.f));
    window.ScrollTrigger?.refresh();
    window.dvLenis?.resize();
  }));
})();

// Hero — original text effect: title words rise from 40px below at .06s intervals, About words start after .45s at .09s intervals, and text cards float up at .15s intervals
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const split = (el) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return walk(n);
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) return frag.append(w);
        const s = document.createElement("span");
        s.className = "nw-w";
        s.textContent = w;
        frag.append(s);
      });
      n.replaceWith(frag);
    });
    walk(el);
    return [...el.querySelectorAll(".nw-w")];
  };
  const groups = [...document.querySelectorAll("[data-words]")].map((el) => ({ el, words: split(el) }));
  const cards = [...document.querySelectorAll(".nw-grid .dv-post")];
  if (reduce || !window.gsap) { document.documentElement.classList.add("is-reduced"); return; }
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    groups.forEach(({ el, words }) => gsap.to(words, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: +(el.dataset.wordsAt || 0.1), stagger: +el.dataset.words }));
    gsap.to(cards.slice(0, 6), { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.1, stagger: 0.15 });
    gsap.set(cards.slice(6), { opacity: 1 });
  });
})();
