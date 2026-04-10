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
  
  // 🔥 SYNC FORCÉ AVANT CALCUL

  if(typeof epargneHistorique !== "undefined"){
  epargneHistorique = JSON.parse(localStorage.getItem("epargneHistorique") || "[]");
}

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
// RESTAURATION
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

        updateBudget();

      }catch(err){
        alert("❌ Fichier invalide");
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

function initData(){

  window.revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");
  window.depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");
  window.epargneHistorique = JSON.parse(localStorage.getItem("epargneHistorique") || "[]");
  window.especes = Number(localStorage.getItem("especes")) || 0;

  console.log("DATA LOADED ✅");
}

// =========================
// INIT
// =========================

window.addEventListener("DOMContentLoaded", () => {

  console.log("INIT APP 🚀");

  initData();

  initUI?.();

  renderEspeces?.();
  renderRevenusPage?.();
  renderDepensesPage?.();
  renderEpargneHistorique?.();
  renderEpargneMois?.();

  // 🔥 1er affichage
  showSection("resume");

  // 🔥 🔥 LE FIX MAGIQUE
  requestAnimationFrame(() => {
    console.log("FORCE RENDER 🎯");
    updateBudget();
  });

  console.log("APP READY ✅");
});

// =========================
// FIX PWA iOS
// =========================

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {

    console.log("🔄 Refresh app");

    renderRevenusPage?.();
    renderDepensesPage?.();
    renderEpargneHistorique?.();
    renderEpargneMois?.();
    renderEspeces?.();

    updateBudget();
  }
});