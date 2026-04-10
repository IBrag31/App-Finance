// =========================
// TOAST
// =========================

let toastTimeout;

function showToast(message){

  const toast = document.getElementById("toast");
  if(!toast) return;

  clearTimeout(toastTimeout);

  toast.style.opacity = "0";

  setTimeout(()=>{
    toast.innerText = message;
    toast.style.opacity = "1";
  },10);

  toastTimeout = setTimeout(()=>{
    toast.style.opacity = "0";
  },1500);
}

// =========================
// NAVIGATION (SIMPLIFIÉE)
// =========================

const sections = [
  "resume",
  "revenus",
  "depenses",
  "depenses-fixes",
  "depenses-variables",
  "epargne",
  "epargne-historique",
  "settings"
];

let currentSectionIndex = 0;

function showSection(name, element){

  const sections = document.querySelectorAll(".section");
  const tabs = document.querySelectorAll(".tab");

  // 🔥 FORCE reset (même si déjà actif)
  sections.forEach(sec => {
    sec.classList.remove("active");
    sec.style.display = "none"; // 💥 force repaint
  });

  tabs.forEach(tab => tab.classList.remove("active"));

  // 🔥 ACTIVE
  const section = document.getElementById("section-" + name);
  if(section){
    section.classList.add("active");
    section.style.display = "block"; // 💥 force affichage
  }

  if(element) element.classList.add("active");

  // 🔥 RENDER
  if(name === "resume"){
    requestAnimationFrame(() => updateBudget?.());
  }

  if(name === "revenus"){
    renderRevenusPage?.();
  }

  if(name === "depenses"){
    renderDepensesPage?.();
  }

  if(name === "epargne"){
    renderEpargneHistorique?.();
    renderEpargneMois?.();
  }
}

// =========================
// NAVIGATION SWIPE (optionnel)
// =========================

function goToSection(index){

  if(index < 0 || index >= sections.length) return;

  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.remove("active"));

  document.querySelectorAll(".tab")
    .forEach(tab => tab.classList.remove("active"));

  document.getElementById("section-"+sections[index])
    ?.classList.add("active");

  document.querySelectorAll(".tab")[index]
    ?.classList.add("active");

  currentSectionIndex = index;
}

// =========================
// MODALS
// =========================

function ouvrirModal(){
  document.getElementById("depenseModal")?.classList.add("show");
}

function fermerModal(){
  document.getElementById("depenseModal")?.classList.remove("show");
}
