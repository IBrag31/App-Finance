console.log("epargne.js loaded");

// =========================
// DATA
// =========================

let epargneHistorique = JSON.parse(
  localStorage.getItem("epargneHistorique") || "[]"
);

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

// =========================
// CALCULS
// =========================

function getTotalEpargneHistorique(){
  return epargneHistorique.reduce((sum, e) => {
    return sum + (Number(e.montant) || 0);
  }, 0);
}

// 🔥 total global utilisé par app.js
function getTotalEpargne(){
  return getTotalEpargneHistorique();
}

function getEpargneDuMois(mois){
  return epargneHistorique
    .filter(e => e.mois === mois)
    .reduce((sum, e) => sum + (Number(e.montant) || 0), 0);
}

// =========================
// RENDER
// =========================

function renderEpargneHistorique(){

  const list = document.getElementById("epargneHistoriqueList");
  if(!list) return;

  list.innerHTML = "";

  let total = 0;

  [...epargneHistorique]
    .sort((a,b) => b.mois.localeCompare(a.mois))
    .forEach((e, i) => {

      const montant = Number(e.montant) || 0;
      total += montant;

      const row = document.createElement("div");
      row.className = "depense-row";

      row.onclick = () => modifierEpargne(i);

      row.innerHTML = `
        <span>${formatMois(e.mois)}</span>
        <span style="color: var(--color-epargne)">
      ${euro(montant)}
      </span>
      `;

      list.appendChild(row);
    });

  setText("epargneHistoriqueTotal", total ? euro(total) : "—");
}

// 🔥 rendu du mois avec style
function renderEpargneMois(){

  const mois = getMoisActuel();
  const total = getEpargneDuMois(mois);

  const el = document.getElementById("epargneMoisPage");
  if(!el) return;

  const prefix = total >= 0 ? "+" : "";
  el.innerText = prefix + euro(total);

  if(total > 0){
    el.style.color = "#22c55e";
  }
  else if(total < 0){
    el.style.color = "#ef4444";
  }
  else{
    el.style.color = "white";
  }

  // petit effet visuel ✨
  el.style.transform = "scale(1.1)";
  setTimeout(()=> el.style.transform = "scale(1)", 120);
}

// =========================
// MODAL
// =========================

function openAddEpargne(){

  if(document.getElementById("modalEpargne")) return;

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "modalEpargne";

  const moisActuel = getMoisActuel().slice(5,7);

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Ajouter épargne</h3>

      <input id="epargneMontant"
             type="number"
             inputmode="decimal"
             placeholder="Montant">

      <select id="epargneMois">
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

      <button id="btnAddEpargne">Ajouter</button>
      <button id="btnCancelEpargne">Annuler</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#epargneMois").value = moisActuel;

  setTimeout(()=>{
    modal.querySelector("#epargneMontant")?.focus();
  },200);

  modal.addEventListener("click",(e)=>{
    if(e.target === modal){
      fermerModalEpargne();
    }
  });

  modal.querySelector("#btnCancelEpargne")
    .addEventListener("click",(e)=>{
      e.stopPropagation();
      fermerModalEpargne();
    });

  modal.querySelector("#btnAddEpargne")
    .addEventListener("click",(e)=>{
      e.stopPropagation();
      validerEpargne();
      fermerModalEpargne();
    });
}

function fermerModalEpargne(){
  document.getElementById("modalEpargne")?.remove();
}

// =========================
// CRUD
// =========================

function validerEpargne(){

  const montantInput = document.getElementById("epargneMontant");
  const moisInput = document.getElementById("epargneMois");

  const montant = parseFloat(montantInput?.value);
  const annee = new Date().getFullYear();
  const mois = `${annee}-${moisInput.value.padStart(2,"0")}`;

  if(isNaN(montant) || montant <= 0){
    showToast?.("⚠️ Montant invalide");
    return;
  }

  epargneHistorique.push({
    montant: Math.round(montant * 100) / 100,
    mois
  });

  saveEpargne();

  renderEpargneHistorique();
  updateBudget();
  renderEpargneMois();

  showToast?.("💙 Épargne ajoutée");
}

function modifierEpargne(index){

  const e = epargneHistorique[index];

  const choix = prompt(
    "Modifier montant ou taper 'supprimer'",
    e.montant
  );

  if(choix === null) return;

  if(choix.toLowerCase() === "supprimer"){
    supprimerEpargne(index);
    showToast?.("🗑️ Épargne supprimée");
    return;
  }

  const nouveauMontant = parseFloat(choix);

  if(isNaN(nouveauMontant) || nouveauMontant < 0) return;

  e.montant = nouveauMontant;

  saveEpargne();

  renderEpargneHistorique();
  updateBudget();
  renderEpargneMois();

  showToast?.("✏️ Épargne modifiée");
}

function supprimerEpargne(index){

  epargneHistorique.splice(index,1);

  saveEpargne();
  renderEpargneHistorique();
  updateBudget();
  renderEpargneMois();
}

// =========================
// STORAGE
// =========================

function saveEpargne(){
  localStorage.setItem(
    "epargneHistorique",
    JSON.stringify(epargneHistorique)
  );
}