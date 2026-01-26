function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');

  // close menu on mobile
  if (window.innerWidth <= 768) {
    document.getElementById("nav").style.display = "none";
  }
}

function toggleMobileMenu() {
  const nav = document.getElementById("nav");
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}