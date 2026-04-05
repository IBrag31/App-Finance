console.log("revenus.js loaded");

// =========================
// DATA
// =========================

let revenusDetail = JSON.parse(localStorage.getItem("revenusDetail") || "[]");
let especes = Number(localStorage.getItem("especes") || 0);

// =========================
// SAFE SET TEXT
// =========================

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.innerText = value;
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

  setText("revenusPage", euro(total));

  const label = document.getElementById("moisActuelLabel");
  if(label){
    label.innerText = formatMois(getMoisActuel());
  }

  const totalMois = getRevenusDuMois(getMoisActuel());
  setText("revenusMois", euro(totalMois));
}