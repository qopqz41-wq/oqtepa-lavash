let products = [];
let catalogIsSynced = true;

// DOM elementlar
const productsGrid = document.getElementById('productsGrid');
const catalogNotice = document.getElementById('catalogNotice');
const categoryList = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const currentCategoryEl = document.getElementById('currentCategory');
const productCountEl = document.getElementById('productCount');
const noResults = document.getElementById('noResults');
const noResultsTitle = noResults.querySelector('h3');
const noResultsMessage = noResults.querySelector('p');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const closeModal = document.querySelector('.close-modal');
const addToCartButton = document.querySelector('.add-to-cart-btn');
const cartButton = document.querySelector('.cart-btn');
const cartCount = document.getElementById('cartCount');
const cartDialog = document.getElementById('cartDialog');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const checkoutDialog = document.getElementById('checkoutDialog');
const checkoutForm = document.getElementById('checkoutForm');
const orderPhone = document.getElementById('orderPhone');
const phoneError = document.getElementById('phoneError');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const checkoutError = document.getElementById('checkoutError');
const orderAddress = document.getElementById('orderAddress');
const addressError = document.getElementById('addressError');
const orderComment = document.getElementById('orderComment');
const promoCode = document.getElementById('promoCode');
const applyPromo = document.getElementById('applyPromo');
const promoMessage = document.getElementById('promoMessage');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryDiscount = document.getElementById('summaryDiscount');
const summaryTotal = document.getElementById('summaryTotal');
const discountRow = document.getElementById('discountRow');
const successOrderInfo = document.getElementById('successOrderInfo');
const successQr = document.getElementById('successQr');
const historyButton = document.getElementById('historyButton');
const historyDialog = document.getElementById('historyDialog');
const historyContent = document.getElementById('historyContent');
const adminLoginButton = document.getElementById('adminLoginButton');

let currentCategory = 'all';
let currentSearch = '';
const cart = new Map();
let selectedProduct = null;
let promoApplied = false;
const deliveryPrice = 20000;

async function loadProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('id,name,price,image,category_id,is_active,categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw error;
    products = (data || []).map(mapSupabaseProduct);
    catalogIsSynced = products.length > 0;
    if (!catalogIsSynced) {
        products = defaultProducts.map(product => ({ ...product }));
    }
    catalogNotice.hidden = catalogIsSynced;
}

function loadSavedCart() {
    try {
        const saved = JSON.parse(localStorage.getItem('oqtepaCart') || '[]');
        saved.forEach(item => {
            const product = products.find(productItem => String(productItem.id) === String(item.id));
            if (product && Number(item.quantity) > 0) {
                cart.set(product.id, { product, quantity: Number(item.quantity) });
            }
        });
    } catch {
        localStorage.removeItem('oqtepaCart');
    }
}

function saveCart() {
    const saved = Array.from(cart.entries()).map(([id, item]) => ({
        id,
        quantity: item.quantity
    }));
    localStorage.setItem('oqtepaCart', JSON.stringify(saved));
}

// Mahsulotlarni chiqarish
function renderProducts() {
    let filtered = products;

    // Kategoriya filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Qidiruv filter
    if (currentSearch.trim() !== '') {
        const term = currentSearch.toLowerCase().trim();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }

    // Natija yo'q bo'lsa
    if (filtered.length === 0) {
        productsGrid.innerHTML = '';
        noResults.style.display = 'block';
        productCountEl.textContent = '0 ta mahsulot';
        noResultsTitle.textContent = products.length === 0
            ? 'Katalogda hozircha mahsulot yo‘q'
            : 'Hech narsa topilmadi 😕';
        noResultsMessage.textContent = products.length === 0
            ? 'Supabase SQL Editor’da supabase-setup.sql faylini ishga tushiring — 33 ta menyu mahsuloti qo‘shiladi.'
            : 'Boshqa so‘z bilan qidirib ko‘ring';
        return;
    }

    noResults.style.display = 'none';
    productCountEl.textContent = `${filtered.length} ta mahsulot`;

    productsGrid.replaceChildren();
    filtered.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.dataset.id = product.id;

        const image = document.createElement('img');
        image.src = product.image;
        image.alt = product.name;
        image.className = 'product-image';
        image.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'product-info';
        const name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = product.name;
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = `${Number(product.price).toLocaleString('uz-UZ')} so‘m`;
        const category = document.createElement('span');
        category.className = 'product-category';
        category.textContent = getCategoryName(product.category);
        const footer = document.createElement('div');
        footer.className = 'product-card-footer';
        const details = document.createElement('div');
        details.className = 'product-card-details';
        details.append(price, category);
        const addButton = document.createElement('button');
        addButton.className = 'quick-add-btn';
        addButton.type = 'button';
        addButton.textContent = '+';
        addButton.setAttribute('aria-label', `${product.name}ni savatga qo‘shish`);
        addButton.addEventListener('click', event => {
            event.stopPropagation();
            const item = cart.get(product.id) || { product, quantity: 0 };
            item.quantity += 1;
            cart.set(product.id, item);
            renderCart();
            addButton.classList.add('added');
            window.setTimeout(() => addButton.classList.remove('added'), 450);
        });
        footer.append(details, addButton);
        info.append(name, footer);
        card.append(image, info);
        card.addEventListener('click', () => {
            openModal(product);
        });
        productsGrid.append(card);
    });
}

// Kategoriya nomini olish
function getCategoryName(category) {
    return getCatalogCategoryName(category);
}

// Modal ochish
function openModal(product) {
    selectedProduct = product;
    modalImage.src = product.image;
    modalTitle.textContent = product.name;
    modalPrice.textContent = product.price.toLocaleString() + " so'm";
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Modal yopish
function closeModalFunc() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

closeModal.addEventListener('click', closeModalFunc);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc();
});

function renderCart() {
    const totalCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
    saveCart();
    checkoutButton.hidden = cart.size === 0;
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Buyurtmani rasmiylashtirish';
    cartItems.replaceChildren();

    if (cart.size === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'cart-empty';
        emptyMessage.textContent = 'Savatchangiz hozircha bo‘sh.';
        cartItems.append(emptyMessage);
        cartTotal.textContent = '';
        return;
    }

    let totalPrice = 0;
    cart.forEach((item, id) => {
        totalPrice += item.product.price * item.quantity;

        const row = document.createElement('div');
        row.className = 'cart-item';

        const image = document.createElement('img');
        image.className = 'cart-item-image';
        image.src = item.product.image;
        image.alt = item.product.name;

        const details = document.createElement('div');
        details.className = 'cart-item-details';
        const name = document.createElement('strong');
        name.textContent = item.product.name;
        const price = document.createElement('span');
        price.textContent = `${item.product.price.toLocaleString()} so‘m`;
        details.append(name, price);

        const controls = document.createElement('div');
        controls.className = 'cart-item-controls';
        const decreaseButton = document.createElement('button');
        decreaseButton.type = 'button';
        decreaseButton.dataset.action = 'decrease';
        decreaseButton.dataset.id = id;
        decreaseButton.setAttribute('aria-label', `${item.product.name} sonini kamaytirish`);
        decreaseButton.textContent = '−';
        const quantity = document.createElement('span');
        quantity.textContent = item.quantity;
        const increaseButton = document.createElement('button');
        increaseButton.type = 'button';
        increaseButton.dataset.action = 'increase';
        increaseButton.dataset.id = id;
        increaseButton.setAttribute('aria-label', `${item.product.name} sonini oshirish`);
        increaseButton.textContent = '+';
        controls.append(decreaseButton, quantity, increaseButton);
        row.append(image, details, controls);
        cartItems.append(row);
    });

    cartTotal.textContent = `Jami: ${totalPrice.toLocaleString()} so‘m`;
}

addToCartButton.addEventListener('click', () => {
    if (!selectedProduct) return;

    const item = cart.get(selectedProduct.id) || { product: selectedProduct, quantity: 0 };
    item.quantity += 1;
    cart.set(selectedProduct.id, item);
    renderCart();
    closeModalFunc();
});

cartItems.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const item = cart.get(id);
    if (!item) return;

    if (button.dataset.action === 'increase') {
        item.quantity += 1;
    } else {
        item.quantity -= 1;
        if (item.quantity === 0) cart.delete(id);
    }
    renderCart();
});

cartButton.addEventListener('click', () => cartDialog.showModal());
document.getElementById('closeCart').addEventListener('click', () => cartDialog.close());
cartDialog.addEventListener('click', (event) => {
    if (event.target === cartDialog) cartDialog.close();
});
checkoutButton.addEventListener('click', () => {
    cartDialog.close();
    promoApplied = false;
    promoCode.value = '';
    promoMessage.textContent = '';
    promoMessage.className = 'promo-message';
    updateOrderSummary();
    checkoutDialog.showModal();
    orderPhone.focus();
});

function getCartSubtotal() {
    return Array.from(cart.values()).reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
}

function updateOrderSummary() {
    const subtotal = getCartSubtotal();
    const discount = promoApplied ? Math.round(subtotal * 0.10) : 0;
    summarySubtotal.textContent = `${subtotal.toLocaleString()} so‘m`;
    summaryDiscount.textContent = `−${discount.toLocaleString()} so‘m`;
    summaryTotal.textContent = `${(subtotal - discount + deliveryPrice).toLocaleString()} so‘m`;
    discountRow.hidden = !promoApplied;
}

applyPromo.addEventListener('click', () => {
    if (promoCode.value.trim().toUpperCase() === 'OQTEPA11') {
        promoApplied = true;
        promoMessage.textContent = 'Promokod muvaffaqiyatli ishlatildi — 10% chegirma!';
        promoMessage.className = 'promo-message success';
    } else {
        promoApplied = false;
        promoMessage.textContent = 'Promokod noto‘g‘ri.';
        promoMessage.className = 'promo-message error';
    }
    updateOrderSummary();
});

promoCode.addEventListener('input', () => {
    promoCode.value = promoCode.value.toUpperCase();
});

checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const digits = orderPhone.value.replace(/\D/g, '');
    if (digits.length < 9) {
        phoneError.textContent = 'Iltimos, to‘liq telefon raqamini kiriting.';
        phoneError.hidden = false;
        orderPhone.focus();
        return;
    }
    phoneError.hidden = true;

    if (!orderAddress.value.trim()) {
        addressError.textContent = 'Yetkazib berish manzilini kiriting.';
        addressError.hidden = false;
        orderAddress.focus();
        return;
    }
    addressError.hidden = true;
    checkoutError.hidden = true;

    const items = Array.from(cart.values()).map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
    }));
    const submitButton = checkoutForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        let order;
        if (catalogIsSynced) {
            const { data, error } = await supabaseClient.rpc('create_order', {
                p_phone: orderPhone.value.trim(),
                p_address: orderAddress.value.trim(),
                p_comment: orderComment.value.trim(),
                p_promo_code: promoApplied ? 'OQTEPA11' : '',
                p_items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                }))
            });
            if (error) throw error;

            const saved = Array.isArray(data) ? data[0] : data;
            if (!saved || !saved.order_code) {
                throw new Error('Bazadan buyurtma raqami olinmadi.');
            }
            order = {
                number: saved.order_code,
                date: saved.created_at,
                phone: orderPhone.value.trim(),
                address: orderAddress.value.trim(),
                comment: orderComment.value.trim(),
                promo: saved.promo_code || '',
                subtotal: Number(saved.subtotal),
                discount: Number(saved.discount),
                delivery: Number(saved.delivery),
                total: Number(saved.total),
                items
            };
        } else {
            const subtotal = getCartSubtotal();
            const discount = promoApplied ? Math.round(subtotal * 0.10) : 0;
            order = {
                number: `OL-${Date.now().toString(36).toUpperCase()}`,
                date: new Date().toISOString(),
                phone: orderPhone.value.trim(),
                address: orderAddress.value.trim(),
                comment: orderComment.value.trim(),
                promo: promoApplied ? 'OQTEPA11' : '',
                subtotal,
                discount,
                delivery: deliveryPrice,
                total: subtotal - discount + deliveryPrice,
                items
            };
        }
        let localStorageWarning = catalogIsSynced
            ? ''
            : ' (demo buyurtma — faqat shu qurilmada saqlandi)';
        try {
            saveOrder(order);
        } catch (storageError) {
            localStorageWarning = ` Qurilma tarixida saqlanmadi: ${storageError.message}`;
        }
        const qrText = encodeURIComponent(
            `${order.number}|${order.phone}|${order.address}|${order.total}`
        );
        successQr.src =
            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${qrText}`;

        checkoutForm.hidden = true;
        checkoutSuccess.hidden = false;
        cart.clear();
        try {
            renderCart();
        } catch (storageError) {
            cartCount.textContent = '0';
            localStorageWarning += ` Savatni qurilmada saqlashda xatolik: ${storageError.message}`;
        }
        successOrderInfo.textContent =
            `Buyurtma raqami: ${order.number} • ${order.total.toLocaleString()} so‘m${localStorageWarning}`;
    } catch (error) {
        checkoutError.textContent = `Buyurtma saqlanmadi: ${error.message}`;
        checkoutError.hidden = false;
    } finally {
        submitButton.disabled = false;
    }
});
document.getElementById('closeCheckout').addEventListener('click', () => checkoutDialog.close());
checkoutDialog.addEventListener('click', (event) => {
    if (event.target === checkoutDialog) checkoutDialog.close();
});
document.getElementById('closeSuccess').addEventListener('click', () => checkoutDialog.close());
checkoutDialog.addEventListener('close', () => {
    checkoutForm.reset();
    checkoutForm.hidden = false;
    checkoutSuccess.hidden = true;
    phoneError.hidden = true;
    addressError.hidden = true;
    promoApplied = false;
    promoMessage.textContent = '';
    checkoutError.hidden = true;
});

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem('oqtepaOrders') || '[]');
    } catch {
        return [];
    }
}

function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem('oqtepaOrders', JSON.stringify(orders));
}

function renderHistory() {
    const orders = getOrders();
    historyContent.replaceChildren();

    if (orders.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = 'Hozircha buyurtmalar yo‘q.';
        historyContent.append(empty);
        return;
    }

    orders.forEach(order => {
        const card = document.createElement('article');
        card.className = 'history-card';

        const top = document.createElement('div');
        top.className = 'history-card-top';
        const number = document.createElement('strong');
        number.textContent = order.number;
        const status = document.createElement('span');
        status.className = 'history-status';
        status.textContent = 'Buyurtma qabul qilindi';
        top.append(number, status);

        const date = document.createElement('time');
        date.textContent = new Date(order.date).toLocaleString('uz-UZ');

        const address = document.createElement('address');
        address.textContent = order.address;

        const list = document.createElement('ul');
        order.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} × ${item.quantity}`;
            list.append(li);
        });

        const promo = document.createElement('p');
        promo.className = 'history-card address';
        promo.textContent = order.promo ? `Promokod: ${order.promo}` : 'Promokod ishlatilmagan';

        const total = document.createElement('p');
        total.className = 'history-card-total';
        total.textContent = `${order.total.toLocaleString()} so‘m`;

        card.append(top, date, address, list, promo, total);
        historyContent.append(card);
    });
}

historyButton.addEventListener('click', () => {
    renderHistory();
    historyDialog.showModal();
});
document.getElementById('closeHistory').addEventListener('click', () => historyDialog.close());
document.getElementById('historyCloseButton').addEventListener('click', () => historyDialog.close());
historyDialog.addEventListener('click', event => {
    if (event.target === historyDialog) historyDialog.close();
});

adminLoginButton.addEventListener('click', () => {
    window.location.href = 'admin.html';
});
// Kategoriya bosilganda
categoryList.addEventListener('click', (e) => {
    if (e.target.classList.contains('category-item')) {
        // Active classni o'zgartirish
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        e.target.classList.add('active');

        currentCategory = e.target.dataset.category;
        currentCategoryEl.textContent = e.target.textContent;
        
        // Animatsiya uchun qisqa delay
        productsGrid.style.opacity = '0';
        setTimeout(() => {
            renderProducts();
            productsGrid.style.opacity = '1';
        }, 150);
    }
});

// Qidiruv
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderProducts();
});

async function initializeStore() {
    try {
        await loadProducts();
        loadSavedCart();
        renderProducts();
        renderCart();
    } catch (error) {
        productsGrid.replaceChildren();
        noResults.textContent = `Mahsulotlarni yuklab bo‘lmadi: ${error.message}`;
        noResults.style.display = 'block';
        productCountEl.textContent = '0 ta mahsulot';
        renderCart();
    }
}

initializeStore();