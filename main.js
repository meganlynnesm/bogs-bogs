// Highlight the nav tab for whichever section is in view.
const links = document.querySelectorAll('nav a');
const map = {};
links.forEach(l => { map[l.getAttribute('href').slice(1)] = l; });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && map[e.target.id]) {
      links.forEach(l => l.classList.remove('active'));
      map[e.target.id].classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

document.querySelectorAll('main section').forEach(s => observer.observe(s));
