const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const adminLogin = document.getElementById('adminLogin');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const adminLayout = document.getElementById('adminLayout');
const productForm = document.getElementById('productForm');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productCategory = document.getElementById('productCategory');
const productImage = document.getElementById('productImage');
const productFormTitle = document.getElementById('productFormTitle');
const productFormMessage = document.getElementById('productFormMessage');
const cancelProductEdit = document.getElementById('cancelProductEdit');
const catalogTableBody = document.getElementById('catalogTableBody');
let catalogProducts = [];
let categories = [];
let orders = [];
let editingProductId = null;

async function loadOrders() {
    const { data, error } = await supabaseClient
        .from('orders')
        .select('id,order_code,phone,address,total,status,created_at,discount,order_items(product_name,quantity,price)')
        .order('created_at', { ascending: false });
    if (error) throw error;

    orders = (data || []).map(order => ({
        id: order.id,
        number: order.order_code,
        phone: order.phone,
        address: order.address,
        total: Number(order.total),
        discount: Number(order.discount || 0),
        status: order.status,
        date: order.created_at,
        items: (order.order_items || []).map(item => ({
            name: item.product_name,
            quantity: Number(item.quantity),
            price: Number(item.price)
        }))
    }));
}

async function loadCategories() {
    const { data, error } = await supabaseClient
        .from('categories')
        .select('id,name')
        .order('name');
    if (error) throw error;
    categories = data || [];
    productCategory.replaceChildren();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        productCategory.append(option);
    });
}

async function loadCatalogProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('id,name,price,image,category_id,is_active,categories(name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
    if (error) throw error;
    catalogProducts = (data || []).map(product => ({
        ...mapSupabaseProduct(product),
        categoryName: Array.isArray(product.categories)
            ? product.categories[0] && product.categories[0].name
            : product.categories && product.categories.name
    }));
}

function isSameLocalDay(firstDate, secondDate) {
    return firstDate.getFullYear() === secondDate.getFullYear()
        && firstDate.getMonth() === secondDate.getMonth()
        && firstDate.getDate() === secondDate.getDate();
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('uz-UZ')} so‘m`;
}

function renderDashboard() {
    const now = new Date();
    const todayOrders = orders.filter(order => isSameLocalDay(new Date(order.date), now));
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekOrders = orders.filter(order => new Date(order.date) >= weekStart);

    document.getElementById('todayOrders').textContent = todayOrders.length;
    document.getElementById('todayRevenue').textContent = formatMoney(
        todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    );
    document.getElementById('weekOrders').textContent = weekOrders.length;

    const productQuantities = new Map();
    todayOrders.forEach(order => {
        (order.items || []).forEach(item => {
            productQuantities.set(
                item.name,
                (productQuantities.get(item.name) || 0) + Number(item.quantity || 0)
            );
        });
    });

    const topProduct = Array.from(productQuantities.entries())
        .sort((a, b) => b[1] - a[1])[0];
    document.getElementById('topProduct').textContent = topProduct ? topProduct[0] : '—';
    document.getElementById('topProductInfo').textContent = topProduct
        ? `Bugun ${topProduct[1]} dona zakaz qilindi`
        : 'Bugun mahsulot yo‘q';

    renderSalesChart(weekStart, now, orders);
    renderRecentOrders(orders);
}

function renderSalesChart(startDate, endDate, orders) {
    const chart = document.getElementById('salesChart');
    chart.replaceChildren();
    const dailyCounts = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const count = orders.filter(order =>
            isSameLocalDay(new Date(order.date), date)
        ).length;
        dailyCounts.push({
            label: date.toLocaleDateString('uz-UZ', { weekday: 'short' }),
            count
        });
    }

    const maximum = Math.max(...dailyCounts.map(day => day.count), 1);
    dailyCounts.forEach(day => {
        const column = document.createElement('div');
        column.className = 'chart-column';
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${Math.max(5, day.count / maximum * 180)}px`;
        bar.title = `${day.count} ta buyurtma`;
        const label = document.createElement('span');
        label.textContent = day.label;
        column.append(bar, label);
        chart.append(column);
    });
}

function renderRecentOrders(orders) {
    const container = document.getElementById('recentOrders');
    container.replaceChildren();

    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-row">Hali buyurtma yo‘q</p>';
        return;
    }

    orders.slice(0, 6).forEach(order => {
        const row = document.createElement('div');
        row.className = 'recent-order';
        const left = document.createElement('strong');
        left.textContent = order.number;
        const time = document.createElement('small');
        time.textContent = new Date(order.date).toLocaleString('uz-UZ');
        const total = document.createElement('span');
        total.textContent = formatMoney(order.total);
        row.append(left, total, time);
        container.append(row);
    });
}

function renderOrdersTable() {
    document.getElementById('ordersCount').textContent =
        `${orders.length} ta buyurtma`;
    const tbody = document.getElementById('ordersTableBody');
    tbody.replaceChildren();

    if (orders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td class="empty-row" colspan="7">Buyurtmalar topilmadi</td>';
        tbody.append(row);
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        const products = (order.items || []).map(item =>
            `${item.name} × ${item.quantity}`
        ).join(', ');
        [
            order.number,
            new Date(order.date).toLocaleString('uz-UZ'),
            `${order.phone}\n${order.address}`,
            products,
            formatMoney(order.discount),
            formatMoney(order.total),
            order.status || 'pending'
        ].forEach((value, index) => {
            const cell = document.createElement('td');
            cell.textContent = value;
            if (index === 0 || index === 5) {
                const strong = document.createElement('strong');
                strong.textContent = value;
                cell.replaceChildren(strong);
            }
            if (index === 6) {
                const status = document.createElement('span');
                status.className = 'order-status';
                status.textContent = value;
                cell.replaceChildren(status);
            }
            row.append(cell);
        });
        tbody.append(row);
    });
}

function formatProductPrice(value) {
    return `${Number(value).toLocaleString('uz-UZ')} so‘m`;
}

function renderCatalog() {
    document.getElementById('catalogCount').textContent =
        `${catalogProducts.length} ta mahsulot`;
    catalogTableBody.replaceChildren();

    if (catalogProducts.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'empty-row';
        cell.colSpan = 5;
        cell.textContent = 'Katalogda mahsulot yo‘q.';
        row.append(cell);
        catalogTableBody.append(row);
        return;
    }

    catalogProducts.forEach(product => {
        const row = document.createElement('tr');
        const imageCell = document.createElement('td');
        const image = document.createElement('img');
        image.className = 'catalog-product-image';
        image.src = product.image;
        image.alt = product.name;
        imageCell.append(image);

        const nameCell = document.createElement('td');
        nameCell.textContent = product.name;
        const categoryCell = document.createElement('td');
        categoryCell.textContent = product.categoryName || getCatalogCategoryName(product.category);
        const priceCell = document.createElement('td');
        priceCell.textContent = formatProductPrice(product.price);

        const actionsCell = document.createElement('td');
        actionsCell.className = 'catalog-actions';
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'edit-product';
        editButton.textContent = 'Tahrirlash';
        editButton.addEventListener('click', () => editProduct(product));
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-product';
        deleteButton.textContent = 'Yashirish';
        deleteButton.addEventListener('click', () => deleteProduct(product));
        actionsCell.append(editButton, deleteButton);
        row.append(imageCell, nameCell, categoryCell, priceCell, actionsCell);
        catalogTableBody.append(row);
    });
}

function showProductFormMessage(message) {
    productFormMessage.textContent = message;
    productFormMessage.hidden = !message;
}

function resetProductForm() {
    editingProductId = null;
    productForm.reset();
    productFormTitle.textContent = 'Yangi mahsulot qo‘shish';
    cancelProductEdit.hidden = true;
    showProductFormMessage('');
}

function editProduct(product) {
    editingProductId = product.id;
    productName.value = product.name;
    productPrice.value = product.price;
    productCategory.value = product.categoryId;
    productImage.value = product.image;
    productFormTitle.textContent = 'Mahsulotni tahrirlash';
    cancelProductEdit.hidden = false;
    showProductFormMessage('');
    productName.focus();
}

async function deleteProduct(product) {
    if (!window.confirm(`"${product.name}" mahsulotini katalogdan yashirmoqchimisiz?`)) return;
    try {
        const { error } = await supabaseClient
            .from('products')
            .update({ is_active: false })
            .eq('id', product.id);
        if (error) throw error;
        if (editingProductId === product.id) resetProductForm();
        await loadCatalogProducts();
        renderCatalog();
    } catch (error) {
        showProductFormMessage(`Mahsulot yashirilmadi: ${error.message}`);
        renderCatalog();
    }
}

productForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = productName.value.trim();
    const price = Number(productPrice.value);
    let imageUrl;
    try {
        imageUrl = new URL(productImage.value);
    } catch {
        showProductFormMessage('Rasm uchun to‘g‘ri havola kiriting.');
        return;
    }

    if (!name || !Number.isSafeInteger(price) || price <= 0) {
        showProductFormMessage('Mahsulot nomi va 0 dan katta butun narx kiriting.');
        return;
    }
    if (imageUrl.protocol !== 'https:' && imageUrl.protocol !== 'http:') {
        showProductFormMessage('Rasm havolasi http yoki https bilan boshlanishi kerak.');
        return;
    }

    const product = {
        name,
        price,
        category_id: productCategory.value,
        image: imageUrl.href,
        is_active: true
    };
    try {
        let query = supabaseClient.from('products');
        if (editingProductId !== null) {
            const { error } = await query.update(product).eq('id', editingProductId);
            if (error) throw error;
        } else {
            const { error } = await query.insert({ ...product, cost: 0 });
            if (error) throw error;
        }
        await loadCatalogProducts();
        resetProductForm();
        renderCatalog();
    } catch (error) {
        showProductFormMessage(`Mahsulot saqlanmadi: ${error.message}`);
    }
});

cancelProductEdit.addEventListener('click', resetProductForm);

function openAdminPanel() {
    loginScreen.hidden = true;
    adminLayout.hidden = false;
    renderDashboard();
    renderOrdersTable();
    renderCatalog();
}

async function userIsAdmin(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
    if (error) throw error;
    return Boolean(data && data.role === 'admin');
}

async function loadAdminData() {
    await Promise.all([loadOrders(), loadCategories(), loadCatalogProducts()]);
    openAdminPanel();
}

loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginError.hidden = true;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: adminLogin.value.trim(),
        password: adminPassword.value
    });
    if (error) {
        loginError.textContent = `Kirish amalga oshmadi: ${error.message}`;
        loginError.hidden = false;
        return;
    }

    try {
        if (!await userIsAdmin(data.user.id)) {
            await supabaseClient.auth.signOut();
            throw new Error('Bu hisobga administrator huquqi berilmagan.');
        }
        await loadAdminData();
    } catch (loadError) {
        loginError.textContent = `Admin panel yuklanmadi: ${loadError.message}`;
        loginError.hidden = false;
    }
});

document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));

        if (button.dataset.view === 'orders') {
            document.getElementById('ordersView').classList.add('active');
            document.getElementById('pageTitle').textContent = 'Buyurtmalar';
            renderOrdersTable();
        } else if (button.dataset.view === 'catalog') {
            document.getElementById('catalogView').classList.add('active');
            document.getElementById('pageTitle').textContent = 'Mahsulot katalogi';
            renderCatalog();
        } else {
            document.getElementById('dashboardView').classList.add('active');
            document.getElementById('pageTitle').textContent = 'Statistika';
            renderDashboard();
        }
    });
});

document.getElementById('clearOrdersButton').addEventListener('click', async () => {
    if (!window.confirm('Barcha buyurtmalar tarixini o‘chirmoqchimisiz?')) return;
    try {
        const { error } = await supabaseClient.rpc('clear_all_orders');
        if (error) throw error;
        orders = [];
        renderDashboard();
        renderOrdersTable();
    } catch (error) {
        window.alert(`Buyurtmalar o‘chirilmadi: ${error.message}`);
    }
});

document.getElementById('logoutButton').addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        window.alert(`Tizimdan chiqib bo‘lmadi: ${error.message}`);
        return;
    }
    adminLayout.hidden = true;
    loginScreen.hidden = false;
    loginForm.reset();
});

async function restoreAdminSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        loginError.textContent = `Sessiya tekshirilmadi: ${error.message}`;
        loginError.hidden = false;
        return;
    }
    if (!data.session) return;

    try {
        if (!await userIsAdmin(data.session.user.id)) {
            await supabaseClient.auth.signOut();
            return;
        }
        await loadAdminData();
    } catch (loadError) {
        loginError.textContent = `Admin panel yuklanmadi: ${loadError.message}`;
        loginError.hidden = false;
    }
}

restoreAdminSession();
