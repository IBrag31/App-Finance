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
// SAFE SET TEXT
// =========================

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

// =========================
// CORE APP
// =========================

function animateRing(selector, targetOffset){

  const el = document.querySelector(selector);
  if(!el) return;

  const current = parseFloat(
    el.style.strokeDashoffset || targetOffset
  );

  const duration = 600;
  const start = performance.now();

  function animate(time){

    const progress = Math.min((time - start) / duration, 1);

    // easeOut (fluide)
    const eased = 1 - Math.pow(1 - progress, 3);

    const value = current + (targetOffset - current) * eased;

    el.style.strokeDashoffset = value;

    if(progress < 1){
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function updateRing(){

  const mois = getMoisActuel();

  const especes = Number(localStorage.getItem("especes")) || 0;
  const revenus = getRevenusDuMois(mois) + especes;

  const epargneInput = document.getElementById("epargneMois");
  const epargne = Number(epargneInput?.value || 0);

  const depenses = calculTotalDepenses();
  const budgetMax = Math.max(revenus - epargne, 0);

  let fixes = 0;
  let variables = 0;

  depensesDetail.forEach(d=>{
    const m = Number(d.montant) || 0;
    if(d.type === "fixe") fixes += m;
    else variables += m;
  });

  // =========================
  // UI CHIFFRES
  // =========================

  setText("revenusPage", euro(revenus));
  setText("epargneMoisPage", euro(epargne));
  setText("epargneTotalePage", euro(getEpargneTotale()));

  // =========================
  // CALCUL POURCENTAGES
  // =========================

  const fixesP = budgetMax ? fixes / budgetMax : 0;
  const varP = budgetMax ? variables / budgetMax : 0;
  const totalP = budgetMax ? depenses / budgetMax : 0;

  // =========================
  // RINGS (ANIMÉS)
  // =========================

animateRing(".ring-fixes", 326 - fixesP * 326);
animateRing(".ring-variables", 264 - varP * 264);
animateRing(".ring-total", 188 - totalP * 188);

  // =========================
  // RÉSUMÉ
  // =========================

  setText("resumeDepenses", euro(depenses));

  const restant = Math.max(budgetMax - depenses, 0);
  setText("resumeRestant", euro(restant));

  setText(
    "resumeEpargne",
    euro(getEpargneTotale()) + " / " + euro(5000)
  );

  // =========================
  // DASHBOARD
  // =========================

  setText("revenusDisplay", euro(revenus));
  setText("depensesDisplay", euro(depenses));
  setText("epargneMoisDisplay", euro(epargne));
  setText("epargneTotaleDisplay", euro(getEpargneTotale()));
}

// =========================
// INIT UI
// =========================

function initUI(){
  renderEspeces();
}

// =========================
// INIT APP
// =========================

window.addEventListener("DOMContentLoaded", () => {

  initUI();

  setTimeout(updateRing, 200);

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