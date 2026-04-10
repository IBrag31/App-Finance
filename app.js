console.log("app.js CLEAN FINAL ✅");

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
  return "#22c55e";
}

function getEpargneColor(){
  return "#3b82f6";
}

// =========================
// CORE APP
// =========================

function updateBudget(){

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

  setText("budgetDepensesText", `${Math.round(depenses)} / ${objectifDepenses} €`);
  setText("budgetEpargneText", `${Math.round(epargneTotale)} / ${objectifEpargne} €`);
  setText("budgetRevenusText", `${Math.round(revenus)} / ${objectifRevenus} €`);

  updateBar("budgetDepensesBar", depenses, objectifDepenses, "depense");
  updateBar("budgetEpargneBar", epargneTotale, objectifEpargne, "epargne");
  updateBar("budgetRevenusBar", revenus, objectifRevenus, "revenus");

  const depColor = getDepenseColor(depenses);

  const depText = document.getElementById("budgetDepensesText");
  if(depText) depText.style.color = depColor;

  const revText = document.getElementById("budgetRevenusText");
  if(revText) revText.style.color = getRevenusColor();

  const epText = document.getElementById("budgetEpargneText");
  if(epText) epText.style.color = getEpargneColor();

  const depensesDisplay = document.getElementById("depensesDisplay");
  if(depensesDisplay) depensesDisplay.style.color = depColor;

  const revenusDisplay = document.getElementById("revenusDisplay");
  if(revenusDisplay) revenusDisplay.style.color = getRevenusColor();

  const epargneDisplay = document.getElementById("epargneMoisDisplay");
  if(epargneDisplay) epargneDisplay.style.color = getEpargneColor();

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

  setText("epargneMoisPage", euro(epargneMois));
  setText("epargneTotalePage", euro(epargneTotale));

  renderEpargneMois?.();

  // 🔥 repaint léger iOS
  const el = document.getElementById("section-resume");
  if(el){
    el.style.transform = "scale(0.9999)";
    requestAnimationFrame(() => {
      el.style.transform = "scale(1)";
    });
  }
}

// =========================
// DASHBOARD
// =========================

function renderDashboard(){
  updateBudget();

  const el = document.getElementById("section-resume");
  if(el){
    el.innerHTML = el.innerHTML;
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

  if(type === "depense") el.style.background = getDepenseColor(value);
  if(type === "epargne") el.style.background = getEpargneColor();
  if(type === "revenus") el.style.background = getRevenusColor();
}

// =========================
// RESTORE
// =========================

function restaurerDepuisIcloud(){

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.onchange = (event) => {

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
      try{
        const data = JSON.parse(e.target.result);

        if(data.revenus) localStorage.setItem("revenusDetail", JSON.stringify(data.revenus));
        if(data.depenses) localStorage.setItem("depensesDetail", JSON.stringify(data.depenses));
        if(data.epargne) localStorage.setItem("epargneHistorique", JSON.stringify(data.epargne));
        if(data.especes !== undefined) localStorage.setItem("especes", data.especes);

        renderRevenusPage?.();
        renderDepensesPage?.();
        renderEpargneHistorique?.();
        renderEpargneMois?.();
        renderEspeces?.();

        renderDashboard();

        alert("✅ Sauvegarde restaurée");

      }catch(err){
        alert("❌ Fichier invalide");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// =========================
// INIT DATA
// =========================

function initData(){
  window.revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");
  window.depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");
  window.epargneHistorique = JSON.parse(localStorage.getItem("epargneHistorique") || "[]");
  window.especes = Number(localStorage.getItem("especes")) || 0;
}

// =========================
// INIT
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT APP 🚀");
  
  caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

  initData();

  initUI?.();

  renderEspeces?.();
  renderRevenusPage?.();
  renderDepensesPage?.();
  renderEpargneHistorique?.();
  renderEpargneMois?.();

  // 🔥 simulation navigation
  showSection("settings");

  setTimeout(() => {
    showSection("resume");
  }, 10);

  // 🔥 double render
  setTimeout(() => {
    renderDashboard();

    requestAnimationFrame(() => {
      renderDashboard();
    });

  }, 50);

});

// =========================
// VISIBILITY FIX
// =========================

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {

    renderRevenusPage?.();
    renderDepensesPage?.();
    renderEpargneHistorique?.();
    renderEpargneMois?.();
    renderEspeces?.();

    renderDashboard();
  }
});