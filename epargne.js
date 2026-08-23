console.log("epargne.js SYNC CLEAN ✅");

// =========================
// UTILS
// =========================

function formatMois(moisStr){

  const [annee, mois] =
    moisStr.split("-");

  const date =
    new Date(annee, mois - 1);

  let str =
    date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    });

  return (
    str.charAt(0).toUpperCase() +
    str.slice(1)
  );

}

// =========================
// CALCULS (GLOBAL)
// =========================

function getTotalEpargne(){

  if(!Array.isArray(window.epargneHistorique)){
    return 0;
  }

  return window.epargneHistorique.reduce(
    (sum, e) => {

      const montant =
        Number(e.montant) || 0;

      return e.type === "retrait"
        ? sum - montant
        : sum + montant;

    },
    0
  );

}

function getEpargneDuMois(mois){

  if(!Array.isArray(window.epargneHistorique)){
    return 0;
  }

  return window.epargneHistorique
    .filter(e => e.mois === mois)
    .reduce(
      (sum, e) => {

        const montant =
          Number(e.montant) || 0;

        return e.type === "retrait"
          ? sum - montant
          : sum + montant;

      },
      0
    );

}

// =========================
// RENDER HISTORIQUE
// =========================

function renderEpargneHistorique(){

  const list =
    document.getElementById(
      "epargneHistoriqueList"
    );

  if(!list) return;

  list.innerHTML = "";

  // sécurité
  if(!Array.isArray(window.epargneHistorique)){
    window.epargneHistorique = [];
  }

  let total = 0;

  [...window.epargneHistorique]

    .forEach((e) => {

      const montant =
  Number(e.montant) || 0;

const estRetrait =
  e.type === "retrait";

total += estRetrait
  ? -montant
  : montant;

      const row =
        document.createElement("div");

      row.className =
  "epargne-row swipe-card";

      const realIndex =
        window.epargneHistorique.indexOf(e);

      // clic modification
      row.addEventListener("click", () => {

  if(
    row.classList.contains("swiped")
  ){
    return;
  }

  modifierEpargne(realIndex);

});

      row.innerHTML = `

<div class="epargne-actions">

  <button
    class="epargne-edit"
  >
    Modifier
  </button>

  <button
    class="epargne-delete"
  >
    Supprimer
  </button>

</div>

<div class="epargne-content">

  <div style="flex:1">

    <div>
  ${formatMois(e.mois)}
</div>

${estRetrait && e.motif ? `
  <div style="
    opacity:0.75;
    font-size:13px;
    margin-top:3px;
  ">
    ${e.motif}
  </div>
` : ""}

<div style="
  opacity:0.8;
  font-size:13px;
  color:${estRetrait ? "#f97316" : "#3b82f6"};
  margin-top:2px;
">

  ${estRetrait ? "−" : "+"}${euro(montant)}

</div>

  </div>

</div>

`;

      // suppression sécurisée
      row
  .querySelector(".epargne-edit")
  ?.addEventListener("click", (e) => {

    e.stopPropagation();

    modifierEpargne(realIndex);

  });

row
  .querySelector(".epargne-delete")
  ?.addEventListener("click", (e) => {

    e.stopPropagation();

    if(
      confirm(
  e.type === "retrait"
    ? "Supprimer ce retrait ?"
    : "Supprimer ce versement ?"
)
    ){

      supprimerEpargne(
        realIndex
      );

    }

  });
  
  const content =
  row.querySelector(
    ".epargne-content"
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
          ".epargne-row"
        )
        .forEach(c => {

          c.classList.remove(
            "swiped"
          );

          c.querySelector(
            ".epargne-content"
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

      list.appendChild(row);

    });

  setText(
    "epargneHistoriqueTotal",
    total ? euro(total) : "—"
  );

  document
    .getElementById("epargneHistoriqueTotal")
    ?.style.setProperty(
      "color",
      "#3b82f6"
    );

}

// =========================
// RENDER MOIS
// =========================

function renderEpargneMois(){

  const el =
    document.getElementById(
      "epargneMoisPage"
    );

  if(!el) return;

  const mois =
  getMoisBudget();

  const total =
    getEpargneDuMois(mois);

  el.innerText = euro(total);

  el.style.color =
    "var(--color-epargne)";

}

// =========================
// MODAL
// =========================

function openAddVersementEpargne(){

  openModal("Ajouter épargne", `

    <input
      id="epargneMontant"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Montant"
    >

    <input
      id="epargneMois"
      class="modal-input"
      type="month"
      value="${getMoisBudget()}"
    >

    <button
      id="btnSaveEpargne"
      class="modal-button"
    >
      Ajouter
    </button>

  `);

  document
    .getElementById("btnSaveEpargne")
    ?.addEventListener("click", validerEpargne);

}

function openRetraitEpargne(){

  openModal("Retirer de l'épargne", `

    <input
      id="retraitEpargneMotif"
      class="modal-input"
      type="text"
      placeholder="Motif du retrait"
    >

    <input
      id="retraitEpargneMontant"
      class="modal-input"
      type="number"
      inputmode="decimal"
      placeholder="Montant"
    >

    <input
      id="retraitEpargneMois"
      class="modal-input"
      type="month"
      value="${getMoisBudget()}"
    >

    <button
      id="btnRetraitEpargne"
      class="modal-button"
    >
      Retirer
    </button>

  `);

  document
    .getElementById("btnRetraitEpargne")
    ?.addEventListener(
      "click",
      validerRetraitEpargne
    );

}
// =========================
// CRUD (SYNC GLOBAL)
// =========================

function validerEpargne(){

  const montant =
    parseFloat(

      document
        .getElementById("epargneMontant")
        ?.value

    );

  const mois =
  document
    .getElementById("epargneMois")
    ?.value;

if(!mois){

  showToast?.("⚠️ Mois invalide");

  return;

}

  // validation
  if(isNaN(montant) || montant <= 0){

    showToast?.("⚠️ Montant invalide");

    return;

  }

  // sécurité
  if(!Array.isArray(window.epargneHistorique)){
    window.epargneHistorique = [];
  }

  // ajout
  window.epargneHistorique.push({

  id: Date.now(),

  type: "versement",

  montant:
    Math.round(montant * 100) / 100,

  mois

});

  saveAll();

  refreshApp();

  closeModal();

  showToast?.("💶 Épargne ajoutée");

}

function validerRetraitEpargne(){

  const motif =
    document
      .getElementById("retraitEpargneMotif")
      ?.value
      .trim();

  const montant =
    parseFloat(
      document
        .getElementById("retraitEpargneMontant")
        ?.value
    );

  const mois =
    document
      .getElementById("retraitEpargneMois")
      ?.value;

  // validation motif
  if(!motif){

    showToast?.("⚠️ Motif du retrait obligatoire");

    return;

  }

  // validation montant
  if(isNaN(montant) || montant <= 0){

    showToast?.("⚠️ Montant invalide");

    return;

  }

  // validation mois
  if(!mois){

    showToast?.("⚠️ Mois invalide");

    return;

  }

  // sécurité
  if(!Array.isArray(window.epargneHistorique)){
    window.epargneHistorique = [];
  }

  const totalDisponible =
    getTotalEpargne();

  // impossible de retirer plus que l'épargne disponible
  if(montant > totalDisponible){

    showToast?.(
      `⚠️ Épargne disponible : ${euro(totalDisponible)}`
    );

    return;

  }

  // ajout du retrait
  window.epargneHistorique.push({

    id: Date.now(),

    type: "retrait",

    motif,

    montant:
      Math.round(montant * 100) / 100,

    mois

  });

  saveAll();

  refreshApp();

  closeModal();

  showToast?.("💸 Retrait enregistré");

}

// =========================
// MODIFIER
// =========================

function modifierEpargne(index){

  const e =
    window.epargneHistorique[index];

  if(!e) return;

  openModal("Modifier épargne", `

    <input
      id="editEpargneMontant"
      class="modal-input"
      type="number"
      inputmode="decimal"
      value="${e.montant}"
    >

    <button
      id="btnSaveEpargne"
      class="modal-button"
    >
      Enregistrer
    </button>

  `);

  // focus iPhone
  setTimeout(() => {

    document
      .getElementById("editEpargneMontant")
      ?.focus();

  }, 120);

  // sauvegarde
  document
    .getElementById("btnSaveEpargne")
    ?.addEventListener("click", () => {

      const nouveauMontant =
        parseFloat(

          document
            .getElementById("editEpargneMontant")
            ?.value

        );

      // validation
      if(
        isNaN(nouveauMontant) ||
        nouveauMontant <= 0
      ){

        showToast?.("⚠️ Montant invalide");

        return;

      }

      // update
      window.epargneHistorique[index].montant =

        Math.round(nouveauMontant * 100) / 100;

      saveAll();

      refreshApp();

      closeModal();

      showToast?.("✏️ Épargne modifiée");

    });

}

// =========================
// SUPPRIMER
// =========================

function supprimerEpargne(index){

  window.epargneHistorique.splice(index,1);

  saveAll();

  refreshApp();

  showToast?.("🗑️ Épargne supprimée");

}

function openAddObjectifEpargne(){

  openModal("Nouvel objectif", `

    <input
      id="objectifEmoji"
      class="modal-input"
      placeholder="🎯"
      maxlength="6"
    >

    <input
      id="objectifNom"
      class="modal-input"
      placeholder="Nom de l'objectif"
    >

    <input
      id="objectifCible"
      class="modal-input"
      type="number"
      placeholder="Montant cible"
    >

    <button
      id="btnSaveObjectif"
      class="modal-button"
    >
      Créer
    </button>

  `);

  document
    .getElementById("btnSaveObjectif")
    ?.addEventListener("click", () => {

      const emoji =
        document.getElementById("objectifEmoji")?.value || "🎯";

      const nom =
        document.getElementById("objectifNom")?.value?.trim();

      const cible =
        parseFloat(
          document.getElementById("objectifCible")?.value
        );

      if(!nom || isNaN(cible) || cible <= 0){

        showToast?.("⚠️ Données invalides");

        return;

      }

      if(!Array.isArray(window.objectifsEpargne)){
        window.objectifsEpargne = [];
      }

      window.objectifsEpargne.push({

        id: Date.now(),

        emoji,

        nom,

        cible,

        montant: 0

      });

      saveAll();

      refreshApp();

      closeModal();

      showToast?.("🎯 Objectif créé");

    });

}

function toggleEpargneMenu(){

  const menu =
    document.getElementById(
      "epargneQuickMenu"
    );

  if(!menu) return;

  menu.classList.toggle("show");

}

document.addEventListener(
  "click",
  (e) => {

    const menu =
      document.getElementById(
        "epargneQuickMenu"
      );

    const wrapper =
      document.querySelector(
        ".epargne-add-wrapper"
      );

    if(
      menu &&
      wrapper &&
      !wrapper.contains(e.target)
    ){

      menu.classList.remove("show");

    }

  }
);

function renderObjectifsEpargne(){

  const list =
    document.getElementById(
      "objectifsEpargneList"
    );

  if(!list) return;

  list.innerHTML = "";

  if(!Array.isArray(window.objectifsEpargne)){
    window.objectifsEpargne = [];
  }

  window.objectifsEpargne.forEach(obj => {

    const pourcentage =
      Math.min(
        100,
        Math.round(
          (obj.montant / obj.cible) * 100
        )
      );

    const card =
      document.createElement("div");

    card.className =
      "card objectif-card";

    card.innerHTML = `

  <div class="objectif-actions">

    <button
  class="objectif-edit"
  data-id="${obj.id}"
>
  Ajouter
</button>

    <button
      class="objectif-delete"
      data-id="${obj.id}"
    >
      Supprimer
    </button>

  </div>

  <div class="objectif-content">

    <div class="objectif-header">

      <div class="objectif-title">
        ${obj.emoji} ${obj.nom}
      </div>

    </div>

    <div class="objectif-amount">

      ${euro(obj.montant)}
      /
      ${euro(obj.cible)}

    </div>

    <div class="objectif-progress">

      <div
        class="objectif-fill"
        style="
          width:${pourcentage}%;
        "
      ></div>

    </div>

    <div class="objectif-percent">

      ${pourcentage} %

    </div>

  </div>

`;

    list.appendChild(card);
    
    card
  .querySelector(".objectif-delete")
  ?.addEventListener("click", () => {

    if(
      !confirm(
        `Supprimer "${obj.nom}" ?`
      )
    ){
      return;
    }

    window.objectifsEpargne =
      window.objectifsEpargne.filter(
        o => o.id !== obj.id
      );

    saveAll();

    refreshApp();

    showToast?.(
      "🗑️ Objectif supprimé"
    );

  });
  
  card
  .querySelector(".objectif-edit")
  ?.addEventListener("click", () => {

    ajouterObjectifEpargne(
      obj.id
    );

  });
    
    const content =
  card.querySelector(
    ".objectif-content"
  );

let startX = 0;

card.addEventListener(
  "touchstart",
  (e) => {

    startX =
      e.touches[0].clientX;

  }
);

card.addEventListener(
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
      ".objectif-card"
    )
    .forEach(c => {

      if(c !== card){

        c.classList.remove("swiped");

        c.querySelector(
          ".objectif-content"
        )?.classList.remove(
          "swiped"
        );

      }

    });

  card.classList.add("swiped");

  content.classList.add("swiped");

}

    // swipe droite
if(delta < -50){

  card.classList.remove(
    "swiped"
  );

  content.classList.remove(
    "swiped"
  );

}

  }
);

  });

}

function ajouterObjectifEpargne(id){

  const obj =
    window.objectifsEpargne.find(
      o => o.id === id
    );

  if(!obj) return;

  openModal(
    `Ajouter à ${obj.nom}`,
    `

    <input
      id="ajoutObjectifMontant"
      class="modal-input"
      type="number"
      placeholder="Montant"
    >

    <button
      id="btnAjoutObjectif"
      class="modal-button"
    >
      Ajouter
    </button>

    `
  );

  document
    .getElementById(
      "btnAjoutObjectif"
    )
    ?.addEventListener(
      "click",
      () => {

        const montant =
          parseFloat(
            document.getElementById(
              "ajoutObjectifMontant"
            ).value
          );

        if(
          isNaN(montant) ||
          montant <= 0
        ){
          showToast?.(
            "⚠️ Montant invalide"
          );
          return;
        }

        obj.montant =
  Math.round(
    (obj.montant + montant) * 100
  ) / 100;

        saveAll();

        refreshApp();

        closeModal();

        showToast?.(
          "💶 Objectif alimenté"
        );

      }
    );

}

document.addEventListener(
  "click",
  (e) => {

    if(
      !e.target.closest(
        ".epargne-row"
      )
    ){

      document
        .querySelectorAll(
          ".epargne-row"
        )
        .forEach(c => {

          c.classList.remove(
            "swiped"
          );

          c.querySelector(
            ".epargne-content"
          )?.classList.remove(
            "swiped"
          );

        });

    }

  }
);