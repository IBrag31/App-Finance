console.log("app.js FINAL PRO+ loaded ✅");

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

  // PAGE DEPENSES
  const depensesPage = document.getElementById("depensesTotalPage");
  if(depensesPage) depensesPage.style.color = depColor;

  // FIXES / VARIABLES (FIX HTML)
  const depensesFixes = document.getElementById("totalFixesPage");
  const depensesVariables = document.getElementById("totalVariablesPage");

  const totalFixes = safe(() => calculDepensesFixes());
  const totalVariables = safe(() => calculDepensesVariables());

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

  // DASHBOARD
  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargneMois));

  // PAGES
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

  if(type === "depense") el.style.background = getDepenseColor(value);
  if(type === "epargne") el.style.background = getEpargneColor();
  if(type === "revenus") el.style.background = getRevenusColor();
}

// =========================
// SAUVEGARDE
// =========================

function sauvegardeAuto(){

  const data = {
    revenus: JSON.parse(localStorage.getItem("revenusDetail") || "[]"),
    depenses: JSON.parse(localStorage.getItem("depensesDetail") || "[]"),
    epargne: JSON.parse(localStorage.getItem("epargneHistorique") || "[]"), // ✅ FIX
    especes: Number(localStorage.getItem("especes")) || 0
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "finance-plus-backup.json";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);

  showToast?.("💾 Sauvegarde téléchargée");
}

// =========================
// RESTAURATION
// =========================

function restaurerDepuisIcloud(){

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  showToast?.("📂 Import en cours...");

  input.onchange = (event) => {

    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){
      try{
        const data = JSON.parse(e.target.result);

        // =========================
        // 💾 RESTAURATION STORAGE
        // =========================

        if(data.revenus) localStorage.setItem("revenusDetail", JSON.stringify(data.revenus));
        if(data.depenses) localStorage.setItem("depensesDetail", JSON.stringify(data.depenses));
        if(data.epargne) localStorage.setItem("epargneHistorique", JSON.stringify(data.epargne));
        if(data.especes !== undefined) localStorage.setItem("especes", data.especes);

        // =========================
        // 🔄 SYNC MÉMOIRE
        // =========================

        if(typeof depensesDetail !== "undefined"){
          depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");
        }

        if(typeof epargneHistorique !== "undefined"){
          epargneHistorique = JSON.parse(localStorage.getItem("epargneHistorique") || "[]");
        }

        // =========================
        // 🎨 REFRESH UI
        // =========================

        renderRevenusPage?.();
        renderDepensesPage?.();
        renderEpargneHistorique?.();
        renderEpargneMois?.();
        updateBudget();

        showToast?.("✅ Données restaurées");

      }catch(err){
        showToast?.("❌ Fichier invalide");
      }
    };

    reader.readAsText(file);
  };

  input.click();
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
// INIT
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT APP 🚀");

  initUI?.();

  renderRevenusPage?.();
  renderDepensesPage?.();
  renderEpargneHistorique?.();
  renderEpargneMois?.();

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