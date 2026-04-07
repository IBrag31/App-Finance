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

function euroShort(n){
  return Math.round(Number(n || 0)).toLocaleString("fr-FR") + " €";
}

function getEpargneTotale(){
  return Number(localStorage.getItem("epargneTotale")) || 0;
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

  // =========================
  // BARRES BUDGET
  // =========================

  const objectifDepenses = 1300;
  const objectifEpargne = 5000;
  const objectifRevenus = 2300;

  const epargneValue = getEpargneTotale();

 // TEXTES

setText(
  "budgetDepensesText",
  `${Math.round(depenses).toLocaleString("fr-FR")} / ${Math.round(objectifDepenses).toLocaleString("fr-FR")} €`
);

setText(
  "budgetEpargneText",
  `${Math.round(epargneValue).toLocaleString("fr-FR")} / ${Math.round(objectifEpargne).toLocaleString("fr-FR")} €`
);

setText(
  "budgetRevenusText",
  `${Math.round(revenus).toLocaleString("fr-FR")} / ${Math.round(objectifRevenus).toLocaleString("fr-FR")} €`
);

  // ELEMENTS
  const depBar = document.getElementById("budgetDepensesBar");
  const epBar = document.getElementById("budgetEpargneBar");
  const revBar = document.getElementById("budgetRevenusBar");

  // =========================
  // 🔥 DEPENSES
  // =========================

  if(depBar){

    const percent = Math.min(depensesP, 100);
    depBar.style.width = percent + "%";

    if(percent < 50){
      depBar.style.background = "#eab308";
    }
    else if(percent < 80){
      depBar.style.background = "#f97316";
    }
    else{
      depBar.style.background = "#ef4444";
    }

    if(depenses > budgetMax){
      depBar.style.background = "#dc2626";
    }
  }

  const depText = document.getElementById("budgetDepensesText");
  if(depText && depBar){
    depText.style.color = depBar.style.background;
  }
  
  // =========================
// 🎨 COULEUR MINI CARTE DEPENSES
// =========================

const depensesMini = document.getElementById("depensesDisplay");

if(depensesMini){

  if(depenses > budgetMax){
    depensesMini.style.color = "#dc2626";
  }
  else if(depensesP < 50){
    depensesMini.style.color = "#eab308";
  }
  else if(depensesP < 80){
    depensesMini.style.color = "#f97316";
  }
  else{
    depensesMini.style.color = "#ef4444";
  }
}

  // =========================
  // 💰 EPARGNE
  // =========================

  if(epBar){

    const percent = objectifEpargne
      ? (epargneValue / objectifEpargne) * 100
      : 0;

    epBar.style.width = Math.min(percent, 100) + "%";
    epBar.style.background = "var(--color-epargne)";
  }

  // =========================
  // 💵 REVENUS
  // =========================

  if(revBar){

    const revenusP = objectifRevenus
      ? (revenus / objectifRevenus) * 100
      : 0;

    revBar.style.width = Math.min(revenusP, 100) + "%";
    revBar.style.background = "var(--color-revenus)";
  }

  const revText = document.getElementById("budgetRevenusText");
  if(revText){
    revText.style.color = "var(--color-revenus)";
  }

  // =========================
  // 🎨 TOTAL DEPENSES (PAGE)
  // =========================

  const totalDepensesEl = document.getElementById("depensesTotalPage");

  if(totalDepensesEl){

    if(depenses > budgetMax){
      totalDepensesEl.style.color = "#dc2626";
    }
    else if(depensesP < 50){
      totalDepensesEl.style.color = "#eab308";
    }
    else if(depensesP < 80){
      totalDepensesEl.style.color = "#f97316";
    }
    else{
      totalDepensesEl.style.color = "#ef4444";
    }

    // animation
    totalDepensesEl.style.transform = "scale(1)";
    
    setTimeout(()=>{
      totalDepensesEl.style.transform = "scale(1.05)";
      
      setTimeout(()=>{
        totalDepensesEl.style.transform = "scale(1)";
      },150);
    },10);
  }

  // =========================
  // DASHBOARD (CARTES)
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargne));
  setText("epargneTotaleDisplay", euro(epargneValue));

  // =========================
  // PAGES DÉTAILLÉES
  // =========================

  setText("revenusPage", euro(revenus));
  setText("epargneMoisPage", euro(epargne));
  setText("epargneTotalePage", euro(epargneValue));
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