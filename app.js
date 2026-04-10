console.log("app.js MASTER SYNC FINAL 🚀");

// =========================
// DATA CENTRALISÉE
// =========================

function loadAll(){
  window.revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");
  window.depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");
  window.epargneHistorique = JSON.parse(localStorage.getItem("epargneHistorique") || "[]");
  window.especes = Number(localStorage.getItem("especes")) || 0;
}

function saveAll(){
  localStorage.setItem("revenusDetail", JSON.stringify(window.revenusDetail));
  localStorage.setItem("depensesDetail", JSON.stringify(window.depensesDetail));
  localStorage.setItem("epargneHistorique", JSON.stringify(window.epargneHistorique));
  localStorage.setItem("especes", window.especes || 0);
}

function refreshApp(){
  renderRevenusPage?.();
  renderDepensesPage?.();
  renderEpargneHistorique?.();
  renderEpargneMois?.();
  renderEspeces?.();

  renderDashboard();
}

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
  return Math.round(n || 0) + " €";
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
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
  return "#22c55e";
}

function getEpargneColor(){
  return "#3b82f6";
}

// =========================
// BARRES
// =========================

function updateBar(id, value, objectif, type){

  const el = document.getElementById(id);
  if(!el) return;

  const percent = objectif ? (value / objectif) * 100 : 0;
  el.style.width = Math.min(percent, 100) + "%";

  if(type === "depense") el.style.background = getDepenseColor(value);
  if(type === "epargne") el.style.background = getEpargneColor();
  if(type === "revenus") el.style.background = getRevenusColor();
}

// =========================
// BUDGET (RÉSUMÉ)
// =========================

function updateBudget(){

  const mois = (typeof getMoisBudget === "function")
    ? getMoisBudget()
    : new Date().toISOString().slice(0,7);

  const revenus = (typeof getRevenusDuMois === "function" ? getRevenusDuMois(mois) : 0) + window.especes;
  const depenses = typeof calculTotalDepenses === "function" ? calculTotalDepenses() : 0;
  const epargneTotale = typeof getTotalEpargne === "function" ? getTotalEpargne() : 0;
  const epargneMois = typeof getEpargneDuMois === "function" ? getEpargneDuMois(mois) : 0;

  const objectifDepenses = 1250;
  const objectifEpargne = 5000;
  const objectifRevenus = 2300;

  // TEXTES
  setText("budgetDepensesText", `${Math.round(depenses)} / ${objectifDepenses} €`);
  setText("budgetEpargneText", `${Math.round(epargneTotale)} / ${objectifEpargne} €`);
  setText("budgetRevenusText", `${Math.round(revenus)} / ${objectifRevenus} €`);

  // BARRES
  updateBar("budgetDepensesBar", depenses, objectifDepenses, "depense");
  updateBar("budgetEpargneBar", epargneTotale, objectifEpargne, "epargne");
  updateBar("budgetRevenusBar", revenus, objectifRevenus, "revenus");

  // COULEURS
  const depColor = getDepenseColor(depenses);

  document.getElementById("budgetDepensesText")?.style.setProperty("color", depColor);
  document.getElementById("budgetRevenusText")?.style.setProperty("color", getRevenusColor());
  document.getElementById("budgetEpargneText")?.style.setProperty("color", getEpargneColor());

  document.getElementById("depensesDisplay")?.style.setProperty("color", depColor);
  document.getElementById("revenusDisplay")?.style.setProperty("color", getRevenusColor());
  document.getElementById("epargneMoisDisplay")?.style.setProperty("color", getEpargneColor());

  // VALEURS
  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

  setText("epargneMoisPage", euro(epargneMois));
  setText("epargneTotalePage", euro(epargneTotale));
}

document.getElementById("epargneTotalePage")?.style.setProperty("color", "#3b82f6");

// =========================
// DASHBOARD
// =========================

function renderDashboard(){
  updateBudget();
}

// =========================
// INIT
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT FINAL ✅");

  loadAll();

  initUI?.();

  // 🔥 premier rendu
  refreshApp();

  // 🔥 forcer affichage correct iOS
  setTimeout(() => {
    renderDashboard();
  }, 50);

  showSection("resume");
});

// =========================
// VISIBILITY FIX (iOS)
// =========================

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshApp();
  }
});