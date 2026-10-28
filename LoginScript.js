
const loginModal = document.getElementById("loginModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");

let selectedAction = null;

function openLogin(action) {
    selectedAction = action;

    if (action === "create") {
        modalTitle.textContent = "Create your family tree.";
        modalDescription.textContent =
            "Sign in to start.";
    } else {
        modalTitle.textContent = "Welcome back.";
        modalDescription.textContent =
            "Sign in to access your existing family trees.";
    }

    loginModal.hidden = false;
    document.body.style.overflow = "hidden";

    loginModal.querySelector(".close-button").focus();
}

function closeLogin() {
    loginModal.hidden = true;
    document.body.style.overflow = "";
    selectedAction = null;
}

function closeLoginOutside(event) {
    if (event.target === loginModal) {
        closeLogin();
    }
}

function oauthPlaceholder() {
    if (!selectedAction) return;

    alert(
        "Required access for OAuth login.\n\n" +
        "Selected action: " +
        (selectedAction === "create"
            ? "Create a New Tree"
            : "Open an Existing Tree")
    );
}

// Allow users to close the modal using Escape.
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !loginModal.hidden) {
        closeLogin();
    }
});
