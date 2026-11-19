/* Interview card placeholder — the first-page slider, the list, and the slider under the post share the same list (the original also fetches one list as JSON and renders it) */
window.TY_INTERVIEWS = [
  { title: "Your two-line interview title here. A roundtable of five department heads", photo: "Roundtable of three leaders · window natural light · seated side by side on a sofa · 16:9 landscape", position: "Role 1", people: [["Name one", "Brand 1 / Brand 2", "Role 1"], ["Name two", "Brand 3 / Brand 4", "Role 1"], ["Name three", "Brand 5", "Role 1"]] },
  { title: "”Your quote goes here”. A title for the on-site story of a second-year new hire", photo: "New employee upper body · office fluorescent light · arms crossed, smiling · landscape 16:9", position: "Role 2", people: [["Name four", "Brand 1", "Role 2"]] },
  { title: "Title spot saying each day builds the future. What executives expect from new hires", photo: "Executive half-length · conference room backlight · shirt, front-facing · landscape 16:9", position: "Role 1", people: [["Fifth name", "Brand 2", "Role 1"]] },
  { title: "Career heading for a director who is ambitious about the work they want to do freely, in their own way", photo: "Director full body · dim studio lighting · leaning on wall · landscape 16:9", position: "Role 3", people: [["Sixth name", "Brand 4", "Role 3"]] },
  { title: "Title slot saying it is not about aiming at someone. The story of a person entrusted with a big project", photo: "Maker half-length · window daylight · seated and gesturing · landscape 16:9", position: "Role 1", people: [["Seventh name", "Brand 1", "Role 1"]] },
  { title: "”I want to value people most” is a quote-style title. A record of a maker who opened their own path", photo: "Creator upper body · in front of a yellow wall · side view · landscape 16:9", position: "Role 1", people: [["Eighth name", "Brand 3", "Role 1"]] },
];

window.tyPeople = (people, cls) => people.map(([name, brand, pos]) => `
  <div class="${cls}">
    <p class="${cls}__name">${name}</p>
    <p class="${cls}__meta"><span><b>Brand</b><i></i><em>${brand}</em></span><span><b>Position</b><i></i><em>${pos}</em></span></p>
  </div>`).join("");

window.tySlides = (list) => list.map((it) => `
  <article class="swiper-slide"><a href="article.html">
    <div class="ty-iv__img"><div class="wf-img" data-label="${it.photo}"></div></div>
    <h3 class="ty-iv__text">${it.title}</h3>
    ${window.tyPeople(it.people, "ty-person")}
  </a></article>`).join("");
