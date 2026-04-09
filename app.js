console.log("app.js FINAL PRO loaded ✅");

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
// SAFE CALLS
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
// COULEURS
// =========================

function getDepenseColor(value){
  if(value < 800) return "#22c55e";
  if(value <= 1250) return "#f97316";
  return "#ef4444";
}

function getRevenusColor(){
  return "#22c55e"; // vert
}

function getEpargneColor(){
  return "#3b82f6"; // bleu
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

  const objectifDepenses = 1250;
  const objectifEpargne = 5000;
  const objectifRevenus = 2300;

  // =========================
  // TEXTES
  // =========================

  setText("budgetDepensesText", `${Math.round(depenses)} / ${objectifDepenses} €`);
  setText("budgetEpargneText", `${Math.round(epargneTotale)} / ${objectifEpargne} €`);
  setText("budgetRevenusText", `${Math.round(revenus)} / ${objectifRevenus} €`);

  // =========================
  // BARRES
  // =========================

  updateBar("budgetDepensesBar", depenses, objectifDepenses, "depense");
  updateBar("budgetEpargneBar", epargneTotale, objectifEpargne, "epargne");
  updateBar("budgetRevenusBar", revenus, objectifRevenus, "revenus");

  // =========================
  // 🎨 COULEURS
  // =========================

  const depColor = getDepenseColor(depenses);

  // Budget textes
  const depText = document.getElementById("budgetDepensesText");
  if(depText) depText.style.color = depColor;

  const revText = document.getElementById("budgetRevenusText");
  if(revText) revText.style.color = getRevenusColor();

  const epText = document.getElementById("budgetEpargneText");
  if(epText) epText.style.color = getEpargneColor();

  // Dashboard cartes
  const depensesDisplay = document.getElementById("depensesDisplay");
  if(depensesDisplay) depensesDisplay.style.color = depColor;

  const revenusDisplay = document.getElementById("revenusDisplay");
  if(revenusDisplay) revenusDisplay.style.color = getRevenusColor();

  const epargneDisplay = document.getElementById("epargneMoisDisplay");
  if(epargneDisplay) epargneDisplay.style.color = getEpargneColor();

  // Page Dépenses
  const depensesPage = document.getElementById("depensesTotalPage");
  if(depensesPage) depensesPage.style.color = depColor;
  
  // =========================
// 🎨 FIXES / VARIABLES
// =========================

const depensesFixes = document.getElementById("depensesFixes");
const depensesVariables = document.getElementById("depensesVariables");

// récup des valeurs (sécurisé)
const totalFixes = safe(() => calculDepensesFixes());
const totalVariables = safe(() => calculDepensesVariables());

// couleur basée sur intensité (option simple)
if(depensesFixes){
  depensesFixes.style.color = totalFixes > totalVariables
    ? "#f97316"
    : "#22c55e";
}

if(depensesVariables){
  depensesVariables.style.color = totalVariables > totalFixes
    ? "#f97316"
    : "#22c55e";
}

  // =========================
  // DASHBOARD
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

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
// BARRES
// =========================

function updateBar(id, value, objectif, type){

  const el = document.getElementById(id);
  if(!el) return;

  const percent = objectif ? (value / objectif) * 100 : 0;
  el.style.width = Math.min(percent, 100) + "%";

  if(type === "depense"){
    el.style.background = getDepenseColor(value);
  }

  if(type === "epargne"){
    el.style.background = getEpargneColor();
  }

  if(type === "revenus"){
    el.style.background = getRevenusColor();
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
// INIT APP
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT APP 🚀");

  initUI();

  if(typeof renderRevenusPage === "function") renderRevenusPage();
  if(typeof renderDepensesPage === "function") renderDepensesPage();
  if(typeof renderEpargneHistorique === "function") renderEpargneHistorique();
  if(typeof renderEpargneMois === "function") renderEpargneMois();

  updateBudget();

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