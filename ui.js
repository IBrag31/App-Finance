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
// NAVIGATION
// =========================

const sections = ["budget","objectifs","historique","sauvegarde"];
let currentSectionIndex = 0;

function showSection(name, element){

  // =========================
  // RESET UI
  // =========================

  document.querySelectorAll(".section")
    .forEach(sec => sec.classList.remove("active"));

  document.querySelectorAll(".tab")
    .forEach(tab => tab.classList.remove("active"));

  // =========================
  // ACTIVATE SECTION
  // =========================

  const section = document.getElementById("section-" + name);
  if(section) section.classList.add("active");

  if(element) element.classList.add("active");

  currentSectionIndex = sections.indexOf(name);

  // =========================
  // RENDER DYNAMIQUE (SAFE)
  // =========================

  if(name === "depenses"){
    if(typeof renderDepensesPage === "function"){
      renderDepensesPage();
    }
  }

  if(name === "revenus"){
    if(typeof renderRevenusPage === "function"){
      renderRevenusPage();
    }
  }

  if(name === "historique"){
    if(typeof initChart === "function") initChart();
    if(typeof afficherHistorique === "function") afficherHistorique();
    if(typeof majGraph === "function") majGraph();
  }

  if(name === "objectifs"){
    if(typeof updateObjectifs === "function"){
      updateObjectifs();
    }
  }

  // =========================
  // BONUS UX (scroll reset)
  // =========================

  const scroll = section?.querySelector(".section-scroll");
  if(scroll){
    scroll.scrollTop = 0;
  }
}

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

function ouvrirModalRevenu(){

  // 🔥 auto mois actuel
  document.getElementById("revenuMois").value = getMoisActuel();

  document.getElementById("revenuModal")?.classList.add("show");
}

function fermerModalRevenu(){
  document.getElementById("revenuModal")?.classList.remove("show");
}