import * as Templates from "./templates.js";

let closeOnOutsideClick = false;
let isOpen = false;
let modalCloseHandler = null;

/**
 * Closes the current modal, if any. Calls the onModalClosed function if one was
 * provided when opening the modal.
 *
 * @returns {DOMElement?} The contents of the modal, or null if no modal was open.
 */
function close() {
    if (!isOpen) {
        return null;
    }

    const contents = document.getElementById("modal-contents").firstChild;

    document.body.classList.remove("modal");
    document.getElementById("modal-container").classList.add("hidden-collapse");

    isOpen = false;
    closeOnOutsideClick = false;

    if (modalCloseHandler) {
        modalCloseHandler(contents);

        modalCloseHandler = null;
    }

    return contents;
}

/**
 * Opens a modal dialog that asks the user to confirm a choice they've made.
 */
async function confirm(prompt, title, trueLabel, falseLabel) {
    trueLabel = trueLabel || "Confirm";
    falseLabel = falseLabel || "Cancel";

    const template = await Templates.instantiateTemplate("assets/html/templates/widgets/modal.html", "template-confirm-modal");
    template.querySelector("#modal-content").textContent = prompt;
    template.querySelector("#modal-title").textContent = title;

    const confirmButton = template.querySelector("#modal-confirm");
    confirmButton.textContent = trueLabel;

    const cancelButton = template.querySelector("#modal-cancel");
    cancelButton.textContent = falseLabel;

    open(template);

    return new Promise(resolve => {
        confirmButton.addEventListener("click", () => { close(); resolve(true); } );
        cancelButton.addEventListener("click", () => { close(); resolve(false); } );
    });
}

function isAnyModalOpen() {
    return isOpen;
}

async function message(content, title) {
    const template = await Templates.instantiateTemplate("assets/html/templates/widgets/modal.html", "template-message-modal");
    template.querySelector("#modal-content").innerHTML = content;
    template.querySelector("#modal-title").textContent = title;

    const closeButton = template.querySelector("#modal-close");
    closeButton.addEventListener("click", close);

    open(template, null, true);
}

/**
 * Opens a new model with the given contents, disabling the rest of the application in the process.
 *
 * @param {DOMElement} contents A DOMElement to place into the modal body.
 * @param {Function<DOMElement>?} onModalClosed A callback for when the modal is closed, receiving as its only argument
 *                                              the DOMElement which was originally provided.
 * @param {Boolean} closeModalOnOutsideClick If true, the modal will close if a click occurs outside of its bounds.
 */
function open(contents, onModalClosed, closeModalOnOutsideClick) {
    if (isAnyModalOpen()) {
        console.error("Attempting to open a modal while one is already open");
        return;
    }

    document.body.classList.add("modal");
    document.getElementById("modal-contents").replaceChildren(contents);
    document.getElementById("modal-container").classList.remove("hidden-collapse");

    isOpen = true;
    modalCloseHandler = onModalClosed;
    closeOnOutsideClick = !!closeModalOnOutsideClick;
}

document.getElementById("modal-background").addEventListener("click", () => {
    if (closeOnOutsideClick) {
        close();
    }
});

export { close, confirm, isAnyModalOpen, message, open };