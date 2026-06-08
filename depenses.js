console.log("depenses.js SYNC CLEAN ✅");

// =========================
// CALCULS
// =========================

function calculTotalDepenses(){
  return window.depensesDetail.reduce(
    (sum, d) => sum + (Number(d.montant) || 0),
    0
  );
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

    const montant =
      Number(d.montant) || 0;

    const row =
      document.createElement("div");

    row.className = "depense-row";

    // clic modification
    row.addEventListener("click", () => {

      modifierDepense(i);

    });

    row.innerHTML = `

      <div style="flex:1">

<div>
  ${d.nom}
</div>

${
  d.type === "CB"
    ? `
      <div style="
        opacity:0.75;
        font-size:12px;
        margin-top:2px;
      ">
        ${d.categorie || "📦 Autre"}
      </div>

      <div style="
        opacity:0.5;
        font-size:12px;
        margin-top:2px;
      ">
        🕒 ${d.date || ""}
      </div>
    `
    : ""
}

<div style="
  opacity:0.6;
  font-size:13px;
  margin-top:2px;
">

  ${euro(montant)}

</div>

      </div>

      <button
        class="delete-btn"
        data-index="${i}"
      >
        ×
      </button>

    `;

    // suppression sécurisée
    row.querySelector(".delete-btn")
      ?.addEventListener("click", (e) => {

        e.stopPropagation();

        supprimerDepense(i);

      });

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

    type

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
    
    <select
  id="editCategorie"
  class="modal-input"
>

  ${window.CATEGORIES_FINANCE.map(cat => `

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

  categorie: nouvelleCategorie

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

    lignes.forEach((ligne) => {

      const [
        nom,
        montantRaw,
        date
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
      const existe =
        window.depensesDetail.some(

          d =>

            d.nom === nom &&

            Number(d.montant) === montant &&

            d.date === date

        );

      if(existe) return;

      // ajout dépense
     window.depensesDetail.push({

  id: Date.now() + Math.random(),

  nom,

  montant,

  date,

  type: "CB",

  categorie:
    detecterCategorie(nom)

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