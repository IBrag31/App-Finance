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

// 🔥 NOUVEAU : mois logique (salaire décalé)
function getMoisBudget(){

  const date = new Date();
  const jour = date.getDate();

  if(jour <= 10){
    date.setMonth(date.getMonth() - 1);
  }

  return date.toISOString().slice(0,7);
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

  // 🔥 MOIS LOGIQUE (corrigé)
  const moisBudget = getMoisBudget();

  // 📅 LABEL
  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(moisBudget);
  }

  // 📅 TOTAL DU MOIS
  const totalMois = getRevenusDuMois(moisBudget);
  setText("revenusMois", euro(totalMois));
}

// =========================
// MODAL ADD REVENU
// =========================

function openAddRevenu(){

  if(document.getElementById("modalRevenu")) return;

  const moisActuel = getMoisActuel().slice(5,7);

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "modalRevenu";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Ajouter un revenu</h3>

      <input id="revenuNom" placeholder="Nom du revenu" required>
      <input id="revenuMontant" type="number" inputmode="decimal" placeholder="Montant" required>

      <select id="revenuMois">
        <option value="01">Janvier</option>
        <option value="02">Février</option>
        <option value="03">Mars</option>
        <option value="04">Avril</option>
        <option value="05">Mai</option>
        <option value="06">Juin</option>
        <option value="07">Juillet</option>
        <option value="08">Août</option>
        <option value="09">Septembre</option>
        <option value="10">Octobre</option>
        <option value="11">Novembre</option>
        <option value="12">Décembre</option>
      </select>

      <button id="btnAddRevenu">Ajouter</button>
      <button id="btnCancelRevenu">Annuler</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#revenuMois").value = moisActuel;

  setTimeout(()=>{
    modal.querySelector("#revenuNom")?.focus();
  }, 300);

  modal.addEventListener("click", (e)=>{
    if(e.target === modal){
      fermerModalRevenu();
    }
  });

  modal.querySelector("#btnCancelRevenu")
    .addEventListener("click",(e)=>{
      e.stopPropagation();
      fermerModalRevenu();
    });

  modal.querySelector("#btnAddRevenu")
    .addEventListener("click",(e)=>{
      e.stopPropagation();
      validerRevenu();
      fermerModalRevenu();
    });
}

function fermerModalRevenu(){
  document.getElementById("modalRevenu")?.remove();
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
  let mois = `${annee}-${moisInput.value.padStart(2,"0")}`;

  if(!nom || isNaN(montant) || montant <= 0){
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
// SWIPE (inchangé)
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