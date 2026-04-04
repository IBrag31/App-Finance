function euro(n){
return Number(n || 0).toLocaleString("fr-FR",{
minimumFractionDigits:2,
maximumFractionDigits:2
}) + " €";
}

function updateRing(){

const mois = getMoisActuel();
const revenus = getRevenusDuMois(mois) + especes;

const epargne = +document.getElementById("epargneMois").value || 0;
const depenses = calculTotalDepenses();

const budgetMax = Math.max(revenus - epargne,0);

let fixes = 0;
let variables = 0;

depensesDetail.forEach(d=>{
const m = Number(d.montant)||0;
if(d.type==="fixe") fixes+=m;
else variables+=m;
});

document.getElementById("revenusPage")?.innerText = euro(revenus);
document.getElementById("epargneMoisPage")?.innerText = euro(epargne);
document.getElementById("epargneTotalePage")?.innerText = euro(getEpargneTotale());

const fixesP = budgetMax ? fixes/budgetMax : 0;
const varP = budgetMax ? variables/budgetMax : 0;
const totalP = budgetMax ? depenses/budgetMax : 0;

document.querySelector(".ring-fixes")?.style.setProperty("stroke-dashoffset", 326 - fixesP*326);
document.querySelector(".ring-variables")?.style.setProperty("stroke-dashoffset", 264 - varP*264);
document.querySelector(".ring-total")?.style.setProperty("stroke-dashoffset", 188 - totalP*188);

document.getElementById("resumeDepenses")?.innerText = euro(depenses);

const restant = Math.max(budgetMax - depenses,0);
document.getElementById("resumeRestant")?.innerText = euro(restant);

document.getElementById("resumeEpargne")?.innerText =
euro(getEpargneTotale())+" / "+euro(5000);

}

function initUI(){
renderDepensesPage();
renderRevenusPage();
renderEspeces();
}

window.onload = function(){

initChart();
afficherHistorique();
majGraph();
updateObjectifs();

initUI();

setTimeout(updateRing,200);

}
