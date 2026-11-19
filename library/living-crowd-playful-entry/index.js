// Hero → tutorial → play. As in the original, a first-time visitor pressing ”Start” goes from the tutorial’s first page, and someone who has seen it goes straight to play.
// Moving to play, the hero and cards clear in .42s (hidden after .44s) and fx:play is fired at the scene so the camera descends to the play viewpoint in 1.5s.
(() => {
  const intro = document.querySelector(".dl-intro");
  const steps = document.querySelector(".dl-steps");
  const stage = document.querySelector(".dl-stage");
  // Loading curtain — lifts when the scene draws its first frame (after 4 seconds at the latest if WebGL fails)
  const loader = document.querySelector(".dl-loader");
  const lift = () => loader?.dispatchEvent(new CustomEvent("fx:hide"));
  stage?.addEventListener("fx:ready", lift, { once: true });
  setTimeout(lift, 4000);
  // The camera orbit is counted from the moment the curtain lifts — so the first ”close” isn’t brought forward by the spin that happened behind the curtain
  loader?.addEventListener("fx:lift", () => stage?.dispatchEvent(new CustomEvent("fx:restart")), { once: true });
  if (!intro || !steps) return;
  const SEEN = "dl.seen";
  // Five sections — the first is a fee bar demo, the second and third have four icons, the fourth has a color key instead of an image, the last is images only
  const cards = [
    { fee: true, title: "Here goes the first title", line: "Your three or four lines go here explaining the first step. Say what to look at and what to press, at a character count close to the original." },
    { icons: ["ball", "heart", "screen", "note"], title: "Second title", line: "Here, add text explaining the second step. Write in two or three lines what the four icons do." },
    { icons: ["star", "bell", "flag", "spark"], tone: ["follow", "follow", "divide", "divide"], title: "Here goes the third title", line: "Your text for the third step goes here. Write in three to four lines about things that cost more but keep working for a long time." },
    { key: true, title: "A fourth title, a bit longer", line: "Your two lines here on how to read status by color." },
    { title: "And the fifth title is longest", line: "Your two sentences on the winning and losing conditions go here." },
  ];
  // Icons use our basic shapes — stand-ins for the original prop art
  const glyph = {
    ball: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16"/>',
    heart: '<path d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.8C19 14.6 12 19 12 19z"/>',
    screen: '<rect x="4" y="6" width="16" height="11" rx="2"/><path d="M9 20h6"/>',
    note: '<path d="M9 17V6l9-2v11"/><circle cx="7" cy="17" r="2"/><circle cx="16" cy="15" r="2"/>',
    star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20h4"/>',
    flag: '<path d="M6 21V4M6 5h11l-2.5 4L17 13H6"/>',
    spark: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  };
  const $ = (s) => steps.querySelector(s);
  let at = 0, playing = false;

  const show = (i) => {
    at = i;
    intro.hidden = true;
    steps.hidden = false;
    steps.classList.remove("is-out");
    const c = cards[i];
    $(".dl-step__num").textContent = `${i + 1} / ${cards.length}`;
    $(".dl-step__title").textContent = c.title;
    $(".dl-step__line").textContent = c.line;
    $(".dl-step__key").hidden = !c.key;
    $(".dl-step__visual").classList.toggle("is-key", !!c.key);
    $(".dl-step__fee").hidden = !c.fee;
    const icons = $(".dl-step__icons");
    icons.hidden = !c.icons;
    icons.innerHTML = (c.icons || []).map((n, k) => `<span class="dl-sicon${c.tone ? ` is-${c.tone[k]}` : ""}"><svg viewBox="0 0 24 24" aria-hidden="true">${glyph[n]}</svg><b>${k + 1}</b></span>`).join("");
    $(".dl-step__extras").classList.toggle("has-extras", !!(c.fee || c.icons));
    // What the card shows (bars·icons·color lines) floats up in order from the start each time the section turns
    const card = $(".dl-step");
    card.classList.remove("is-in");
    void card.offsetWidth;
    requestAnimationFrame(() => card.classList.add("is-in"));
    const last = i === cards.length - 1;
    $('[data-act="skip"]').hidden = last;
    $('[data-act="next"]').textContent = last ? "Start Game" : "Next";
  };
  const play = () => {
    if (playing) return;
    playing = true;
    try { localStorage.setItem(SEEN, "1"); } catch {}
    document.body.classList.remove("is-title");
    for (const s of [intro, steps]) { s.classList.add("is-out"); setTimeout(() => { s.hidden = true; }, 440); }
    stage?.dispatchEvent(new CustomEvent("fx:play"));
  };

  intro.querySelector('[data-act="start"]')?.addEventListener("click", () => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN) === "1"; } catch {}
    seen ? play() : show(0);
  });
  intro.querySelector('[data-act="how"]')?.addEventListener("click", () => show(0));
  $('[data-act="next"]')?.addEventListener("click", () => (at < cards.length - 1 ? show(at + 1) : play()));
  $('[data-act="skip"]')?.addEventListener("click", play);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !steps.hidden && !playing) { steps.hidden = true; intro.hidden = false; }
  });
})();
