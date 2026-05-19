console.log("revenus.js SYNC CLEAN ✅");

// =========================
// UTILS DATE
// =========================

function getMoisActuel(){
  return new Date().toISOString().slice(0,7);
}

function getMoisBudget(){

  const date =
    new Date();

  // budget basé sur
  // le salaire du mois précédent
  date.setMonth(
    date.getMonth() - 1
  );

  return date
    .toISOString()
    .slice(0,7);

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

// =========================
// ESPECES (GLOBAL)
// =========================

function renderEspeces(){
  const el = document.getElementById("especesValue");
  if(!el) return;

  el.innerText = euroShort(window.especes);

  el.style.transform = "scale(1.1)";
  setTimeout(()=> el.style.transform = "scale(1)", 120);
}

function ajouterEspeces(){
  window.especes += 5;
  saveAll();
  refreshApp();
}

function retirerEspeces(){
  window.especes = Math.max(0, window.especes - 5);
  saveAll();
  refreshApp();
}

// =========================
// LOGIQUE
// =========================

function getRevenusDuMois(mois){
  return window.revenusDetail
    .filter(r => r.mois === mois)
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
}

function getTotalRevenus(){
  return window.revenusDetail
    .reduce((sum, r) => sum + (Number(r.montant) || 0), 0);
}

// =========================
// RENDER
// =========================

function renderRevenusPage(){

  const list =
    document.getElementById("revenusList");

  if(!list) return;

  // reset liste
  list.innerHTML = "";

  // sécurité
  if(!Array.isArray(window.revenusDetail)){
    window.revenusDetail = [];
  }

  // tri revenus
  [...window.revenusDetail]

    .sort((a, b) =>
      b.mois.localeCompare(a.mois)
    )

    .forEach((r) => {

      const div =
        document.createElement("div");

      div.className = "depense-row";

      // clic modification
      div.addEventListener("click", () => {

        modifierRevenu(r);

      });

      div.innerHTML = `

        <div style="flex:1">

          <div>
            ${r.nom}
          </div>

          <div style="
            opacity:0.6;
            font-size:13px;
            margin-top:2px;
          ">

            ${formatMois(r.mois)}
            •
            ${euro(r.montant)}

          </div>

        </div>

        <button
          class="delete-btn"
          data-id="${r.id}"
        >
          ×
        </button>

      `;

      // suppression sécurisée
      div.querySelector(".delete-btn")
        ?.addEventListener("click", (e) => {

          e.stopPropagation();

          supprimerRevenu(r.id);

        });

      list.appendChild(div);

    });

  // total global
  const totalGlobal =
    getTotalRevenus() + window.especes;

  setText(
    "revenusPage",
    euro(totalGlobal)
  );

  // mois budget
  const moisBudget =
    getMoisBudget();

  // label mois
  const label =
    document.getElementById("moisActuelLabel");

  if(label){

    label.innerText =
      formatMois(moisBudget);

  }

  // total mois
  const totalMois =
    getRevenusDuMois(moisBudget);

  setText(
    "revenusMois",
    euro(totalMois)
  );

}

// =========================
// MODAL
// =========================

function openAddRevenu(){

  const moisActuel =
    getMoisBudget().slice(5,7);

  openModal("Ajouter un revenu", `

    <input
      id="revenuNom"
      class="modal-input"
      placeholder="Nom du revenu"
    >

    <input
      id="revenuMontant"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Montant"
    >

    <select
      id="revenuMois"
      class="modal-input"
    >

      <option value="01">Janvier</option>
      <option value="02">Février</option>
      <option value="03">Mars</option>
      <option value="04">Avril</option>
      <option value="05">Mai</option>
      <option value="06">Juin</option>
      <option value="07">Juillet</option>
      <option value="08">Août</option>
      <option value="09">Septembre</option>
      <option value="10">Octobre</option>
      <option value="11">Novembre</option>
      <option value="12">Décembre</option>

    </select>

    <button
      id="btnValidateRevenu"
      class="modal-button"
    >
      Ajouter
    </button>

  `);

  // mois actuel
  document
    .getElementById("revenuMois")
    .value = moisActuel;

  // focus iPhone
  setTimeout(() => {

    document
      .getElementById("revenuNom")
      ?.focus();

  }, 120);

  // validation
  document
    .getElementById("btnValidateRevenu")
    ?.addEventListener("click", () => {

      validerRevenu();

    });

}

// =========================
// CRUD (SYNC GLOBAL)
// =========================

function validerRevenu(){

  const nom =
    document
      .getElementById("revenuNom")
      ?.value
      .trim();

  const montant =
    parseFloat(
      document
        .getElementById("revenuMontant")
        ?.value
    );

  const moisInput =
    document
      .getElementById("revenuMois");

  const annee =
    new Date().getFullYear();

  const mois =
    `${annee}-${moisInput.value}`;

  // validation
  if(!nom || isNaN(montant) || montant <= 0){

    showToast?.("⚠️ Montant invalide");

    return;

  }

  // sécurité
  if(!Array.isArray(window.revenusDetail)){
    window.revenusDetail = [];
  }

  // ajout revenu
  window.revenusDetail.push({

    id: Date.now(),

    nom,

    montant:
      Math.round(montant * 100) / 100,

    mois

  });

  // sauvegarde
  saveAll();

  // refresh UI
  refreshApp();

  // fermeture modale
  closeModal();

  // toast
  showToast?.("💰 Revenu ajouté");

}

// =========================

function modifierRevenu(revenu){

  openModal("Modifier revenu", `

    <input
      id="editRevenuNom"
      class="modal-input"
      value="${revenu.nom}"
    >

    <input
      id="editRevenuMontant"
      class="modal-input"
      type="number"
      value="${revenu.montant}"
    >

    <button
      id="btnSaveRevenu"
      class="modal-button"
    >
      Enregistrer
    </button>

  `);

  setTimeout(() => {

    document
      .getElementById("editRevenuNom")
      ?.focus();

  }, 120);

  document
    .getElementById("btnSaveRevenu")
    ?.addEventListener("click", () => {

      const nouveauNom =
        document
          .getElementById("editRevenuNom")
          ?.value
          .trim();

      const nouveauMontant =
        parseFloat(
          document
            .getElementById("editRevenuMontant")
            ?.value
        );

      if(
        !nouveauNom ||
        isNaN(nouveauMontant) ||
        nouveauMontant <= 0
      ){

        showToast?.("⚠️ Montant invalide");
        return;

      }

      const index =
        window.revenusDetail
          .findIndex(r => r.id === revenu.id);

      if(index === -1) return;

      window.revenusDetail[index].nom =
        nouveauNom;

      window.revenusDetail[index].montant =
        Math.round(nouveauMontant * 100) / 100;

      saveAll();
      refreshApp();

      closeModal();

      showToast?.("✏️ Revenu modifié");

    });

}

// =========================

function supprimerRevenu(id){

  window.revenusDetail = window.revenusDetail.filter(r => r.id !== id);

  saveAll();
  refreshApp();

  showToast?.("🗑️ Revenu supprimé");
}