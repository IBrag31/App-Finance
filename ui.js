function showToast(message){

const toast = document.getElementById("toast");
if(!toast) return;

toast.innerText = message;
toast.style.opacity = "1";

setTimeout(()=>{
toast.style.opacity = "0";
},1500);

}

function showSection(name, element){

document.querySelectorAll(".section")
.forEach(sec => sec.classList.remove("active"));

document.querySelectorAll(".tab")
.forEach(tab => tab.classList.remove("active"));

document.getElementById("section-"+name)?.classList.add("active");

element?.classList.add("active");

}

function goToSection(index){

const sections = ["budget","objectifs","historique","sauvegarde"];

document.querySelectorAll(".section")
.forEach(sec => sec.classList.remove("active"));

document.querySelectorAll(".tab")
.forEach(tab => tab.classList.remove("active"));

document.getElementById("section-"+sections[index])?.classList.add("active");

document.querySelectorAll(".tab")[index]?.classList.add("active");

}

function ouvrirModal(){
document.getElementById("depenseModal")?.classList.add("show");
}

function fermerModal(){
document.getElementById("depenseModal")?.classList.remove("show");
}

function ouvrirModalRevenu(){
document.getElementById("revenuModal")?.classList.add("show");
}

function fermerModalRevenu(){
document.getElementById("revenuModal")?.classList.remove("show");
}
