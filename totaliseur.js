// 
const cartItems = document.querySelector("#cart_items");
const cartTotal = document.querySelector("#cart_total");
document.querySelector('#add_item').addEventListener('click', addItem);
document.querySelector('header').addEventListener('click', () => { window.scrollTo(0, 0) });
document.querySelector('footer').addEventListener('click', () => { window.scrollTo(0, document.body.scrollHeight) });

const newItem = (function () {      // fonction auto-invoquée IIFE et closure
    const itemTags = [
        "<button class='btn_minus' type='button'>&minus;</button>",
        "<input class='edit qty' type='text' value='1' readonly>",
        "<button class='btn_plus' type='button'>&plus;</button>",
        "<input class='edit price currency' type='text' inputmode='numeric' maxlength='5'>",
        "<input class='edit discount' type='text' inputmode='numeric' maxlength='2' placeholder='%'>",
        "<input class='cost currency' type='text' value='0.00' readonly>",
        "<span class='detail'></span>",
        "<button class='btn_remove' type='button'>&times;</button>"
    ]
    const e = document.createElement("div");
    e.className = "item";
    e.innerHTML = itemTags.join("");
    return () => { return e.cloneNode(true) };    // closure
})();   // IIFE : ne pas oublier les ()

function addItem() {
    const itemNode = newItem();

    itemNode.querySelector('.btn_minus').addEventListener('click', decrementQty);
    itemNode.querySelector('.btn_plus').addEventListener('click', incrementQty);
    itemNode.querySelector('.btn_remove').addEventListener('click', removeItem);

    itemNode.querySelector('.price').addEventListener('input', formatPrice);
    itemNode.querySelectorAll('.edit').forEach(
        (e) => { e.addEventListener("input", updateItemTotal) }
    );

    cartItems.appendChild(itemNode);
    itemNode.querySelector(".price").focus();
}

function updateItemTotal() {
    const itemRow = this.parentElement;
    const removeButton = itemRow.querySelector('.btn_remove');
    const qty = +itemRow.querySelector(".qty").value;
    const totalPrice = +itemRow.querySelector(".price").value * qty;
    const discountRate = +itemRow.querySelector(".discount").value / 100;
    const priceCut = +(totalPrice * discountRate).toFixed(2);
    const costPrice = totalPrice - priceCut;

    itemRow.querySelector(".cost").value = costPrice.toFixed(2);
    if (priceCut !== 0) {
        itemRow.querySelector(".detail").textContent = totalPrice.toFixed(2) + " - " + priceCut.toFixed(2);
    } else {
        itemRow.querySelector(".detail").textContent = "";
    }
    removeButton.disabled = totalPrice !== 0;

    updateCartPrice();
}

function updateCartPrice() {
    let amount = 0;
    const allPrices = document.querySelectorAll(".cost");
    for (let price of allPrices) {
        amount += +price.value;
    }
    cartTotal.innerHTML = amount.toFixed(2);
}

function decrementQty() {
    const e = this.parentElement.querySelector(".qty");
    if (e.value > 0) {
        e.value--;
        e.dispatchEvent(new Event("input"));
    }
}

function incrementQty() {
    const e = this.parentElement.querySelector(".qty");
    if (e.value < 6) {
        e.value++;
        e.dispatchEvent(new Event("input"));
    }
}

function formatPrice() {
    this.value = this.value.replace(/\D/g, "")  // uniquement des chiffres
        .replace(/^0+/, "")                     // pas de zéro en tête
        .replace(/^(\d)$/, "0$1")               // 2 digits au minimun
        .replace(/(\d*)(\d\d)/, "$1.$2");       // format 9.99
}

function removeItem() {
    const itemNode = this.parentElement;
    itemNode.parentElement.removeChild(itemNode);
    updateCartPrice();
}

for (let index = 0; index < 15; index++) {
    addItem();
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/repo1/sw.js")
            .then(reg => console.log("Registration succeeded. Scope is " + reg.scope))
            .catch(error => alert("Registration failed with " + error));
    });
}
