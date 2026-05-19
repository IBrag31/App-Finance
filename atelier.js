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

    .reverse()

    .forEach((a, index) => {

      const marge =
        calculMarge(a);

      const row =
        document.createElement("div");

      row.className =
        "atelier-card";

      row.innerHTML = `

        <div class="atelier-top">

          <div class="atelier-title">

            📱 ${a.appareil}

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

          supprimerAppareil(index);

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

    vente,

    date: getMoisActuel()

  });

  saveAll();

  renderAtelier();

  closeModal();

  showToast?.("🛠️ Appareil ajouté");

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