console.log("atelier.js READY ✅");

// =========================
// DATA
// =========================

window.atelier =
  window.atelier || [];

// =========================
// CALCULS
// =========================

function calculCoutTotal(appareil){

  return (

    (Number(appareil.achat) || 0)

    +

    (Number(appareil.pieces) || 0)

    +

    (Number(appareil.frais) || 0)

  );

}

function getAppareilsDuMois(){

  const mois =
    getMoisBudget();

  return window.atelier.filter(

    a => a.date === mois

  );

}

function calculMarge(appareil){

  return (

    (Number(appareil.vente) || 0)

    -

    calculCoutTotal(appareil)

  );

}

function getTotalMarge(){

  return getAppareilsDuMois()

    .reduce(

      (sum, a) =>

        sum + calculMarge(a),

      0

    );

}

function getTotalAppareils(){

  return getAppareilsDuMois().length;

}

function getCapitalImmobilise(){

  return getAppareilsDuMois()

    .filter(a =>

      a.statut !== "vendu"

    )

    .reduce(

      (sum, a) =>

        sum + calculCoutTotal(a),

      0

    );

}

function getMargeMoyenne(){

  const appareils =
    getAppareilsDuMois();

  if(!appareils.length) return 0;

  return (

    getTotalMarge() /

    appareils.length

  );

}

// =========================
// COULEURS
// =========================

function getMargeColor(marge){

  if(marge < 0){
    return "#ef4444";
  }

  if(marge < 40){
    return "#f97316";
  }

  return "#22c55e";

}

// =========================
// ICONES
// =========================

function getAppareilIcon(nom){

  const n =
    String(nom || "")
      .toLowerCase();

  if(
    n.includes("lave") ||
    n.includes("machine")
  ){
    return "🧺";
  }

  if(
    n.includes("frigo") ||
    n.includes("réfrigérateur")
  ){
    return "🧊";
  }

  if(
    n.includes("micro")
  ){
    return "📡";
  }

  if(
    n.includes("aspirateur")
  ){
    return "🌀";
  }

  if(
    n.includes("cafetière") ||
    n.includes("cafe")
  ){
    return "☕";
  }

  if(
    n.includes("four")
  ){
    return "🔥";
  }

  if(
    n.includes("lave-vaisselle")
  ){
    return "🍽️";
  }

  return "🔧";

}

// =========================
// RENDER
// =========================

function renderAtelier(){

  const list =
    document.getElementById("atelierList");

  if(!list) return;

  list.innerHTML = "";

  // sécurité
  if(!Array.isArray(window.atelier)){
    window.atelier = [];
  }

  const appareilsDuMois =
    getAppareilsDuMois();

  // total marge
  const totalMarge =
    getTotalMarge();

  setText(
    "atelierTotalMarge",
    euro(totalMarge)
  );

  setText(
    "atelierResumeValue",
    euro(totalMarge)
  );

  // couleur marge totale
  document
    .getElementById("atelierTotalMarge")
    ?.style.setProperty(
      "color",
      getMargeColor(totalMarge)
    );

  // total appareils
  setText(
    "atelierTotalAppareils",
    getTotalAppareils()
  );

  // marge moyenne
  setText(
    "atelierMargeMoyenne",
    euro(getMargeMoyenne())
  );

  // capital engagé
  setText(
    "atelierCapital",
    euro(
      getCapitalImmobilise()
    )
  );

  // aucun appareil
  if(!appareilsDuMois.length){

    list.innerHTML = `

      <div class="card">

        Aucun appareil
        pour ce mois 📅

      </div>

    `;

    return;

  }

  // render appareils
  [...appareilsDuMois]

    .slice()

    .reverse()

    .forEach((a) => {

      const marge =
        calculMarge(a);

      const coutTotal =
        calculCoutTotal(a);

      const realIndex =
        window.atelier.findIndex(
          item => item.id === a.id
        );

      const row =
        document.createElement("div");

      row.className =
        "atelier-card";

      row.addEventListener("click", () => {

        voirDetailsAppareil(realIndex);

      });

      row.innerHTML = `

  <div class="atelier-top">

    <div class="atelier-title">

      ${getAppareilIcon(a.appareil)}
      ${a.appareil}

    </div>

    <div
      class="atelier-marge"
      style="
        color:${getMargeColor(marge)}
      "
    >

      ${marge >= 0 ? "+" : ""}
      ${euro(marge)}

    </div>

  </div>

  <div
    class="
      atelier-badge

      ${
        a.statut === "vendu"

          ? "badge-vendu"

          : a.statut === "repare"

          ? "badge-repare"

          : "badge-encours"
      }
    "
  >

    ${
      a.statut === "vendu"

        ? "💰 Vendu"

        : a.statut === "repare"

        ? "✅ Réparé"

        : "🔧 En cours"
    }

  </div>

  <button
    class="delete-btn atelier-delete"
  >
    ×
  </button>

`;

      // delete
      row.querySelector(".atelier-delete")
        ?.addEventListener("click", (e) => {

          e.stopPropagation();

          supprimerAppareil(realIndex);

        });

      list.appendChild(row);

    });

}

// =========================
// MODAL AJOUT
// =========================

function openAddAppareil(){

  openModal("Ajouter appareil", `

    <input
      id="atelierNom"
      class="modal-input"
      placeholder="Nom appareil"
    >

    <input
      id="atelierAchat"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Prix achat"
    >

    <input
      id="atelierPieces"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Coût pièces"
    >

    <input
      id="atelierFrais"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Autres frais"
    >

    <input
      id="atelierVente"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Prix revente"
    >

    <select
      id="atelierStatut"
      class="modal-input"
    >

      <option value="encours">
        🔧 En cours
      </option>

      <option value="repare">
        ✅ Réparé
      </option>

      <option value="vendu">
        💰 Vendu
      </option>

    </select>

    <button
      id="btnAddAppareil"
      class="modal-button"
    >
      Ajouter
    </button>

  `);

  // focus iPhone
  setTimeout(() => {

    document
      .getElementById("atelierNom")
      ?.focus();

  }, 120);

  // validation
  document
    .getElementById("btnAddAppareil")
    ?.addEventListener("click", () => {

      validerAppareil();

    });

}

// =========================
// CRUD
// =========================

function validerAppareil(){

  const appareil =
    document
      .getElementById("atelierNom")
      ?.value
      .trim();

  const achat =
    parseFloat(
      document
        .getElementById("atelierAchat")
        ?.value
    ) || 0;

  const pieces =
    parseFloat(
      document
        .getElementById("atelierPieces")
        ?.value
    ) || 0;

  const frais =
    parseFloat(
      document
        .getElementById("atelierFrais")
        ?.value
    ) || 0;

  const vente =
    parseFloat(
      document
        .getElementById("atelierVente")
        ?.value
    ) || 0;

  const statut =
    document
      .getElementById("atelierStatut")
      ?.value || "encours";

  // validation
  if(
    !appareil ||
    vente <= 0
  ){

    showToast?.("⚠️ Valeurs invalides");

    return;

  }

  // sécurité
  if(!Array.isArray(window.atelier)){
    window.atelier = [];
  }

  // ajout
  window.atelier.push({

    id: Date.now(),

    appareil,

    achat,

    pieces,

    frais,

    vente,

    statut,

    date: getMoisBudget()

  });

  saveAll();

  refreshApp();

  closeModal();

  showToast?.("🛠️ Appareil ajouté");

}

function voirDetailsAppareil(index){

  const a =
    window.atelier[index];

  if(!a) return;

  const marge =
    calculMarge(a);

  const coutTotal =
    calculCoutTotal(a);

  openModal(`

    ${getAppareilIcon(a.appareil)}
    ${a.appareil}

  `, `

    <div class="atelier-detail-grid">

      <div>
        Achat :
        ${euro(a.achat)}
      </div>

      <div>
        Pièces :
        ${euro(a.pieces)}
      </div>

      <div>
        Frais :
        ${euro(a.frais || 0)}
      </div>

      <div>
        Coût total :
        ${euro(coutTotal)}
      </div>

      <div>
        Vente :
        ${euro(a.vente)}
      </div>

      <div>
        Marge :
        <span style="
          color:${getMargeColor(marge)};
          font-weight:700;
        ">
          ${euro(marge)}
        </span>
      </div>

      <div>
        Date :
        ${formatMois(a.date)}
      </div>

      <div
        class="
          atelier-badge

          ${
            a.statut === "vendu"

              ? "badge-vendu"

              : a.statut === "repare"

              ? "badge-repare"

              : "badge-encours"
          }
        "
      >

        ${
          a.statut === "vendu"

            ? "💰 Vendu"

            : a.statut === "repare"

            ? "✅ Réparé"

            : "🔧 En cours"
        }

      </div>

    </div>

    <button
      id="btnModifierAppareil"
      class="modal-button"
    >
      Modifier
    </button>

    <button
      id="btnDeleteAppareil"
      class="modal-button delete-modal-btn"
    >
      Supprimer
    </button>

  `);

  // modifier
  document
    .getElementById("btnModifierAppareil")
    ?.addEventListener("click", () => {

      modifierAppareil(index);

    });

  // supprimer
  document
    .getElementById("btnDeleteAppareil")
    ?.addEventListener("click", () => {

      closeModal();

      supprimerAppareil(index);

    });

}

// =========================
// MODIFIER
// =========================

function modifierAppareil(index){

  const a =
    window.atelier[index];

  if(!a) return;

  openModal("Modifier appareil", `

    <input
      id="editAtelierNom"
      class="modal-input"
      value="${a.appareil}"
    >

    <input
      id="editAtelierAchat"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${a.achat}"
      placeholder="Prix achat"
    >

    <input
      id="editAtelierPieces"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${a.pieces}"
      placeholder="Coût pièces"
    >

    <input
      id="editAtelierFrais"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${a.frais || 0}"
      placeholder="Autres frais"
    >

    <input
      id="editAtelierVente"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${a.vente}"
      placeholder="Prix vente"
    >

    <select
      id="editAtelierStatut"
      class="modal-input"
    >

      <option
        value="encours"
        ${a.statut === "encours" ? "selected" : ""}
      >
        🔧 En cours
      </option>

      <option
        value="repare"
        ${a.statut === "repare" ? "selected" : ""}
      >
        ✅ Réparé
      </option>

      <option
        value="vendu"
        ${a.statut === "vendu" ? "selected" : ""}
      >
        💰 Vendu
      </option>

    </select>

    <button
      id="btnSaveAppareil"
      class="modal-button"
    >
      Enregistrer
    </button>

  `);

  // focus iPhone
  setTimeout(() => {

    document
      .getElementById("editAtelierNom")
      ?.focus();

  }, 120);

  // save
  document
    .getElementById("btnSaveAppareil")
    ?.addEventListener("click", () => {

      const appareil =
        document
          .getElementById("editAtelierNom")
          ?.value
          .trim();

      const achat =
        parseFloat(
          document
            .getElementById("editAtelierAchat")
            ?.value
        ) || 0;

      const pieces =
        parseFloat(
          document
            .getElementById("editAtelierPieces")
            ?.value
        ) || 0;

      const frais =
        parseFloat(
          document
            .getElementById("editAtelierFrais")
            ?.value
        ) || 0;

      const vente =
        parseFloat(
          document
            .getElementById("editAtelierVente")
            ?.value
        ) || 0;

      const statut =
        document
          .getElementById("editAtelierStatut")
          ?.value || "encours";

      // validation
      if(
        !appareil ||
        vente <= 0
      ){

        showToast?.("⚠️ Valeurs invalides");

        return;

      }

      // update
      window.atelier[index] = {

        ...window.atelier[index],

        appareil,

        achat,

        pieces,

        frais,

        vente,

        statut

      };

      saveAll();

      refreshApp();

      closeModal();

      showToast?.("✏️ Appareil modifié");

    });

}

// =========================
// DELETE
// =========================

function supprimerAppareil(index){

  window.atelier.splice(index,1);

  saveAll();

  refreshApp();

  showToast?.("🗑️ Appareil supprimé");

}