console.log("revenus.js loaded");

// =========================
// DATA
// =========================

let revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");

// =========================
// UTILS
// =========================

function getMoisActuel(){
  return new Date().toISOString().slice(0,7);
}

function formatMois(moisStr){
  const [annee, mois] = moisStr.split("-");
  const date = new Date(annee, mois - 1);

  let str = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric"
  });

  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getEspeces(){
  return Number(localStorage.getItem("especes")) || 0;
}

// =========================
// ESPECES
// =========================

function renderEspeces(){
  const el = document.getElementById("especesValue");
  if(!el) return;

  el.innerText = euroShort(getEspeces());

  el.style.transform = "scale(1.1)";
  setTimeout(()=> el.style.transform = "scale(1)", 120);
}

function ajouterEspeces(){
  let val = getEspeces();
  val += 5;
  localStorage.setItem("especes", val);

  renderEspeces();
  updateBudget();
  renderRevenusPage();
}

function retirerEspeces(){
  let val = getEspeces();
  val -= 5;
  if(val < 0) val = 0;

  localStorage.setItem("especes", val);

  renderEspeces();
  updateBudget();
  renderRevenusPage();
}

// =========================
// LOGIQUE
// =========================

function getRevenusDuMois(mois){
  return revenusDetail
    .filter(r => r.mois === mois)
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
}

function getTotalRevenus(){
  return revenusDetail.reduce((sum, r) => {
    return sum + (Number(r.montant) || 0);
  }, 0);
}

// =========================
// RENDER
// =========================

function renderRevenusPage(){

  const list = document.getElementById("revenusList");
  if(!list) return;

  list.innerHTML = "";

  [...revenusDetail]
    .sort((a, b) => b.mois.localeCompare(a.mois))
    .forEach((r) => {

      const montant = Number(r.montant) || 0;

      const div = document.createElement("div");
      div.className = "depense-row";
      
      div.onclick = () => modifierRevenu(r);
      div.ontouchstart = (e) => startSwipeRevenu(e, r);
      div.ontouchend = (e) => endSwipeRevenu(e, r);

      div.innerHTML = `
        <span>${r.nom}</span>
        <span>${formatMois(r.mois)} • ${euro(montant)}</span>
      `;

      list.appendChild(div);
    });

  // 🔥 TOTAL GLOBAL + ESPECES
  const totalGlobal = getTotalRevenus() + getEspeces();
  setText("revenusPage", euro(totalGlobal));

  // 📅 LABEL MOIS
  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(getMoisActuel());
  }

  // 📅 TOTAL DU MOIS
  const totalMois = getRevenusDuMois(getMoisActuel());
  setText("revenusMois", euro(totalMois));
}

// =========================
// CRUD
// =========================

function validerRevenu(){

  const nomInput = document.getElementById("revenuNom");
  const montantInput = document.getElementById("revenuMontant");
  const moisInput = document.getElementById("revenuMois");

  const nom = nomInput?.value.trim();
  const montant = parseFloat(montantInput?.value);

  const annee = new Date().getFullYear();
  const mois = `${annee}-${moisInput.value.padStart(2, "0")}`;

  if(!nom || isNaN(montant) || montant <= 0 || !mois){
    showToast?.("⚠️ Montant invalide");
    return;
  }

  revenusDetail.push({
    nom,
    montant: Math.round(montant * 100) / 100,
    mois
  });

  saveRevenus();

  renderRevenusPage();
  updateBudget();

  if(nomInput) nomInput.value = "";
  if(montantInput) montantInput.value = "";
  if(moisInput) moisInput.value = "";

  showToast?.("💰 Revenu ajouté");
}

function modifierRevenu(revenu){

  const nouveauNom = prompt("Nom :", revenu.nom);
  if(!nouveauNom) return;

  const nouveauMontant = parseFloat(prompt("Montant :", revenu.montant));
  if(isNaN(nouveauMontant) || nouveauMontant < 0) return;

  revenu.nom = nouveauNom;
  revenu.montant = nouveauMontant;

  saveRevenus();

  renderRevenusPage();
  updateBudget();

  showToast?.("✏️ Revenu modifié");
}

function supprimerRevenu(revenu){

  const index = revenusDetail.indexOf(revenu);

  if(index !== -1){
    revenusDetail.splice(index,1);
  }

  saveRevenus();

  renderRevenusPage();
  updateBudget();

  showToast?.("🗑️ Revenu supprimé");
}

// =========================
// STORAGE
// =========================

function saveRevenus(){
  localStorage.setItem(
    "revenusDetail",
    JSON.stringify(revenusDetail)
  );
}

// =========================
// SWIPE
// =========================

let revenuSwipeStartX = 0;
let currentRevenuRow = null;
let armedRevenuRow = null;
let currentRevenu = null;

function startSwipeRevenu(e, revenu){
  revenuSwipeStartX = e.touches[0].clientX;
  currentRevenuRow = e.currentTarget;
  currentRevenu = revenu;
}

function endSwipeRevenu(e){

  const diff = e.changedTouches[0].clientX - revenuSwipeStartX;

  if(diff < -20 && currentRevenuRow){
    currentRevenuRow.style.transform = "translateX(-40px)";
    currentRevenuRow.classList.add("swiping");
  }

  if(diff < -100){

    if(armedRevenuRow === currentRevenuRow){

      navigator.vibrate?.(10);

      currentRevenuRow.style.transform = "translateX(-100%)";

      setTimeout(()=>{
        supprimerRevenu(currentRevenu);
      },200);

      armedRevenuRow = null;
      return;
    }

    if(armedRevenuRow){
      armedRevenuRow.style.transform = "translateX(0)";
      armedRevenuRow.classList.remove("swiping");
    }

    armedRevenuRow = currentRevenuRow;

    currentRevenuRow.style.transform = "translateX(-80px)";
    currentRevenuRow.classList.add("swiping");

    showToast?.("👉 Glisse encore pour supprimer");
  }

  else if(currentRevenuRow){
    currentRevenuRow.style.transform = "translateX(0)";
    currentRevenuRow.classList.remove("swiping");
    armedRevenuRow = null;
  }
}