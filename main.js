let globalStoreProducts = [
    { id: 1, title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops", price: 109.95, image: "https://unsplash.com" },
    { id: 2, title: "Mens Casual Premium Slim Fit T-Shirts", price: 22.30, image: "https://unsplash.com" },
    { id: 3, title: "Mens Cotton Jacket - Спортивна Куртка", price: 55.99, image: "https://unsplash.com" },
    { id: 4, title: "Mens Casual Slim Fit - Штани повсякденні", price: 15.99, image: "https://unsplash.com" },
    { id: 5, title: "Ноутбук Apple MacBook Pro 16", price: 2499.00, image: "https://unsplash.com" },
    { id: 6, title: "Смартфон Samsung Galaxy S24 Ultra", price: 1199.00, image: "https://unsplash.com" },
    { id: 7, title: "Навушники Sony WH-1000XM5", price: 349.99, image: "https://unsplash.com" },
    { id: 8, title: "Ігровий Монітор LG UltraGear 27", price: 299.50, image: "https://unsplash.com" },
    { id: 9, title: "Ігрова миша Razer DeathAdder Essential", price: 29.99, image: "https://unsplash.com" }
];
let cart = [];

const productsGrid = document.querySelector(".products-grid"); 
const cartButton = document.querySelector(".btn-cart"); 
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalSum = document.getElementById("cartTotalSum");
const cartCounter = document.querySelector(".cart-counter");
const favoritesZone = document.getElementById("favoritesZone");
const searchInput = document.getElementById('searchInput');
const searchResultCount = document.getElementById('searchResultCount');
const orderForm = document.getElementById('checkoutOrderForm');

function renderProducts(productsToDisplay) {
    if (!productsGrid) return;
    if (!productsToDisplay || productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p class="no-products" style="grid-column: 1/-1; text-align: center; color: #777; font-style: italic;">Товарів не знайдено</p>';
        return;
    }
    productsGrid.innerHTML = productsToDisplay.map(product => `
        <article class="product-card" draggable="true" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" draggable="false">
            <h3 title="${product.title}">${product.title}</h3>
            <p class="price">$${product.price}</p>
            <button class="btn-buy" data-id="${product.id}">Купити</button>
        </article>
    `).join("");
}

renderProducts(globalStoreProducts);

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const searchQuery = event.target.value.trim().toLowerCase();
        const matchedProducts = globalStoreProducts.filter(product => product.title.toLowerCase().includes(searchQuery));
        searchResultCount.textContent = searchQuery.length > 0 ? `Знайдено товарів: ${matchedProducts.length}` : '';
        renderProducts(matchedProducts);
    });
}

if (productsGrid) {
    productsGrid.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-buy")) {
            const productId = Number(event.target.dataset.id);
            const product = globalStoreProducts.find(p => p.id === productId);
            if (product) addToCart(product);
        }
    });

    productsGrid.addEventListener("dragstart", (event) => {
        const card = event.target.closest(".product-card");
        if (card) {
            event.dataTransfer.setData("text/plain", card.dataset.id);
            card.classList.add("dragging");
        }
    });

    productsGrid.addEventListener("dragend", (event) => {
        const card = event.target.closest(".product-card");
        if (card) card.classList.remove("dragging");
    });
}

if (favoritesZone) {
    favoritesZone.addEventListener("dragover", (event) => {
        event.preventDefault(); 
        favoritesZone.classList.add("drag-over");
    });
    favoritesZone.addEventListener("dragleave", () => {
        favoritesZone.classList.remove("drag-over"); 
    });
    favoritesZone.addEventListener("drop", (event) => {
        event.preventDefault();
        favoritesZone.classList.remove("drag-over");
        const productId = event.dataTransfer.getData("text/plain");
        const product = globalStoreProducts.find(p => p.id === Number(productId));
        if (product) {
            const shortTitle = product.title.length > 20 ? product.title.slice(0, 20) + "..." : product.title;
            favoritesZone.innerHTML += `<div class="fav-item" title="${product.title}">${shortTitle}</div>`;
        }
    });
}

function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartCounter) cartCounter.textContent = totalItems;
    if (cartTotalSum) cartTotalSum.textContent = subtotalSum.toFixed(2);
    return subtotalSum;
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartSummary();
}

if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(orderForm);
        const cleanName = (formData.get('clientName') || '').trim().replace(/\s+/g, ' ');
        const cleanPhone = (formData.get('clientPhone') || '').replaceAll(/[\s\(\)\-]/g, '');
        const cleanEmail = (formData.get('clientEmail') || '').trim().toLowerCase();
        const cleanPromo = (formData.get('orderPromo') || '').trim().toUpperCase();

        if (!validateCheckoutForm(cleanName, cleanPhone, cleanEmail)) return; 
        completeCheckoutProcess(cleanName, cleanPhone, cleanEmail, cleanPromo);
    });
}

function validateCheckoutForm(name, phone, email) {
    let isValid = true;
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('emailError').textContent = '';

    if (name.split(' ').filter(Boolean).length < 2 || name.length < 5) {
        document.getElementById('nameError').textContent = "Введіть повне ім'я та прізвище (щонайменше 2 слова).";
        isValid = false;
    }
    if (!/^\+?380\d{9}$/.test(phone)) {
        document.getElementById('phoneError').textContent = "Введіть коректний номер у форматі +380XXXXXXXXX.";
        isValid = false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        document.getElementById('emailError').textContent = "Введіть дійсну поштову адресу (наприклад, user@mail.com).";
        isValid = false;
    }
    return isValid;
}

function completeCheckoutProcess(name, phone, email, promo) {
    if (cart.length === 0) {
        alert("Ваш кошик порожній! Спочатку додайте товари до кошика.");
        return;
    }
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discountPercent = promo === 'SALE10' ? 10 : 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const finalAmount = Math.max(0, subtotal - discountAmount);

    const orderData = {
        customer: { name, phone, email },
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, quantity: item.quantity, total: (item.price * item.quantity).toFixed(2) })),
        summary: { subtotal: subtotal.toFixed(2), promoCode: promo || 'НЕМАЄ', discount: discountAmount.toFixed(2), finalPayable: finalAmount.toFixed(2) },
        createdAt: new Date().toISOString()
    };

    console.log("=== JSON PAYLOAD СФОРМОВАНО ДЛЯ СЕРВЕРА ===");
    console.log(JSON.stringify(orderData, null, 2));
    alert(`Дякуємо, ${name}! Замовлення оформлено.\nСума до сплати: $${finalAmount.toFixed(2)}`);

    cart = [];
    updateCartSummary();
    renderCartItems();
    if (cartOverlay) cartOverlay.classList.add("hidden");
    if (orderForm) orderForm.reset();
}

if (cartButton) cartButton.addEventListener("click", () => {
    if (cartOverlay) cartOverlay.classList.remove("hidden");
    renderCartItems();
});

if (closeBtn) closeBtn.addEventListener("click", () => {
    if (cartOverlay) cartOverlay.classList.add("hidden");
});

if (cartOverlay) {
    cartOverlay.addEventListener("click", (event) => {
        if (event.target === cartOverlay && cartOverlay) cartOverlay.classList.add("hidden");
    });
}

function renderCartItems() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p class='empty-message'>Кошик порожній.</p>";
        if (cartTotalSum) cartTotalSum.textContent = "0";
        return;
    }
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span class="cart-item-title">${item.title}</span>
            <span class="cart-item-price">$${item.price} x ${item.quantity}</span>
        </div>
    `).join("");
    updateCartSummary();
}
