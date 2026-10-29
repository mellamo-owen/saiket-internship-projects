const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("primaryNavigation");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");

function setMenuOpen(isOpen) {
    navigation.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );
}

menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.contains("open");
    setMenuOpen(!isOpen);
});

navLinks.forEach(link => {
    link.addEventListener("click", () => {
        setMenuOpen(false);
    });
});

document.querySelectorAll(".navigation a").forEach(link => {
    link.addEventListener("click", () => {
        const targetId = link.getAttribute("href");

        if (!targetId || !targetId.startsWith("#")) {
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {
            navLinks.forEach(navLink => {
                navLink.classList.toggle(
                    "active",
                    navLink.getAttribute("href") === targetId
                );
            });
        }
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        setMenuOpen(false);
    }
});

document.addEventListener("click", event => {
    const clickedInsideNavigation = navigation.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNavigation && !clickedToggle) {
        setMenuOpen(false);
    }
});

function updateActiveSection() {
    let currentSection = "home";
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        if (scrollPosition >= section.offsetTop) {
            currentSection = section.id;
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + currentSection
        );
    });
}

window.addEventListener("scroll", updateActiveSection, { passive: true });

window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
        setMenuOpen(false);
    }
});

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

setMenuOpen(false);
updateActiveSection();
