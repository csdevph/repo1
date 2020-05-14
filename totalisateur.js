// 
const ligneArticle = [
    "<input class='btn_moins' type='button' value='-'>",
    "<input class='saisie qte' type='text' value='1' readonly>",
    "<input class='btn_plus' type='button' value='+'>",
    "<input class='saisie prix' type='text' inputmode='numeric' maxlength='4'>",
    "<input class='saisie reduc' type='text' inputmode='numeric' maxlength='2' placeholder='%'>",
    "<input class='cout' type='text' value='0.00' readonly>",
    "<span class='detail'></span>",
    "<input class='suppr' type='button' value='&#10060;'>"
]

const grille = document.querySelector("#grille");
const divTotal = document.querySelector("#total");

// ajouter();
document.querySelector('#ajouter').addEventListener('click', ajouter);

function ajouter() {
    // let frag = document.createDocumentFragment();
    let tr = document.createElement("div");
    tr.className = "item";

    let td = "";
    for (const el of ligneArticle) td += el;
    tr.innerHTML = td;

    tr.querySelector('.btn_moins').addEventListener('click', decrement);
    tr.querySelector('.btn_plus').addEventListener('click', increment);

    tr.querySelector('.suppr').addEventListener('click', supprim);

    const inputs = tr.querySelectorAll('.saisie');
    for (const el of inputs) {
        el.addEventListener("input", prixTotal)
    }
    grille.appendChild(tr);
    tr.querySelector(".prix").focus();
}

function prixTotal() {
    let article = this.parentElement;
    let suppr = article.querySelector('.suppr');
    let qte = +article.querySelector(".qte").value;
    let prix = +article.querySelector(".prix").value * qte;
    let reduc = +article.querySelector(".reduc").value;
    reduc = Math.round(prix * reduc / 100);
    let cout = prix - reduc;
    article.querySelector(".cout").value = (cout / 100).toFixed(2);
    if (reduc !== 0) {
        article.querySelector(".detail").textContent = prix / 100 + " - " + reduc / 100;
    } else {
        article.querySelector(".detail").textContent = "";
    }
    suppr.classList.toggle("invisible", prix !== 0 && !isNaN(prix));

    aPayer();
}

function aPayer() {
    let somme = 0;
    const couts = document.querySelectorAll(".cout");
    for (let coutArticle of couts) {
        somme += +coutArticle.value;
    }
    divTotal.innerHTML = somme.toFixed(2);
}

function decrement() {
    const e = this.parentElement.querySelector(".qte");
    if (e.value > 0) {
        e.value--;
        e.dispatchEvent(new Event("input"));
    }
}

function increment() {
    const e = this.parentElement.querySelector(".qte");
    if (e.value < 6) {
        e.value++;
        e.dispatchEvent(new Event("input"));
    }
}

function supprim() {
    let tr = this.parentElement;
    tr.parentElement.removeChild(tr);
    aPayer();
}
