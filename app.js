// 🔥 INIT GLOBAL SAFE (CRITIQUE)
window.revenusDetail = [];
window.depensesDetail = [];
window.epargneHistorique = [];
window.especes = 0;
window.atelier = [];

const date =
  new Date();

date.setMonth(
  date.getMonth() - 1
);

window.moisSelectionne =
  date
    .toISOString()
    .slice(0,7);

// =========================
// MOIS GLOBAL
// =========================

function getMoisBudget(){

  return (

    window.moisSelectionne ||

    new Date()
      .toISOString()
      .slice(0,7)

  );

}

function getMoisActuel(){

  return new Date()
    .toISOString()
    .slice(0,7);

}

function changerMois(direction){

  const [annee, mois] =
    window.moisSelectionne
      .split("-")
      .map(Number);

  const date =
    new Date(
      annee,
      mois - 1 + direction,
      1
    );

  window.moisSelectionne =

    `${date.getFullYear()}-${
      String(
        date.getMonth() + 1
      ).padStart(2,"0")
    }`;

  refreshApp();

}

// =========================
// DATA CENTRALISÉE
// =========================

function loadAll(){

  try{

    const revenus =
      localStorage.getItem("revenusDetail");

    const depenses =
      localStorage.getItem("depensesDetail");

    const epargne =
      localStorage.getItem("epargneHistorique");

    const especes =
      localStorage.getItem("especes");

    const atelier =
      localStorage.getItem("atelier");

    // =========================
    // LOAD
    // =========================

    window.revenusDetail =
      revenus ? JSON.parse(revenus) : [];

    window.depensesDetail =
      depenses ? JSON.parse(depenses) : [];
      
      // =========================
// MIGRATION CB CATEGORIES
// =========================

window.depensesDetail =
  window.depensesDetail.map(d => {

    if(d.categorie === "CB"){

      return {

        ...d,

        type: "CB",

        categorie:
          detecterCategorie(d.nom)

      };

    }

    return d;

  });

    window.epargneHistorique =
  epargne ? JSON.parse(epargne) : [];

window.objectifsEpargne =
  JSON.parse(
    localStorage.getItem("finance_objectifs_epargne")
  ) || [];

window.especes =
  especes ? JSON.parse(especes) : 0;

window.atelier =
  atelier ? JSON.parse(atelier) : [];

    // =========================
    // MIGRATION ATELIER
    // =========================

    window.atelier =
      window.atelier.map(a => ({

        frais: 0,

        statut: "encours",

        ...a

      }));

  }catch(e){

    console.error(
      "❌ Erreur chargement données",
      e
    );

    window.revenusDetail = [];
    window.depensesDetail = [];
    window.epargneHistorique = [];
    window.especes = 0;
    window.atelier = [];

    window.moisSelectionne =
      new Date()
        .toISOString()
        .slice(0,7);

  }

}

// =========================
// SAFE STORAGE
// =========================

function safeSet(key, value){

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch(error){

    console.error(
      "❌ Erreur sauvegarde :",
      key,
      error
    );

    return false;

  }

}

// =========================
// SAVE
// =========================

function saveAll(){

  console.log("SAVE OK");

  safeSet(
    "revenusDetail",
    window.revenusDetail
  );

  safeSet(
    "depensesDetail",
    window.depensesDetail
  );

  safeSet(
    "epargneHistorique",
    window.epargneHistorique
  );
  
  safeSet(
  "finance_objectifs_epargne",
  window.objectifsEpargne || []
);

  safeSet(
    "especes",
    window.especes || 0
  );

  safeSet(
    "atelier",
    window.atelier
  );

}

// =========================
// REFRESH GLOBAL
// =========================

function refreshApp(){
  
  updateTodayDate();

  loadAll();

  // sécurité
  if(!Array.isArray(window.revenusDetail)){
    window.revenusDetail = [];
  }

  if(!Array.isArray(window.depensesDetail)){
    window.depensesDetail = [];
  }

  if(!Array.isArray(window.epargneHistorique)){
    window.epargneHistorique = [];
  }

  if(!Array.isArray(window.atelier)){
    window.atelier = [];
  }

// render modules

renderRevenusPage?.();

renderDepensesPage?.();

renderStatsCategories?.();

renderEpargneHistorique?.();

renderEpargneMois?.();

renderObjectifsEpargne?.();

renderEspeces?.();

renderAtelier?.();

// dashboard
renderDashboard();

}

// =========================
// UTILS
// =========================

function euro(n){

  return Number(n || 0)
    .toLocaleString("fr-FR",{

      minimumFractionDigits:2,

      maximumFractionDigits:2

    }) + " €";

}

function euroShort(n){

  return Math.round(n || 0) + " €";

}

function setText(id, value){

  const el =
    document.getElementById(id);

  if(el){
    el.innerText = value;
  }

}

// =========================
// DATE DU JOUR
// =========================

function updateTodayDate(){

  const el =
    document.getElementById("todayDate");

  if(!el) return;

  const date = new Date();

  el.textContent =
    date.toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}

// =========================
// CATEGORIES FINANCE
// =========================

window.CATEGORIES_FINANCE = [

  "🏠 Logement",
  "⚡ Énergie",
  "🌐 Réseau",
  "🚗 Automobile",
  "⛽ Carburant",
  "🛒 Courses",
  "🍽️ Restauration",
  "🛍️ Shopping",
  "📱 Abonnements",
  "🎮 Loisirs",
  "🏥 Santé",
  "🐱 Animaux",
  "🔧 Maison",
  "💰 Banque",
  "🏛️ Impôts & Taxes",
  "📦 Autre"

];

// =========================
// DETECTION CATEGORIES
// =========================

function detecterCategorie(nom){

  const n =
    String(nom || "")
      .toLowerCase();

  // 🏠 LOGEMENT
  if(
    n.includes("loyer") ||
    n.includes("foncia") ||
    n.includes("orpi")
  ){
    return "🏠 Logement";
  }

  // ⚡ ENERGIE
  if(
    n.includes("edf") ||
    n.includes("engie") ||
    n.includes("total energies electricite") ||
    n.includes("eni")
  ){
    return "⚡ Énergie";
  }

  // 🌐 TELECOM
  if(
    n.includes("bouygues") ||
    n.includes("orange") ||
    n.includes("sfr") ||
    n.includes("free")
  ){
    return "🌐 Réseau";
  }

  // 🚗 AUTOMOBILE
  if(
    n.includes("norauto") ||
    n.includes("feu vert") ||
    n.includes("controle technique") ||
    n.includes("midas")
  ){
    return "🚗 Automobile";
  }

  // ⛽ CARBURANT
  if(
    n.includes("total") ||
    n.includes("shell") ||
    n.includes("esso") ||
    n.includes("avia")
  ){
    return "⛽ Carburant";
  }

  // 🛒 COURSES
  if(
    n.includes("carrefour") ||
    n.includes("leclerc") ||
    n.includes("intermarche") ||
    n.includes("lidl") ||
    n.includes("aldi") ||
    n.includes("auchan") ||
    n.includes("super u")
  ){
    return "🛒 Courses";
  }

  // 🍽️ RESTAURATION
  if(
    n.includes("restaurant") ||
    n.includes("pizzeria") ||
    n.includes("burger") ||
    n.includes("mcdonald") ||
    n.includes("kfc") ||
    n.includes("la mie de pain") ||
    n.includes("boulangerie")
  ){
    return "🍽️ Restauration";
  }

  // 🛍️ SHOPPING
  if(
    n.includes("amazon") ||
    n.includes("fnac") ||
    n.includes("darty") ||
    n.includes("ikea") ||
    n.includes("action")
  ){
    return "🛍️ Shopping";
  }
  
  // 📱 ABONNEMENTS

if(

  n.includes("netflix") ||

  n.includes("spotify") ||

  n.includes("disney") ||

  n.includes("disney+") ||

  n.includes("prime video") ||

  n.includes("amazon prime") ||

  n.includes("youtube") ||

  n.includes("apple one") ||

  n.includes("icloud") ||

  n.includes("google one") ||

  n.includes("canal+") ||

  n.includes("game pass") ||

  n.includes("playstation") ||

  n.includes("ps plus") ||

  n.includes("xbox")

){

  return "📱 Abonnements";

}

  // 🎮 LOISIRS
  if(
    n.includes("netflix") ||
    n.includes("spotify") ||
    n.includes("disney") ||
    n.includes("steam") ||
    n.includes("cinema")
  ){
    return "🎮 Loisirs";
  }

  // 🏥 SANTE
  if(
    n.includes("pharmacie") ||
    n.includes("dentiste") ||
    n.includes("medecin") ||
    n.includes("docteur")
  ){
    return "🏥 Santé";
  }

  // 🐱 ANIMAUX
  if(
    n.includes("maxi zoo") ||
    n.includes("veterinaire") ||
    n.includes("croquettes")
  ){
    return "🐱 Animaux";
  }

  // 🔧 BRICOLAGE
  if(
    n.includes("leroy merlin") ||
    n.includes("castorama") ||
    n.includes("brico depot") ||
    n.includes("manomano")
  ){
    return "🔧 Bricolage / Maison";
  }

  // 💰 BANQUE
  if(
    n.includes("credit agricole") ||
    n.includes("banque populaire") ||
    n.includes("caisse epargne") ||
    n.includes("frais bancaires")
  ){
    return "💰 Banque";
  }

  // 🏛️ IMPOTS
  if(
    n.includes("dgfip") ||
    n.includes("impots") ||
    n.includes("taxe fonciere")
  ){
    return "🏛️ Impôts & Taxes";
  }

  return "📦 Autre";

}

function getStatsCategories(){

  const stats = {};

  window.depensesDetail.forEach(d => {

    const categorie =
      d.categorie || "📦 Autre";

    const montant =
      Number(d.montant) || 0;

    if(!stats[categorie]){
      stats[categorie] = 0;
    }

    stats[categorie] += montant;

  });

  return stats;

}

function renderStatsCategories(){

  const container =
    document.getElementById(
      "statsCategories"
    );

  if(!container) return;

  const stats =
    getStatsCategories();

  const total =
    calculTotalDepenses();

  container.innerHTML = "";

  Object.entries(stats)

    .sort((a,b) => b[1] - a[1])

    .forEach(([categorie,montant]) => {

      const ratio =
        total > 0

          ? (
              montant / total * 100
            ).toFixed(1)

          : 0;

      container.innerHTML += `

  <div class="stats-row">

    <div>
      <strong>${categorie}</strong>
    </div>

    <div>
      ${euro(montant)}
    </div>

    <div class="stats-ratio">
      ${ratio} %
    </div>

  </div>

`;

    });

}

// =========================
// COULEURS
// =========================

function getDepenseColor(value, objectif){

  if(!objectif || objectif <= 0){
    return "#f97316";
  }

  const ratio = value / objectif;

  if(ratio < 0.8){
    return "#22c55e";
  }

  if(ratio <= 1){
    return "#f97316";
  }

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

function updateBar(
  id,
  value,
  objectif,
  type
){

  const el =
    document.getElementById(id);

  if(!el) return;

  const percent =
    objectif
      ? (value / objectif) * 100
      : 0;
      
      if(!objectif){

  el.style.width = "0%";

  return;

}

  el.style.width =
    Math.min(percent, 100) + "%";

  if(type === "depense"){
  el.style.background =
    getDepenseColor(
      value,
      objectif
    );
}

  if(type === "epargne"){
    el.style.background =
      getEpargneColor();
  }

  if(type === "revenus"){
    el.style.background =
      getRevenusColor();
  }

}

// =========================
// BUDGET
// =========================

function updateBudget(){

  const mois =
    getMoisBudget();

  const revenus =

    (
      typeof getRevenusDuMois === "function"

        ? getRevenusDuMois(mois)

        : 0

    )

    +

    window.especes;

  const depenses =

    typeof calculTotalDepenses === "function"

      ? calculTotalDepenses()

      : 0;

  const epargneTotale =
    getTotalEpargne();

  const epargneMois =
    getEpargneDuMois(mois);

  // label mois
const moisLabel =
  formatMois?.(mois);

setText(
  "revenusDashboardMois",
  moisLabel || "Ce mois"
);

setText(
  "moisGlobalLabel",
  formatMois(mois)
);
  
  

  // objectifs
  const objectifDepenses =
  Number(
    localStorage.getItem(
      "objectifDepenses"
    )
  ) || 0;

const objectifEpargne =
  Number(
    localStorage.getItem(
      "objectifEpargne"
    )
  ) || 0;

const objectifRevenus =
  Number(
    localStorage.getItem(
      "objectifRevenus"
    )
  ) || 0;

  // =========================
  // TEXTES
  // =========================

  setText(
  "budgetRevenusText",
  objectifRevenus > 0
    ? `${Math.round(revenus)} / ${objectifRevenus} €`
    : "Non défini"
);

setText(
  "budgetDepensesText",
  objectifDepenses > 0
    ? `${Math.round(depenses)} / ${objectifDepenses} €`
    : "Non défini"
);

setText(
  "budgetEpargneText",
  objectifEpargne > 0
    ? `${Math.round(epargneTotale)} / ${objectifEpargne} €`
    : "Non défini"
);

  // =========================
  // BARRES
  // =========================

  updateBar(
    "budgetDepensesBar",
    depenses,
    objectifDepenses,
    "depense"
  );

  updateBar(
    "budgetEpargneBar",
    epargneTotale,
    objectifEpargne,
    "epargne"
  );

  updateBar(
    "budgetRevenusBar",
    revenus,
    objectifRevenus,
    "revenus"
  );

  // =========================
  // COULEURS
  // =========================

  const depColor =
  getDepenseColor(
    depenses,
    objectifDepenses
  );

  document
    .getElementById("budgetDepensesText")
    ?.style.setProperty(
      "color",
      depColor
    );

  document
    .getElementById("budgetRevenusText")
    ?.style.setProperty(
      "color",
      getRevenusColor()
    );

  document
    .getElementById("budgetEpargneText")
    ?.style.setProperty(
      "color",
      getEpargneColor()
    );

  document
    .getElementById("depensesDisplay")
    ?.style.setProperty(
      "color",
      depColor
    );

  document
    .getElementById("revenusDisplay")
    ?.style.setProperty(
      "color",
      getRevenusColor()
    );

  document
    .getElementById("epargneMoisDisplay")
    ?.style.setProperty(
      "color",
      getEpargneColor()
    );

  // =========================
  // VALEURS
  // =========================

  setText(
    "revenusDisplay",
    euro(revenus)
  );

  setText(
    "depensesDisplay",
    euro(depenses)
  );

  setText(
  "epargneMoisDisplay",
  euro(epargneTotale)
);

  setText(
    "epargneMoisPage",
    euro(epargneMois)
  );

  setText(
    "epargneTotalePage",
    euro(epargneTotale)
  );

  // style épargne
  const ep =
    document.getElementById(
      "epargneTotalePage"
    );

  if(ep){

    ep.style.color = "#3b82f6";

    ep.style.fontSize = "28px";

    ep.style.fontWeight = "700";

  }

}

// =========================
// DASHBOARD
// =========================

function renderDashboard(){

  updateBudget();

}

function loadBudgetSettings(){

  const revenus =
    localStorage.getItem(
      "objectifRevenus"
    );

  const depenses =
    localStorage.getItem(
      "objectifDepenses"
    );

  const epargne =
    localStorage.getItem(
      "objectifEpargne"
    );

  const revenusInput =
    document.getElementById(
      "objectifRevenus"
    );

  const depensesInput =
    document.getElementById(
      "objectifDepenses"
    );

  const epargneInput =
    document.getElementById(
      "objectifEpargne"
    );

  if(revenusInput){
  revenusInput.value =
    revenus === "0"
      ? ""
      : revenus || "";
}

if(depensesInput){
  depensesInput.value =
    depenses === "0"
      ? ""
      : depenses || "";
}

if(epargneInput){
  epargneInput.value =
    epargne === "0"
      ? ""
      : epargne || "";
}

}

// =========================
// INIT
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log("INIT SAFE 🔥");

    loadAll();
    
    loadBudgetSettings();
    
    loadThemeSettings();

    setTimeout(() => {

      initUI?.();

      showSection("resume");

      refreshApp();

      // sécurité iOS
      requestAnimationFrame(() => {

        setTimeout(() => {

          refreshApp();

        }, 80);

      });

    }, 50);

  }
);

// =========================
// PAGESHOW FIX
// =========================

window.addEventListener(
  "pageshow",
  (event) => {

    console.log(
      "📱 pageshow",
      event.persisted
    );

    loadAll();

    setTimeout(() => {

      refreshApp();

    }, 50);

  }
);

// =========================
// BACKUP
// =========================

function sauvegardeAuto(){

  const data = {

    revenus:
      window.revenusDetail,

    depenses:
      window.depensesDetail,

    epargne:
      window.epargneHistorique,

    especes:
      window.especes,

    atelier:
      window.atelier

  };

  const blob =
    new Blob(
      [JSON.stringify(data)],
      {type:"application/json"}
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "finance_backup.json";

  a.click();

  URL.revokeObjectURL(url);

  alert("💾 Sauvegarde téléchargée");

}

// =========================
// RESTORE
// =========================

function restaurerDepuisIcloud(){

  const input =
    document.createElement("input");

  input.type = "file";

  input.accept =
    "application/json";

  input.onchange = e => {

    const file =
      e.target.files[0];

    if(!file) return;

    const reader =
      new FileReader();

    reader.onload = event => {

      try{

        const data =
          JSON.parse(
            event.target.result
          );

        window.revenusDetail =
          data.revenus || [];

        window.depensesDetail =
          data.depenses || [];

        window.epargneHistorique =
          data.epargne || [];

        window.especes =
          data.especes || 0;

        window.atelier =
          data.atelier || [];

        saveAll();

        setTimeout(() => {

          refreshApp();

        }, 0);

        alert(
          "✅ Données restaurées"
        );

      }catch{

        alert(
          "❌ Fichier invalide"
        );

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

  if(
    !confirm(
      "⚠️ Supprimer toutes les données ?"
    )
  ){
    return;
  }

  localStorage.clear();

  window.revenusDetail = [];
  window.depensesDetail = [];
  window.epargneHistorique = [];
  window.especes = 0;
  window.atelier = [];

  window.moisSelectionne =
    new Date()
      .toISOString()
      .slice(0,7);

  setTimeout(() => {

    refreshApp();

  }, 0);

  alert("🗑️ Données réinitialisées");

}

// =========================
// VISIBILITY FIX
// =========================

document.addEventListener(
  "visibilitychange",
  () => {

    if(
      document.visibilityState === "visible"
    ){

      loadAll();

      setTimeout(() => {

        refreshApp();

      }, 50);

    }

  }
);

// =========================
// PWA
// =========================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    async () => {

      try {

        const registration =

          await navigator
            .serviceWorker
            .register(
              "./service-worker.js"
            );

        console.log(
          "✅ Service Worker actif :",
          registration.scope
        );

      } catch (error) {

        console.error(
          "❌ Erreur Service Worker :",
          error
        );

      }

    }
  );

}

function saveBudgetSettings(){

  const revenus =
    Number(
      document.getElementById(
        "objectifRevenus"
      )?.value
    );

  const depenses =
    Number(
      document.getElementById(
        "objectifDepenses"
      )?.value
    );

  const epargne =
    Number(
      document.getElementById(
        "objectifEpargne"
      )?.value
    );

  localStorage.setItem(
  "objectifRevenus",
  revenus || 0
);

localStorage.setItem(
  "objectifDepenses",
  depenses || 0
);

localStorage.setItem(
  "objectifEpargne",
  epargne || 0
);

  updateBudget?.();

  refreshApp?.();

  showToast?.(
    "🎯 Objectifs enregistrés"
  );

}

function loadThemeSettings(){

  const theme =
    localStorage.getItem("finance_theme")
    || "auto";

  const auto =
    document.getElementById("themeAuto");

  const light =
    document.getElementById("themeLight");

  if(!auto || !light) return;

  auto.checked =
    theme === "auto";

  light.checked =
    theme === "light";

  applyTheme(theme);

}

function toggleThemeAuto(){

  const auto =
    document.getElementById("themeAuto");

  const light =
    document.getElementById("themeLight");

  if(auto.checked){

    localStorage.setItem(
      "finance_theme",
      "auto"
    );

    light.checked = false;

    applyTheme("auto");

  }

}

function toggleThemeLight(){

  const light =
    document.getElementById("themeLight");

  const auto =
    document.getElementById("themeAuto");

  auto.checked = false;

  localStorage.setItem(
    "finance_theme",
    light.checked
      ? "light"
      : "dark"
  );

  applyTheme(
    light.checked
      ? "light"
      : "dark"
  );

}