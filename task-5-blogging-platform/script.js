const filterButtons = document.querySelectorAll(".filter-button");
const articleCards = document.querySelectorAll(".article-card");
const emptyState = document.getElementById("emptyState");

const articleDialog = document.getElementById("articleDialog");
const dialogCategory = document.getElementById("dialogCategory");
const dialogTitle = document.getElementById("dialogTitle");
const dialogBody = document.getElementById("dialogBody");

const closeDialog = document.getElementById("closeDialog");
const dialogDone = document.getElementById("dialogDone");
const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.category;
        let visibleCount = 0;

        filterButtons.forEach(item => {
            const isActive = item === button;
            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        articleCards.forEach(card => {
            const matchesCategory =
                selectedCategory === "All" ||
                card.dataset.category === selectedCategory;

            card.hidden = !matchesCategory;

            if (matchesCategory) {
                visibleCount += 1;
            }
        });

        emptyState.hidden = visibleCount !== 0;
    });
});

document.querySelectorAll(".read-link").forEach(button => {
    button.addEventListener("click", () => {
        dialogTitle.textContent = button.dataset.title;
        dialogCategory.textContent = button.dataset.category;
        dialogBody.textContent = button.dataset.body;

        if (typeof articleDialog.showModal === "function") {
            articleDialog.showModal();
        }
    });
});

function closeArticleDialog() {
    if (articleDialog.open) {
        articleDialog.close();
    }
}

closeDialog.addEventListener("click", closeArticleDialog);
dialogDone.addEventListener("click", closeArticleDialog);

articleDialog.addEventListener("click", event => {
    if (event.target === articleDialog) {
        closeArticleDialog();
    }
});
