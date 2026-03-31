let depensesDetail =
JSON.parse(localStorage.getItem("depensesDetail")) || [];

function calculTotalDepenses(){

const total = depensesDetail.reduce(
(sum,d)=> sum + (Number(d.montant) || 0),
0
);

return Math.round(total * 100) / 100;

}

function renderDepenses(){

const fixes = document.getElementById("depensesFixes");
const variables = document.getElementById("depensesVariables");

if(!fixes || !variables) return;

let totalFixes = 0;
let totalVariables = 0;

fixes.innerHTML = "";
variables.innerHTML = "";

depensesDetail.forEach((d,i)=>{

const montant = Number(d.montant) || 0;

const row = document.createElement("div");
row.className = "depense-row";

row.onclick = () => modifierDepense(i);
row.ontouchstart = (e) => startSwipe(e, i);
row.ontouchend = (e) => endSwipe(e, i);

// nom de la dépense
const spanNom = document.createElement("span");
spanNom.textContent = d.nom;

// montant
const spanMontant = document.createElement("span");
spanMontant.textContent = euro(montant);

row.appendChild(spanNom);
row.appendChild(spanMontant);

if(d.type === "fixe"){
fixes.appendChild(row);
totalFixes += montant;
}else{
variables.appendChild(row);
totalVariables += montant;
}
});

}

function renderDepensesPage(){

  const fixes = document.getElementById("depensesFixesPage");
  const variables = document.getElementById("depensesVariablesPage");

  if(!fixes || !variables) return;

  fixes.innerHTML = "";
  variables.innerHTML = "";

  let totalFixes = 0;
  let totalVariables = 0;

  depensesDetail.forEach((d,i)=>{

    const montant = Number(d.montant) || 0;

    const row = document.createElement("div");
    row.className = "depense-row";

    // 🔥 AJOUT IMPORTANT
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

  document.getElementById("totalFixesPage").innerText = euro(totalFixes);
  document.getElementById("totalVariablesPage").innerText = euro(totalVariables);

  const total = totalFixes + totalVariables;
  document.getElementById("depensesTotalPage").innerText = euro(total);
}

function ajouterDepense(){

const nom = prompt("Nom de la dépense ?");
if(!nom) return;

const montant = parseFloat(prompt("Montant ?"));
if(isNaN(montant)) return;

let type = prompt("Type : fixe ou variable ?");
if(!type) return;

type = type.toLowerCase().trim();

if(type !== "fixe" && type !== "variable"){
showToast("Type invalide");
return;
}

depensesDetail.push({
nom,
montant,
type
});

saveDepenses();
renderDepenses();
updateRing();

}

function supprimerDepense(index){

depensesDetail.splice(index,1);

saveDepenses();
renderDepenses();
renderDepensesPage();
updateRing();

}

function modifierDepense(index){

const depense = depensesDetail[index];

const nouveauNom = prompt("Nom de la dépense :", depense.nom);
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
renderDepenses();
updateRing();

showToast("✏️ Dépense modifiée");

}

