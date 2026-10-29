const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    formStatus.className = "form-status";
    formStatus.textContent = "";

    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        formStatus.classList.add("error");
        formStatus.textContent = "Please check the required fields and try again.";
        return;
    }

    const formData = new FormData(contactForm);
    const fullName = String(formData.get("fullName") || "").trim();

    if (fullName.length < 2) {
        formStatus.classList.add("error");
        formStatus.textContent = "Please enter a name with at least two characters.";
        document.getElementById("fullName").focus();
        return;
    }

    formStatus.classList.add("success");
    formStatus.textContent =
        "Thank you, " + fullName + ". The demo form was validated successfully. Nothing was sent.";

    contactForm.reset();
});
