// 
const cartItems = document.querySelector("#cart_items");
const cartTotal = document.querySelector("#cart_total");
document.querySelector('#add_item').addEventListener('click', () => {
    const lastItem = cartItems.lastElementChild;
    if (lastItem) {
        // Pas de nouvelle ligne si la dernière est vide
        if (lastItem.querySelector('.price').value === "" && lastItem.querySelector('.discount').value === "") {
            lastItem.querySelector('.price').focus();
            return;
        }
    }
    addItem();
});
document.querySelector('header').addEventListener('click', () => { window.scrollTo(0, 0) });
document.querySelector('footer').addEventListener('click', () => { window.scrollTo(0, document.body.scrollHeight) });

const newItem = (function () {      // fonction auto-invoquée IIFE et closure
    const itemTags = [
        "<button class='btn_remove' type='button'>&times;</button>",
        "<button class='btn_minus' type='button'>&minus;</button>",
        "<input class='edit qty' type='text' value='1' readonly>",
        "<button class='btn_plus' type='button'>&plus;</button>",
        "<input class='edit price currency' type='text' inputmode='numeric' maxlength='5'>",
        "<input class='edit discount' type='text' inputmode='numeric' maxlength='2' placeholder='%'>",
        "<input class='cost currency' type='text' value='0.00' readonly>",
        "<span class='detail'></span>"
    ]
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = itemTags.join("");
    return () => { return el.cloneNode(true) };    // closure
})();   // IIFE : ne pas oublier les ()

function addItem() {
    const itemNode = newItem();

    itemNode.querySelector('.btn_minus').addEventListener('click', decrementQty);
    itemNode.querySelector('.btn_plus').addEventListener('click', incrementQty);
    itemNode.querySelector('.btn_remove').addEventListener('click', removeItem);

    itemNode.querySelector('.price').addEventListener('input', formatPrice);
    itemNode.querySelectorAll('.edit').forEach(
        (el) => { el.addEventListener("input", updateItemTotal) }
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
    save();
}

function decrementQty() {
    const el = this.parentElement.querySelector(".qty");
    if (el.value > 0) {
        el.value--;
        el.dispatchEvent(new Event("input"));
    }
}

function incrementQty() {
    const el = this.parentElement.querySelector(".qty");
    if (el.value < 6) {
        el.value++;
        el.dispatchEvent(new Event("input"));
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

function save() {
    let inputs = Array.from(document.querySelectorAll('.edit'));
    localStorage.setItem("cart", JSON.stringify(inputs.map(v => v.value)));
}

function retrieve() {
    try {
        const data = JSON.parse(localStorage.getItem("cart"));
        const dataCount = data.length;      // 3 valeurs par item
        if (isNaN(dataCount) || dataCount % 3) { throw ("Invalid data") }
        for (let index = 0; index < dataCount / 3; index++) { addItem() }
        const inputs = Array.from(document.querySelectorAll('.edit'));
        for (let index = 0; index < dataCount; index++) {
            inputs[index].value = data[index];
        }
        document.querySelectorAll(".price").forEach((z) => { z.dispatchEvent(new Event("input")) });
    } catch (error) {
        console.warn("Local storage.", error);
        for (let index = 0; index < 10; index++) { addItem() }  // Items disponibles initialement
    }
}

retrieve();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/repo1/sw.js")
            // .then(reg => console.log("Registration succeeded. Scope is " + reg.scope))
            .catch(error => alert("Registration failed with " + error));
    });
}
