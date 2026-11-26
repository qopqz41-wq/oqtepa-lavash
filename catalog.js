const defaultProducts = [
    { id: 1, name: "Para tovuqli tandir lavash", price: 49000, category: "aksiya", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop" },
    { id: 2, name: "Talaba seti 1", price: 39000, category: "aksiya", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop" },
    { id: 3, name: "Talaba seti 2", price: 39000, category: "aksiya", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop" },
    { id: 4, name: "Mini lavash", price: 32000, category: "lavash", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop" },
    { id: 5, name: "Katta lavash", price: 37000, category: "lavash", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop" },
    { id: 6, name: "Pishloqli katta lavash", price: 40000, category: "lavash", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop" },
    { id: 7, name: "Tandir lavash", price: 39000, category: "lavash", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop" },
    { id: 8, name: "Tandir lavash pishloqli", price: 42000, category: "lavash", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop" },
    { id: 9, name: "Tovuqli katta lavash", price: 35000, category: "lavash", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop" },
    { id: 10, name: "Katta shaurma", price: 35000, category: "doner", image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop" },
    { id: 11, name: "Shaurma", price: 31000, category: "doner", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop" },
    { id: 12, name: "Pita doner", price: 35000, category: "doner", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop" },
    { id: 13, name: "Big Doner", price: 41000, category: "doner", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop" },
    { id: 14, name: "Super pita", price: 37000, category: "doner", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=400&fit=crop" },
    { id: 15, name: "Gamburger", price: 34000, category: "burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop" },
    { id: 16, name: "Chizburger", price: 36000, category: "burger", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=400&fit=crop" },
    { id: 17, name: "Big Burger", price: 50000, category: "burger", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop" },
    { id: 18, name: "Big Chizburger", price: 55000, category: "burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop" },
    { id: 19, name: "Hot-dog", price: 19000, category: "hotdog", image: "https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop" },
    { id: 20, name: "Hot-dog pishloqli", price: 21000, category: "hotdog", image: "https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop" },
    { id: 21, name: "Qirollik Hot-dog", price: 28000, category: "hotdog", image: "https://images.unsplash.com/photo-1612392065422-4c16a2d8c8c0?w=500&h=400&fit=crop" },
    { id: 22, name: "Pepperoni pitsa", price: 95000, category: "pitsa", image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=400&fit=crop" },
    { id: 23, name: "Assorti pitsa", price: 110000, category: "pitsa", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop" },
    { id: 24, name: "Donar pitsa", price: 115000, category: "pitsa", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop" },
    { id: 25, name: "Qazili pitsa", price: 115000, category: "pitsa", image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop" },
    { id: 26, name: "Tovuqli pitsa", price: 100000, category: "pitsa", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=400&fit=crop" },
    { id: 27, name: "Fri kichik", price: 12000, category: "sneki", image: "https://images.unsplash.com/photo-1573080496689-880f3e87e8a9?w=500&h=400&fit=crop" },
    { id: 28, name: "Fri katta", price: 25000, category: "sneki", image: "https://images.unsplash.com/photo-1573080496689-880f3e87e8a9?w=500&h=400&fit=crop" },
    { id: 29, name: "Naggets 8 dona", price: 23000, category: "sneki", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&h=400&fit=crop" },
    { id: 30, name: "Strips 5 dona", price: 34000, category: "sneki", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&h=400&fit=crop" },
    { id: 31, name: "Pepsi 0.5L", price: 12000, category: "ichimlik", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&h=400&fit=crop" },
    { id: 32, name: "Klassik Mohito 0.5L", price: 18000, category: "ichimlik", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=400&fit=crop" },
    { id: 33, name: "Americano 0.3L", price: 16000, category: "ichimlik", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&h=400&fit=crop" }
];

const catalogStorageKey = 'oqtepaProducts';

function getCatalogProducts() {
    const saved = localStorage.getItem(catalogStorageKey);
    if (saved === null) {
        saveCatalogProducts(defaultProducts);
        return defaultProducts.map(product => ({ ...product }));
    }

    const products = JSON.parse(saved);
    if (!Array.isArray(products) || products.some(product =>
        !product || !Number.isFinite(Number(product.id))
        || typeof product.name !== 'string'
        || !Number.isFinite(Number(product.price))
        || typeof product.category !== 'string'
        || typeof product.image !== 'string'
    )) {
        throw new Error('Mahsulot katalogi noto‘g‘ri formatda saqlangan.');
    }
    return products;
}

function saveCatalogProducts(products) {
    localStorage.setItem(catalogStorageKey, JSON.stringify(products));
}

function getCatalogCategoryName(category) {
    const names = {
        aksiya: 'Aksiya',
        lavash: 'Lavash',
        doner: 'Doner',
        burger: 'Burger',
        hotdog: 'Hot-dog',
        pitsa: 'Pitsa',
        sneki: 'Snek',
        ichimlik: 'Ichimlik'
    };
    return names[category] || category;
}

function getCatalogCategorySlug(categoryName) {
    const value = String(categoryName || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
    const aliases = [
        ['aksiya', 'aksiya'],
        ['lavash', 'lavash'],
        ['doner', 'doner'],
        ['shaurma', 'doner'],
        ['shawarma', 'doner'],
        ['burger', 'burger'],
        ['hotdog', 'hotdog'],
        ['pitsa', 'pitsa'],
        ['pizza', 'pitsa'],
        ['snek', 'sneki'],
        ['snack', 'sneki'],
        ['ichimlik', 'ichimlik'],
        ['drink', 'ichimlik']
    ];
    const match = aliases.find(([alias]) => value.includes(alias));
    return match ? match[1] : value;
}

function mapSupabaseProduct(product) {
    const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;
    return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: getCatalogCategorySlug(category && category.name),
        image: product.image || '',
        categoryId: product.category_id,
        isActive: product.is_active
    };
}
