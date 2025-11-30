// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Cart functionality with IndexedDB
let cart = [];
let total = 0;
let db;

function initDB() {
    const request = indexedDB.open('CartDB', 1);

    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadCart();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('cart', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('price', 'price', { unique: false });
    };
}

function saveCart() {
    const transaction = db.transaction(['cart'], 'readwrite');
    const objectStore = transaction.objectStore('cart');

    // Clear existing cart
    objectStore.clear();

    // Add current cart items
    cart.forEach(item => {
        objectStore.add(item);
    });
}

function loadCart() {
    const transaction = db.transaction(['cart'], 'readonly');
    const objectStore = transaction.objectStore('cart');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        cart = event.target.result;
        total = cart.reduce((sum, item) => sum + item.price, 0);
        updateCart();
    };
}

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    if (db) {
        saveCart();
    }
    updateCart();
}

function removeFromCart(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    if (db) {
        saveCart();
    }
    updateCart();
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        addToCart(name, price);
        alert(`تم إضافة ${name} إلى السلة!`);
    });
});

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cartItems) {
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `${item.name} - ${item.price} دولار <button class="remove-item" data-index="${index}">إزالة</button>`;
            cartItems.appendChild(itemDiv);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    if (cartTotal) {
        cartTotal.textContent = `المجموع: ${total.toFixed(2)} دولار`;
    }
}

const checkoutBtn = document.getElementById('checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('السلة فارغة. يرجى إضافة منتجات أولاً.');
        } else {
            alert(`إجمالي الفاتورة: ${total.toFixed(2)} دولار\nطريقة الدفع: نقدي أو بطاقة ائتمانية عند الاستلام.`);
        }
    });
}

const clearCartBtn = document.getElementById('clear-cart');
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
        cart = [];
        total = 0;
        if (db) {
            saveCart();
        }
        updateCart();
        alert('تم مسح السلة.');
    });
}

// Initialize database
initDB();

// Product hover details
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        const name = this.querySelector('h4').textContent;
        const desc = this.querySelector('p').textContent;
        const price = this.querySelector('.price').textContent;

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<strong>${name}</strong><br>${desc}<br><em>${price}</em>`;
        this.appendChild(tooltip);
    });

    item.addEventListener('mouseleave', function() {
        const tooltip = this.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    });
});
