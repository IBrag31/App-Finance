console.log("revenus.js loaded");

// =========================
// DATA
// =========================

let revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");
let especes = Number(localStorage.getItem("especes") || 0);

// =========================
// UTILS (autonomes)
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
// ESPECES
// =========================

function renderEspeces(){
  const el = document.getElementById("especesValue");
  if(!el) return;

  el.innerText = euroShort(especes); // ✅ CORRIGÉ

  el.style.transform = "scale(1.1)";
  setTimeout(()=> el.style.transform = "scale(1)", 120);
}

function ajouterEspeces(){
  especes += 5;
  saveEspeces();
}

function retirerEspeces(){
  especes -= 5;
  if(especes < 0) especes = 0;
  saveEspeces();
}

function saveEspeces(){
  localStorage.setItem("especes", especes);
  renderEspeces();
  updateBudget();
}

// =========================
// RENDER
// =========================

function renderRevenusPage(){

  const list = document.getElementById("revenusList");
  if(!list) return;

  list.innerHTML = "";

  let total = 0;

  [...revenusDetail]
    .sort((a, b) => b.mois.localeCompare(a.mois))
    .forEach((r) => {

      const montant = Number(r.montant) || 0;
      total += montant;

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

  setText("revenusPage", euro(total));

  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(getMoisActuel());
  }

  const totalMois = getRevenusDuMois(getMoisActuel());
  setText("revenusMois", euro(totalMois));
}

// =========================
// LOGIQUE
// =========================

function getRevenusDuMois(mois){
  return revenusDetail
    .filter(r => r.mois === mois)
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
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
  const mois = moisInput?.value;

  if(!nom || isNaN(montant) || montant <= 0 || !mois){
    showToast?.("⚠️ Montant invalide");
    return;
  }

  revenusDetail.push({ nom, montant, mois });

  saveRevenus();

  if(nomInput) nomInput.value = "";
  if(montantInput) montantInput.value = "";
  if(moisInput) moisInput.value = "";

  showToast?.("💰 Revenu ajouté");

  fermerModalRevenu();
  renderRevenusPage();
  updateBudget();
}

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

  // auto mois
  modal.querySelector("#revenuMois").value = moisActuel;

  // focus
  setTimeout(()=>{
  modal.querySelector("#revenuNom")?.focus();
}, 300);

  // 🔥 fermeture clic extérieur
  modal.addEventListener("click", (e)=>{
    if(e.target === modal){
      fermerModalRevenu();
    }
  });

  // 🔥 bouton annuler
  modal.querySelector("#btnCancelRevenu")
    .addEventListener("click", fermerModalRevenu);

  // 🔥 bouton ajouter
  modal.querySelector("#btnAddRevenu")
    .addEventListener("click", ()=>{
      validerRevenu();
      fermerModalRevenu(); // 🔥 fermeture FORCÉE
    });
}

function fermerModalRevenu(){
  const modal = document.getElementById("modalRevenu");
  if(modal) modal.remove();
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
        showToast?.("🗑️ Revenu supprimé");
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