// About: fill the illustration slot
document.querySelectorAll("[data-people]").forEach((el) => (el.innerHTML = NT.people(el.dataset.people)));
