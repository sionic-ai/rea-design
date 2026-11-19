// Freshman roundtable — plugs in five round member photos and five THEME sections (same type: sticky vertical name tag · underlined title · speech lines · photo)
(() => {
  const NAMES = ["Name 01", "Name 02", "Name 03", "Name 04", "Name 05"];
  document.querySelector("[data-members]").innerHTML = NAMES.map((n, i) => `<li >
    <div class="wf-img is-round mb__ph" data-label="Member ${i + 1} Face · Light background · Circle"></div><p class="mb__name">${n}</p></li>`).join("");

  const say = (who) => `<div class="cs"><div class="cs__who"><div class="wf-img is-round cs__ph" data-label="Speaker’s face · circle"></div><p>${NAMES[who]}</p></div>
    <p class="cs__txt">Your quote from this person here. In four or five lines, conversationally, write what drew them as a student, what work they wanted to do, and why they chose this place. Add one more sentence here.</p></div>`;
  const THEMES = ["Your first question goes here?", "Your second question here?", "Your third question goes here?", "Your fourth question here?", "Your message to applicants goes here."];
  document.querySelector("[data-themes]").innerHTML = THEMES.map((q, i) => {
    const flip = i % 2 === 1;
    return `<section class="tt${flip ? " is-flip" : ""}" data-slot="talk-theme">
      <p class="md-sidelbl tt__num">theme 0${i + 1}</p>
      <div class="tt__inner md-wide">
        <span class="tt__deco" data-deco="slash"></span>
        <h2 class="tt__head">${q}</h2>
        <div class="tt__body">
          <div class="tt__talk">${say(i % 5)}${say((i + 1) % 5)}${say((i + 2) % 5)}</div>
          <div class="wf-img tt__ph" data-label="New hires chatting · bright meeting room lighting · ${flip ? "Vertical 4:5" : "Landscape 3:2"}"></div>
        </div>
        <div class="wf-img tt__wide" data-label="New hires smiling around a desk · meeting room · landscape 3:1"></div>
      </div>
    </section>`;
  }).join("");
})();
