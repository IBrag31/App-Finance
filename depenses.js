console.log("depenses.js loaded");

// =========================
// DATA
// =========================

let depensesDetail = JSON.parse(localStorage.getItem("depensesDetail") || "[]");

// =========================
// UTILS
// =========================

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
}

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){
  const total = depensesDetail.reduce(
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

  if(!fixes || !variables) return;

  fixes.innerHTML = "";
  variables.innerHTML = "";

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
      fixes.appendChild(row);
      totalFixes += montant;
    } else {
      variables.appendChild(row);
      totalVariables += montant;
    }

  });

  setText("totalFixesPage", euro(totalFixes));
  setText("totalVariablesPage", euro(totalVariables));

  const total = totalFixes + totalVariables;
  setText("depensesTotalPage", euro(total));
}

// =========================
// CRUD
// =========================

function validerDepense(){

  const nom = document.getElementById("depenseNom")?.value.trim();
  const montant = parseFloat(
    document.getElementById("depenseMontant")?.value
  );
  const type = document.getElementById("typeDepense")?.value;

  if(!nom || isNaN(montant)) return;

  depensesDetail.push({
    nom,
    montant: Math.round(montant * 100) / 100,
    type
  });

  saveDepenses();
  renderDepensesPage();
  updateRing();

  const nomInput = document.getElementById("depenseNom");
  const montantInput = document.getElementById("depenseMontant");

  if(nomInput) nomInput.value = "";
  if(montantInput) montantInput.value = "";

  fermerModal();
}

function supprimerDepense(index){

  depensesDetail.splice(index,1);

  saveDepenses();
  renderDepensesPage();
  updateRing();
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
  updateRing();

  showToast("✏️ Dépense modifiée");
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