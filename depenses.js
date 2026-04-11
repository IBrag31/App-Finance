console.log("depenses.js SYNC CLEAN ✅");

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){
  return window.depensesDetail.reduce(
    (sum, d) => sum + (Number(d.montant) || 0),
    0
  );
}

// =========================
// RENDER PAGE
// =========================

function renderDepensesPage(){

  const fixes = document.getElementById("depensesFixesPage");
  const variables = document.getElementById("depensesVariablesPage");

  if(fixes) fixes.innerHTML = "";
  if(variables) variables.innerHTML = "";

  let totalFixes = 0;
  let totalVariables = 0;

  window.depensesDetail.forEach((d, i) => {

    const montant = Number(d.montant) || 0;

    const row = document.createElement("div");
    row.className = "depense-row";

    row.onclick = () => modifierDepense(i);

    row.innerHTML = `
  <div style="flex:1">
    <div>${d.nom}</div>
    <div style="opacity:0.6;font-size:13px">
      ${euro(montant)}
    </div>
  </div>

  <button class="delete-btn" onclick="supprimerDepense(${i})">×</button>
`;

    if(d.type === "fixe"){
      if(fixes) fixes.appendChild(row);
      totalFixes += montant;
    } else {
      if(variables) variables.appendChild(row);
      totalVariables += montant;
    }

  });

  setText("totalFixesPage", euro(totalFixes));
  setText("totalVariablesPage", euro(totalVariables));
  setText("depensesTotalPage", euro(totalFixes + totalVariables));
}

// =========================
// AJOUT
// =========================

function validerDepense(){

  const nom = document.getElementById("depenseNom")?.value.trim();
  const montant = parseFloat(document.getElementById("depenseMontant")?.value);
  const type = document.getElementById("typeDepense")?.value || "variable";

  if(!nom || isNaN(montant) || montant <= 0){
    showToast?.("⚠️ Valeur invalide");
    return;
  }

  if(!Array.isArray(window.depensesDetail)){
  window.depensesDetail = [];
}

		window.depensesDetail.push({
  nom,
  montant: Math.round(montant * 100) / 100,
  type
});
		montant: Math.round(montant * 100) / 100,

  saveAll();
  refreshApp();

  document.getElementById("depenseNom").value = "";
  document.getElementById("depenseMontant").value = "";

  fermerModalDepense();
}

// =========================
// MODAL
// =========================

function openAddDepense(){

  if(document.getElementById("modalDepense")) return;

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "modalDepense";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Ajouter une dépense</h3>

      <input id="depenseNom" placeholder="Nom de la dépense">

      <input id="depenseMontant" type="number" inputmode="decimal" placeholder="Montant">

      <select id="typeDepense">
        <option value="fixe">📦 Fixe</option>
        <option value="variable">🛒 Variable</option>
      </select>

      <button id="btnAddDepense">Ajouter</button>
      <button id="btnCancelDepense">Annuler</button>
    </div>
  `;

  document.body.appendChild(modal);

  setTimeout(()=>{
    modal.querySelector("#depenseNom")?.focus();
  }, 200);

  modal.addEventListener("click", (e)=>{
    if(e.target === modal){
      fermerModalDepense();
    }
  });

  modal.querySelector("#btnCancelDepense")
    .addEventListener("click", (e)=>{
      e.stopPropagation();
      fermerModalDepense();
    });

  modal.querySelector("#btnAddDepense")
    .addEventListener("click", (e)=>{
      e.stopPropagation();
      validerDepense();
      fermerModalDepense();
    });
}

function fermerModalDepense(){
  document.getElementById("modalDepense")?.remove();
}

// =========================
// MODIFIER
// =========================

function modifierDepense(index){

  const depense = window.depensesDetail[index];

  const nouveauNom = prompt("Nom :", depense.nom);
  if(nouveauNom === null) return;

  const nouveauMontant = parseFloat(
    prompt("Montant :", depense.montant)
  );

  if(isNaN(nouveauMontant) || nouveauMontant < 0) return;

  let nouveauType = prompt(
    "Type : fixe ou variable",
    depense.type
  );

  if(!nouveauType) return;

  nouveauType = nouveauType.toLowerCase().trim();

  window.depensesDetail[index] = {
    nom: nouveauNom,
    montant: nouveauMontant,
    type: nouveauType
  };

  saveAll();
  refreshApp();

  showToast?.("✏️ Dépense modifiée");
}

// =========================
// SUPPRIMER
// =========================

function supprimerDepense(index){

  window.depensesDetail.splice(index,1);

  saveAll();
  refreshApp();

  showToast?.("🗑️ Dépense supprimée");
}