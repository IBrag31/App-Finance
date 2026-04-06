console.log("app.js loaded");

// =========================
// UTILS
// =========================

function euro(n){
  return Number(n || 0).toLocaleString("fr-FR",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  }) + " €";
}

// =========================
// SAFE SET TEXT
// =========================

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

// =========================
// CORE APP
// =========================

function updateBudget(){
  
  console.log("UPDATE BUDGET RUN 🔥");

  const mois = getMoisActuel();

  const especes = Number(localStorage.getItem("especes")) || 0;
  const revenus = getRevenusDuMois(mois) + especes;

  const epargneInput = document.getElementById("epargneMois");
  const epargne = Number(epargneInput?.value || 0);

  const depenses = calculTotalDepenses();
  const budgetMax = Math.max(revenus - epargne, 0);

  // =========================
  // CALCUL POURCENTAGES
  // =========================

  const depensesP = budgetMax ? (depenses / budgetMax) * 100 : 0;
  const epargneP = revenus ? (getEpargneTotale() / revenus) * 100 : 0;

  // =========================
  // BARRES BUDGET
  // =========================

  setText("budgetDepensesText", euro(depenses));
  setText("budgetEpargneText", euro(getEpargneTotale()));

  const depBar = document.getElementById("budgetDepensesBar");
  const epBar = document.getElementById("budgetEpargneBar");

  // 🔥 DEPENSES DYNAMIQUES
  if(depBar){

    const percent = Math.min(depensesP, 100);
    depBar.style.width = percent + "%";

    if(percent < 50){
      depBar.style.background = "#eab308"; // jaune
    }
    else if(percent < 80){
      depBar.style.background = "#f97316"; // orange
    }
    else{
      depBar.style.background = "#ef4444"; // rouge
    }

    // dépassement
    if(depenses > budgetMax){
      depBar.style.background = "#dc2626";
    }
  }

  // épargne inchangée
  if(epBar){
    epBar.style.width = Math.min(epargneP,100) + "%";
  }

  // =========================
  // DASHBOARD (CARTES)
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargne));
  setText("epargneTotaleDisplay", euro(getEpargneTotale()));

  // =========================
  // PAGES DÉTAILLÉES
  // =========================

  setText("revenusPage", euro(revenus));
  setText("epargneMoisPage", euro(epargne));
  setText("epargneTotalePage", euro(getEpargneTotale()));
  
  // =========================
  // BARRE REVENUS OBJECTIF
  // =========================

  const objectifRevenus = 2300;

  const revenusP = objectifRevenus > 0
    ? (revenus / objectifRevenus) * 100
    : 0;

  setText(
    "budgetRevenusText",
    `${euro(revenus)} / ${euro(objectifRevenus)}`
  );

  const revBar = document.getElementById("budgetRevenusBar");

  if(revBar){
    revBar.style.width = Math.min(revenusP, 100) + "%";
    revBar.style.background = "#22c55e"; // 🔥 vert
  }
  
  if(typeof renderRevenusPage === "function"){
  renderRevenusPage();
  }

if(typeof renderDepensesPage === "function"){
  renderDepensesPage();
  }
}

// =========================
// INIT UI
// =========================

function initUI(){
  renderEspeces?.();
}

// =========================
// INIT APP
// =========================

window.addEventListener("DOMContentLoaded", () => {

  initUI();

  setTimeout(()=>{
    
    renderRevenusPage?.();
    renderDepensesPage?.();
  
    updateBudget();
  }, 200);

  const dateElement = document.getElementById("todayDate");
  if(dateElement){
    const d = new Date();
    let dateStr = d.toLocaleDateString("fr-FR",{
      weekday:"long",
      day:"numeric",
      month:"long"
    });
    dateElement.textContent =
      dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  console.log("APP READY 🚀");
});