let revenusDetail =
JSON.parse(localStorage.getItem("revenusDetail")) || [];

let especes =
Number(localStorage.getItem("especes")) || 0;

function renderRevenusPage(){

  const list = document.getElementById("revenusList");
  if(!list) return;

  list.innerHTML = "";

  let total = 0;

  [...revenusDetail]
  .sort((a, b) => b.mois.localeCompare(a.mois))
  .forEach((r) => {

    total += r.montant;

    const div = document.createElement("div");
    div.className = "depense-row";
    
    div.onclick = () => modifierRevenu(r);
    div.ontouchstart = (e) => startSwipeRevenu(e, r);
    div.ontouchend = (e) => endSwipeRevenu(e, r);

    div.innerHTML = `
      <span>${r.nom}</span>
      <span>${formatMois(r.mois)} • ${euro(r.montant)}</span>
    `;

    list.appendChild(div);
  });

  // total global
  const el = document.getElementById("revenusPage");
  if(el) el.innerText = euro(total);

  // 🔥 PARTIE SÉPARÉE (plus propre)
  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(getMoisActuel());
  }

  const moisActuel = getMoisActuel();
  const totalMois = getRevenusDuMois(moisActuel);

  const elMois = document.getElementById("revenusMois");
  if(elMois){
    elMois.innerText = euro(totalMois);
  }

}

function validerRevenu(){

  const nom = document.getElementById("revenuNom").value.trim();
  const montant = parseFloat(document.getElementById("revenuMontant").value);
  const mois = document.getElementById("revenuMois").value;

  if(!nom || isNaN(montant) || montant <= 0 || !mois){
  showToast("⚠️ Montant invalide");
  return;
}

  revenusDetail.push({
    nom,
    montant,
    mois
  });

  localStorage.setItem("revenusDetail", JSON.stringify(revenusDetail));

  // 🔥 RESET DES CHAMPS (ICI)
  document.getElementById("revenuNom").value = "";
  document.getElementById("revenuMontant").value = "";
  document.getElementById("revenuMois").value = "";

  showToast("💰 Revenu ajouté");

  fermerModalRevenu();
  renderRevenusPage();
  updateRing();
}

function modifierRevenu(revenu){

  const nouveauNom = prompt("Nom :", revenu.nom);
  if(!nouveauNom || nouveauNom.trim() === "") return;

  const nouveauMontant = parseFloat(prompt("Montant :", revenu.montant));
  
  // 🔥 AJOUT ICI
  if(isNaN(nouveauMontant) || nouveauMontant < 0) return;

  revenu.nom = nouveauNom;
  revenu.montant = nouveauMontant;

  localStorage.setItem("revenusDetail", JSON.stringify(revenusDetail));

  renderRevenusPage();
  updateRing();

  showToast("✏️ Revenu modifié");
}

function supprimerRevenu(revenu){

  const index = revenusDetail.indexOf(revenu);
  if(index !== -1){
    revenusDetail.splice(index,1);
  }

  localStorage.setItem("revenusDetail", JSON.stringify(revenusDetail));

  renderRevenusPage();
  updateRing();
}

function getRevenusDuMois(mois){

  return revenusDetail
    .filter(r => r.mois === mois)
    .reduce((sum, r) => sum + r.montant, 0);
}

function getMoisActuel(){
  const d = new Date();
  return d.toISOString().slice(0,7); // format YYYY-MM
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

function startSwipeRevenu(e, revenu){
  revenuSwipeStartX = e.touches[0].clientX;
  currentRevenuRow = e.currentTarget;
  currentRevenu = revenu;
}

let currentRevenu = null;

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
showToast("🗑️ Revenu supprimé");
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

showToast("👉 Glisse encore pour supprimer");
}
else if(currentRevenuRow){
  currentRevenuRow.style.transform = "translateX(0)";
  currentRevenuRow.classList.remove("swiping");
  armedRevenuRow = null;
}
} // ✅ ferme la fonction endSwipeRevenu
