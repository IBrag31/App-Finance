console.log("revenus.js SYNC CLEAN ✅");

// =========================
// UTILS DATE
// =========================

function getMoisActuel(){
  return new Date().toISOString().slice(0,7);
}

function getMoisBudget(){
  const date = new Date();
  if(date.getDate() <= 10){
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

// =========================
// ESPECES (GLOBAL)
// =========================

function renderEspeces(){
  const el = document.getElementById("especesValue");
  if(!el) return;

  el.innerText = euroShort(window.especes);

  el.style.transform = "scale(1.1)";
  setTimeout(()=> el.style.transform = "scale(1)", 120);
}

function ajouterEspeces(){
  window.especes += 5;
  saveAll();
  refreshApp();
}

function retirerEspeces(){
  window.especes = Math.max(0, window.especes - 5);
  saveAll();
  refreshApp();
}

// =========================
// LOGIQUE
// =========================

function getRevenusDuMois(mois){
  return window.revenusDetail
    .filter(r => r.mois === mois)
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
}

function getTotalRevenus(){
  return window.revenusDetail
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
}

// =========================
// RENDER
// =========================

function renderRevenusPage(){

  const list = document.getElementById("revenusList");
  if(!list) return;

  list.innerHTML = "";

  [...window.revenusDetail]
    .sort((a, b) => b.mois.localeCompare(a.mois))
    .forEach((r) => {

      const div = document.createElement("div");
      div.className = "depense-row";

      div.addEventListener("click", () => {
        modifierRevenu(r);
      });

      div.innerHTML = `
        <span>${r.nom}</span>
        <span>${formatMois(r.mois)} • ${euro(r.montant)}</span>
      `;

      list.appendChild(div);
    });

  const totalGlobal = getTotalRevenus() + window.especes;
  setText("revenusPage", euro(totalGlobal));

  const moisBudget = getMoisBudget();

  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(moisBudget);
  }

  const totalMois = getRevenusDuMois(moisBudget);
  setText("revenusMois", euro(totalMois));
}

// =========================
// MODAL
// =========================

function openAddRevenu(){

  if(document.getElementById("modalRevenu")) return;

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "modalRevenu";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Ajouter un revenu</h3>

      <input id="revenuNom" placeholder="Nom du revenu">
      <input id="revenuMontant" type="number" placeholder="Montant">

      <button id="btnAddRevenu">Ajouter</button>
      <button id="btnCancelRevenu">Annuler</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#btnCancelRevenu").onclick = fermerModalRevenu;
  modal.querySelector("#btnAddRevenu").onclick = () => {
    validerRevenu();
    fermerModalRevenu();
  };
}

function fermerModalRevenu(){
  document.getElementById("modalRevenu")?.remove();
}

// =========================
// CRUD (SYNC GLOBAL)
// =========================

function validerRevenu(){

  const nom = document.getElementById("revenuNom")?.value.trim();
  const montant = parseFloat(document.getElementById("revenuMontant")?.value);

  if(!nom || isNaN(montant) || montant <= 0){
    showToast?.("⚠️ Montant invalide");
    return;
  }

  window.revenusDetail.push({
    id: Date.now(),
    nom,
    montant: Math.round(montant * 100) / 100,
    mois: getMoisBudget()
  });

  saveAll();
  refreshApp();

  showToast?.("💰 Revenu ajouté");
}

// =========================

function modifierRevenu(revenu){

  const index = window.revenusDetail.findIndex(r => r.id === revenu.id);
  if(index === -1) return;

  const nouveauNom = prompt("Nom :", revenu.nom);
  if(!nouveauNom) return;

  const nouveauMontant = parseFloat(prompt("Montant :", revenu.montant));
  if(isNaN(nouveauMontant)) return;

  window.revenusDetail[index].nom = nouveauNom;
  window.revenusDetail[index].montant = nouveauMontant;

  saveAll();
  refreshApp();

  showToast?.("✏️ Revenu modifié");
}

// =========================

function supprimerRevenu(revenu){

  window.revenusDetail = window.revenusDetail.filter(r => r.id !== revenu.id);

  saveAll();
  refreshApp();

  showToast?.("🗑️ Revenu supprimé");
}