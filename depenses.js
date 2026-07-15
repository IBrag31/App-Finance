console.log("depenses.js SYNC CLEAN ✅");

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){

  return window.depensesDetail.reduce(

    (sum, d) => {

      const montant =
        Number(d.montant) || 0;

      return sum + (
        d.commun
          ? montant / 2
          : montant
      );

    },

    0

  );

}

// =========================
// TOTAL DEPENSES MOIS
// =========================

function calculTotalDepensesMois(){

  return window.depensesDetail.reduce((sum, d) => {

    const montant =
      Number(d.montant) || 0;

    const valeur =
      d.commun ? montant / 2 : montant;

    // Les dépenses CB ne comptent
    // que pour le mois sélectionné
    if(d.type === "CB"){

      return d.mois === getMoisBudget()

        ? sum + valeur

        : sum;

    }

    // Les dépenses fixes et variables
    // restent permanentes
    return sum + valeur;

  }, 0);

}

// =========================
// RENDER PAGE
// =========================

function renderDepensesPage(){

  const fixes =
    document.getElementById("depensesFixesPage");

  const variables =
    document.getElementById("depensesVariablesPage");

  const cb =
  document.getElementById("depensesCBPage");

  if(fixes) fixes.innerHTML = "";
  if(variables) variables.innerHTML = "";
  if(cb){
  cb.innerHTML = "";
}

  // sécurité
  if(!Array.isArray(window.depensesDetail)){
    window.depensesDetail = [];
  }

  let totalFixes = 0;
  let totalVariables = 0;
  let totalCB = 0;

  window.depensesDetail.forEach((d, i) => {

    // Les transactions Apple Pay
// ne s'affichent que pour le mois sélectionné
if(
  d.type === "CB" &&
  d.mois !== getMoisBudget()
){
  return;
}

    const montantBrut =
  Number(d.montant) || 0;

const montant =
  d.commun
    ? montantBrut / 2
    : montantBrut;

    const row =
      document.createElement("div");

    row.className =
  "depense-row swipe-card";

    // clic modification
    row.addEventListener("click", () => {

  if(
    row.classList.contains("swiped")
  ){
    return;
  }

  modifierDepense(i);

});

    row.innerHTML = `

<div class="depense-actions">

  <button
    class="depense-edit"
  >
    Modifier
  </button>

  <button
    class="depense-delete"
  >
    Supprimer
  </button>

</div>

<div class="depense-content">

  <div style="flex:1">

    <div>
      ${d.nom}
    </div>
    
    <div style="
opacity:.7;
font-size:12px;
margin-top:2px;
">
${d.categorie || "📦 Autre"}
</div>

    ${
      d.commun
        ? `
          <div style="
            color:#60a5fa;
            font-size:12px;
            margin-top:2px;
          ">
            👥 Dépense commune
          </div>
        `
        : ""
    }


    <div style="
      opacity:0.6;
      font-size:13px;
      margin-top:2px;
    ">

      ${
        d.commun
          ? `${euro(montantBrut)} • Ma part : ${euro(montant)}`
          : euro(montant)
      }

    </div>

  </div>

</div>

`;

row
  .querySelector(".depense-edit")
  ?.addEventListener("click", (e) => {

    e.stopPropagation();

    modifierDepense(i);

  });

row
  .querySelector(".depense-delete")
  ?.addEventListener("click", (e) => {

    e.stopPropagation();

    if(
      confirm(
        "Supprimer cette dépense ?"
      )
    ){

      supprimerDepense(i);

    }

  });
  
  const content =
  row.querySelector(
    ".depense-content"
  );

let startX = 0;

row.addEventListener(
  "touchstart",
  (e) => {

    startX =
      e.touches[0].clientX;

  }
);

row.addEventListener(
  "touchend",
  (e) => {

    const endX =
      e.changedTouches[0].clientX;

    const delta =
      startX - endX;

    // swipe gauche
    if(delta > 50){

      document
        .querySelectorAll(
          ".depense-row"
        )
        .forEach(c => {

          c.classList.remove(
            "swiped"
          );

          c.querySelector(
            ".depense-content"
          )?.classList.remove(
            "swiped"
          );

        });

      row.classList.add(
        "swiped"
      );

      content.classList.add(
        "swiped"
      );

    }

    // swipe droite
    if(delta < -50){

      row.classList.remove(
        "swiped"
      );

      content.classList.remove(
        "swiped"
      );

    }

  }
);

    // append

if(
  d.type === "CB" ||
  d.categorie === "CB"
){

  if(cb){
    cb.appendChild(row);
  }

  totalCB += montant;

}

else if(d.type === "fixe"){

  if(fixes){
    fixes.appendChild(row);
  }

  totalFixes += montant;

}

else{

  if(variables){
    variables.appendChild(row);
  }

  totalVariables += montant;

}

  });

  // totaux
  setText(
    "totalFixesPage",
    euro(totalFixes)
  );

  setText(
    "totalVariablesPage",
    euro(totalVariables)
  );
  
  setText(
  "totalCBPage",
  euro(totalCB)
  );

  setText(
    "depensesTotalPage",
    euro(totalFixes + totalVariables + totalCB)
  );

}

// =========================
// AJOUT
// =========================

function validerDepense(){

  const nom =
    document
      .getElementById("depenseNom")
      ?.value
      .trim();

  const montant =
    parseFloat(
      document
        .getElementById("depenseMontant")
        ?.value
    );

  const type =
    document
      .getElementById("typeDepense")
      ?.value || "variable";
      
      const commun =
  document
    .getElementById("depenseCommune")
    ?.checked || false;
    
    const categorie =
document
  .getElementById("categorieDepense")
  ?.value || "📦 Autre";

  // validation
  if(!nom || isNaN(montant) || montant <= 0){

    showToast?.("⚠️ Valeur invalide");

    return;

  }

  // sécurité
  if(!Array.isArray(window.depensesDetail)){
    window.depensesDetail = [];
  }

  // ajout
  window.depensesDetail.push({

  id: Date.now(),

  nom,

  montant:
    Math.round(montant * 100) / 100,

  date: getDateAujourdhui(),

  mois: getMoisActuel(),

  type,

  categorie,

  commun

});

  saveAll();

  refreshApp();

  closeModal();

  showToast?.("💸 Dépense ajoutée");

}

// =========================
// MODAL
// =========================

function openAddDepense(){

  openModal("Ajouter une dépense", `

    <input
      id="depenseNom"
      class="modal-input"
      placeholder="Nom de la dépense"
    >

    <input
      id="depenseMontant"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Montant"
    >

    <select
      id="typeDepense"
      class="modal-input"
    >

      <option value="fixe">
        📦 Fixe
      </option>

      <option value="variable">
        🛒 Variable
      </option>

    </select>

    <select
      id="categorieDepense"
      class="modal-input"
    >

      ${window.getCategoriesFinance().map(cat => `

        <option value="${cat}">
          ${cat}
        </option>

      `).join("")}

    </select>

    <label
      style="
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:14px;
        color:white;
      "
    >

      <input
        type="checkbox"
        id="depenseCommune"
      >

      👥 Dépense commune (50/50)

    </label>

    <button
      id="btnValidateDepense"
      class="modal-button"
    >
      Ajouter
    </button>

  `);

  // focus auto iPhone
  setTimeout(() => {

    document
      .getElementById("depenseNom")
      ?.focus();

  }, 120);

  // validation
  document
    .getElementById("btnValidateDepense")
    ?.addEventListener("click", () => {

      validerDepense();

    });

}

// =========================
// MODIFIER
// =========================

function modifierDepense(index){

  const depense =
    window.depensesDetail[index];

  if(!depense) return;

  openModal("Modifier dépense", `

    <input
      id="editDepenseNom"
      class="modal-input"
      value="${depense.nom}"
    >

    <input
      id="editDepenseMontant"
      class="modal-input"
      type="number"
      value="${depense.montant}"
    >

    ${
  depense.type === "CB"
    ? ""
    : `

      <select
        id="editTypeDepense"
        class="modal-input"
      >

        <option
          value="fixe"
          ${depense.type === "fixe" ? "selected" : ""}
        >
          📦 Fixe
        </option>

        <option
          value="variable"
          ${depense.type === "variable" ? "selected" : ""}
        >
          🛒 Variable
        </option>

      </select>

    `
}

<label
  style="
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:14px;
    color:white;
  "
>

  <input
    type="checkbox"
    id="editDepenseCommune"
    ${depense.commun ? "checked" : ""}
  >

  👥 Dépense commune (50/50)

</label>
    
    <select
  id="editCategorie"
  class="modal-input"
>

  ${window.getCategoriesFinance().map(cat => `

    <option
      value="${cat}"
      ${depense.categorie === cat ? "selected" : ""}
    >
      ${cat}
    </option>

  `).join("")}

</select>

    <button
      id="btnSaveDepense"
      class="modal-button"
    >
      Enregistrer
    </button>

  `);

  setTimeout(() => {

    document
      .getElementById("editDepenseNom")
      ?.focus();

  }, 120);

  document
    .getElementById("btnSaveDepense")
    ?.addEventListener("click", () => {

      const nouveauNom =
        document
          .getElementById("editDepenseNom")
          ?.value
          .trim();

      const nouveauMontant =
        parseFloat(
          document
            .getElementById("editDepenseMontant")
            ?.value
        );

      const nouveauType =
  depense.type === "CB"
    ? "CB"
    : document
        .getElementById("editTypeDepense")
        ?.value || "variable";
          
          const nouvelleCategorie =
  document
    .getElementById("editCategorie")
    ?.value || "📦 Autre";
    
    const commun =
  document
    .getElementById("editDepenseCommune")
    ?.checked || false;

      if(
        !nouveauNom ||
        isNaN(nouveauMontant) ||
        nouveauMontant <= 0
      ){

        showToast?.("⚠️ Valeur invalide");

        return;

      }

      window.depensesDetail[index] = {

  ...depense,

  nom: nouveauNom,

  montant:
    Math.round(nouveauMontant * 100) / 100,

  type: nouveauType,

  categorie: nouvelleCategorie,

  commun

};

      saveAll();

      refreshApp();

      closeModal();

      showToast?.("✏️ Dépense modifiée");

    });

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

// =========================
// CLE UNIQUE TRANSACTION
// =========================

function getCleTransaction(transaction){

  return [

    transaction.date,

    Number(transaction.montant)
      .toFixed(2),

    String(transaction.nom || "")
      .trim()
      .toLowerCase()

  ].join("|");

}

// =========================
// SUPPRESSION DOUBLONS CB
// =========================

function supprimerDoublonsCB(depenses){

  const cles = new Set();

  return depenses.filter(depense => {

    // On ne touche pas aux dépenses fixes/variables
    if(depense.type !== "CB"){
      return true;
    }

    const cle = getCleTransaction(depense);

    if(cles.has(cle)){
      return false;
    }

    cles.add(cle);

    return true;

  });

}

async function importTransactionsCB(){

  const input =
    document.createElement("input");

  input.type = "file";

  input.accept = ".txt";

  input.onchange = async (e) => {

    const file =
      e.target.files[0];

    if(!file) return;

    const text =
      await file.text();

    const lignes =
      text
        .split("\n")
        .filter(l => l.trim());

    let imported = 0;

    const transactionsExistantes = new Set(

  window.depensesDetail

    .filter(d => d.type === "CB")

    .map(getCleTransaction)

);

    lignes.forEach((ligne) => {

      const [
  date,
  nom,
  commercant,
  montantRaw,
  carte
] = ligne.split("|");

      if(
        !nom ||
        !montantRaw
      ) return;

      // nettoyage montant
      const montant =
        parseFloat(

          montantRaw

            .replace("€","")

            .replace(",", ".")

            .trim()

        );

      if(isNaN(montant)) return;

      // anti doublon
      const libelle =
  (commercant || nom).trim();

const transaction = {

  date,

  montant,

  nom: libelle

};

const cle =
  getCleTransaction(transaction);

if(
  transactionsExistantes.has(cle)
){
  return;
}

transactionsExistantes.add(cle);

      // ajout dépense
     window.depensesDetail.push({

  id: Date.now() + Math.random(),

  nom: libelle,

  montant,

  date,

  mois: getMoisFromDate(date),

  carte,

  type: "CB",

  categorie: detecterCategorie(
  libelle
),

  commun: false

});

      imported++;

    });

    saveAll();

    refreshApp();

    showToast?.(

      `💳 ${imported} transaction(s) importée(s)`

    );

  };

  input.click();

}

document.addEventListener(
  "click",
  (e) => {

    if(
      !e.target.closest(
        ".depense-row"
      )
    ){

      document
        .querySelectorAll(
          ".depense-row"
        )
        .forEach(c => {

          c.classList.remove(
            "swiped"
          );

          c.querySelector(
            ".depense-content"
          )?.classList.remove(
            "swiped"
          );

        });

    }

  }
);