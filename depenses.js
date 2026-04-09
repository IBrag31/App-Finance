console.log("depenses.js loaded");

// =========================
// DATA
// =========================

let depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){

  const data = JSON.parse(localStorage.getItem("depensesDetail") || "[]");

  const total = data.reduce(
    (sum, d) => sum + (Number(d.montant) || 0),
    0
  );

  return Math.round(total * 100) / 100;
}

// =========================
// RENDER PAGE
// =========================

function renderDepensesPage(){
  
  console.log("depensesDetail:", depensesDetail);

  const fixes = document.getElementById("depensesFixesPage");
  const variables = document.getElementById("depensesVariablesPage");

  // 🔥 reset uniquement si présent
  if(fixes) fixes.innerHTML = "";
  if(variables) variables.innerHTML = "";

  let totalFixes = 0;
  let totalVariables = 0;

  depensesDetail.forEach((d, i) => {

    const montant = Number(d.montant) || 0;

    const row = document.createElement("div");
    row.className = "depense-row";

    row.onclick = () => modifierDepense(i);
    row.ontouchstart = (e) => startSwipe(e, i);
    row.ontouchend = (e) => endSwipe(e, i);

    row.innerHTML = `
      <span>${d.nom}</span>
      <span>${euro(montant)}</span>
    `;

    if(d.type === "fixe"){
      if(fixes) fixes.appendChild(row); // 🔥 sécurité
      totalFixes += montant;
    } else {
      if(variables) variables.appendChild(row); // 🔥 sécurité
      totalVariables += montant;
    }

  });

  // 🔥 TOUJOURS mettre à jour les cartes
  setText("totalFixesPage", euro(totalFixes));
  setText("totalVariablesPage", euro(totalVariables));
  setText("depensesTotalPage", euro(totalFixes + totalVariables));
}

// =========================
// CRUD
// =========================

function validerDepense(){

  const nom = document.getElementById("depenseNom")?.value.trim();
  const montant = parseFloat(
    document.getElementById("depenseMontant")?.value
  );
  const type = document.getElementById("typeDepense")?.value || "variable";

  if(!nom || isNaN(montant) || montant <= 0){
  showToast?.("⚠️ Valeur invalide");
  return;
}

  depensesDetail.push({
    nom,
    montant: Math.round(montant * 100) / 100,
    type
  });

  saveDepenses();
  renderDepensesPage();
  updateBudget(); // 🔥 AJOUT

  const nomInput = document.getElementById("depenseNom");
  const montantInput = document.getElementById("depenseMontant");

  if(nomInput) nomInput.value = "";
  if(montantInput) montantInput.value = "";

  fermerModalDepense();
}

function openAddDepense(){

  if(document.getElementById("modalDepense")) return;

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.id = "modalDepense";

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Ajouter une dépense</h3>

      <input id="depenseNom" placeholder="Nom de la dépense">

      <input id="depenseMontant" 
             type="number" 
             inputmode="decimal" 
             placeholder="Montant">

     <select id="typeDepense">
   <option value="fixe">📦 Fixe</option>
   <option value="variable">🛒 Variable</option>
     </select>

      <button id="btnAddDepense">Ajouter</button>
      <button id="btnCancelDepense">Annuler</button>
    </div>
  `;

  document.body.appendChild(modal);

  // focus
  setTimeout(()=>{
    modal.querySelector("#depenseNom")?.focus();
  }, 200);

  // fermer clic extérieur
  modal.addEventListener("click", (e)=>{
    if(e.target === modal){
      fermerModalDepense();
    }
  });

  // annuler
  modal.querySelector("#btnCancelDepense")
    .addEventListener("click", (e)=>{
      e.stopPropagation();
      fermerModalDepense();
    });

  // ajouter
  modal.querySelector("#btnAddDepense")
    .addEventListener("click", (e)=>{
      e.stopPropagation();
      validerDepense();
      fermerModalDepense();
    });
}

function fermerModalDepense(){
  const modal = document.getElementById("modalDepense");
  if(modal) modal.remove();
}

function modifierDepense(index){

  const depense = depensesDetail[index];

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

  depensesDetail[index] = {
    nom: nouveauNom,
    montant: nouveauMontant,
    type: nouveauType
  };

  saveDepenses();
  renderDepensesPage();
  updateBudget(); // 🔥 AJOUT

  showToast("✏️ Dépense modifiée");
}

function supprimerDepense(index){

  depensesDetail.splice(index,1);

  saveDepenses();
  renderDepensesPage();
  updateBudget();

}

// =========================
// STORAGE
// =========================

function saveDepenses(){
  localStorage.setItem(
    "depensesDetail",
    JSON.stringify(depensesDetail)
  );
}

// =========================
// SWIPE
// =========================

let swipeStartX = 0;
let currentRow = null;
let armedRow = null;

function startSwipe(e, index){
  swipeStartX = e.touches[0].clientX;
  currentRow = e.currentTarget;
}

function endSwipe(e,index){

  const diff = e.changedTouches[0].clientX - swipeStartX;

  if(diff < -20 && currentRow){
    currentRow.style.transform = "translateX(-40px)";
    currentRow.classList.add("swiping");
  }

  if(diff < -100){

    if(armedRow === currentRow){

      navigator.vibrate?.(10);

      currentRow.style.transform = "translateX(-100%)";

      setTimeout(()=>{
        supprimerDepense(index);
        showToast("🗑️ Dépense supprimée");
      },200);

      armedRow = null;
      return;
    }

    if(armedRow){
      armedRow.style.transform = "translateX(0)";
      armedRow.classList.remove("swiping");
    }

    armedRow = currentRow;

    currentRow.style.transform = "translateX(-72px)";
    currentRow.classList.add("swiping");

    showToast("👉 Glisse encore pour supprimer");
  }

  else if(currentRow){
    currentRow.style.transform = "translateX(0)";
    currentRow.classList.remove("swiping");
    armedRow = null;
  }
}