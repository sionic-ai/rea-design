// Studio first scene — original values: the photo cuts every 2s (starting after 2s), the text alternates from 3s on, every 3s, between a random word and the original sentence
// Mix and swap each letter cell over .5s (ease none, speed .8) with .03s between cells.
(() => {
  const { reduce } = window.fgShared;
  const line = document.querySelector("[data-type-line]");
  const photos = [...document.querySelectorAll("[data-photo-cycle] > .wf-img")];
  const BASE = "Studio is ...";
  const WORDS = ["Value One", "Value Two", "Value Three", "Value Four", "Value Five"];
  const uniq = (s) => [...new Set(s)].join("");
  const WORD_CHARS = uniq(WORDS.join(""));
  const BASE_CHARS = uniq(BASE.replace(/[^a-zA-Z]/g, ""));

  if (line) {
    const caret = line.querySelector(".fg-caret");
    line.textContent = "";
    const cells = [...BASE].map((c) => { const s = document.createElement("span"); s.textContent = c; line.append(s); return s; });
    caret && line.append(caret);
    const write = (text, chars) => {
      const padded = text.padEnd(cells.length, " ");
      const tl = gsap.timeline();
      cells.forEach((cell, i) => tl.to(cell, { duration: 0.5, ease: "none", scrambleText: { text: padded[i], chars, speed: 0.8 } }, 0.03 * i));
    };
    if (!reduce) {
      let last = -1;
      const pick = () => { let k; do k = Math.floor(Math.random() * WORDS.length); while (k === last); last = k; return WORDS[k]; };
      gsap.timeline({ repeat: -1, delay: 3 })
        .call(() => write(pick(), WORD_CHARS))
        .to({}, { duration: 3 })
        .call(() => write(BASE, BASE_CHARS))
        .to({}, { duration: 3 });
    }
  }

  if (photos.length > 1 && !reduce) {
    let cur = 0;
    photos.forEach((p, i) => gsap.set(p, { opacity: i === 0 ? 1 : 0 }));
    gsap.timeline({ repeat: -1, delay: 2 })
      .call(() => {
        const prev = cur;
        cur = (cur + 1) % photos.length;
        gsap.set(photos[cur], { opacity: 1 });
        gsap.set(photos[prev], { opacity: 0 });
      })
      .to({}, { duration: 2 });
  }
})();
