// Staff interviews — mounts four list cards and four FILE sections (same type: left sticky vertical name tag · profile · question group · message board)
(() => {
  const { ARROW } = window.mdIcons;
  const PEOPLE = [
    ["Department name 01", "Team name 01", "Name 01", "Staff member at a laptop · Office natural light"],
    ["Department name 02", "Team name 02", "Name 02", "Staff holding a tablet · meeting room by the window"],
    ["Department name 03", "Team name 03", "Name 03", "Staff in a yellow shirt · indoor green plant"],
    ["Department name 04", "", "Name 04", "Staff member in a suit, half-length · office desk"],
  ];
  document.querySelector("[data-index]").innerHTML = PEOPLE.map(([d1, d2, name, ph], i) => `<li >
    <article class="md-icard is-index">
      <div class="md-icard__lbl"><span class="md-icard__lbl-en">file.</span><span class="md-icard__lbl-num">0${i + 1}</span></div>
      <div class="md-icard__img"><div class="wf-img" data-label="${ph} · Landscape 3:2"></div></div>
      <div class="md-icard__info"><p>${d1}</p>${d2 ? `<p>${d2}</p>` : ""}<p class="is-name">${name}</p></div>
      <span class="md-circ md-icard__ico">${ARROW}</span>
      <a class="md-icard__link" href="#file0${i + 1}" aria-label="FILE 0${i + 1} Toward"></a>
    </article></li>`).join("");

  const Q = ["Tell us what made you decide to join.", "What do you do now, and when do you feel rewarded?", "How did you overcome the difficulties you met at work?", "What Kind of Workplace Is It?", "What would you like to do next?"];
  const item = (q, i, img) => `<div class="tq${img ? ` has-img${img.cls ? ` ${img.cls}` : ""}` : ""}">
      <div class="tq__txt">
        <h3 class="tq__q">${q}</h3>
        <p class="tq__lead">Your title here condensing the answer to this question into one line ${i + 1}</p>
        <p class="tq__p">Your answer body here. Write eight to ten lines about what you did at your previous company, why you chose this place, and what you do and feel now in your current role. Keep sentences short and conversational. Add a second paragraph here to fill out the length. Add a third sentence here.</p>
      </div>
      ${img ? `<div class="wf-img tq__img" data-label="${img.label}"></div>` : ""}
    </div>`;
  const file = ([d1, d2, name], n, full) => `<section class="tf" id="file0${n}" data-slot="interview-file">
      <p class="md-sidelbl tf__num">file. 0${n}</p>
      <div class="tf__inner md-wide">
        <h2 class="tf__title">Your big title for this person’s interview here, and<br>Finish at the second line</h2>
        <div class="tf__wrap">
          <div class="tp">
            <div class="wf-img is-round tp__img" data-label="Face photo · light background · circle"></div>
            <p class="tp__info">${d1}</p>${d2 ? `<p class="tp__info"><strong>${d2}</strong></p>` : ""}
            <p class="tp__name">${name}</p>
          </div>
          <div class="tf__items">
            ${item(Q[0], 0, { label: "Seated smiling staff member, half-length · office natural light · portrait 3:4" })}
            ${item(Q[1], 1)}
            ${full ? item(Q[2], 2, { cls: "is-large is-reverse", label: "Hand reviewing materials at a desk · from above · square" }) : ""}
            ${item(Q[3], 3)}
            ${full ? `<div class="tq"><div class="wf-img tq__img is-wide" data-label="Staff member in front of an office logo wall · indoor lighting · landscape 2:1"></div></div>` : ""}
            ${full ? item(Q[4], 4) : ""}
          </div>
        </div>
        <div class="tm">
          <p class="tm__en">message</p>
          <h3 class="tq__q">A few words for those applying, please.</h3>
          <p class="tm__txt">Your words to applicants go here, in about five lines. Cover an atmosphere where even new joiners’ opinions are heard, help from seniors, and what kind of people you want to work with.</p>
        </div>
      </div>
    </section>`;
  document.querySelector("[data-files]").innerHTML = PEOPLE.map((p, i) => file(p, i + 1, i % 2 === 0)).join("");
})();
