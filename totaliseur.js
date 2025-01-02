//
const Numboard = {
    cartItems: null,
    cartTotal: null,
    clearBtn: null,

    init() {
        this.cartItems = document.querySelector("#cart_items");
        this.cartTotal = document.querySelector("#cart_total");
        this.clearBtn = document.querySelector("#cart_total+button");

        document.querySelector('header').addEventListener('click', () => { window.scrollTo(0, 0) });
        // document.querySelector('footer').addEventListener('click', () => { window.scrollTo(0, document.body.scrollHeight) });

        this.clearBtn.addEventListener('click', () => { localStorage.clear(); location.reload() });
    },

    addItemHandler(e) {
        const lastItem = Numboard.cartItems.lastElementChild;
        if (!lastItem
            || lastItem.querySelector('.price').value !== ""
            || lastItem.querySelector('.discount').value !== "") Numboard.addItem();

        Numboard.cartItems.lastElementChild.querySelector('.price').focus();
        Numboard.cartItems.lastElementChild.querySelector('.price').click();
        e.stopPropagation();
    },

    _newItem:
        (function () {      // fonction auto-invoquée IIFE et closure
            const ico = "<svg class='fill-red-600 size-6 m-auto'><use href='sprite.svg#clear'></use></svg>";
            const itemTags = [
                "<button class='btn_remove' type='button'>" + ico + "</button>",
                "<input class='edit use-keyboard qty' type='text' value='1' readonly maxlength='1'>",
                "<input class='edit use-keyboard price currency' type='text' inputmode='numeric' maxlength='5'>",
                "<input class='edit use-keyboard discount' type='text' inputmode='numeric' maxlength='5' placeholder='%'>",
                "<input class='cost currency' type='text' value='0.00' readonly>",
                "<span class='detail'></span>"
            ]
            const el = document.createElement("div");
            el.className = "item flex justify-center";
            el.innerHTML = itemTags.join("");
            return () => { return el.cloneNode(true) };    // closure
        })()    // IIFE : ne pas oublier les ()
    ,

    addItem() {
        const itemNode = this._newItem();

        itemNode.querySelector('.btn_remove').addEventListener('click', this.removeItem);

        itemNode.querySelector('.price').addEventListener('input', this.formatPrice);
        itemNode.querySelectorAll('.edit').forEach(
            (el) => { el.addEventListener("input", this.updateItemTotal) }
        );

        this.cartItems.appendChild(itemNode);
    },

    updateItemTotal() {
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
        Numboard._updateCartPrice();
    },

    _updateCartPrice() {
        let amount = 0;
        const allPrices = document.querySelectorAll(".cost");
        for (let price of allPrices) {
            amount += +price.value;
        }
        this.cartTotal.value = amount.toFixed(2);
        this.cartItems.dispatchEvent(new Event("revised"));
    },

    decrementQty() {
        const el = this.parentElement.querySelector(".qty");
        if (el.value > 0) {
            el.value--;
            el.dispatchEvent(new Event("input"));
        }
    },

    incrementQty() {
        const el = this.parentElement.querySelector(".qty");
        if (el.value < 6) {
            el.value++;
            el.dispatchEvent(new Event("input"));
        }
    },

    formatPrice() {
        this.value = this.value.replace(/\D/g, "")  // uniquement des chiffres
            .replace(/^0+/, "")                     // pas de zéro en tête
            .replace(/^(\d)$/, "0$1")               // 2 digits au minimun
            .replace(/(\d*)(\d\d)/, "$1.$2");       // format 9.99
    },

    removeItem() {
        const itemNode = this.parentElement;
        itemNode.parentElement.removeChild(itemNode);
        Numboard._updateCartPrice();
    }
}

const Histo = {
    save() {
        let inputs = Array.from(document.querySelectorAll('.edit'));
        localStorage.setItem("cart", JSON.stringify(inputs.map(v => v.value)));
    },

    retrieve() {
        try {
            const data = JSON.parse(localStorage.getItem("cart"));
            const dataCount = data.length;      // 3 valeurs par item
            if (isNaN(dataCount) || dataCount % 3) { throw ("Invalid data") }
            for (let index = 0; index < dataCount / 3; index++) { Numboard.addItem() }
            const inputs = Array.from(document.querySelectorAll('.edit'));
            for (let index = 0; index < dataCount; index++) {
                inputs[index].value = data[index];
            }
            document.querySelectorAll(".price").forEach((z) => { z.dispatchEvent(new Event("input")) });
        } catch (error) {
            console.warn("Local storage.", error);
            Numboard.cartTotal.value = "0.00";
            for (let index = 0; index < 10; index++) { Numboard.addItem() }  // Items disponibles initialement
        }
    }
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/repo1/sw.js")
            // .then(reg => console.log("Registration succeeded. Scope is " + reg.scope))
            .catch(error => alert("Registration failed with " + error));
    });
}