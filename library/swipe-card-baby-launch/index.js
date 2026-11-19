// First page — hero title pop-up, concept-end wordmark filling up, bath guide button and progress indicator
(() => {
  const { reduce } = window.bsSite || {};
  const mm = gsap.matchMedia();

  // Hero title — letters are split inside word chunks (so Korean lines don’t break in the middle of a word)
  const splitChars = (el) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) return frag.append(w);
            const word = document.createElement("span");
            word.style.display = "inline-block";
            for (const c of w) { const s = document.createElement("span"); s.className = "ch"; s.textContent = c; word.append(s); out.push(s); }
            frag.append(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return out;
  };
  const main = splitChars(document.querySelector(".bs-fv__main"));
  const sub = splitChars(document.querySelector(".bs-fv__sub"));
  const label = document.querySelector(".bs-fv__label");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // After 1s — title letters elastic.out(1,.3) 1.5s · rising from 30% below with a .08s stagger, subtitle from the 75% point 1.4s · .06s, round badge .5→1x, the badge tail line is drawn in .3s
    const tl = gsap.timeline({ delay: 1, defaults: { ease: "elastic.out(1, 0.3)", duration: 1.5, stagger: 0.08 } });
    tl.fromTo(main, { opacity: 0, y: "30%" }, { opacity: 1, y: 0 });
    tl.fromTo(sub, { opacity: 0, y: "30%" }, { opacity: 1, y: 0, duration: 1.4, stagger: 0.06 }, "<75%");
    tl.fromTo(label, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1 }, "<20%");
    tl.fromTo(label, { "--line-prog": 0 }, { "--line-prog": 1, ease: "power1.out", duration: 0.3 }, "<60%");

    // Concept-end English wordmark — fills with mint from the bottom, from when its top edge touches the bottom of the screen until it touches the top
    const foot = document.querySelector(".bs-concept__foot");
    gsap.fromTo(foot, { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "top top", scrub: true } });
  });
  if (reduce) document.querySelector(".bs-concept__foot")?.style.setProperty("--progress", 1);

  // Bath guide — card flipping is the card-deck-flip part. Here only the bottom button text (Read → Next page → Start over), the ‹Start over› text link and the progress bar
  const deck = document.querySelector(".bs-hb");
  if (!deck) return;
  deck.querySelectorAll(".progress[data-step]").forEach((p) => {
    for (let i = 1; i <= 7; i++) { const s = document.createElement("span"); if (i <= +p.dataset.step) s.className = "is-on"; p.append(s); }
  });
  const next = deck.querySelector(".bs-hb__next"), nextLabel = next.querySelector(".label"), first = deck.querySelector(".bs-hb__first");
  deck.addEventListener("fx:change", (e) => {
    const { index, total } = e.detail;
    const ends = index === 0 || index === total - 1;
    nextLabel.textContent = index === 0 ? "Read the guidebook" : index === total - 1 ? "Read from start" : "To the next section";
    next.classList.toggle("is-to-top", index === total - 1);
    gsap.to(first, { opacity: ends ? 0 : 1, duration: 0.3, onComplete: () => { first.inert = ends; } });
    // The wide-screen table of contents covers only the cover through step 7 — in the last (product) section no line is lit
    deck.querySelectorAll(".bs-hb__menu [data-fx-part='tab']").forEach((t, k) => t.classList.toggle("is-current", k === index && index < total - 1));
    const scroll = deck.querySelectorAll("[data-fx-part='card']")[index]?.querySelector(".bs-step__scroll");
    const os = scroll && window.bsSite?.scrollbars?.get(scroll);
    if (os) os.elements().viewport.scrollTop = 0; else if (scroll) scroll.scrollTop = 0;
  });
  first.inert = true;
})();
