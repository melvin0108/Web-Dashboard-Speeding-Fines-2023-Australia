// js/script.js

function navigateTo(page) {
  // 1) Hide all sections, show the one for “page”
  document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`${page}-section`).classList.remove('hidden');

  // 2) Highlight the active nav link
  document.querySelectorAll('nav ul li a').forEach(a => a.classList.remove('active'));
  document
    .querySelector(`nav ul li a[onclick="navigateTo('${page}')"]`)
    .classList.add('active');

  // 3) Update document title
  document.title = page.charAt(0).toUpperCase() + page.slice(1) + ' – Banh Mi Ram Ram';
}

// On initial load, show “home”
document.addEventListener('DOMContentLoaded', () => navigateTo('home'));
