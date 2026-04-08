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

  // 🎯 OBJECTIF UNIQUE
  const objectifDepenses = 1250;
  const objectifEpargne = 5000;
  const objectifRevenus = 2300;

  const epargneValue = getEpargneTotale();

  // =========================
  // 📊 POURCENTAGE DEPENSES
  // =========================

  const depensesP = (depenses / objectifDepenses) * 100;

  // =========================
  // TEXTES
  // =========================

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

  // =========================
  // ELEMENTS
  // =========================

  const depBar = document.getElementById("budgetDepensesBar");
  const epBar = document.getElementById("budgetEpargneBar");
  const revBar = document.getElementById("budgetRevenusBar");

  // =========================
  // 💸 DEPENSES (BARRE + COULEUR)
  // =========================

  if(depBar){

    const percent = Math.min(depensesP, 100);
    depBar.style.width = percent + "%";

    if(depenses < 800){
      depBar.style.background = "#22c55e"; // vert
    }
    else if(depenses <= 1250){
      depBar.style.background = "#f97316"; // orange
    }
    else{
      depBar.style.background = "#ef4444"; // rouge
    }
  }

  const depText = document.getElementById("budgetDepensesText");
  if(depText && depBar){
    depText.style.color = depBar.style.background;
  }

  // =========================
  // 🎨 MINI CARTE DEPENSES
  // =========================

  const depensesMini = document.getElementById("depensesDisplay");

  if(depensesMini){

    if(depenses < 800){
      depensesMini.style.color = "#22c55e";
    }
    else if(depenses <= 1250){
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

    if(depenses < 800){
      totalDepensesEl.style.color = "#22c55e";
    }
    else if(depenses <= 1250){
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
  // DASHBOARD
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargne));

  // =========================
  // PAGES DÉTAILLÉES
  // =========================

  setText("epargneMoisPage", euro(epargne));
  setText("epargneTotalePage", euro(epargneValue));
}

// =========================
// INIT UI
// =========================

function initUI(){
  renderEspeces?.();
}

function resetApp(){

  console.log("RESET CLICK 🔥");

  if(!confirm("⚠️ Supprimer toutes les données ?")) return;

  localStorage.clear();
  location.reload();
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