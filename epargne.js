console.log("epargne.js SYNC CLEAN ✅");

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
// CALCULS (GLOBAL)
// =========================

function getTotalEpargne(){
  return window.epargneHistorique.reduce(
    (sum, e) => sum + (Number(e.montant) || 0),
    0
  );
}

function getEpargneDuMois(mois){
  return window.epargneHistorique
    .filter(e => e.mois === mois)
    .reduce((sum, e) => sum + (Number(e.montant) || 0), 0);
}

// =========================
// RENDER HISTORIQUE
// =========================

function renderEpargneHistorique(){

  const list = document.getElementById("epargneHistoriqueList");
  if(!list) return;

  list.innerHTML = "";

  let total = 0;

  [...window.epargneHistorique]
    .forEach((e) => {

  const realIndex = window.epargneHistorique.indexOf(e);

  row.onclick = () => modifierEpargne(realIndex);

      const montant = Number(e.montant) || 0;
      total += montant;

      const row = document.createElement("div");
      row.className = "depense-row";

      row.onclick = () => modifierEpargne(i);

      row.innerHTML = `
  <span>${formatMois(e.mois)}</span>
  <span style="color:#3b82f6">${euro(montant)}</span>
`;

      list.appendChild(row);
    });

  setText("epargneHistoriqueTotal", total ? euro(total) : "—");
}

// =========================
// RENDER MOIS
// =========================

function renderEpargneMois(){

  const el = document.getElementById("epargneMoisPage");
  if(!el) return;

  el.style.color = "var(--color-epargne)";

  el.style.transform = "scale(1.05)";
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
// CRUD (SYNC GLOBAL)
// =========================

function validerEpargne(){

  const montantInput = document.getElementById("epargneMontant");
  const moisInput = document.getElementById("epargneMois");

  const montant = parseFloat(montantInput?.value);
  const annee = new Date().getFullYear();
  const mois = `${annee}-${moisInput.value}`;

  if(isNaN(montant) || montant <= 0){
    showToast?.("⚠️ Montant invalide");
    return;
  }

  window.epargneHistorique.push({
    montant: Math.round(montant * 100) / 100,
    mois
  });

  saveAll();
  refreshApp();

  showToast?.("💙 Épargne ajoutée");
}

// =========================

function modifierEpargne(index){

  const e = window.epargneHistorique[index];

  const choix = prompt(
    "Modifier montant ou taper 'supprimer'",
    e.montant
  );

  if(choix === null) return;

  if(choix.toLowerCase() === "supprimer"){
    supprimerEpargne(index);
    return;
  }

  const nouveauMontant = parseFloat(choix);

  if(isNaN(nouveauMontant) || nouveauMontant < 0) return;

  window.epargneHistorique[index].montant = nouveauMontant;

  saveAll();
  refreshApp();

  showToast?.("✏️ Épargne modifiée");
}

// =========================

function supprimerEpargne(index){
  window.epargneHistorique.splice(index,1);
  saveAll();
  refreshApp();

  showToast?.("🗑️ Épargne supprimée");
}