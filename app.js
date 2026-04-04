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

// =========================
// CORE APP
// =========================

function updateRing(){

  const mois = getMoisActuel();
  const revenus = getRevenusDuMois(mois) + especes;

  const epargne = +document.getElementById("epargneMois")?.value || 0;
  const depenses = calculTotalDepenses();

  const budgetMax = Math.max(revenus - epargne, 0);

  let fixes = 0;
  let variables = 0;

  depensesDetail.forEach(d=>{
    const m = Number(d.montant) || 0;
    if(d.type === "fixe") fixes += m;
    else variables += m;
  });

  // UI chiffres
  document.getElementById("revenusPage")?.innerText = euro(revenus);
  document.getElementById("epargneMoisPage")?.innerText = euro(epargne);
  document.getElementById("epargneTotalePage")?.innerText =
    euro(getEpargneTotale());

  // calcul pourcentages
  const fixesP = budgetMax ? fixes / budgetMax : 0;
  const varP = budgetMax ? variables / budgetMax : 0;
  const totalP = budgetMax ? depenses / budgetMax : 0;

  // rings
  document.querySelector(".ring-fixes")?.style
    .setProperty("stroke-dashoffset", 326 - fixesP * 326);

  document.querySelector(".ring-variables")?.style
    .setProperty("stroke-dashoffset", 264 - varP * 264);

  document.querySelector(".ring-total")?.style
    .setProperty("stroke-dashoffset", 188 - totalP * 188);

  // résumé
  document.getElementById("resumeDepenses")?.innerText = euro(depenses);

  const restant = Math.max(budgetMax - depenses, 0);
  document.getElementById("resumeRestant")?.innerText = euro(restant);

  document.getElementById("resumeEpargne")?.innerText =
    euro(getEpargneTotale()) + " / " + euro(5000);

  // dashboard
  document.getElementById("revenusDisplay")?.innerText = euro(revenus);
  document.getElementById("depensesDisplay")?.innerText = euro(depenses);
  document.getElementById("epargneMoisDisplay")?.innerText = euro(epargne);
  document.getElementById("epargneTotaleDisplay")?.innerText =
    euro(getEpargneTotale());
}

// =========================
// INIT UI
// =========================

function initUI(){
  renderDepensesPage();
  renderRevenusPage();
  renderEspeces();
}

// =========================
// INIT APP
// =========================

window.onload = function(){

  // graph + historique
  initChart();
  afficherHistorique();
  majGraph();
  updateObjectifs();

  // UI
  initUI();

  // update principal
  setTimeout(updateRing, 200);

  // date affichée
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
};
