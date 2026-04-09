console.log("app.js clean loaded ✅");

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

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

// =========================
// SAFE CALLS (anti-bug)
// =========================

function safe(fn, fallback = 0){
  try{
    return (typeof fn === "function") ? fn() : fallback;
  }catch(e){
    console.warn("Erreur fonction :", fn?.name, e);
    return fallback;
  }
}

// =========================
// CORE APP
// =========================

function updateBudget(){

  console.log("UPDATE BUDGET 🔄");

  const mois = (typeof getMoisBudget === "function")
    ? getMoisBudget()
    : new Date().toISOString().slice(0,7);

  const especes = Number(localStorage.getItem("especes")) || 0;

  const revenus = safe(() => getRevenusDuMois(mois)) + especes;
  const depenses = safe(() => calculTotalDepenses());
  const epargneTotale = safe(() => getTotalEpargne());

  const epargneMois = safe(() => getEpargneDuMois(mois));

  // =========================
  // OBJECTIFS
  // =========================

  const objectifDepenses = 1250;
  const objectifEpargne = 5000;
  const objectifRevenus = 2300;

  // =========================
  // TEXTES
  // =========================

  setText("budgetDepensesText",
    `${Math.round(depenses)} / ${objectifDepenses} €`
  );

  setText("budgetEpargneText",
    `${Math.round(epargneTotale)} / ${objectifEpargne} €`
  );

  setText("budgetRevenusText",
    `${Math.round(revenus)} / ${objectifRevenus} €`
  );

  // =========================
  // BARRES
  // =========================

  updateBar("budgetDepensesBar", depenses, objectifDepenses, "depense");
  updateBar("budgetEpargneBar", epargneTotale, objectifEpargne, "epargne");
  updateBar("budgetRevenusBar", revenus, objectifRevenus, "revenus");
  
  // =========================
// 🎨 COULEUR TEXTE DEPENSES
// =========================

const depText = document.getElementById("budgetDepensesText");

if(depText){
  if(depenses < 800){
    depText.style.color = "#22c55e";
  }
  else if(depenses <= 1250){
    depText.style.color = "#f97316";
  }
  else{
    depText.style.color = "#ef4444";
  }
}

  // =========================
  // DASHBOARD
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

// 🎨 COULEUR DEPENSES (carte dashboard)
const depensesDisplay = document.getElementById("depensesDisplay");

if(depensesDisplay){
  if(depenses < 800){
    depensesDisplay.style.color = "#22c55e";
  }
  else if(depenses <= 1250){
    depensesDisplay.style.color = "#f97316";
  }
  else{
    depensesDisplay.style.color = "#ef4444";
  }
}

  // =========================
  // PAGES
  // =========================

  setText("epargneMoisPage", euro(epargneMois));
  setText("epargneTotalePage", euro(epargneTotale));

  if(typeof renderEpargneMois === "function"){
    renderEpargneMois();
  }
}

// =========================
// BARRES (clean)
// =========================

function updateBar(id, value, objectif, type){

  const el = document.getElementById(id);
  if(!el) return;

  const percent = objectif ? (value / objectif) * 100 : 0;
  el.style.width = Math.min(percent, 100) + "%";

  // 🎯 DEPENSES (logique complète restaurée)
  if(type === "depense"){
    if(value < 800){
      el.style.background = "#22c55e"; // vert
    }
    else if(value <= 1250){
      el.style.background = "#f97316"; // orange
    }
    else{
      el.style.background = "#ef4444"; // rouge
    }
  }

  // 💰 EPARGNE
  if(type === "epargne"){
    el.style.background = "var(--color-epargne)";
  }

  // 💵 REVENUS (AJOUT MANQUANT ❗)
  if(type === "revenus"){
    el.style.background = "var(--color-revenus)";
  }
}

// =========================
// INIT UI
// =========================

function initUI(){
  if(typeof renderEspeces === "function"){
    renderEspeces();
  }
}

// =========================
// RESET
// =========================

function resetApp(){

  if(!confirm("⚠️ Supprimer toutes les données ?")) return;

  localStorage.clear();
  location.reload();
}

// =========================
// INIT APP (propre)
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT APP 🚀");

  initUI();

  // render pages
  if(typeof renderRevenusPage === "function") renderRevenusPage();
  if(typeof renderDepensesPage === "function") renderDepensesPage();
  if(typeof renderEpargneHistorique === "function") renderEpargneHistorique();
  if(typeof renderEpargneMois === "function") renderEpargneMois();

  // update global
  updateBudget();

  // date affichée
  const el = document.getElementById("todayDate");
  if(el){
    const d = new Date();
    let str = d.toLocaleDateString("fr-FR",{
      weekday:"long",
      day:"numeric",
      month:"long"
    });
    el.textContent = str.charAt(0).toUpperCase() + str.slice(1);
  }

  console.log("APP READY ✅");
});