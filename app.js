console.log("app.js MASTER SYNC 🔥");

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

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

// =========================
// BUDGET
// =========================

function updateBudget(){

  const mois = (typeof getMoisBudget === "function")
    ? getMoisBudget()
    : new Date().toISOString().slice(0,7);

  const revenus = getRevenusDuMois(mois) + window.especes;
  const depenses = calculTotalDepenses();
  const epargneTotale = getTotalEpargne();
  const epargneMois = getEpargneDuMois(mois);

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

  setText("epargneMoisPage", euro(epargneMois));
  setText("epargneTotalePage", euro(epargneTotale));
}

// =========================
// INIT
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT CLEAN 🚀");

  loadAll();

  initUI?.();

  refreshApp();

  showSection("resume");
});