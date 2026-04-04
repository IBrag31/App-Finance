// =========================
// CORE STORAGE
// =========================

function saveData(key, data){
  try{
    localStorage.setItem(key, JSON.stringify(data));
  }catch(e){
    console.error("Erreur saveData :", key, e);
  }
}

function loadData(key, fallback){
  try{
    const data = JSON.parse(localStorage.getItem(key));
    return data ?? fallback;
  }catch(e){
    console.warn("Erreur loadData :", key);
    return fallback;
  }
}

// =========================
// HELPERS APP
// =========================

// Dépenses
function saveDepenses(){
  saveData("depensesDetail", depensesDetail);
}

// Revenus
function saveRevenus(){
  saveData("revenusDetail", revenusDetail);
}

// Historique
function saveHistorique(){
  saveData("historique", historique);
}

// Espèces
function saveEspeces(){
  saveData("especes", especes);
}