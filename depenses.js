console.log("depenses.js CLEAN FINAL ✅");

// =========================
// DATA
// =========================

function getDepensesDetail(){
  return JSON.parse(localStorage.getItem("depensesDetail") || "[]");
}

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){

  const data = getDepensesDetail();

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

  const fixes = document.getElementById("depensesFixesPage");
  const variables = document.getElementById("depensesVariablesPage");

  if(fixes) fixes.innerHTML = "";
  if(variables) variables.innerHTML = "";

  let totalFixes = 0;
  let totalVariables = 0;

  const data = getDepensesDetail();

  data.forEach((d, i) => {

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
  const montant = parseFloat(
    document.getElementById("depenseMontant")?.value
  );
  const type = document.getElementById("typeDepense")?.value || "variable";

  if(!nom || isNaN(montant) || montant <= 0){
    showToast?.("⚠️ Valeur invalide");
    return;
  }

  const data = getDepensesDetail();

  data.push({
    nom,
    montant: Math.round(montant * 100) / 100,
    type
  });

  saveDepenses(data);
  renderDepensesPage();
  updateBudget();

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

  const data = getDepensesDetail();
  const depense = data[index];

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

  data[index] = {
    nom: nouveauNom,
    montant: nouveauMontant,
    type: nouveauType
  };

  saveDepenses(data);
  renderDepensesPage();
  updateBudget();

  showToast("✏️ Dépense modifiée");
}

// =========================
// SUPPRIMER
// =========================

function supprimerDepense(index){

  const data = getDepensesDetail();

  data.splice(index,1);

  saveDepenses(data);
  renderDepensesPage();
  updateBudget();

  showToast("🗑️ Dépense supprimée");
}

// =========================
// STORAGE
// =========================

function saveDepenses(data){
  localStorage.setItem("depensesDetail", JSON.stringify(data));
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