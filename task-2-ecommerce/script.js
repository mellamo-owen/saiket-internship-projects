const PRODUCT = {
    id: "novagear-backpack",
    name: "NovaGear Smart Laptop Backpack",
    price: 3499
};

const STORAGE_KEY = "novagear_cart";

const quantityDisplay = document.getElementById("quantity");
const selectedColorDisplay = document.getElementById("selectedColor");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const deliveryCost = document.getElementById("deliveryCost");
const cartTotal = document.getElementById("cartTotal");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const toast = document.getElementById("toast");

let quantity = 1;
let selectedColor = "Black";
let cart = loadCart();
let toastTimeout;

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.filter(item =>
            item &&
            typeof item.color === "string" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 99
        );
    } catch {
        return [];
    }
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatMoney(amount) {
    return "KSh " + amount.toLocaleString("en-KE");
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function updateQuantityDisplay() {
    quantityDisplay.textContent = quantity;
}

function setSelectedColor(color) {
    selectedColor = color;
    selectedColorDisplay.textContent = color;

    document.querySelectorAll(".color-button").forEach(button => {
        const isSelected = button.dataset.color === color;

        button.classList.toggle("selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
}

function addToCart(amount = quantity) {
    const existingItem = cart.find(item => item.color === selectedColor);

    if (existingItem) {
        if (existingItem.quantity + amount > 99) {
            showToast("Maximum quantity per colour is 99.");
            return;
        }

        existingItem.quantity += amount;
    } else {
        cart.push({
            productId: PRODUCT.id,
            name: PRODUCT.name,
            price: PRODUCT.price,
            color: selectedColor,
            quantity: amount
        });
    }

    saveCart();
    renderCart();
    showToast("Added to your cart.");
}

function changeCartQuantity(color, change) {
    const item = cart.find(entry => entry.color === color);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(entry => entry.color !== color);
    }

    saveCart();
    renderCart();
}

function removeCartItem(color) {
    cart = cart.filter(item => item.color !== color);

    saveCart();
    renderCart();
    showToast("Item removed from cart.");
}

function renderCart() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const delivery = subtotal === 0 || subtotal >= 5000 ? 0 : 250;
    const total = subtotal + delivery;

    cartCount.textContent = totalQuantity;
    cartSubtotal.textContent = formatMoney(subtotal);
    deliveryCost.textContent = formatMoney(delivery);
    cartTotal.textContent = formatMoney(total);

    cartItems.replaceChildren();

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "Your cart is empty.";
        cartItems.appendChild(emptyMessage);
        return;
    }

    cart.forEach(item => {
        const article = document.createElement("article");
        article.className = "cart-item";

        const details = document.createElement("div");

        const name = document.createElement("h3");
        name.textContent = item.name;

        const description = document.createElement("p");
        description.textContent = "Colour: " + item.color;

        const unitPrice = document.createElement("p");
        unitPrice.textContent = formatMoney(item.price) + " each";

        const actions = document.createElement("div");
        actions.className = "cart-item-actions";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute("aria-label", "Decrease " + item.color + " quantity");
        decreaseButton.addEventListener("click", () => {
            changeCartQuantity(item.color, -1);
        });

        const amount = document.createElement("span");
        amount.textContent = item.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", "Increase " + item.color + " quantity");
        increaseButton.addEventListener("click", () => {
            if (item.quantity >= 99) {
                showToast("Maximum quantity per colour is 99.");
                return;
            }

            changeCartQuantity(item.color, 1);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-item";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            removeCartItem(item.color);
        });

        actions.append(
            decreaseButton,
            amount,
            increaseButton,
            removeButton
        );

        details.append(name, description, unitPrice, actions);

        const lineTotal = document.createElement("strong");
        lineTotal.textContent = formatMoney(item.price * item.quantity);

        article.append(details, lineTotal);
        cartItems.appendChild(article);
    });
}

function openCart() {
    document.body.classList.add("cart-open");
    cartPanel.setAttribute("aria-hidden", "false");
    document.getElementById("closeCart").focus();
}

function closeCart() {
    document.body.classList.remove("cart-open");
    cartPanel.setAttribute("aria-hidden", "true");
    document.getElementById("openCart").focus();
}

document.getElementById("decreaseQuantity").addEventListener("click", () => {
    if (quantity > 1) {
        quantity--;
        updateQuantityDisplay();
    }
});

document.getElementById("increaseQuantity").addEventListener("click", () => {
    if (quantity < 99) {
        quantity++;
        updateQuantityDisplay();
    } else {
        showToast("Maximum quantity is 99.");
    }
});

document.querySelectorAll(".color-button").forEach(button => {
    button.addEventListener("click", () => {
        setSelectedColor(button.dataset.color);
    });
});

document.getElementById("addToCart").addEventListener("click", () => {
    addToCart(quantity);
});

document.getElementById("buyNow").addEventListener("click", () => {
    addToCart(quantity);
    openCart();
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("cart-open")) {
        closeCart();
    }
});

document.getElementById("checkoutButton").addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Add a product before proceeding to checkout.");
        return;
    }

    showToast("Demo checkout only. No payment has been collected.");
});

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

document.getElementById("currentYear").textContent = new Date().getFullYear();

setSelectedColor("Black");
updateQuantityDisplay();
renderCart();
