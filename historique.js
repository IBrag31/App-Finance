// =========================
// DATA
// =========================

let historique =
JSON.parse(localStorage.getItem("historique")) || [];

let historyChart;

// =========================
// CHART
// =========================

function initChart(){

  const canvas = document.getElementById("historyChart");
  if(!canvas) return; // 🔥 protection

  if(typeof Chart === "undefined") return;

  if(historyChart) historyChart.destroy();

  const ctx = canvas.getContext("2d");

  historyChart = new Chart(ctx,{
    type:"line",
    data:{
      labels:[],
      datasets:[
        {label:"Dépenses",data:[],borderColor:"#ef4444"},
        {label:"Épargne",data:[],borderColor:"#22c55e"}
      ]
    }
  });
}

function majGraph(){

  if(!historyChart) return;

  historyChart.data.labels = historique.map(m => m.mois);
  historyChart.data.datasets[0].data = historique.map(m => m.depenses);
  historyChart.data.datasets[1].data = historique.map(m => m.epargne);

  historyChart.update();
}

// =========================
// CRUD
// =========================

function ajouterMois(){

  const moisInput = document.getElementById("moisSelect").value;

  if(!moisInput){
    showToast("⚠️ Choisis un mois");
    return;
  }

  const [annee, mois] = moisInput.split("-");
  const moisFinal = mois + "/" + annee;

  const existe = historique.some(m => m.mois === moisFinal);

  if(existe){
    showToast("⚠️ Déjà ajouté");
    return;
  }

  const depenses = calculTotalDepenses();
  const epargne = +document.getElementById("epargneMois").value;

  historique.push({mois: moisFinal, depenses, epargne});

 saveHistorique();

  afficherHistorique();
  majGraph();
  updateObjectifs();
  updateRing();
}

function afficherHistorique(){

  const tbody = document.querySelector("#historiqueTable tbody");
  if(!tbody) return;

  tbody.innerHTML = "";

  historique.forEach((m,i)=>{

    tbody.innerHTML += `
      <tr>
        <td>${m.mois}</td>
        <td>${euro(m.depenses)}</td>
        <td>${euro(m.epargne)}</td>
        <td>
          <button onclick="supprimer(${i})">X</button>
        </td>
      </tr>
    `;

  });
}

function supprimer(i){

  historique.splice(i,1);

  saveHistorique();

  afficherHistorique();
  majGraph();
  updateObjectifs();

  showToast("🗑️ supprimé");
}

// =========================
// UTILS
// =========================

function getEpargneTotale(){
  return historique.reduce((t,m)=> t + m.epargne, 0);
}

function updateObjectifs(){

  const bar1 = document.getElementById("bar1");
  const bar2 = document.getElementById("bar2");
  const bar3 = document.getElementById("bar3");

  // 🔥 sécurité DOM
  if(!bar1 || !bar2 || !bar3) return;

  let total = getEpargneTotale();

  const obj1 = 6000;
  const obj2 = 1500;
  const obj3 = 3000;

  const s1 = Math.min(total, obj1);
  bar1.style.width = (s1/obj1)*100 + "%";

  total -= s1;

  const s2 = Math.min(total, obj2);
  bar2.style.width = (s2/obj2)*100 + "%";

  total -= s2;

  const s3 = Math.min(total, obj3);
  bar3.style.width = (s3/obj3)*100 + "%";
}