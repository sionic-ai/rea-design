// The original (Studio) hangs every entrance on an absolute time measured from when the page attached, and transitions with no curve use the Studio default cubic-bezier(.4,.4,0,1) — once the opening curtain starts folding at 3.3s
// Hero content appears over 1.2s at 3.8s, and the header line drops from 8px above over .5s at 4.2s.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const head = document.querySelector(".cs-head");
  const inner = document.querySelector(".cs-hero__inner");
  if (inner) inner.classList.add("is-pre");

  // Collage board pieces — [kind, left %, top %, width %, ratio (width/height), tilt, photo description]
  const S = "photo", M = "man", W = "woman", K = "kid", D = "dog";
  const collage = {
    a: [
      [S, 0, -2, 13.6, 195 / 268, 0, "Hand holding a liquor bottle · Bright table · Portrait"],
      [K, 20.5, 0.4, 6.8, 120 / 150, -8],
      [S, 26.6, 5.4, 17.9, 256 / 175, 0, "Woman in a T-shirt · kitchen shelf · landscape"],
      [W, 56, 1, 6.2, 92 / 266, 28],
      [S, 60.1, -1, 25.6, 366 / 270, 0, "Model in T-shirt · white tile wall · landscape"],
      [M, 1.5, 47.5, 6.5, 86 / 266, -32],
      [S, 19, 60.6, 17.8, 255 / 200, 0, "Hand holding a patterned scarf · from above · landscape"],
      [D, 41.6, 70.4, 7, 120 / 90, 0],
      [S, 51.7, 63.6, 24, 343 / 230, 0, "Family seated around the table · daytime · landscape"],
      [K, 73.8, 54, 10, 120 / 150, 18],
      [S, 92, 60, 10, 140 / 200, 0, "Smiling child · by the window · portrait"],
    ],
    b: [
      [S, 3, 4, 19, 270 / 200, 0, "Model with a scarf around the neck · natural light · landscape"],
      [W, 24, 2, 6.2, 92 / 266, -20],
      [S, 33, -3, 15, 210 / 280, 0, "Hand holding a lacquerware cup · workshop · vertical"],
      [K, 54, 4, 8, 120 / 150, 12],
      [S, 66, 6, 22, 320 / 230, 0, "Three family members in matching T-shirts · living room · landscape"],
      [D, 5, 52, 8, 120 / 90, 0],
      [S, 14, 64, 21, 300 / 210, 0, "Several can badges · on patterned fabric · landscape"],
      [M, 40, 62, 6.5, 86 / 266, 24],
      [S, 58, 70, 14, 200 / 200, 0, "Three liquor bottles · Wooden shelf · Square"],
      [K, 80, 58, 9, 120 / 150, -14],
      [S, 88, 66, 12, 170 / 220, 0, "Hand holding a keychain · white background · vertical"],
    ],
    m: [
      [S, 0, 0, 35, 133 / 150, 0, "Hand holding a bottle · Portrait"],
      [W, 35, 9, 20, 92 / 266, 30],
      [S, 72, 4, 30, 113 / 147, 0, "Model in a T-shirt · vertical"],
      [M, -3, 60, 12, 86 / 266, -30],
      [S, 9, 63, 35, 134 / 168, 0, "Smiling Child · Portrait"],
      [K, 58, 62, 14, 120 / 150, 0],
      [S, 72, 64, 32, 120 / 108, 0, "Pattern scarf · Horizontal"],
    ],
    m2: [
      [S, 4, 2, 30, 1, 0, "Lacquerware bowl · square"],
      [K, 44, 6, 16, 120 / 150, -10],
      [S, 66, 0, 34, 120 / 150, 0, "Family of three · vertical"],
      [D, 6, 62, 22, 120 / 90, 0],
      [S, 30, 66, 32, 130 / 110, 0, "Can badge · Landscape"],
      [W, 76, 58, 12, 92 / 266, 20],
    ],
  };
  const symbol = { man: ["cs-man", "0 0 86 266"], woman: ["cs-woman", "0 0 92 266"], kid: ["cs-kid", "0 0 120 150"], dog: ["cs-dog", "0 0 120 90"] };
  const fill = (box, list) => {
    for (const [kind, x, y, w, ratio, tilt, label] of list) {
      let el;
      if (kind === S) {
        el = document.createElement("span");
        el.className = "cs-photo";
        el.dataset.label = label;
      } else {
        el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        el.setAttribute("viewBox", symbol[kind][1]);
        el.innerHTML = `<use href="#${symbol[kind][0]}"/>`;
      }
      Object.assign(el.style, { left: `${x}%`, top: `${y}%`, width: `${w}%`, aspectRatio: String(ratio), rotate: `${tilt}deg` });
      box.append(el);
    }
  };
  document.querySelectorAll(".cs-collage").forEach((box) => {
    const key = box.classList.contains("cs-collage--m2") ? "m2" : box.classList.contains("cs-collage--m") ? "m" : box.classList.contains("cs-collage--b") ? "b" : "a";
    fill(box, collage[key]);
  });

  // Header and hero entrance: counted from the moment the opening curtain starts as 0
  const show = (el, at, css) => {
    if (!el) return;
    if (reduce) { el.classList.remove("is-pre"); return; }
    setTimeout(() => {
      el.style.transition = css;
      el.classList.remove("is-pre");
    }, at);
  };
  show(inner, 3800, "opacity 1.2s cubic-bezier(.4,.4,0,1)");
  show(head, 4200, "opacity .5s cubic-bezier(.4,.4,0,1), transform .5s cubic-bezier(.4,.4,0,1)");
  if (head && !reduce) head.addEventListener("transitionend", () => { head.style.transition = ""; }, { once: true });

  // Phone menu — pressing the square button turns it into × and an off-white panel opens, and pressing a menu item or the button again closes it
  const burger = document.querySelector(".cs-head__burger");
  const menu = document.getElementById("cs-menu");
  if (burger && menu) {
    const set = (open) => {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }
})();
