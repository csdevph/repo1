const Keyboard = {
    keyLayout: [
        ["7", "8", "9", "add"],
        ["4", "5", "6", "backspace"],
        ["1", "2", "3", "0"]
    ],

    functionKeyHandler: null,
    selectedTarget: null,

    init(inputContainer) {
        // Create keyboard elements
        const keysContainer = document.createElement("div");
        keysContainer.classList.add("mx-auto", "h-full", "w-11/12", "divide-y-2", "bg-slate-400");
        keysContainer.addEventListener("click", (e) => { e.stopPropagation() });
        keysContainer.appendChild(this._createKeys());
        document.body.lastElementChild.appendChild(keysContainer);

        document.addEventListener('click', this.unplug);

        document.querySelector(inputContainer).addEventListener('click', (event) => {
            if (!event.target.matches('.use-keyboard')) return;
            event.stopPropagation();
            event.target.readOnly = true;
            Keyboard.plugInto(event.target);
        });
        console.log("### Keyboard available now...");
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();

        this.keyLayout.forEach(keyRow => {
            const keyboardRow = document.createElement("div");
            keyboardRow.classList.add("flex", "h-1/3", "divide-x-2");
            keyRow.forEach(key => {
                const keyElement = document.createElement("button");

                // Add attributes/classes
                keyElement.setAttribute("type", "button");
                keyElement.classList.add("w-1/4");

                switch (key) {
                    case "backspace":
                        keyElement.innerHTML = createIconHTML("backspace");
                        keyElement.addEventListener("click", () => {
                            if (!this.selectedTarget) return;
                            this.selectedTarget.value = this.selectedTarget.value.substring(0, this.selectedTarget.value.length - 1);
                            this.triggerInputEvent();
                        });
                        break;

                    case "add":
                        keyElement.innerHTML = createIconHTML("add");
                        keyElement.addEventListener("click", this.functionKeyHandler);
                        break;

                    default:
                        keyElement.textContent = key;
                        keyElement.addEventListener("click", () => {
                            if (!this.selectedTarget) return;

                            // si on dépasse la taille maxi on remet le champ à vide 
                            if (this.selectedTarget.maxLength > 0 &&
                                this.selectedTarget.value.length >= this.selectedTarget.maxLength)
                                this.selectedTarget.value = "";

                            this.selectedTarget.value += key;
                            this.triggerInputEvent();
                        });
                        break;
                }
                keyboardRow.appendChild(keyElement)
                fragment.appendChild(keyboardRow);
            });
        });
        return fragment;
    },

    triggerInputEvent() {
        const evt = new InputEvent("input", {
            bubbles: true,      // default: false
            cancelable: true,   // default: false
            view: window        // default: null
        });

        if (!this.selectedTarget) return;
        this.selectedTarget.dispatchEvent(evt);
    },

    plugInto(target) {
        Keyboard.unplug();
        Keyboard.selectedTarget = target;
        Keyboard.selectedTarget.classList.add('bg-yellow-200', '[outline:auto]');
    },

    unplug() {
        if (Keyboard.selectedTarget)
            Keyboard.selectedTarget.classList.remove('bg-yellow-200', '[outline:auto]');
        Keyboard.selectedTarget = null;
    }
};

// Creates HTML for an icon
const createIconHTML = (icon_name) => {
    return `<svg class="fill-blue-800 size-6 m-auto"><title>${icon_name}</title><use href="sprite.svg#${icon_name}"></use></svg>`;
};
