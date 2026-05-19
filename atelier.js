console.log("atelier.js READY ✅");

// =========================
// DATA
// =========================

window.atelier =
  window.atelier || [];

// =========================
// CALCULS
// =========================

function calculMarge(appareil){

  return (
    (Number(appareil.vente) || 0)

    -

    (Number(appareil.achat) || 0)

    -

    (Number(appareil.pieces) || 0)
  );

}

function getTotalMarge(){

  return window.atelier.reduce(

    (sum, a) =>

      sum + calculMarge(a),

    0

  );

}

function getTotalAppareils(){

  return window.atelier.length;

}

function getMargeMoyenne(){

  if(!window.atelier.length) return 0;

  return (
    getTotalMarge() /
    window.atelier.length
  );

}

function calculCoutTotal(appareil){

  return (
    (Number(appareil.achat) || 0)
    +
    (Number(appareil.pieces) || 0)
    +
    (Number(appareil.frais) || 0)
  );

}

// =========================
// COULEURS MARGE
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
// RENDER
// =========================

function getAppareilIcon(nom){

  const n =
    nom.toLowerCase();

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

function renderAtelier(){

  const list =
    document.getElementById("atelierList");

  if(!list) return;

  list.innerHTML = "";

  // sécurité
  if(!Array.isArray(window.atelier)){
    window.atelier = [];
  }

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

  // render appareils
  [...window.atelier]

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
        
        row.addEventListener("click", () => {

  modifierAppareil(realIndex);

});

      row.className =
        "atelier-card";

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

        <div class="atelier-details">

          <div>
            Achat :
            ${euro(a.achat)}
          </div>

          <div>
            Pièces :
            ${euro(a.pieces)}
          </div>

          <div>
            Vente :
            ${euro(a.vente)}
          </div>

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

const statut =
  document
    .getElementById("atelierStatut")
    ?.value || "encours";

  const vente =
    parseFloat(
      document
        .getElementById("atelierVente")
        ?.value
    ) || 0;

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

  date: getMoisActuel()

});

  saveAll();

  renderAtelier();

  closeModal();

  showToast?.("🛠️ Appareil ajouté");

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
      id="editAtelierVente"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${a.vente}"
      placeholder="Prix vente"
    >

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

      const vente =
        parseFloat(
          document
            .getElementById("editAtelierVente")
            ?.value
        ) || 0;

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

        vente

      };

      saveAll();

      renderAtelier();

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

  renderAtelier();

  showToast?.("🗑️ Appareil supprimé");

}